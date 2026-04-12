'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useQuery } from '@tanstack/react-query';

// Reuse all the existing widgets
import SourceTabs from '../../(control-panel)/dashboards/client-analytics/components/ui/SourceTabs';
import AdMetricsCards from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/AdMetricsCards';
import SummaryCards from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/SummaryCards';
import FunnelChart from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/FunnelChart';
import MonthlyTrendChart from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/MonthlyTrendChart';
import RecentActivityWidget from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/RecentActivityWidget';
import LeadSpreadsheet from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/LeadSpreadsheet';
import HistoricalPerformance from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/HistoricalPerformance';
import CallDonutCharts from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/CallDonutCharts';
import HourlyMissedChart from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/HourlyMissedChart';
import MissedByAttemptChart from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/MissedByAttemptChart';
import CallSummaryCards from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/CallSummaryCards';
import MissedCallsTable from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/MissedCallsTable';
import CohortTiles from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/CohortTiles';
import GoogleAdsPanel from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/GoogleAdsPanel';
import GuaranteeBar from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/GuaranteeBar';
import FunnelDrawer from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/FunnelDrawer';
import type { FunnelStage } from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/FunnelDrawer';
import DateRangePicker from '../../(control-panel)/dashboards/client-analytics/components/ui/DateRangePicker';
import {
  useFunnel,
  useGroupFunnel,
  useMonthlyTrend,
  useRecentActivity,
  useSourceTabs,
  useGroupSourceTabs,
  useCallAnalytics,
} from '../../(control-panel)/dashboards/client-analytics/api/hooks/useClientAnalytics';
import { clientAnalyticsService } from '../../(control-panel)/dashboards/client-analytics/api/services/clientAnalyticsService';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const VIEW_TABS_CLIENT = [
  { label: 'Overview' },
  { label: 'Leads' },
  { label: 'Calls' },
  { label: 'Trends' },
];

// Group dashboards only support the Overview tab for now.
// Leads/Calls/Trends require per-customer endpoints that haven't been group-refactored yet.
const VIEW_TABS_GROUP = [
  { label: 'Overview' },
];

type ClientResource = {
  type: 'client';
  customer_id: number;
  name: string;
  field_management_software: string;
  start_date?: string;
};

type GroupResource = {
  type: 'group';
  group_id: number;
  name: string;
  slug: string;
  description?: string;
  member_ids: (number | string)[];
  member_names: string[];
  start_date?: string;
};

export type Resource = ClientResource | GroupResource;

type Props = {
  resource: Resource;
  embed?: boolean;
};

