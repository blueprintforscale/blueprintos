'use client';

import { memo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { MonthlyTrend } from '../../../api/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = { data: MonthlyTrend[] | undefined };
type Metric = 'leads' | 'spend' | 'cpl' | 'roas' | 'revenue';

const metrics: { key: Metric; label: string; format: (v: number) => string }[] = [
  { key: 'leads', label: 'Leads', format: (v) => String(Math.round(v)) },
  { key: 'spend', label: 'Ad Spend', format: (v) => `$${(v / 1000).toFixed(1)}K` },
  { key: 'cpl', label: 'CPL', format: (v) => `$${v.toFixed(0)}` },
  { key: 'roas', label: 'ROAS', format: (v) => `${v.toFixed(1)}x` },
  { key: 'revenue', label: 'Revenue', format: (v) => `$${(v / 1000).toFixed(1)}K` },
];

function HistoricalPerformance({ data }: Props) {
  const [metric, setMetric] = useState<Metric>('leads');

  if (!data || !Array.isArray(data) || data.length === 0) return null;

  const cfg = metrics.find((m) => m.key === metric)!;

  // Split by year
  const years = [...new Set(data.map((d) => (d as any).year))].sort() as number[];
  const currentYear = years[years.length - 1];
  const priorYear = years.length > 1 ? years[years.length - 2] : null;

  // Get current year data (YTD)
  const currentData = data.filter((d) => (d as any).year === currentYear);
  const priorData = priorYear ? data.filter((d) => (d as any).year === priorYear) : [];

  const getValue = (d: MonthlyTrend): number => parseFloat((d as any)[metric]) || 0;

  const currentValues = currentData.map(getValue);
  const currentLabels = currentData.map((d) => (d as any).short_label || d.label);

  // Current value (latest month)
  const latestValue = currentValues[currentValues.length - 1] || 0;
  const priorMonthValue = currentValues.length > 1 ? currentValues[currentValues.length - 2] : null;

  // Same month last year
  const latestMonth = currentData[currentData.length - 1];
  const latestMonthShort = latestMonth ? (latestMonth as any).short_label : '';
  const sameMonthLastYear = priorData.find((d) => (d as any).short_label === latestMonthShort);
  const lastYearValue = sameMonthLastYear ? getValue(sameMonthLastYear) : null;

  // Build series
  const series: ApexAxisChartSeries = [
    { name: String(currentYear), data: currentValues },
  ];

  const colors = ['#000000'];
  const strokeWidth = [3];
  const dashArray = [0];

  if (priorData.length > 0) {
    // Align prior year months to current year labels
    const priorValues = currentLabels.map((label) => {
      const match = priorData.find((d) => (d as any).short_label === label);
      return match ? getValue(match) : null;
    });
    series.push({ name: String(priorYear), data: priorValues as number[] });
    colors.push('#c5bfb6');
    strokeWidth.push(2);
    dashArray.push(5);
  }

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
    markers: { size: [4, 0], colors, strokeWidth: 0 },
    xaxis: {
      categories: currentLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#8a8279', fontSize: '11px' } },
    },
    yaxis: {
      labels: {
        formatter: cfg.format,
        style: { colors: '#8a8279', fontSize: '11px' },
      },
    },
    tooltip: {
      theme: 'light',
      custom: ({ series: s, seriesIndex, dataPointIndex, w }) => {
        const val = s[0][dataPointIndex];
        const priorVal = s[1] ? s[1][dataPointIndex] : null;
        const monthLabel = currentLabels[dataPointIndex];
        const prevMonth = dataPointIndex > 0 ? s[0][dataPointIndex - 1] : null;

        let html = `<div style="padding:10px 14px;font-size:12px;line-height:1.6">`;
        html += `<div style="font-weight:700;color:#000;margin-bottom:4px">${monthLabel} ${currentYear}</div>`;
        html += `<div style="color:#000">${cfg.label}: <strong>${cfg.format(val)}</strong></div>`;

        if (prevMonth !== null) {
          const change = val - prevMonth;
          const pct = prevMonth > 0 ? ((change / prevMonth) * 100).toFixed(0) : '—';
          const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
          const color = change > 0 ? (metric === 'cpl' ? '#c44a3c' : '#3b8a5a') : change < 0 ? (metric === 'cpl' ? '#3b8a5a' : '#c44a3c') : '#8a8279';
          html += `<div style="color:${color}">${arrow} ${pct}% vs prior month</div>`;
        }

        if (priorVal !== null && priorVal !== undefined) {
          const yoyChange = val - priorVal;
          const yoyPct = priorVal > 0 ? ((yoyChange / priorVal) * 100).toFixed(0) : '—';
          const yoyArrow = yoyChange > 0 ? '↑' : yoyChange < 0 ? '↓' : '→';
          const yoyColor = yoyChange > 0 ? (metric === 'cpl' ? '#c44a3c' : '#3b8a5a') : yoyChange < 0 ? (metric === 'cpl' ? '#3b8a5a' : '#c44a3c') : '#8a8279';
          html += `<div style="color:#c5bfb6;margin-top:2px">${priorYear}: ${cfg.format(priorVal)}</div>`;
          html += `<div style="color:${yoyColor}">${yoyArrow} ${yoyPct}% year over year</div>`;
        }

        html += `</div>`;
        return html;
      },
    },
    grid: {
      borderColor: '#EEEAD9',
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
  };

  return (
    <Paper className="flex flex-col rounded-xl border shadow-none" style={{ borderColor: '#ddd8cb' }}>
      {/* Header */}
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
              {currentLabels[currentLabels.length - 1]} {currentYear}
            </Typography>
          </div>
          {/* Comparison line */}
          <div className="mt-0.5 flex gap-4 text-[11px]" style={{ color: '#8a8279' }}>
            {priorMonthValue !== null && (
              <span>Prior month: {cfg.format(priorMonthValue)}</span>
            )}
            {lastYearValue !== null && (
              <span>{priorYear}: {cfg.format(lastYearValue)}</span>
            )}
          </div>
        </div>

        {/* Metric selector */}
        <div className="flex gap-1">
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
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

      {/* Legend */}
      {priorYear && (
        <div className="flex gap-4 px-6 pb-1 text-[10px]" style={{ color: '#8a8279' }}>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4" style={{ backgroundColor: '#000' }} /> {currentYear}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 border-t border-dashed" style={{ borderColor: '#c5bfb6' }} /> {priorYear}
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="px-2 pb-4" style={{ height: 280 }}>
        <ReactApexChart options={chartOptions} series={series} type="line" height="100%" />
      </div>
    </Paper>
  );
}

export default memo(HistoricalPerformance);
