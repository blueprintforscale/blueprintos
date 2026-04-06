'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FusePageSimple from '@fuse/core/FusePageSimple';
import ClientSelector from '../ui/ClientSelector';
import SourceTabs from '../ui/SourceTabs';
import AdMetricsCards from '../ui/widgets/AdMetricsCards';
import SummaryCards from '../ui/widgets/SummaryCards';
import FunnelChart from '../ui/widgets/FunnelChart';
import MonthlyTrendChart from '../ui/widgets/MonthlyTrendChart';
import RecentActivityWidget from '../ui/widgets/RecentActivityWidget';
import LeadSpreadsheet from '../ui/widgets/LeadSpreadsheet';
import HistoricalPerformance from '../ui/widgets/HistoricalPerformance';
import CallSummaryCards from '../ui/widgets/CallSummaryCards';
import CallDonutCharts from '../ui/widgets/CallDonutCharts';
import HourlyMissedChart from '../ui/widgets/HourlyMissedChart';
import MissedCallsTable from '../ui/widgets/MissedCallsTable';
import MissedByAttemptChart from '../ui/widgets/MissedByAttemptChart';
import GoogleAdsPanel from '../ui/widgets/GoogleAdsPanel';
import CohortTiles from '../ui/widgets/CohortTiles';
import GuaranteeBar from '../ui/widgets/GuaranteeBar';
import FunnelDrawer from '../ui/widgets/FunnelDrawer';
import type { FunnelStage } from '../ui/widgets/FunnelDrawer';
import DateRangePicker from '../ui/DateRangePicker';
import {
  useClients,
  useFunnel,
  useMonthlyTrend,
  useRecentActivity,
  useLeads,
  useSourceTabs,
  useCallAnalytics,
} from '../../api/hooks/useClientAnalytics';
import { clientAnalyticsService } from '../../api/services/clientAnalyticsService';
import { useQuery } from '@tanstack/react-query';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const DEFAULT_CLIENT = 7441590915;

const VIEW_TABS = [
  { label: 'Overview', icon: 'lucide:layout-dashboard' },
  { label: 'Leads', icon: 'lucide:users' },
  { label: 'Calls', icon: 'lucide:phone' },
  { label: 'Trends', icon: 'lucide:trending-up' },
];