export default function SharedDashboard({ resource, embed }: Props) {
  const isGroup = resource.type === 'group';
  // For client: use customer_id. For group: use the first member as a "representative" for the
  // few per-customer widgets we still show (none right now, but leaving it for future).
  const customerId = isGroup
    ? Number((resource as GroupResource).member_ids[0])
    : (resource as ClientResource).customer_id;
  const groupSlug = isGroup ? (resource as GroupResource).slug : '';
  const [activeSource, setActiveSource] = useState('google_ads');
  const [activeTab, setActiveTab] = useState(0);
  const [drawerStage, setDrawerStage] = useState<FunnelStage | null>(null);
  const [drawerTitle, setDrawerTitle] = useState<string | undefined>(undefined);
  const [drawerAdSpend, setDrawerAdSpend] = useState<number | undefined>(undefined);
  const [drawerProgramPrice, setDrawerProgramPrice] = useState<number | undefined>(undefined);
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

  // Funnel data — use group endpoint for groups, client endpoint for individual clients.
  // Only one of the two queries is enabled at a time (the other is disabled via `enabled: !!id`).
  const clientFunnel = useFunnel(isGroup ? 0 : customerId, activeSource, dateFrom, dateTo);
  const clientFunnel90 = useFunnel(isGroup ? 0 : customerId, activeSource, ninetyDayFrom, ninetyDayTo);
  const groupFunnelQ = useGroupFunnel(isGroup ? groupSlug : '', activeSource, dateFrom, dateTo);
  const groupFunnel90Q = useGroupFunnel(isGroup ? groupSlug : '', activeSource, ninetyDayFrom, ninetyDayTo);
  const funnel = isGroup ? groupFunnelQ.data : clientFunnel.data;
  const funnel90 = isGroup ? groupFunnel90Q.data : clientFunnel90.data;

  const { data: trend } = useMonthlyTrend(isGroup ? 0 : customerId, 6);
  const { data: activity } = useRecentActivity(isGroup ? 0 : customerId);
  const clientSourceTabs = useSourceTabs(isGroup ? 0 : customerId);
  const groupSourceTabs = useGroupSourceTabs(isGroup ? groupSlug : '');
  const sourceTabs = isGroup ? groupSourceTabs.data : clientSourceTabs.data;

  const { data: spreadsheetData } = useQuery({
    queryKey: ['leadSpreadsheet', isGroup ? `group:${groupSlug}` : customerId, activeSource, dateFrom, dateTo],
    queryFn: () => {
      const url = isGroup
        ? `/api/blueprint/groups/${groupSlug}/lead-spreadsheet?source=${activeSource}&date_from=${dateFrom}&date_to=${dateTo}`
        : `/api/blueprint/clients/${customerId}/lead-spreadsheet?source=${activeSource}&date_from=${dateFrom}&date_to=${dateTo}`;
      return fetch(url).then(r => r.json());
    },
    enabled: isGroup ? !!groupSlug : (activeTab === 1 || drawerStage !== null),
  });

  const { data: callData, isLoading: callsLoading } = useCallAnalytics(isGroup ? 0 : customerId, dateFrom, dateTo);

  // Google Ads panel data — per-customer only (hidden for groups)
  const isGoogleAds = activeSource === 'google_ads';
  const { data: campaignData } = useQuery({
    queryKey: ['campaignBreakdown', customerId, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getCampaignBreakdown(customerId, dateFrom, dateTo),
    enabled: !isGroup && activeTab === 0 && isGoogleAds,
  });
  const { data: searchTermsData } = useQuery({
    queryKey: ['searchTerms', customerId, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getSearchTerms(customerId, dateFrom, dateTo),
    enabled: !isGroup && activeTab === 0 && isGoogleAds,
  });
  const { data: dailySpendData } = useQuery({
    queryKey: ['dailySpend', customerId, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getDailySpend(customerId, dateFrom, dateTo),
    enabled: !isGroup && activeTab === 0 && isGoogleAds,
  });

  const { data: historicalData, isLoading: historicalLoading } = useQuery({
    queryKey: ['historicalTrend', customerId, 24],
    queryFn: () => clientAnalyticsService.getMonthlyTrend(customerId, 24),
    enabled: !isGroup && activeTab === 3,
  });
  const { data: campaignTrendData } = useQuery({
    queryKey: ['campaignTrend', customerId, 24],
    queryFn: () => clientAnalyticsService.getCampaignTrend(customerId, 24),
    enabled: !isGroup && activeTab === 3,
  });

  // Extract display name (after " | " if present)
  const displayName = resource.name.includes('|') ? resource.name.split('|').pop()?.trim() : resource.name;
  // For client: field_management_software. For group: always housecall_pro (enforced by API).
  const fms = isGroup ? 'housecall_pro' : (resource as ClientResource).field_management_software;
  const startDate = resource.start_date;

  const cplSource = isShortRange && funnel90 ? funnel90 : funnel;
  const adMetrics = funnel ? {
    ad_spend: parseFloat(funnel.ad_spend as any) || 0,
    quality_leads: parseInt(funnel.quality_leads as any) || 0,
    actual_quality_leads: parseInt((cplSource as any)?.quality_leads) || 0,
    cpl: (parseInt((cplSource as any)?.quality_leads) || 0) > 0
      ? (parseFloat((cplSource as any)?.ad_spend) || 0) / parseInt((cplSource as any)?.quality_leads) : 0,
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

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
    <div className="min-h-screen" style={{ backgroundColor: '#ebe7de' }}>
      {/* Branded header bar — hidden in embed mode */}
      {!embed && (
        <div style={{ backgroundColor: '#000' }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: '#E85D4D' }}>
                <span className="text-base font-black text-white">B</span>
              </div>
              <div>
                <Typography className="text-lg font-extrabold text-white tracking-tight">{displayName}</Typography>
                <Typography className="text-[10px]" style={{ color: '#5a554d' }}>Blueprint for Scale</Typography>
              </div>
            </div>
            <Typography className="text-[10px]" style={{ color: '#5a554d' }}>{today}</Typography>
          </div>
        </div>
      )}

      {/* Main container */}
      <div className={`mx-auto max-w-6xl ${embed ? 'px-2 py-2' : 'px-4 py-6 md:px-6'}`}>
        <div className="rounded-2xl shadow-sm" style={{ backgroundColor: '#F5F1E8' }}>
          {/* Controls bar */}
          <div className="flex flex-col gap-3 px-6 pt-5 pb-2 md:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <SourceTabs tabs={sourceTabs} activeTab={activeSource} onTabChange={setActiveSource} />
              {activeTab !== 3 && (
                <>
                  <div className="h-4 w-px" style={{ backgroundColor: '#ddd8cb' }} />
                  <DateRangePicker value={dateRange} onChange={setDateRange} startDate={startDate} />
                </>
              )}
              <a
                href="/share/how-it-works"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-[10px] no-underline transition-opacity hover:opacity-70"
                style={{ color: '#c5bfb6', textDecoration: 'none' }}
              >
                How does this work?
              </a>
            </div>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: '0.8rem', textTransform: 'none' } }}
            >
              {(isGroup ? VIEW_TABS_GROUP : VIEW_TABS_CLIENT).map((t) => (
                <Tab key={t.label} label={t.label} />
              ))}
            </Tabs>
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            className="flex w-full flex-col gap-6 px-6 py-6 md:px-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {activeTab === 0 && (
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
                {/* Ad metrics (CPL, ROAS, Ad Spend) — only for paid sources */}
                {(activeSource === 'google_ads' || activeSource === 'lsa') && (
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
                {/* Google Ads details — per-customer only (hidden in group view) */}
                {isGoogleAds && !isGroup && (
                  <motion.div variants={item}>
                    <GoogleAdsPanel
                      campaigns={campaignData}
                      searchTerms={searchTermsData}
                      dailySpend={dailySpendData}
                    />
                  </motion.div>
                )}
                {/* Guarantee — only for paid sources */}
                {activeSource === 'google_ads' && (
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
                {isGroup && (
                  <motion.div variants={item}>
                    <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#ebe7de' }}>
                      <Typography className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#5a554d' }}>
                        Combined View
                      </Typography>
                      <Typography className="mt-1 text-xs" style={{ color: '#8a8279' }}>
                        This dashboard rolls up {(resource as GroupResource).member_names?.join(' + ')}. Phones that appear in more than one business are deduplicated.
                      </Typography>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {activeTab === 1 && !isGroup && (
              <motion.div variants={item}>
                <LeadSpreadsheet data={spreadsheetData} customerId={customerId} crm={fms} />
              </motion.div>
            )}

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
                  <HistoricalPerformance data={historicalData} startDate={startDate} campaignTrend={campaignTrendData} />
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-center pb-6">
          <Typography className="text-[10px]" style={{ color: '#c5bfb6' }}>
            Powered by Blueprint for Scale
          </Typography>
        </div>
      </div>
    </div>

    <FunnelDrawer
      open={drawerStage !== null}
      stage={drawerStage || 'leads'}
      title={drawerTitle}
      leads={spreadsheetData}
      customerId={customerId}
      crm={fms}
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
