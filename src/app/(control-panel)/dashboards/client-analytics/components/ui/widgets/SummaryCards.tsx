'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { FunnelData } from '../../../api/types';
import type { FunnelStage } from './FunnelDrawer';

function formatDollars(n: number) {
  if (!n) return '$0';
  if (n >= 1000) return `$${(n / 1000).toFixed(0).toLocaleString()}K`;
  return `$${n.toFixed(0)}`;
}

type ExtendedFunnel = FunnelData & {
  total_contacts?: number;
  quality_leads?: number;
  spam_count?: number;
  closed_rev?: number;
  open_est_rev?: number;
  open_estimate_count?: number;
};

type Props = {
  data: ExtendedFunnel | undefined;
  onStageClick?: (stage: FunnelStage, title?: string) => void;
};

function SummaryCards({ data, onStageClick }: Props) {
  if (!data) return null;

  const closedRev = parseFloat(data.closed_rev as any) || 0;
  const openEst = parseFloat(data.open_est_rev as any) || 0;
  const openEstCount = parseInt(data.open_estimate_count as any) || Math.max((parseInt(data.estimate_sent as any) || 0) - (parseInt(data.estimate_approved as any) || 0), 0);
  const avgOpenEst = openEstCount > 0 ? openEst / openEstCount : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Revenue Closed */}
      <Paper
        className="flex flex-col rounded-xl p-5 shadow-sm transition-all cursor-pointer hover:shadow-md"
        sx={{ backgroundColor: '#E85D4D', color: '#fff' }}
        onClick={() => onStageClick?.('revenue_closed', 'Revenue Closed')}
      >
        <Typography className="text-xs font-medium uppercase tracking-wide text-red-100">
          Revenue Closed
        </Typography>
        <Typography className="mt-1 text-3xl font-bold tracking-tight">
          {formatDollars(closedRev)}
        </Typography>
      </Paper>

      {/* Open Estimates */}
      <Paper
        className="flex flex-col rounded-xl p-5 shadow-sm transition-all cursor-pointer hover:shadow-md"
        onClick={() => onStageClick?.('open_estimates', 'Open Estimates')}
      >
        <Typography className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Open Estimates
        </Typography>
        <Typography className="mt-1 text-3xl font-bold tracking-tight">
          {formatDollars(openEst)}
        </Typography>
        <Typography className="mt-1 text-xs text-gray-400">
          {openEstCount > 0 ? `${openEstCount} estimates · avg ${formatDollars(avgOpenEst)}` : 'Pipeline value'}
        </Typography>
      </Paper>
    </div>
  );
}

export default memo(SummaryCards);
