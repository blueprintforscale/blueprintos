'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { FunnelData } from '../../../api/types';
import type { FunnelStage } from './FunnelDrawer';

// Cohort benchmark ranges (aspirational targets for mold remediation clients)
const BOOK_RATE_RANGE = { min: 30, max: 45 };
const CLOSE_RATE_RANGE = { min: 25, max: 35 };
const FULL_FUNNEL_RANGE = { min: 5, max: 10 };

// Scale maxes — range should fill most of the bar with minimal dead space
const BOOK_RATE_SCALE = 48;
const CLOSE_RATE_SCALE = 36;
const FULL_FUNNEL_SCALE = 12;

function CohortRangeBar({ value, range, unit = '%' }: {
  value: number;
  range: { min: number; max: number };
  scaleMax?: number;
  unit?: string;
}) {
  // Scale starts just below range min so the green zone dominates the bar
  const padding = (range.max - range.min) * 0.3;
  const scaleMin = Math.max(0, range.min - padding);
  const isAbove = value > range.max;
  const isBelow = value < range.min;
  const scaleMax = isAbove ? value + padding * 0.5 : range.max + padding;
  const scaleSpan = scaleMax - scaleMin;

  const rangeLeftPct = ((range.min - scaleMin) / scaleSpan) * 100;
  const rangeWidthPct = ((range.max - range.min) / scaleSpan) * 100;
  const rangeMaxPct = ((range.max - scaleMin) / scaleSpan) * 100;
  const markerPct = Math.min(Math.max(((value - scaleMin) / scaleSpan) * 100, 2), 98);

  const isHealthy = value >= range.min && value <= range.max;
  const isHigh = value > range.max;
  const markerColor = isHealthy ? '#3b8a5a' : isHigh ? '#3b8a5a' : '#E85D4D';

  return (
    <div className="mt-3">
      <div className="relative h-3 w-full rounded-full" style={{ backgroundColor: '#f0ede6' }}>
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${rangeLeftPct}%`,
            width: `${rangeWidthPct}%`,
            backgroundColor: '#d4edda',
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-5 w-2 rounded-full"
          style={{
            left: `${markerPct}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: markerColor,
          }}
        />
      </div>
      <div className="relative mt-1.5 text-[11px] font-medium" style={{ height: '16px' }}>
        {/* Min label — hide if marker is too close */}
        {!(isBelow && Math.abs(markerPct - rangeLeftPct) < 12) && (
          <span className="absolute" style={{ left: `${rangeLeftPct}%`, transform: 'translateX(-50%)', color: '#8a8279' }}>
            {range.min}{unit}
          </span>
        )}
        {/* Max label — hide if marker is too close */}
        {!(isHigh && Math.abs(markerPct - rangeMaxPct) < 12) && (
          <span className="absolute" style={{ left: `${rangeMaxPct}%`, transform: 'translateX(-50%)', color: '#8a8279' }}>
            {range.max}{unit}
          </span>
        )}
        {isHigh && (
          <span className="absolute font-bold" style={{
            left: `${markerPct}%`,
            transform: 'translateX(-50%)',
            color: '#3b8a5a',
          }}>
            {value.toFixed(1)}{unit} ▲
          </span>
        )}
        {isBelow && (
          <span className="absolute font-bold" style={{
            left: `${markerPct}%`,
            transform: 'translateX(-50%)',
            color: '#E85D4D',
          }}>
            {value.toFixed(1)}{unit} ▼
          </span>
        )}
      </div>
    </div>
  );
}

type ExtendedFunnel = FunnelData & {
  total_contacts?: number;
  quality_leads?: number;
  spam_count?: number;
};

type Props = {
  data: ExtendedFunnel | undefined;
  onStageClick?: (stage: FunnelStage, title?: string) => void;
};

function CohortTiles({ data, onStageClick }: Props) {
  if (!data) return null;

  const rawContacts = parseInt(data.total_contacts as any) || 0;
  const quality = parseInt(data.quality_leads as any) || parseInt(data.leads as any) || 0;
  const contacts = Math.max(rawContacts, quality);
  const spam = Math.max(contacts - quality, 0);
  const inspScheduled = parseInt(data.inspection_scheduled as any) || 0;
  const estApproved = parseInt(data.estimate_approved as any) || 0;

  const bookRate = quality > 0 ? (inspScheduled / quality) * 100 : 0;
  const closeRate = inspScheduled > 0 ? (estApproved / inspScheduled) * 100 : 0;
  const fullFunnel = quality > 0 ? (estApproved / quality) * 100 : 0;

  const tiles = [
    {
      label: 'Contacts',
      value: String(contacts),
      sub: spam > 0 ? `${quality} quality leads · ${spam} removed` : `${quality} quality leads`,
      bar: null,
      stage: 'cpl_leads' as FunnelStage,
    },
    {
      label: 'Inspection Book Rate',
      value: `${bookRate.toFixed(1)}%`,
      sub: `${inspScheduled} inspections / ${quality} leads`,
      bar: <CohortRangeBar value={bookRate} range={BOOK_RATE_RANGE} scaleMax={BOOK_RATE_SCALE} />,
      stage: 'inspection_scheduled' as FunnelStage,
    },
    {
      label: 'Estimate Close Rate',
      value: `${closeRate.toFixed(1)}%`,
      sub: `${estApproved} approved / ${inspScheduled} inspections`,
      bar: <CohortRangeBar value={closeRate} range={CLOSE_RATE_RANGE} scaleMax={CLOSE_RATE_SCALE} />,
      stage: 'estimate_approved' as FunnelStage,
    },
    {
      label: 'Full Funnel',
      value: `${fullFunnel.toFixed(1)}%`,
      sub: `${estApproved} approved / ${quality} leads`,
      bar: <CohortRangeBar value={fullFunnel} range={FULL_FUNNEL_RANGE} scaleMax={FULL_FUNNEL_SCALE} />,
      stage: 'estimate_approved' as FunnelStage,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {tiles.map((tile) => (
        <Paper
          key={tile.label}
          className="flex flex-col rounded-xl p-5 shadow-sm transition-all cursor-pointer hover:shadow-md"
          onClick={() => onStageClick?.(tile.stage, tile.label)}
        >
          <Typography className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {tile.label}
          </Typography>
          <Typography className="mt-1 text-3xl font-bold tracking-tight">
            {tile.value}
          </Typography>
          <Typography className="mt-1 text-xs text-gray-400">
            {tile.sub}
          </Typography>
          {tile.bar}
        </Paper>
      ))}
    </div>
  );
}

export default memo(CohortTiles);
