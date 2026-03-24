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
import FunnelDrawer from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/FunnelDrawer';
import type { FunnelStage } from '../../(control-panel)/dashboards/client-analytics/components/ui/widgets/FunnelDrawer';
import DateRangePicker from '../../(control-panel)/dashboards/client-analytics/components/ui/DateRangePicker';
import {
  useFunnel,
  useMonthlyTrend,
  useRecentActivity,
  useSourceTabs,
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

const VIEW_TABS = [
  { label: 'Overview' },
  { label: 'Leads' },
  { label: 'Performance' },
];

type Props = {
  client: {
    customer_id: number;
    name: string;
    field_management_software: string;
  };
};

export default function SharedDashboard({ client }: Props) {
  const customerId = client.customer_id;
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

  const { data: funnel } = useFunnel(customerId, activeSource, dateFrom, dateTo);
  const { data: funnel90 } = useFunnel(customerId, activeSource, ninetyDayFrom, ninetyDayTo);
  const { data: trend } = useMonthlyTrend(customerId, 6);
  const { data: activity } = useRecentActivity(customerId);
  const { data: sourceTabs } = useSourceTabs(customerId);

  const { data: spreadsheetData } = useQuery({
    queryKey: ['leadSpreadsheet', customerId, activeSource, dateFrom, dateTo],
    queryFn: () => fetch(`/api/blueprint/clients/${customerId}/lead-spreadsheet?source=${activeSource}&date_from=${dateFrom}&date_to=${dateTo}`).then(r => r.json()),
    enabled: activeTab === 1 || drawerStage !== null,
  });

  const { data: historicalData, isLoading: historicalLoading } = useQuery({
    queryKey: ['historicalTrend', customerId, 24],
    queryFn: () => clientAnalyticsService.getMonthlyTrend(customerId, 24),
    enabled: activeTab === 2,
  });

  // Extract client display name (after " | " if present)
  const displayName = client.name.includes('|') ? client.name.split('|').pop()?.trim() : client.name;

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
    lsa_spend: 0, lsa_leads: 0,
  } : undefined;

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
    <div className="min-h-screen" style={{ backgroundColor: '#ebe7de' }}>
      {/* Branded header bar */}
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

      {/* Main container */}
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <div className="rounded-2xl shadow-sm" style={{ backgroundColor: '#F5F1E8' }}>
          {/* Controls bar */}
          <div className="flex flex-col gap-3 px-6 pt-5 pb-2 md:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <SourceTabs tabs={sourceTabs} activeTab={activeSource} onTabChange={setActiveSource} />
              {activeTab !== 2 && (
                <>
                  <div className="h-4 w-px" style={{ backgroundColor: '#ddd8cb' }} />
                  <DateRangePicker value={dateRange} onChange={setDateRange} />
                </>
              )}
            </div>
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
                {activeSource !== 'all' && (
                  <>
                    <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#c5bfb6', marginBottom: -16 }}>Ad Performance</div>
                    <motion.div variants={item}>
                      <AdMetricsCards data={adMetrics} days={dateRange.days} onRoasClick={() => {
                        setDrawerStage('estimate_approved');
                        setDrawerTitle('ROAS Breakdown');
                        setDrawerAdSpend(adMetrics?.ad_spend);
                        setDrawerProgramPrice(undefined);
                      }} onGuaranteeClick={() => {
                        setDrawerStage('estimate_approved');
                        setDrawerTitle('Guarantee Breakdown');
                        setDrawerProgramPrice(adMetrics?.program_price);
                        setDrawerAdSpend(undefined);
                      }} />
                    </motion.div>
                  </>
                )}
                <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#c5bfb6', marginBottom: -16 }}>Pipeline</div>
                <motion.div variants={item}>
                  <SummaryCards data={funnel as any} onStageClick={(stage, title) => { setDrawerStage(stage); setDrawerTitle(title); }} />
                </motion.div>
                <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#c5bfb6', marginBottom: -16 }}>Trends</div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <motion.div variants={item}>
                    <FunnelChart data={funnel} onStageClick={(stage) => { setDrawerStage(stage); setDrawerTitle(undefined); }} />
                  </motion.div>
                  <motion.div variants={item}>
                    <MonthlyTrendChart data={trend} />
                  </motion.div>
                </div>
                <motion.div variants={item}>
                  <RecentActivityWidget data={activity} />
                </motion.div>
              </>
            )}

            {activeTab === 1 && (
              <motion.div variants={item}>
                <LeadSpreadsheet data={spreadsheetData} customerId={customerId} crm={client.field_management_software} />
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div variants={item}>
                {historicalLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200" style={{ borderTopColor: '#000' }} />
                      <span className="text-xs" style={{ color: '#8a8279' }}>Loading performance data...</span>
                    </div>
                  </div>
                ) : (
                  <HistoricalPerformance data={historicalData} />
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
      crm={client.field_management_software}
      adSpend={drawerAdSpend}
      programPrice={drawerProgramPrice}
      closedRev={adMetrics?.total_closed_rev}
      periodAdSpend={adMetrics?.ad_spend}
      onClose={() => { setDrawerStage(null); setDrawerTitle(undefined); setDrawerAdSpend(undefined); setDrawerProgramPrice(undefined); }}
    />
    </>
  );
}
