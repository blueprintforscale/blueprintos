'use client';

import { memo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { MonthlyTrend } from '../../../api/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = { data: MonthlyTrend[] | undefined };
type Metric = 'leads' | 'spend' | 'cpl' | 'book_rate' | 'close_rate' | 'roas';

const metricsList: { key: Metric; label: string; format: (v: number) => string; color: string }[] = [
  { key: 'leads', label: 'Leads', format: (v) => String(Math.round(v)), color: '#000000' },
  { key: 'spend', label: 'Ad Spend', format: (v) => `$${(v / 1000).toFixed(1)}K`, color: '#5a554d' },
  { key: 'cpl', label: 'CPL', format: (v) => `$${v.toFixed(0)}`, color: '#E85D4D' },
  { key: 'book_rate', label: 'Book Rate', format: (v) => `${v.toFixed(0)}%`, color: '#E85D4D' },
  { key: 'close_rate', label: 'Close Rate', format: (v) => `${v.toFixed(0)}%`, color: '#3b8a5a' },
  { key: 'roas', label: 'ROAS', format: (v) => `${v.toFixed(1)}x`, color: '#3b8a5a' },
];

// Detect if a month_start is the current (incomplete) month
function isCurrentMonth(monthStart: string): boolean {
  const now = new Date();
  const d = new Date(monthStart + 'T00:00:00');
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function HistoricalPerformance({ data }: Props) {
  const [metric, setMetric] = useState<Metric>('leads');
  const [overlays, setOverlays] = useState<Metric[]>([]);

  if (!data || !Array.isArray(data) || data.length === 0) return null;

  const cfg = metricsList.find((m) => m.key === metric)!;
  const getValue = (d: MonthlyTrend, key: Metric): number => parseFloat((d as any)[key]) || 0;

  const recent = data.slice(-12);
  const labels = recent.map((d) => (d as any).short_label || d.label);
  const values = recent.map((d) => getValue(d, metric));

  // Detect which data points are incomplete (current month)
  const incompleteIdx = recent.findIndex((d) => isCurrentMonth((d as any).month_start));
  const hasIncomplete = incompleteIdx >= 0;

  // Split primary series: solid for complete months, dashed for current month
  // ApexCharts doesn't support per-point dash, so we use two series:
  // 1. Complete months (solid) — with null for the incomplete month
  // 2. Incomplete bridge (dashed) — only the last complete point + incomplete point
  const completeValues = values.map((v, i) => (hasIncomplete && i === incompleteIdx) ? null : v);
  const incompleteValues: (number | null)[] = hasIncomplete
    ? values.map((v, i) => {
        if (i === incompleteIdx) return v;
        if (i === incompleteIdx - 1) return v; // bridge from last complete point
        return null;
      })
    : [];

  // Prior year for primary metric
  const priorValues = recent.map((d) => {
    const shortLabel = (d as any).short_label;
    const year = (d as any).year;
    const priorMatch = data.find((p) => (p as any).short_label === shortLabel && (p as any).year === year - 1);
    return priorMatch ? getValue(priorMatch, metric) : null;
  });
  const hasPriorYear = priorValues.some((v) => v !== null && v > 0);

  // Use last complete month for headline value
  const lastCompleteIdx = hasIncomplete && incompleteIdx > 0 ? incompleteIdx - 1 : values.length - 1;
  const latestValue = values[lastCompleteIdx] || 0;
  const incompleteValue = hasIncomplete ? values[incompleteIdx] : null;
  const priorMonthValue = lastCompleteIdx > 0 ? values[lastCompleteIdx - 1] : null;
  const lastYearValue = priorValues[lastCompleteIdx];

  // Build series
  const series: ApexAxisChartSeries = [
    { name: cfg.label, data: completeValues as number[] },
  ];
  const colors = [cfg.color];
  const strokeWidth = [3];
  const dashArray = [0];

  if (hasIncomplete) {
    series.push({ name: `${cfg.label} (in progress)`, data: incompleteValues as number[] });
    colors.push(cfg.color);
    strokeWidth.push(2);
    dashArray.push(6);
  }

  if (hasPriorYear) {
    series.push({ name: `${cfg.label} (prior year)`, data: priorValues as number[] });
    colors.push('#c5bfb6');
    strokeWidth.push(2);
    dashArray.push(5);
  }

  // Overlay series
  overlays.forEach((ovKey) => {
    const ovCfg = metricsList.find((m) => m.key === ovKey)!;
    const ovValues = recent.map((d) => getValue(d, ovKey));
    // Split overlay into complete + incomplete too
    const ovComplete = ovValues.map((v, i) => (hasIncomplete && i === incompleteIdx) ? null : v);
    const ovIncomplete: (number | null)[] = hasIncomplete
      ? ovValues.map((v, i) => (i === incompleteIdx || i === incompleteIdx - 1) ? v : null)
      : [];

    series.push({ name: ovCfg.label, data: ovComplete as number[] });
    colors.push(ovCfg.color);
    strokeWidth.push(2);
    dashArray.push(0);

    if (hasIncomplete) {
      series.push({ name: `${ovCfg.label} (in progress)`, data: ovIncomplete as number[] });
      colors.push(ovCfg.color);
      strokeWidth.push(2);
      dashArray.push(6);
    }
  });

  // Marker sizes: show dots on solid lines, hollow circle on incomplete points
  const markerSizes = series.map((s, i) => {
    if (i === 0) return 4; // primary solid
    return 0;
  });

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: 'inherit',
      foreColor: '#5a554d',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
    },
    colors,
    stroke: { width: strokeWidth, curve: 'smooth', dashArray },
    markers: { size: markerSizes, colors, strokeWidth: 0 },
    xaxis: {
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: 0,
        hideOverlappingLabels: false,
        style: {
          colors: labels.map((_, i) => (hasIncomplete && i === incompleteIdx) ? '#c5bfb6' : '#8a8279'),
          fontSize: '11px',
        },
      },
    },
    yaxis: overlays.length > 0 ? [
      { labels: { formatter: cfg.format, style: { colors: '#8a8279', fontSize: '11px' } }, min: 0 },
      ...overlays.map((ovKey) => {
        const ovCfg = metricsList.find((m) => m.key === ovKey)!;
        return { opposite: true, labels: { formatter: ovCfg.format, style: { colors: ovCfg.color, fontSize: '10px' } }, min: 0 };
      }),
    ] : {
      labels: { formatter: cfg.format, style: { colors: '#8a8279', fontSize: '11px' } },
      min: 0,
    },
    tooltip: {
      theme: 'light',
      shared: true,
      intersect: false,
      y: { formatter: (val: number, opts: { seriesIndex: number }) => {
        if (val === null || val === undefined) return '';
        // Find which metric this series belongs to
        const idx = opts.seriesIndex;
        // Primary + its incomplete
        if (idx <= (hasIncomplete ? 1 : 0)) return cfg.format(val);
        // Prior year
        const priorIdx = hasIncomplete ? 2 : 1;
        if (hasPriorYear && idx === priorIdx) return cfg.format(val);
        // Overlays (each has complete + incomplete if hasIncomplete)
        const overlayStart = priorIdx + (hasPriorYear ? 1 : 0);
        const step = hasIncomplete ? 2 : 1;
        const ovIdx = Math.floor((idx - overlayStart) / step);
        if (ovIdx >= 0 && ovIdx < overlays.length) {
          const ovCfg = metricsList.find((m) => m.key === overlays[ovIdx])!;
          return ovCfg.format(val);
        }
        return String(val);
      }},
    },
    grid: { borderColor: '#EEEAD9', xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    legend: { show: false },
    dataLabels: { enabled: false },
    annotations: hasIncomplete ? {
      xaxis: [{
        x: labels[incompleteIdx],
        borderColor: '#ddd8cb',
        strokeDashArray: 4,
        label: {
          text: 'In progress',
          borderColor: 'transparent',
          style: { background: 'transparent', color: '#c5bfb6', fontSize: '9px', fontWeight: 400, padding: { left: 4, right: 4, top: 2, bottom: 2 } },
          position: 'top',
          orientation: 'horizontal',
        },
      }],
    } : undefined,
  };

  const toggleOverlay = (key: Metric) => {
    if (key === metric) return;
    setOverlays((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : prev.length >= 2 ? [prev[1], key] : [...prev, key]);
  };

  return (
    <Paper className="flex flex-col rounded-xl border shadow-none" style={{ borderColor: '#ddd8cb' }}>
      <div className="flex flex-col gap-3 px-6 pt-5 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Typography className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#8a8279' }}>
            {cfg.label}
          </Typography>
          <div className="flex items-baseline gap-2">
            <Typography className="text-3xl font-bold" style={{ color: '#000' }}>
              {cfg.format(latestValue)}
            </Typography>
            <Typography className="text-xs" style={{ color: '#8a8279' }}>
              {labels[lastCompleteIdx]}
            </Typography>
            {incompleteValue !== null && (
              <Typography className="text-xs" style={{ color: '#c5bfb6' }}>
                {labels[incompleteIdx]} so far: {cfg.format(incompleteValue)}
              </Typography>
            )}
          </div>
          <div className="mt-0.5 flex gap-4 text-[11px]" style={{ color: '#8a8279' }}>
            {priorMonthValue !== null && <span>Prior month: {cfg.format(priorMonthValue)}</span>}
            {lastYearValue !== null && lastYearValue > 0 && <span>Year ago: {cfg.format(lastYearValue)}</span>}
          </div>
        </div>

        {/* Primary metric pills */}
        <div className="flex flex-wrap gap-1">
          {metricsList.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMetric(m.key); setOverlays((prev) => prev.filter((k) => k !== m.key)); }}
              className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor: metric === m.key ? '#000' : 'transparent',
                color: metric === m.key ? '#fff' : '#8a8279',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overlay toggles */}
      <div className="flex items-center gap-2 px-6 pb-2">
        <span className="text-[10px] font-medium" style={{ color: '#c5bfb6' }}>Compare:</span>
        <div className="flex flex-wrap gap-1">
          {metricsList.filter((m) => m.key !== metric).map((m) => {
            const isActive = overlays.includes(m.key);
            return (
              <button
                key={m.key}
                onClick={() => toggleOverlay(m.key)}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? m.color : 'transparent',
                  color: isActive ? '#fff' : '#c5bfb6',
                  border: `1px solid ${isActive ? m.color : '#ddd8cb'}`,
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-4" style={{ height: 300 }}>
        <ReactApexChart options={chartOptions} series={series} type="line" height="100%" />
      </div>
    </Paper>
  );
}

export default memo(HistoricalPerformance);
