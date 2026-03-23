'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import FusePageSimple from '@fuse/core/FusePageSimple';
import ClientSelector from '../ui/ClientSelector';
import SourceTabs from '../ui/SourceTabs';
import AdMetricsCards from '../ui/widgets/AdMetricsCards';
import FunnelChart from '../ui/widgets/FunnelChart';
import MonthlyTrendChart from '../ui/widgets/MonthlyTrendChart';
import RecentActivityWidget from '../ui/widgets/RecentActivityWidget';
import LeadsTable from '../ui/widgets/LeadsTable';
import {
  useClients,
  useAdPerformance,
  useFunnel,
  useMonthlyTrend,
  useRecentActivity,
  useLeads,
  useSourceTabs,
} from '../../api/hooks/useClientAnalytics';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Default to Sy Elijah for demo
const DEFAULT_CLIENT = 7441590915;

function ClientAnalyticsView() {
  const [selectedClient, setSelectedClient] = useState<number | null>(DEFAULT_CLIENT);
  const [activeSource, setActiveSource] = useState('google_ads');

  const { data: clients } = useClients();
  const { data: adPerformance } = useAdPerformance(selectedClient!, 30);
  const { data: funnel } = useFunnel(selectedClient!, activeSource);
  const { data: trend } = useMonthlyTrend(selectedClient!, 6);
  const { data: activity } = useRecentActivity(selectedClient!);
  const { data: leads } = useLeads(selectedClient!, 'google_ads');
  const { data: sourceTabs } = useSourceTabs(selectedClient!);

  const clientName = clients?.find((c) => c.customer_id === selectedClient)?.name || 'Select a client';

  return (
    <FusePageSimple
      header={
        <div className="flex w-full flex-col gap-4 px-6 py-6 md:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Typography className="text-2xl font-bold tracking-tight">Client Analytics</Typography>
              <Typography className="text-sm text-gray-500">{clientName}</Typography>
            </div>
            <ClientSelector
              clients={clients}
              selectedId={selectedClient}
              onSelect={setSelectedClient}
            />
          </div>
          <SourceTabs
            tabs={sourceTabs}
            activeTab={activeSource}
            onTabChange={setActiveSource}
          />
        </div>
      }
      content={
        selectedClient ? (
          <motion.div
            className="flex w-full flex-col gap-6 px-6 py-6 md:px-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Ad Performance Cards */}
            <motion.div variants={item}>
              <AdMetricsCards data={adPerformance} />
            </motion.div>

            {/* Funnel + Trend side by side on desktop */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <motion.div variants={item}>
                <FunnelChart data={funnel} />
              </motion.div>
              <motion.div variants={item}>
                <MonthlyTrendChart data={trend} />
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div variants={item}>
              <RecentActivityWidget data={activity} />
            </motion.div>

            {/* Leads Table */}
            <motion.div variants={item}>
              <LeadsTable data={leads} />
            </motion.div>
          </motion.div>
        ) : (
          <div className="flex h-64 items-center justify-center">
            <Typography className="text-gray-400">Select a client to view analytics</Typography>
          </div>
        )
      }
      scroll="content"
    />
  );
}

export default ClientAnalyticsView;