function ClientAnalyticsView() {
  const [selectedClient, setSelectedClient] = useState<number | null>(DEFAULT_CLIENT);
  const [activeSource, setActiveSource] = useState('google_ads');
  const [activeTab, setActiveTab] = useState(0);
  const [drawerStage, setDrawerStage] = useState<FunnelStage | null>(null);
  const [drawerTitle, setDrawerTitle] = useState<string | undefined>(undefined);
  const [drawerAdSpend, setDrawerAdSpend] = useState<number | undefined>(undefined);
  const [drawerProgramPrice, setDrawerProgramPrice] = useState<number | undefined>(undefined);
  const [shareCopied, setShareCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    days: 90 as number | null,
  });

  const dateFrom = dateRange.from;
  const dateTo = dateRange.to;

  const isShortRange = dateRange.days !== null && dateRange.days <= 7;
  const ninetyDayFrom = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
  const ninetyDayTo = new Date().toISOString().split('T')[0];

  const { data: clients } = useClients();
  const { data: funnel, isLoading: funnelLoading } = useFunnel(selectedClient!, activeSource, dateFrom, dateTo);
  // 90-day funnel for CPL fallback on short ranges
  const { data: funnel90 } = useFunnel(selectedClient!, activeSource, ninetyDayFrom, ninetyDayTo);
  const { data: trend } = useMonthlyTrend(selectedClient!, 6);
  const { data: activity } = useRecentActivity(selectedClient!);
  const { data: sourceTabs } = useSourceTabs(selectedClient!);

  // Lead spreadsheet — always fetch so drawer data is ready on click
  const { data: spreadsheetData } = useQuery({
    queryKey: ['leadSpreadsheet', selectedClient, activeSource, dateFrom, dateTo],
    queryFn: () => fetch(`/api/blueprint/clients/${selectedClient}/lead-spreadsheet?source=${activeSource}&date_from=${dateFrom}&date_to=${dateTo}`).then(r => r.json()),
    enabled: !!selectedClient,
  });

  // Call analytics data (only fetch when on Calls tab)
  const { data: callData, isLoading: callsLoading } = useCallAnalytics(
    selectedClient!, dateFrom, dateTo
  );

  // Google Ads panel data (only fetch on Overview with Google Ads source)
  const isGoogleAds = activeSource === 'google_ads';
  const { data: campaignData } = useQuery({
    queryKey: ['campaignBreakdown', selectedClient, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getCampaignBreakdown(selectedClient!, dateFrom, dateTo),
    enabled: !!selectedClient && activeTab === 0 && isGoogleAds,
  });
  const { data: searchTermsData } = useQuery({
    queryKey: ['searchTerms', selectedClient, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getSearchTerms(selectedClient!, dateFrom, dateTo),
    enabled: !!selectedClient && activeTab === 0 && isGoogleAds,
  });
  const { data: dailySpendData } = useQuery({
    queryKey: ['dailySpend', selectedClient, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getDailySpend(selectedClient!, dateFrom, dateTo),
    enabled: !!selectedClient && activeTab === 0 && isGoogleAds,
  });

  // Historical data (only fetch when on Performance tab — now tab 3)
  const { data: historicalData, isLoading: historicalLoading } = useQuery({
    queryKey: ['historicalTrend', selectedClient, 24],
    queryFn: () => clientAnalyticsService.getMonthlyTrend(selectedClient!, 24),
    enabled: !!selectedClient && activeTab === 3,
  });

  const clientList = Array.isArray(clients) ? clients : [];
  const selectedClientObj = clientList.find((c) => c.customer_id === selectedClient);
  const clientName = selectedClientObj?.name || 'Select a client';
  const clientCrm = selectedClientObj?.field_management_software;

  // Derive ad metrics from funnel — CPL uses CallRail-deduped leads (matches risk dashboard)
  // Falls back to 90-day data on short ranges
  const cplSource = isShortRange && funnel90 ? funnel90 : funnel;
  const cplLeads = parseInt((cplSource as any)?.cpl_quality_leads) || parseInt((cplSource as any)?.quality_leads) || 0;
  const cplFromApi = parseFloat((cplSource as any)?.cpl);
  const adMetrics = funnel ? {
    ad_spend: parseFloat(funnel.ad_spend as any) || 0,
    quality_leads: parseInt(funnel.quality_leads as any) || 0,
    actual_quality_leads: cplLeads,
    cpl: !isNaN(cplFromApi) && cplFromApi > 0 ? cplFromApi
      : cplLeads > 0 ? (parseFloat((cplSource as any)?.ad_spend) || 0) / cplLeads : 0,
    total_closed_rev: parseFloat(funnel.closed_rev as any) || 0,
    total_open_est_rev: parseFloat(funnel.open_est_rev as any) || 0,
    roas: (parseFloat(funnel.ad_spend as any) || 0) > 0
      ? (parseFloat(funnel.closed_rev as any) || 0) / (parseFloat(funnel.ad_spend as any) || 0) : 0,
    all_time_rev: parseFloat((funnel as any).all_time_rev) || 0,
    all_time_spend: parseFloat((funnel as any).all_time_spend) || 0,
    program_price: parseFloat((funnel as any).program_price) || 0,
    guarantee: parseFloat((funnel as any).program_price) > 0
      ? (parseFloat((funnel as any).all_time_rev) || 0) / parseFloat((funnel as any).program_price) : 0,
    projected_close_total: parseFloat((funnel as any).projected_close_total) || 0,
    months_in_program: parseInt((funnel as any).months_in_program) || 0,
    lsa_spend: 0, lsa_leads: 0,
  } : undefined;

  return (
    <>
    <FusePageSimple
      header={
        <div className="flex w-full flex-col gap-4 px-6 pt-6 md:px-8" style={{ backgroundColor: '#F5F1E8' }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Typography className="text-2xl font-extrabold uppercase tracking-tight" sx={{ color: '#000000' }}>Client Analytics</Typography>
              <div className="flex items-center gap-2">
                <Typography className="text-sm" sx={{ color: '#5a554d' }}>{clientName}</Typography>
                {(selectedClientObj as any)?.dashboard_token && (
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/share/${(selectedClientObj as any).dashboard_token}`;
                      navigator.clipboard.writeText(url);
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    }}
                    className="rounded px-2 py-0.5 text-[10px] font-medium transition-colors"
                    style={{
                      backgroundColor: shareCopied ? '#3b8a5a' : 'transparent',
                      color: shareCopied ? '#fff' : '#c5bfb6',
                      border: `1px solid ${shareCopied ? '#3b8a5a' : '#ddd8cb'}`,
                    }}
                  >
                    {shareCopied ? 'Link copied!' : 'Share'}
                  </button>
                )}
                {(selectedClientObj as any)?.dashboard_token && (
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/share/${(selectedClientObj as any).dashboard_token}?embed=true`;
                      navigator.clipboard.writeText(url);
                      setEmbedCopied(true);
                      setTimeout(() => setEmbedCopied(false), 2000);
                    }}
                    className="rounded px-2 py-0.5 text-[10px] font-medium transition-colors"
                    style={{
                      backgroundColor: embedCopied ? '#3b8a5a' : 'transparent',
                      color: embedCopied ? '#fff' : '#c5bfb6',
                      border: `1px solid ${embedCopied ? '#3b8a5a' : '#ddd8cb'}`,
                    }}
                  >
                    {embedCopied ? 'Embed link copied!' : 'Embed'}
                  </button>
                )}
              </div>
            </div>
            <ClientSelector clients={clientList} selectedId={selectedClient} onSelect={setSelectedClient} />
          </div>
          <SourceTabs tabs={sourceTabs} activeTab={activeSource} onTabChange={setActiveSource} />
          {activeTab !== 3 && <DateRangePicker value={dateRange} onChange={setDateRange} />}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: '0.8rem', textTransform: 'none' } }}
          >
            {VIEW_TABS.map((t) => (
              <Tab key={t.label} label={t.label} />
            ))}
          </Tabs>
        </div>
      }
      content={
        selectedClient ? (
          <motion.div
            key={activeTab}
            className="flex w-full flex-col gap-6 px-6 py-6 md:px-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* ====== OVERVIEW TAB ====== */}
            {activeTab === 0 && funnelLoading && (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200" style={{ borderTopColor: '#000' }} />
                  <span className="text-xs" style={{ color: '#8a8279' }}>Loading funnel data...</span>
                </div>
              </div>
            )}
            {activeTab === 0 && !funnelLoading && (
              <>
                {/* Revenue cards */}
                <motion.div variants={item}>
                  <SummaryCards data={funnel as any} onStageClick={(stage, title) => { setDrawerStage(stage); setDrawerTitle(title); }} />
                </motion.div>
                {/* Conversion funnel + cohort tiles */}
                <motion.div variants={item}>
                  <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    <FunnelChart data={funnel} onStageClick={(stage) => { setDrawerStage(stage); setDrawerTitle(undefined); }} />
                    <CohortTiles data={funnel as any} onStageClick={(stage, title) => { setDrawerStage(stage); setDrawerTitle(title); }} />
                  </div>
                </motion.div>
                {/* Google Ads metrics (CPL, ROAS, Ad Spend) */}
                {activeSource !== 'all' && (
                  <motion.div variants={item}>
                    <AdMetricsCards data={adMetrics} days={dateRange.days} onCplClick={() => {
                      setDrawerStage('cpl_leads');
                      setDrawerTitle('Cost Per Lead');
                      setDrawerAdSpend(undefined);
                      setDrawerProgramPrice(undefined);
                    }} onRoasClick={() => {
                      setDrawerStage('revenue_closed');
                      setDrawerTitle('ROAS Breakdown');
                      setDrawerAdSpend(adMetrics?.ad_spend);
                      setDrawerProgramPrice(undefined);
                    }} />
                  </motion.div>
                )}
                {/* Google Ads details panel */}
                {isGoogleAds && (
                  <motion.div variants={item}>
                    <GoogleAdsPanel
                      campaigns={campaignData}
                      searchTerms={searchTermsData}
                      dailySpend={dailySpendData}
                    />
                  </motion.div>
                )}
                {/* Guarantee progress bar */}
                {activeSource !== 'all' && (
                  <motion.div variants={item}>
                    <GuaranteeBar data={adMetrics} onClick={() => {
                      setDrawerStage('estimate_approved');
                      setDrawerTitle('Guarantee Breakdown');
                      setDrawerProgramPrice(adMetrics?.program_price);
                      setDrawerAdSpend(undefined);
                    }} />
                  </motion.div>
                )}
                <motion.div variants={item}>
                  <RecentActivityWidget data={activity} />
                </motion.div>
              </>
            )}

            {/* ====== LEADS TAB ====== */}
            {activeTab === 1 && (
              <motion.div variants={item}>
                <LeadSpreadsheet data={spreadsheetData} customerId={selectedClient!} crm={clientCrm} />
              </motion.div>
            )}

            {/* ====== CALLS TAB ====== */}
            {activeTab === 2 && callsLoading && (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200" style={{ borderTopColor: '#000' }} />
                  <span className="text-xs" style={{ color: '#8a8279' }}>Loading call data...</span>
                </div>
              </div>
            )}
            {activeTab === 2 && !callsLoading && (
              <>
                <motion.div variants={item}>
                  <CallDonutCharts data={callData} />
                </motion.div>
                <motion.div variants={item}>
                  <HourlyMissedChart data={callData} dateFrom={dateFrom} dateTo={dateTo} />
                </motion.div>
                <motion.div variants={item}>
                  <MissedByAttemptChart data={callData} />
                </motion.div>
                <motion.div variants={item}>
                  <CallSummaryCards data={callData} />
                </motion.div>
                <motion.div variants={item}>
                  <MissedCallsTable data={callData?.missed_calls_table} />
                </motion.div>
              </>
            )}

            {/* ====== PERFORMANCE TAB ====== */}
            {activeTab === 3 && (
              <motion.div variants={item}>
                {historicalLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200" style={{ borderTopColor: '#000' }} />
                      <span className="text-xs" style={{ color: '#8a8279' }}>Loading performance data...</span>
                    </div>
                  </div>
                ) : (
                  <HistoricalPerformance data={historicalData} startDate={selectedClientObj?.start_date} showSuperQuality={(selectedClientObj as any)?.dashboard_config?.show_super_quality} />
                )}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="flex h-64 items-center justify-center">
            <Typography className="text-gray-400">Select a client to view analytics</Typography>
          </div>
        )
      }
      scroll="content"
    />

    {/* Drill-down drawer */}
    <FunnelDrawer
      open={drawerStage !== null}
      stage={drawerStage || 'leads'}
      title={drawerTitle}
      leads={spreadsheetData}
      customerId={selectedClient!}
      crm={clientCrm}
      adSpend={drawerAdSpend}
      programPrice={drawerProgramPrice}
      closedRev={adMetrics?.total_closed_rev}
      periodAdSpend={adMetrics?.ad_spend}
      onClose={() => { setDrawerStage(null); setDrawerTitle(undefined); setDrawerAdSpend(undefined); setDrawerProgramPrice(undefined); }}
    />
  </>
  );
}

export default ClientAnalyticsView;
