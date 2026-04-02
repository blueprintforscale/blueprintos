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

// Cohort benchmark ranges (P25-P75 across free inspection clients, 90-day)
const BOOK_RATE_RANGE = { min: 25, max: 43 };
const CLOSE_RATE_RANGE = { min: 12, max: 31 };
const FULL_FUNNEL_RANGE = { min: 5, max: 10 };

function CohortRangeBar({ value, range, scaleMax, unit = '%' }: {
  value: number;
  range: { min: number; max: number };
  scaleMax: number;
  unit?: string;
}) {
  const rangeLeftPct = (range.min / scaleMax) * 100;
  const rangeWidthPct = ((range.max - range.min) / scaleMax) * 100;
  const markerPct = Math.min(Math.max((value / scaleMax) * 100, 0), 100);

  // Higher is better for funnel rates (opposite of CPL)
  const isHealthy = value >= range.min && value <= range.max;
  const isHigh = value > range.max;
  const markerColor = isHealthy ? '#3b8a5a' : isHigh ? '#3b8a5a' : '#E85D4D';

  return (
    <div className="mt-3">
      <div className="relative h-2 w-full rounded-full" style={{ backgroundColor: '#f0ede6' }}>
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${rangeLeftPct}%`,
            width: `${rangeWidthPct}%`,
            backgroundColor: '#e6f3ec',
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-1.5 rounded-full"
          style={{
            left: `${markerPct}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: markerColor,
          }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[9px]" style={{ color: '#c5bfb6' }}>
        <span>{range.min}{unit}</span>
        <span style={{ color: isHealthy ? '#3b8a5a' : '#8a8279' }}>
          {isHealthy ? 'Healthy range' : isHigh ? 'Above avg' : 'Below avg'}
        </span>
        <span>{range.max}{unit}</span>
      </div>
    </div>
  );
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

  const rawContacts = parseInt(data.total_contacts as any) || 0;
  const quality = parseInt(data.quality_leads as any) || parseInt(data.leads as any) || 0;
  const contacts = Math.max(rawContacts, quality);
  const spam = Math.max(contacts - quality, 0);
  const closedRev = parseFloat(data.closed_rev as any) || 0;
  const openEst = parseFloat(data.open_est_rev as any) || 0;
  const openEstCount = parseInt(data.open_estimate_count as any) || Math.max((parseInt(data.estimate_sent as any) || 0) - (parseInt(data.estimate_approved as any) || 0), 0);
  const avgOpenEst = openEstCount > 0 ? openEst / openEstCount : 0;

  const inspScheduled = parseInt(data.inspection_scheduled as any) || 0;
  const estApproved = parseInt(data.estimate_approved as any) || 0;

  const bookRate = quality > 0 ? (inspScheduled / quality) * 100 : 0;
  const closeRate = inspScheduled > 0 ? (estApproved / inspScheduled) * 100 : 0;
  const fullFunnel = quality > 0 ? (estApproved / quality) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Contacts + 3 funnel metrics with cohort bars */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Contacts */}
        <Paper
          className="flex flex-col rounded-xl p-5 shadow-sm transition-all cursor-pointer hover:shadow-md"
          onClick={() => onStageClick?.('cpl_leads', 'Contacts')}
        >
          <Typography className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Contacts
          </Typography>
          <Typography className="mt-1 text-3xl font-bold tracking-tight">
            {contacts}
          </Typography>
          <Typography className="mt-1 text-xs text-gray-400">
            {spam > 0 ? `${quality} quality leads · ${spam} removed` : `${quality} quality leads`}
          </Typography>
        </Paper>

        {/* Book Rate */}
        <Paper
          className="flex flex-col rounded-xl p-5 shadow-sm transition-all cursor-pointer hover:shadow-md"
          onClick={() => onStageClick?.('inspection_scheduled', 'Book Rate')}
        >
          <Typography className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Book Rate
          </Typography>
          <Typography className="mt-1 text-3xl font-bold tracking-tight">
            {bookRate.toFixed(1)}%
          </Typography>
          <Typography className="mt-1 text-xs text-gray-400">
            {inspScheduled} inspections / {quality} leads
          </Typography>
          <CohortRangeBar value={bookRate} range={BOOK_RATE_RANGE} scaleMax={60} />
        </Paper>

        {/* Close Rate */}
        <Paper
          className="flex flex-col rounded-xl p-5 shadow-sm transition-all cursor-pointer hover:shadow-md"
          onClick={() => onStageClick?.('estimate_approved', 'Close Rate')}
        >
          <Typography className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Close Rate
          </Typography>
          <Typography className="mt-1 text-3xl font-bold tracking-tight">
            {closeRate.toFixed(1)}%
          </Typography>
          <Typography className="mt-1 text-xs text-gray-400">
            {estApproved} approved / {inspScheduled} inspections
          </Typography>
          <CohortRangeBar value={closeRate} range={CLOSE_RATE_RANGE} scaleMax={60} />
        </Paper>

        {/* Full Funnel */}
        <Paper
          className="flex flex-col rounded-xl p-5 shadow-sm transition-all cursor-pointer hover:shadow-md"
          onClick={() => onStageClick?.('estimate_approved', 'Full Funnel')}
        >
          <Typography className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Full Funnel
          </Typography>
          <Typography className="mt-1 text-3xl font-bold tracking-tight">
            {fullFunnel.toFixed(1)}%
          </Typography>
          <Typography className="mt-1 text-xs text-gray-400">
            {estApproved} approved / {quality} leads
          </Typography>
          <CohortRangeBar value={fullFunnel} range={FULL_FUNNEL_RANGE} scaleMax={25} />
        </Paper>
      </div>

      {/* Row 2: Revenue cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
    </div>
  );
}

export default memo(SummaryCards);
