'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { AdPerformance } from '../../../api/types';

function formatDollars(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

// Cohort benchmark: healthy CPL range across all mold remediation clients
const CPL_RANGE = { min: 60, max: 160 };

function CplRangeBar({ cpl }: { cpl: number }) {
  // Scale: show range from $0 to $200 (a little past max for context)
  const scaleMax = 200;
  const rangeLeftPct = (CPL_RANGE.min / scaleMax) * 100;
  const rangeWidthPct = ((CPL_RANGE.max - CPL_RANGE.min) / scaleMax) * 100;
  const markerPct = Math.min(Math.max((cpl / scaleMax) * 100, 0), 100);

  const isHealthy = cpl >= CPL_RANGE.min && cpl <= CPL_RANGE.max;
  const isLow = cpl < CPL_RANGE.min;
  const markerColor = isHealthy ? '#3b8a5a' : isLow ? '#3b8a5a' : '#E85D4D';

  return (
    <div className="mt-3">
      {/* Bar */}
      <div className="relative h-2 w-full rounded-full" style={{ backgroundColor: '#f0ede6' }}>
        {/* Healthy range zone */}
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${rangeLeftPct}%`,
            width: `${rangeWidthPct}%`,
            backgroundColor: '#e6f3ec',
          }}
        />
        {/* Client marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-1.5 rounded-full"
          style={{
            left: `${markerPct}%`,
            transform: `translate(-50%, -50%)`,
            backgroundColor: markerColor,
          }}
        />
      </div>
      {/* Labels */}
      <div className="mt-1 flex items-center justify-between text-[9px]" style={{ color: '#c5bfb6' }}>
        <span>${CPL_RANGE.min}</span>
        <span style={{ color: isHealthy ? '#3b8a5a' : '#8a8279' }}>
          {isHealthy ? 'Healthy range' : isLow ? 'Below avg' : 'Above avg'}
        </span>
        <span>${CPL_RANGE.max}</span>
      </div>
    </div>
  );
}

type Props = {
  data: AdPerformance | undefined;
  days?: number | null;
  onRoasClick?: () => void;
  onGuaranteeClick?: () => void;
};

function AdMetricsCards({ data, days, onRoasClick, onGuaranteeClick }: Props) {
  if (!data) return null;

  const isShortRange = days !== null && days !== undefined && days <= 7;
  const periodLabel = days ? `${days}-day` : 'Custom';

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Ad Spend */}
      <Paper className="flex flex-col rounded-xl border p-5 shadow-none" sx={{ borderColor: '#ddd8cb' }}>
        <Typography className="text-xs font-semibold uppercase tracking-wide" sx={{ color: '#8a8279' }}>Ad Spend</Typography>
        <Typography className="mt-1 text-3xl font-bold tracking-tight">{formatDollars(data.ad_spend)}</Typography>
        <Typography className="mt-1 text-xs" sx={{ color: '#8a8279' }}>{periodLabel}</Typography>
      </Paper>

      {/* Cost Per Lead — with cohort range bar */}
      <Paper className="flex flex-col rounded-xl border p-5 shadow-none" sx={{ borderColor: '#ddd8cb' }}>
        <Typography className="text-xs font-semibold uppercase tracking-wide" sx={{ color: '#8a8279' }}>Cost Per Lead</Typography>
        <Typography className="mt-1 text-3xl font-bold tracking-tight">
          ${data.cpl.toFixed(0)}
        </Typography>
        <Typography className="mt-1 text-xs" sx={{ color: '#8a8279' }}>
          {data.actual_quality_leads} quality leads{isShortRange ? ' (90-day)' : ''}
        </Typography>
        <CplRangeBar cpl={data.cpl} />
      </Paper>

      {/* ROAS */}
      <Paper
        className={`flex flex-col rounded-xl border p-5 shadow-none relative ${!isShortRange && onRoasClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        sx={{ borderColor: '#E85D4D', backgroundColor: '#000000' }}
        onClick={isShortRange ? undefined : onRoasClick}
      >
        <Typography className="text-xs font-semibold uppercase tracking-wide" sx={{ color: '#E85D4D' }}>ROAS</Typography>
        {isShortRange ? (
          <>
            <Typography className="mt-1 text-xl font-bold tracking-tight" sx={{ color: '#5a554d' }}>--</Typography>
            <Typography className="mt-1 text-xs" sx={{ color: '#5a554d' }}>Not enough data for 7-day ROAS</Typography>
          </>
        ) : (
          <>
            <Typography className="mt-1 text-3xl font-bold tracking-tight" sx={{ color: '#fff' }}>{data.roas.toFixed(1)}x</Typography>
            <Typography className="mt-1 text-xs" sx={{ color: '#c5bfb6' }}>{formatDollars(data.total_closed_rev)} / {formatDollars(data.ad_spend)}</Typography>
          </>
        )}
      </Paper>

      {/* Guarantee — always all-time, never changes with date range */}
      <Paper
        className={`flex flex-col rounded-xl border p-5 shadow-none ${onGuaranteeClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        sx={{ borderColor: '#ddd8cb' }}
        onClick={onGuaranteeClick}
      >
        <Typography className="text-xs font-semibold uppercase tracking-wide" sx={{ color: '#8a8279' }}>Guarantee</Typography>
        <Typography className="mt-1 text-3xl font-bold tracking-tight">{data.guarantee.toFixed(1)}x</Typography>
        <Typography className="mt-1 text-xs" sx={{ color: '#8a8279' }}>
          {formatDollars(data.all_time_rev)} / {formatDollars(data.program_price || 0)}
        </Typography>
        <Typography className="text-[9px] mt-0.5" sx={{ color: '#c5bfb6' }}>All-time</Typography>
      </Paper>
    </div>
  );
}

export default memo(AdMetricsCards);
