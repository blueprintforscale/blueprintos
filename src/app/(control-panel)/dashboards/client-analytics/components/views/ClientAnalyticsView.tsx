'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FusePageSimple from '@fuse/core/FusePageSimple';
import ClientSelector, { type Selection } from '../ui/ClientSelector';
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
  useGroups,
  useFunnel,
  useGroupFunnel,
  useMonthlyTrend,
  useRecentActivity,
  useLeads,
  useSourceTabs,
  useGroupSourceTabs,
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

// Group dashboards only support the Overview tab — Leads/Calls/Trends require
// per-customer endpoints that haven't been refactored for groups yet.
const VIEW_TABS_GROUP = [{ label: 'Overview', icon: 'lucide:layout-dashboard' }];

function ClientAnalyticsView() {
  const [selected, setSelected] = useState<Selection | null>({ type: 'client', id: DEFAULT_CLIENT });
  const isGroup = selected?.type === 'group';
  const groupSlug = selected?.type === 'group' ? selected.slug : '';
  const selectedClient = selected?.type === 'client' ? selected.id : null;
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

  const isShortRange = dateRange.days !== null && dateRange.days > 0 && dateRange.days <= 7;
  const ninetyDayFrom = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
  const ninetyDayTo = new Date().toISOString().split('T')[0];

  const { data: clients } = useClients();
  const { data: groups } = useGroups();
  // Per-client funnel — disabled when a group is selected
  const clientFunnelQ = useFunnel(isGroup ? 0 : (selectedClient ?? 0), activeSource, dateFrom, dateTo);
  const clientFunnel90Q = useFunnel(isGroup ? 0 : (selectedClient ?? 0), activeSource, ninetyDayFrom, ninetyDayTo);
  // Group funnel — disabled unless a group is selected
  const groupFunnelQ = useGroupFunnel(isGroup ? groupSlug : '', activeSource, dateFrom, dateTo);
  const groupFunnel90Q = useGroupFunnel(isGroup ? groupSlug : '', activeSource, ninetyDayFrom, ninetyDayTo);
  const funnel = isGroup ? groupFunnelQ.data : clientFunnelQ.data;
  const funnel90 = isGroup ? groupFunnel90Q.data : clientFunnel90Q.data;
  const funnelLoading = isGroup ? groupFunnelQ.isLoading : clientFunnelQ.isLoading;

  // Per-client widgets — disabled when a group is selected
  const { data: trend } = useMonthlyTrend(isGroup ? 0 : (selectedClient ?? 0), 6);
  const { data: activity } = useRecentActivity(isGroup ? 0 : (selectedClient ?? 0));
  const clientSourceTabs = useSourceTabs(isGroup ? 0 : (selectedClient ?? 0));
  const groupSourceTabs = useGroupSourceTabs(isGroup ? groupSlug : '');
  const sourceTabs = isGroup ? groupSourceTabs.data : clientSourceTabs.data;

  // Lead spreadsheet — per-client or per-group (fans out to members server-side)
  const { data: spreadsheetData } = useQuery({
    queryKey: ['leadSpreadsheet', isGroup ? `group:${groupSlug}` : selectedClient, activeSource, dateFrom, dateTo],
    queryFn: () => {
      const url = isGroup
        ? `/api/blueprint/groups/${groupSlug}/lead-spreadsheet?source=${activeSource}&date_from=${dateFrom}&date_to=${dateTo}`
        : `/api/blueprint/clients/${selectedClient}/lead-spreadsheet?source=${activeSource}&date_from=${dateFrom}&date_to=${dateTo}`;
      return fetch(url).then(r => r.json());
    },
    enabled: isGroup ? !!groupSlug : !!selectedClient,
  });

  // Call analytics data (only fetch when on Calls tab)
  const { data: callData, isLoading: callsLoading } = useCallAnalytics(
    isGroup ? 0 : (selectedClient ?? 0), dateFrom, dateTo
  );

  // Google Ads panel data (only fetch on Overview with Google Ads source)
  const isGoogleAds = activeSource === 'google_ads';
  const { data: campaignData } = useQuery({
    queryKey: ['campaignBreakdown', selectedClient, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getCampaignBreakdown(selectedClient!, dateFrom, dateTo),
    enabled: !isGroup && !!selectedClient && activeTab === 0 && isGoogleAds,
  });
  const { data: searchTermsData } = useQuery({
    queryKey: ['searchTerms', selectedClient, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getSearchTerms(selectedClient!, dateFrom, dateTo),
    enabled: !isGroup && !!selectedClient && activeTab === 0 && isGoogleAds,
  });
  const { data: dailySpendData } = useQuery({
    queryKey: ['dailySpend', selectedClient, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getDailySpend(selectedClient!, dateFrom, dateTo),
    enabled: !isGroup && !!selectedClient && activeTab === 0 && isGoogleAds,
  });

  // Historical data (only fetch when on Performance tab — now tab 3)
  const { data: historicalData, isLoading: historicalLoading } = useQuery({
    queryKey: ['historicalTrend', selectedClient, 24],
    queryFn: () => clientAnalyticsService.getMonthlyTrend(selectedClient!, 24),
    enabled: !isGroup && !!selectedClient && activeTab === 3,
  });
  const { data: campaignTrendData } = useQuery({
    queryKey: ['campaignTrend', selectedClient, 24],
    queryFn: () => clientAnalyticsService.getCampaignTrend(selectedClient!, 24),
    enabled: !isGroup && !!selectedClient && activeTab === 3,
  });

  const clientList = Array.isArray(clients) ? clients : [];
  const groupList = Array.isArray(groups) ? groups : [];
  const selectedClientObj = clientList.find((c) => c.customer_id === selectedClient);
  const selectedGroupObj = isGroup ? groupList.find((g) => g.slug === groupSlug) : undefined;
  const clientName = isGroup
    ? selectedGroupObj?.name || 'Select a client'
    : selectedClientObj?.name || 'Select a client';
  // For groups, the API enforces HCP-only members today
  const clientCrm = isGroup ? 'housecall_pro' : selectedClientObj?.field_management_software;
  const headerStartDate = isGroup ? selectedGroupObj?.start_date : selectedClientObj?.start_date;
  const headerToken = isGroup
    ? (selectedGroupObj as any)?.dashboard_token
    : (selectedClientObj as any)?.dashboard_token;
  const hasSelection = isGroup ? !!groupSlug : !!selectedClient;
  // Drawer needs a numeric customer_id even in group mode — use first member as a representative
  const drawerCustomerId = isGroup
    ? Number(selectedGroupObj?.member_ids?.[0] ?? 0)
    : (selectedClient ?? 0);

  // Derive ad metrics from funnel data (API returns unified risk-dashboard-aligned values)
  // CPL falls back to 90-day data on short ranges
  const cplSource = isShortRange && funnel90 ? funnel90 : funnel;
  const f = funnel as any;
  const cs = cplSource as any;
  const qualityLeads = parseInt(cs?.quality_leads) || 0;
  const cplFromApi = parseFloat(cs?.cpl);
  const adMetrics = funnel ? {
    ad_spend: parseFloat(f.ad_spend) || 0,
    quality_leads: parseInt(f.quality_leads) || 0,
    actual_quality_leads: qualityLeads,
    cpl: !isNaN(cplFromApi) && cplFromApi > 0 ? cplFromApi
      : qualityLeads > 0 ? (parseFloat(cs?.ad_spend) || 0) / qualityLeads : 0,
    total_closed_rev: parseFloat(f.closed_rev) || 0,
    total_open_est_rev: parseFloat(f.open_est_rev) || 0,
    roas: (parseFloat(f.ad_spend) || 0) > 0
      ? (parseFloat(f.closed_rev) || 0) / (parseFloat(f.ad_spend) || 0) : 0,
    all_time_rev: parseFloat(f.all_time_rev) || 0,
    all_time_spend: parseFloat(f.all_time_spend) || 0,
    program_price: parseFloat(f.program_price) || 0,
    guarantee: parseFloat(f.guarantee) > 0 ? parseFloat(f.guarantee)
      : parseFloat(f.program_price) > 0 ? (parseFloat(f.all_time_rev) || 0) / parseFloat(f.program_price) : 0,
    projected_close_total: parseFloat(f.projected_close_total) || 0,
    months_in_program: parseInt(f.months_in_program) || 0,
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
                {headerToken && (
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/share/${headerToken}`;
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
                {headerToken && (
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/share/${headerToken}?embed=true`;
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
            <ClientSelector
              clients={clientList}
              groups={groupList}
              selected={selected}
              onSelect={(s) => {
                setSelected(s);
                // Group dashboards only support Overview — snap back if on a hidden tab
                if (s?.type === 'group' && activeTab > 0) setActiveTab(0);
              }}
            />
          </div>
          <SourceTabs tabs={sourceTabs} activeTab={activeSource} onTabChange={setActiveSource} />
          {activeTab !== 3 && <DateRangePicker value={dateRange} onChange={setDateRange} startDate={headerStartDate} />}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: '0.8rem', textTransform: 'none' } }}
          >
            {(isGroup ? VIEW_TABS_GROUP : VIEW_TABS).map((t) => (
              <Tab key={t.label} label={t.label} />
            ))}
          </Tabs>
        </div>
      }
      content={
        hasSelection ? (
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
                {/* Conversion funnel + cohort tiles (cohort hidden on GBP) */}
                <motion.div variants={item}>
                  <div className="grid gap-6" style={{ gridTemplateColumns: activeSource === 'gbp' ? '1fr' : '2fr 1fr' }}>
                    <FunnelChart data={funnel} onStageClick={(stage) => { setDrawerStage(stage); setDrawerTitle(undefined); }} />
                    {activeSource !== 'gbp' && (
                      <CohortTiles data={funnel as any} onStageClick={(stage, title) => { setDrawerStage(stage); setDrawerTitle(title); }} />
                    )}
                  </div>
                </motion.div>
                {/* Google Ads metrics (CPL, ROAS, Ad Spend) — hidden for GBP (organic, no ad cost) */}
                {activeSource !== 'all' && activeSource !== 'gbp' && (
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
                {/* Google Ads details panel — per-customer only */}
                {isGoogleAds && !isGroup && (
                  <motion.div variants={item}>
                    <GoogleAdsPanel
                      campaigns={campaignData}
                      searchTerms={searchTermsData}
                      dailySpend={dailySpendData}
                    />
                  </motion.div>
                )}
                {/* Guarantee progress bar — hidden for GBP (no ad spend = no guarantee) */}
                {activeSource !== 'all' && activeSource !== 'gbp' && (
                  <motion.div variants={item}>
                    <GuaranteeBar data={adMetrics} onClick={() => {
                      setDrawerStage('estimate_approved');
                      setDrawerTitle('Guarantee Breakdown');
                      setDrawerProgramPrice(adMetrics?.program_price);
                      setDrawerAdSpend(undefined);
                    }} />
                  </motion.div>
                )}
                {!isGroup && (
                  <motion.div variants={item}>
                    <RecentActivityWidget data={activity} />
                  </motion.div>
                )}
                {isGroup && selectedGroupObj && (
                  <motion.div variants={item}>
                    <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#ebe7de' }}>
                      <Typography className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#5a554d' }}>
                        Combined View
                      </Typography>
                      <Typography className="mt-1 text-xs" style={{ color: '#8a8279' }}>
                        This dashboard rolls up {selectedGroupObj.member_names?.join(' + ')}. Phones that appear in more than one business are deduplicated.
                      </Typography>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* ====== LEADS TAB ====== */}
            {activeTab === 1 && !isGroup && (
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
                  <HistoricalPerformance data={historicalData} startDate={selectedClientObj?.start_date} showSuperQuality={(selectedClientObj as any)?.dashboard_config?.show_super_quality} campaignTrend={campaignTrendData} />
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
      customerId={drawerCustomerId}
      crm={clientCrm}
      source={activeSource}
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
