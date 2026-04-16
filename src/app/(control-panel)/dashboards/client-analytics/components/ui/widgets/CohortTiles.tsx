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
  /** Book rate data source. Falls back to `data` if not provided. */
  bookRateData?: ExtendedFunnel;
  /** Close rate + full funnel data source. Falls back to `data`. */
  closeRateData?: ExtendedFunnel;
  /** True when the selected range extends into the last 14 days — book-rate data
   *  still includes leads that haven't had time to book yet. Rate is shown with
   *  a disclaimer so users read it as an early indicator, not a final number. */
  bookImmature?: boolean;
  /** Same idea for close rate / full funnel: true when range extends into the
   *  last 30 days (inspections haven't had time to close). */
  closeImmature?: boolean;
  onStageClick?: (stage: FunnelStage, title?: string) => void;
};

const MIN_SAMPLE = 10; // below this, show dash rather than a misleading %

function CohortTiles({ data, bookRateData, closeRateData, bookImmature, closeImmature, onStageClick }: Props) {
  if (!data) return null;

  const rawContacts = parseInt(data.total_contacts as any) || 0;
  const quality = parseInt(data.quality_leads as any) || parseInt(data.leads as any) || 0;
  const contacts = Math.max(rawContacts, quality);
  const spam = Math.max(contacts - quality, 0);

  // Book rate — always compute from whatever data the parent passes; the
  // parent is responsible for choosing whether that's capped-to-mature or
  // the user's full range. `bookImmature` just flags "this number includes
  // leads still in the delay window, show a disclaimer".
  const bookSource = bookRateData || data;
  const bookQuality = parseInt(bookSource.quality_leads as any) || parseInt(bookSource.leads as any) || 0;
  const bookInspScheduled = parseInt(bookSource.inspection_scheduled as any) || 0;
  // Show rate whenever we have any sample; add a "small sample" disclaimer when below MIN_SAMPLE.
  // Matches how Sy's dashboard surfaces early-read rates — we let clients see the number + a caveat
  // rather than hiding it behind a dash.
  const bookRate = bookQuality > 0 ? (bookInspScheduled / bookQuality) * 100 : null;
  const bookSmallSample = bookQuality > 0 && bookQuality < MIN_SAMPLE;

  // Close rate + full funnel — same idea, different delay window.
  const closeSource = closeRateData || data;
  const closeQuality = parseInt(closeSource.quality_leads as any) || parseInt(closeSource.leads as any) || 0;
  const closeInspScheduled = parseInt(closeSource.inspection_scheduled as any) || 0;
  const closeEstApproved = parseInt(closeSource.estimate_approved as any) || 0;
  const closeRate = closeInspScheduled > 0 ? (closeEstApproved / closeInspScheduled) * 100 : null;
  const closeSmallSample = closeInspScheduled > 0 && closeInspScheduled < MIN_SAMPLE;
  const fullFunnel = closeQuality > 0 ? (closeEstApproved / closeQuality) * 100 : null;
  const fullFunnelSmallSample = closeQuality > 0 && closeQuality < MIN_SAMPLE;

  const fmtRate = (v: number | null) => v == null ? '—' : `${v.toFixed(1)}%`;

  const bookSub = bookRate == null
    ? `No leads in window yet`
    : `${bookInspScheduled} of ${bookQuality} leads`;

  const closeSub = closeRate == null
    ? `No inspections in window yet`
    : `${closeEstApproved} of ${closeInspScheduled} inspections`;

  const fullFunnelSub = fullFunnel == null
    ? `No leads in window yet`
    : `${closeEstApproved} of ${closeQuality} leads`;

  // Build disclaimer strings — combine early-read + small-sample into one line when both apply
  const buildNote = (immature: boolean, immatureText: string, smallSample: boolean, sampleLabel: string, sampleCount: number): string | null => {
    if (immature && smallSample) return `Early read — limited sample (${sampleCount} ${sampleLabel}, best with ${MIN_SAMPLE}+)`;
    if (immature) return immatureText;
    if (smallSample) return `Limited sample — ${sampleCount} ${sampleLabel} (best with ${MIN_SAMPLE}+)`;
    return null;
  };

  const tiles = [
    {
      label: 'Contacts',
      value: String(contacts),
      sub: spam > 0 ? `${quality} quality leads · ${spam} removed` : `${quality} quality leads`,
      bar: null,
      immatureNote: null as string | null,
      stage: 'cpl_leads' as FunnelStage,
    },
    {
      label: 'Inspection Book Rate',
      value: fmtRate(bookRate),
      sub: bookSub,
      bar: bookRate != null ? <CohortRangeBar value={bookRate} range={BOOK_RATE_RANGE} scaleMax={BOOK_RATE_SCALE} /> : null,
      immatureNote: buildNote(!!bookImmature, 'Early read — leads still within 14-day maturation window', bookSmallSample, 'leads', bookQuality),
      stage: 'inspection_scheduled' as FunnelStage,
    },
    {
      label: 'Estimate Close Rate',
      value: fmtRate(closeRate),
      sub: closeSub,
      bar: closeRate != null ? <CohortRangeBar value={closeRate} range={CLOSE_RATE_RANGE} scaleMax={CLOSE_RATE_SCALE} /> : null,
      immatureNote: buildNote(!!closeImmature, 'Early read — inspections still within 30-day maturation window', closeSmallSample, 'inspections', closeInspScheduled),
      stage: 'estimate_approved' as FunnelStage,
    },
    {
      label: 'Full Funnel',
      value: fmtRate(fullFunnel),
      sub: fullFunnelSub,
      bar: fullFunnel != null ? <CohortRangeBar value={fullFunnel} range={FULL_FUNNEL_RANGE} scaleMax={FULL_FUNNEL_SCALE} /> : null,
      immatureNote: buildNote(!!closeImmature, 'Early read — leads still within 30-day maturation window', fullFunnelSmallSample, 'leads', closeQuality),
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
          {tile.immatureNote && (
            <Typography className="mt-2 text-[10px] italic" style={{ color: '#c4890a' }}>
              ⚠ {tile.immatureNote}
            </Typography>
          )}
        </Paper>
      ))}
      {/* Methodology blurb sits at the bottom so it's available without
          competing with the tiles for attention. */}
      <Typography className="px-1 text-[11px]" style={{ color: '#8a8279' }}>
        Follows the date range above, excluding recent leads that haven't had time to progress —{' '}
        <a
          href="/share/how-it-works#cohort-benchmarks"
          target="_blank"
          rel="noreferrer"
          className="underline"
          style={{ color: '#8a8279' }}
        >
          how this works
        </a>
      </Typography>
    </div>
  );
}

export default memo(CohortTiles);
