'use client';

import { memo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { MonthlyTrend } from '../../../api/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = { data: MonthlyTrend[] | undefined; startDate?: string };
type Metric = 'leads' | 'spend' | 'cpl' | 'conversions';

const metricsList: { key: Metric; label: string; format: (v: number) => string; color: string; projectable: boolean }[] = [
  { key: 'leads', label: 'Leads', format: (v) => String(Math.round(v)), color: '#000000', projectable: true },
  { key: 'spend', label: 'Ad Spend', format: (v) => `$${(v / 1000).toFixed(1)}K`, color: '#5a554d', projectable: true },
  { key: 'cpl', label: 'CPL', format: (v) => `$${v.toFixed(0)}`, color: '#E85D4D', projectable: false },
  { key: 'conversions', label: 'Conversions', format: (v) => String(Math.round(v)), color: '#6366f1', projectable: true },
];

function isCurrentMonth(monthStart: string): boolean {
  const now = new Date();
  const d = new Date(monthStart);
  return d.getUTCFullYear() === now.getFullYear() && d.getUTCMonth() === now.getMonth();
}

function getMonthProgress(): { dayElapsed: number; daysInMonth: number; fraction: number } {
  const now = new Date();
  const dayElapsed = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return { dayElapsed, daysInMonth, fraction: dayElapsed / daysInMonth };
}

function HistoricalPerformance({ data, startDate }: Props) {
  const [metric, setMetric] = useState<Metric>('leads');
  const [overlays, setOverlays] = useState<Metric[]>([]);

  if (!data || !Array.isArray(data) || data.length === 0) return null;

  const cfg = metricsList.find((m) => m.key === metric)!;
  const getValue = (d: MonthlyTrend, key: Metric): number => parseFloat((d as any)[key]) || 0;

  const recent = data.slice(-12);
  const labels = recent.map((d) => (d as any).short_label || d.label);

  // Detect program start month index
  const startMonthIdx = startDate ? recent.findIndex((d) => {
    const ms = new Date((d as any).month_start);
    const sd = new Date(startDate);
    return ms.getUTCFullYear() === sd.getFullYear() && ms.getUTCMonth() === sd.getMonth();
  }) : -1;
  const values = recent.map((d) => getValue(d, metric));

  // Detect current (incomplete) month
  const lastIsIncomplete = recent.length > 0 && isCurrentMonth((recent[recent.length - 1] as any).month_start);
  const forecastCount = lastIsIncomplete ? 1 : 0;

  // Projection for current month
  const { fraction: monthFraction } = getMonthProgress();
  const currentValue = lastIsIncomplete ? values[values.length - 1] : null;
  const projectedValue = lastIsIncomplete && cfg.projectable && currentValue !== null && monthFraction > 0
    ? Math.round(currentValue / monthFraction)
    : null;

  // Prior year for primary metric
  const priorValues = recent.map((d) => {
    const shortLabel = (d as any).short_label;
    const year = (d as any).year;
    const priorMatch = data.find((p) => (p as any).short_label === shortLabel && (p as any).year === year - 1);
    return priorMatch ? getValue(priorMatch, metric) : null;
  });
  const hasPriorYear = priorValues.some((v) => v !== null && v > 0);

  // Headline: use last complete month
  const lastCompleteIdx = lastIsIncomplete ? values.length - 2 : values.length - 1;
  const latestValue = values[lastCompleteIdx] || 0;
  const incompleteValue = lastIsIncomplete ? values[values.length - 1] : null;
  const priorMonthValue = lastCompleteIdx > 0 ? values[lastCompleteIdx - 1] : null;
  const lastYearValue = priorValues[lastCompleteIdx];

  // Trend line (linear regression starting from program start)
  const trendStart = startMonthIdx >= 0 ? startMonthIdx : 0;
  const trendInputs = lastIsIncomplete && projectedValue !== null && cfg.projectable
    ? [...values.slice(0, -1), projectedValue]
    : values;
  const trendSlice = trendInputs.slice(trendStart);
  const nPts = trendSlice.length;
  let trendLine: (number | null)[] | null = null;
  if (nPts >= 2) {
    const sX = trendSlice.reduce((s, _, i) => s + i, 0);
    const sY = trendSlice.reduce((s, v) => s + v, 0);
    const sXY = trendSlice.reduce((s, v, i) => s + i * v, 0);
    const sX2 = trendSlice.reduce((s, _, i) => s + i * i, 0);
    const sl = (nPts * sXY - sX * sY) / (nPts * sX2 - sX * sX);
    const ic = (sY - sl * sX) / nPts;
    // null before start, straight regression from start onward
    trendLine = trendInputs.map((_, i) =>
      i < trendStart ? null : Math.max(Math.round(ic + sl * (i - trendStart)), 0)
    );
  }

  // Build series
  const series: ApexAxisChartSeries = [
    { name: cfg.label, data: values },
  ];
  const seriesColors = [cfg.color];
  const strokeWidth = [3];
  const dashArray = [0];
  const strokeCurve: ('smooth' | 'straight')[] = ['smooth'];

  if (hasPriorYear) {
    series.push({ name: `${cfg.label} (prior year)`, data: priorValues as number[] });
    seriesColors.push('#c5bfb6');
    strokeWidth.push(2);
    dashArray.push(5);
    strokeCurve.push('smooth');
  }

  if (trendLine) {
    series.push({ name: 'Trend', data: trendLine as any });
    seriesColors.push('#ddd8cb');
    strokeWidth.push(1.5);
    dashArray.push(6);
    strokeCurve.push('straight');
  }

  // Overlay series
  overlays.forEach((ovKey) => {
    const ovCfg = metricsList.find((m) => m.key === ovKey)!;
    const ovValues = recent.map((d) => getValue(d, ovKey));
    series.push({ name: ovCfg.label, data: ovValues });
    seriesColors.push(ovCfg.color);
    strokeWidth.push(2);
    dashArray.push(3);
    strokeCurve.push('smooth');
  });

  // Projection: point annotation at projected value for current month
  const annotations: ApexOptions['annotations'] = {};
  if (startMonthIdx >= 0) {
    annotations.xaxis = [{
      x: labels[startMonthIdx],
      borderColor: '#E85D4D',
      strokeDashArray: 3,
      opacity: 0.6,
      label: {
        text: 'Program Start',
        borderColor: 'transparent',
        position: 'top',
        orientation: 'horizontal',
        offsetY: -5,
        style: {
          background: '#E85D4D',
          color: '#fff',
          fontSize: '9px',
          fontWeight: 600,
          padding: { left: 4, right: 4, top: 2, bottom: 2 },
        },
      },
    }];
  }
  if (projectedValue !== null && projectedValue > 0) {
    annotations.points = [{
      x: labels[labels.length - 1],
      y: projectedValue,
      seriesIndex: 0,
      marker: {
        size: 5,
        fillColor: '#fff',
        strokeColor: cfg.color,
        strokeWidth: 2,
        shape: 'circle',
      },
      label: {
        text: `~${cfg.format(projectedValue)}`,
        borderColor: cfg.color,
        offsetY: -15,
        offsetX: -40,
        style: {
          background: '#1a1a1a',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 600,
          padding: { left: 6, right: 6, top: 3, bottom: 3 },
        },
      },
    }];
  }

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: 'inherit',
      foreColor: '#5a554d',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
    },
    colors: seriesColors,
    stroke: { width: strokeWidth, curve: strokeCurve as any, dashArray },
    markers: { size: [4, ...new Array(series.length - 1).fill(0)], colors: seriesColors, strokeWidth: 0 },
    forecastDataPoints: { count: forecastCount, dashArray: 6, strokeWidth: 2 },
    xaxis: {
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#8a8279', fontSize: '11px' } },
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
        const idx = opts.seriesIndex;
        if (idx === 0) return cfg.format(val);
        if (hasPriorYear && idx === 1) return cfg.format(val);
        const ovIdx = idx - (hasPriorYear ? 2 : 1);
        if (ovIdx >= 0 && ovIdx < overlays.length) {
          const ovCfg = metricsList.find((m) => m.key === overlays[ovIdx])!;
          return ovCfg.format(val);
        }
        return String(val);
      }},
    },
    grid: { borderColor: '#EEEAD9', xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } }, padding: { top: 20 } },
    legend: { show: false },
    dataLabels: { enabled: false },
    annotations,
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
          </div>
          <div className="mt-0.5 flex flex-col gap-0.5">
            <div className="flex gap-4 text-[11px]" style={{ color: '#8a8279' }}>
              {priorMonthValue !== null && <span>Prior month: {cfg.format(priorMonthValue)}</span>}
              {lastYearValue !== null && lastYearValue > 0 && <span>Year ago: {cfg.format(lastYearValue)}</span>}
            </div>
            {incompleteValue !== null && (
              <div className="flex gap-3 text-[11px]" style={{ color: '#c5bfb6' }}>
                <span>{labels[labels.length - 1]} so far: {cfg.format(incompleteValue)}</span>
                {projectedValue !== null && (
                  <span>Projected: ~{cfg.format(projectedValue)}</span>
                )}
              </div>
            )}
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
