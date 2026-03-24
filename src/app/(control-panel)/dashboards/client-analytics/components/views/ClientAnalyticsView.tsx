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
  { label: 'Performance', icon: 'lucide:trending-up' },
];

function ClientAnalyticsView() {
  const [selectedClient, setSelectedClient] = useState<number | null>(DEFAULT_CLIENT);
  const [activeSource, setActiveSource] = useState('google_ads');
  const [activeTab, setActiveTab] = useState(0);
  const [drawerStage, setDrawerStage] = useState<FunnelStage | null>(null);
  const [drawerTitle, setDrawerTitle] = useState<string | undefined>(undefined);
  const [drawerAdSpend, setDrawerAdSpend] = useState<number | undefined>(undefined);
  const [shareCopied, setShareCopied] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    days: 90 as number | null,
  });

  const dateFrom = dateRange.from;
  const dateTo = dateRange.to;

  const { data: clients } = useClients();
  const { data: funnel } = useFunnel(selectedClient!, activeSource, dateFrom, dateTo);
  const { data: trend } = useMonthlyTrend(selectedClient!, 6);
  const { data: activity } = useRecentActivity(selectedClient!);
  const { data: sourceTabs } = useSourceTabs(selectedClient!);

  // Lead spreadsheet (only fetch when on Leads tab)
  const { data: spreadsheetData } = useQuery({
    queryKey: ['leadSpreadsheet', selectedClient, activeSource, dateFrom, dateTo],
    queryFn: () => fetch(`/api/blueprint/clients/${selectedClient}/lead-spreadsheet?source=${activeSource}&date_from=${dateFrom}&date_to=${dateTo}`).then(r => r.json()),
    enabled: !!selectedClient && (activeTab === 1 || drawerStage !== null),
  });

  // Historical data (only fetch when on Performance tab)
  const { data: historicalData, isLoading: historicalLoading } = useQuery({
    queryKey: ['historicalTrend', selectedClient, 24],
    queryFn: () => clientAnalyticsService.getMonthlyTrend(selectedClient!, 24),
    enabled: !!selectedClient && activeTab === 2,
  });

  const clientList = Array.isArray(clients) ? clients : [];
  const selectedClientObj = clientList.find((c) => c.customer_id === selectedClient);
  const clientName = selectedClientObj?.name || 'Select a client';
  const clientCrm = selectedClientObj?.field_management_software;

  // Derive ad metrics from funnel
  const adMetrics = funnel ? {
    ad_spend: parseFloat(funnel.ad_spend as any) || 0,
    quality_leads: parseInt(funnel.quality_leads as any) || 0,
    actual_quality_leads: parseInt(funnel.quality_leads as any) || 0,
    cpl: (parseInt(funnel.quality_leads as any) || 0) > 0
      ? (parseFloat(funnel.ad_spend as any) || 0) / parseInt(funnel.quality_leads as any) : 0,
    total_closed_rev: parseFloat(funnel.closed_rev as any) || 0,
    total_open_est_rev: parseFloat(funnel.open_est_rev as any) || 0,
    roas: (parseFloat(funnel.ad_spend as any) || 0) > 0
      ? (parseFloat(funnel.closed_rev as any) || 0) / (parseFloat(funnel.ad_spend as any) || 0) : 0,
    all_time_rev: parseFloat((funnel as any).all_time_rev) || 0,
    all_time_spend: parseFloat((funnel as any).all_time_spend) || 0,
    guarantee: parseFloat((funnel as any).all_time_spend) > 0
      ? (parseFloat((funnel as any).all_time_rev) || 0) / parseFloat((funnel as any).all_time_spend) : 0,
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
              </div>
            </div>
            <ClientSelector clients={clientList} selectedId={selectedClient} onSelect={setSelectedClient} />
          </div>
          <SourceTabs tabs={sourceTabs} activeTab={activeSource} onTabChange={setActiveSource} />
          {activeTab !== 2 && <DateRangePicker value={dateRange} onChange={setDateRange} />}
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
            {activeTab === 0 && (
              <>
                {activeSource !== 'all' && (
                  <motion.div variants={item}>
                    <AdMetricsCards data={adMetrics} onRoasClick={() => {
                      setDrawerStage('estimate_approved');
                      setDrawerTitle('ROAS Breakdown');
                      setDrawerAdSpend(adMetrics?.ad_spend);
                    }} />
                  </motion.div>
                )}
                <motion.div variants={item}>
                  <SummaryCards data={funnel as any} onStageClick={(stage, title) => { setDrawerStage(stage); setDrawerTitle(title); }} />
                </motion.div>
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

            {/* ====== LEADS TAB ====== */}
            {activeTab === 1 && (
              <motion.div variants={item}>
                <LeadSpreadsheet data={spreadsheetData} customerId={selectedClient!} crm={clientCrm} />
              </motion.div>
            )}

            {/* ====== PERFORMANCE TAB ====== */}
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
      onClose={() => { setDrawerStage(null); setDrawerTitle(undefined); setDrawerAdSpend(undefined); }}
    />
  </>
  );
}

export default ClientAnalyticsView;
