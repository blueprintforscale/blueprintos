'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { AdPerformance } from '../../../api/types';

function formatDollars(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

// Cohort benchmarks across all mold remediation clients
const CPL_RANGE = { min: 60, max: 160 };
const ROAS_RANGE = { min: 2, max: 4 };

function CplRangeBar({ cpl }: { cpl: number }) {
  // Scale starts just below range min so green zone dominates
  const padding = (CPL_RANGE.max - CPL_RANGE.min) * 0.3;
  const scaleMin = Math.max(0, CPL_RANGE.min - padding);
  const isAboveCpl = cpl > CPL_RANGE.max;
  const scaleMax = isAboveCpl ? cpl + padding * 0.5 : CPL_RANGE.max + padding;
  const scaleSpan = scaleMax - scaleMin;

  const rangeLeftPct = ((CPL_RANGE.min - scaleMin) / scaleSpan) * 100;
  const rangeWidthPct = ((CPL_RANGE.max - CPL_RANGE.min) / scaleSpan) * 100;
  const markerPct = Math.min(Math.max(((cpl - scaleMin) / scaleSpan) * 100, 2), 98);

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

function RoasRangeBar({ roas }: { roas: number }) {
  // Scale starts just below range min so green zone dominates the bar
  const padding = (ROAS_RANGE.max - ROAS_RANGE.min) * 0.3;
  const scaleMin = Math.max(0, ROAS_RANGE.min - padding);
  const isAbove = roas > ROAS_RANGE.max;
  const scaleMax = isAbove ? roas + padding * 0.5 : ROAS_RANGE.max + padding;
  const scaleSpan = scaleMax - scaleMin;

  const rangeLeftPct = ((ROAS_RANGE.min - scaleMin) / scaleSpan) * 100;
  const rangeWidthPct = ((ROAS_RANGE.max - ROAS_RANGE.min) / scaleSpan) * 100;
  const markerPct = Math.min(Math.max(((roas - scaleMin) / scaleSpan) * 100, 2), 98);

  const isHealthy = roas >= ROAS_RANGE.min && roas <= ROAS_RANGE.max;
  const isHigh = roas > ROAS_RANGE.max;
  const markerColor = isHealthy ? '#3b8a5a' : isHigh ? '#3b8a5a' : '#E85D4D';

  return (
    <div className="mt-3">
      <div className="relative h-2 w-full rounded-full" style={{ backgroundColor: '#444' }}>
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${rangeLeftPct}%`,
            width: `${rangeWidthPct}%`,
            backgroundColor: 'rgba(59, 138, 90, 0.35)',
          }}
        />
        {/* Client marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-1.5 rounded-full"
          style={{
            left: `${markerPct}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: markerColor,
          }}
        />
      </div>
      <div className="relative mt-1 text-[9px]" style={{ height: '14px' }}>
        <span className="absolute" style={{ left: `${rangeLeftPct}%`, transform: 'translateX(-50%)', color: '#8a8279' }}>
          {ROAS_RANGE.min}x
        </span>
        <span className="absolute" style={{ left: `${((ROAS_RANGE.max - scaleMin) / scaleSpan) * 100}%`, transform: 'translateX(-50%)', color: '#8a8279' }}>
          {ROAS_RANGE.max}x
        </span>
        {isHigh && (
          <span className="absolute font-semibold" style={{
            left: `${markerPct}%`,
            transform: 'translateX(-50%)',
            color: '#4ade80',
          }}>
            {roas.toFixed(1)}x ▲
          </span>
        )}
        {!isHealthy && !isHigh && (
          <span className="absolute font-semibold" style={{
            left: `${markerPct}%`,
            transform: 'translateX(-50%)',
            color: '#f87171',
          }}>
            {roas.toFixed(1)}x ▼
          </span>
        )}
      </div>
    </div>
  );
}

type Props = {
  data: AdPerformance | undefined;
  days?: number | null;
  onCplClick?: () => void;
  onRoasClick?: () => void;
};

function AdMetricsCards({ data, days, onCplClick, onRoasClick }: Props) {
  if (!data) return null;

  const isShortRange = days !== null && days !== undefined && days <= 7;
  const periodLabel = days ? `${days}-day` : 'Custom';

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {/* Ad Spend */}
      <Paper className="flex flex-col rounded-xl border p-5 shadow-none" sx={{ borderColor: '#ddd8cb' }}>
        <Typography className="text-xs font-semibold uppercase tracking-wide" sx={{ color: '#8a8279' }}>Ad Spend</Typography>
        <Typography className="mt-1 text-3xl font-bold tracking-tight">{formatDollars(data.ad_spend)}</Typography>
        <Typography className="mt-1 text-xs" sx={{ color: '#8a8279' }}>{periodLabel}</Typography>
      </Paper>

      {/* Cost Per Lead — with cohort range bar */}
      <Paper
        className={`flex flex-col rounded-xl border p-5 shadow-none ${onCplClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        sx={{ borderColor: '#ddd8cb' }}
        onClick={onCplClick}
      >
        <Typography className="text-xs font-semibold uppercase tracking-wide" sx={{ color: '#8a8279' }}>Cost Per Lead</Typography>
        <Typography className="mt-1 text-3xl font-bold tracking-tight">
          ${data.cpl.toFixed(0)}
        </Typography>
        <Typography className="mt-1 text-xs" sx={{ color: '#8a8279' }}>
          {data.actual_quality_leads} quality leads{isShortRange ? ' (90-day)' : ''}
        </Typography>
        <CplRangeBar cpl={data.cpl} />
        {data.ad_spend > 0 && data.quality_leads > 0 && data.quality_leads !== data.actual_quality_leads && (
          <div className="mt-1 text-[9px]" style={{ color: '#c5bfb6' }}>
            ${Math.round(data.ad_spend / data.quality_leads)} per contact
          </div>
        )}
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
            <div className="mt-1 flex items-baseline gap-2">
              <Typography className="text-3xl font-bold tracking-tight" sx={{ color: '#fff' }}>{data.roas.toFixed(1)}x</Typography>
              {(data.projected_close_total || 0) > 0 && data.ad_spend > 0 && (
                <Typography className="text-lg font-medium tracking-tight" sx={{ color: '#5a554d' }}>
                  → {((data.total_closed_rev + (data.projected_close_total || 0)) / data.ad_spend).toFixed(1)}x
                </Typography>
              )}
            </div>
            <Typography className="mt-1 text-xs" sx={{ color: '#c5bfb6' }}>
              {formatDollars(data.total_closed_rev)} / {formatDollars(data.ad_spend)}
              {(data.projected_close_total || 0) > 0 && (
                <span style={{ color: '#5a554d' }}> · +{formatDollars(data.projected_close_total || 0)} projected</span>
              )}
            </Typography>
            <RoasRangeBar roas={data.roas} />
          </>
        )}
      </Paper>

    </div>
  );
}

export default memo(AdMetricsCards);
