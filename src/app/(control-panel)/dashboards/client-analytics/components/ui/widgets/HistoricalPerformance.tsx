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

const metricsList: { key: Metric; label: string; format: (v: number) => string }[] = [
  { key: 'leads', label: 'Leads', format: (v) => String(Math.round(v)) },
  { key: 'spend', label: 'Ad Spend', format: (v) => `$${(v / 1000).toFixed(1)}K` },
  { key: 'cpl', label: 'CPL', format: (v) => `$${v.toFixed(0)}` },
  { key: 'roas', label: 'ROAS', format: (v) => `${v.toFixed(1)}x` },
  { key: 'revenue', label: 'Revenue', format: (v) => `$${(v / 1000).toFixed(1)}K` },
];

function HistoricalPerformance({ data }: Props) {
  const [metric, setMetric] = useState<Metric>('leads');

  if (!data || !Array.isArray(data) || data.length === 0) return null;

  const cfg = metricsList.find((m) => m.key === metric)!;
  const getValue = (d: MonthlyTrend): number => parseFloat((d as any)[metric]) || 0;

  // Use all data as a continuous timeline (last 12 months)
  // Take the most recent 12 months
  const recent = data.slice(-12);
  const labels = recent.map((d) => (d as any).short_label || d.label);
  const values = recent.map(getValue);

  // Build prior year comparison: for each month in recent, find the same month 12 months earlier
  const priorValues = recent.map((d) => {
    const shortLabel = (d as any).short_label;
    const year = (d as any).year;
    const priorMatch = data.find(
      (p) => (p as any).short_label === shortLabel && (p as any).year === year - 1
    );
    return priorMatch ? getValue(priorMatch) : null;
  });
  const hasPriorYear = priorValues.some((v) => v !== null && v > 0);

  // Latest values for header
  const latestValue = values[values.length - 1] || 0;
  const priorMonthValue = values.length > 1 ? values[values.length - 2] : null;
  const lastYearValue = priorValues[priorValues.length - 1];

  // Series
  const series: ApexAxisChartSeries = [
    { name: 'Current', data: values },
  ];
  const colors = ['#000000'];
  const strokeWidth = [3];
  const dashArray = [0];

  if (hasPriorYear) {
    series.push({ name: 'Prior Year', data: priorValues as number[] });
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
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#8a8279', fontSize: '11px' } },
    },
    yaxis: {
      labels: {
        formatter: cfg.format,
        style: { colors: '#8a8279', fontSize: '11px' },
      },
      min: 0,
    },
    tooltip: {
      theme: 'light',
      custom: ({ series: s, dataPointIndex }) => {
        const val = s[0][dataPointIndex];
        const priorVal = hasPriorYear && s[1] ? s[1][dataPointIndex] : null;
        const monthLabel = labels[dataPointIndex];
        const prevMonth = dataPointIndex > 0 ? s[0][dataPointIndex - 1] : null;

        let html = `<div style="padding:10px 14px;font-size:12px;line-height:1.6">`;
        html += `<div style="font-weight:700;color:#000;margin-bottom:4px">${monthLabel}</div>`;
        html += `<div style="color:#000">${cfg.label}: <strong>${cfg.format(val)}</strong></div>`;

        if (prevMonth !== null) {
          const change = val - prevMonth;
          const pct = prevMonth > 0 ? ((change / prevMonth) * 100).toFixed(0) : '—';
          const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
          const color = change > 0 ? (metric === 'cpl' ? '#c44a3c' : '#3b8a5a') : change < 0 ? (metric === 'cpl' ? '#3b8a5a' : '#c44a3c') : '#8a8279';
          html += `<div style="color:${color}">${arrow} ${pct}% vs prior month</div>`;
        }

        if (priorVal !== null && priorVal !== undefined && priorVal > 0) {
          const yoyChange = val - priorVal;
          const yoyPct = priorVal > 0 ? ((yoyChange / priorVal) * 100).toFixed(0) : '—';
          const yoyArrow = yoyChange > 0 ? '↑' : yoyChange < 0 ? '↓' : '→';
          const yoyColor = yoyChange > 0 ? (metric === 'cpl' ? '#c44a3c' : '#3b8a5a') : yoyChange < 0 ? (metric === 'cpl' ? '#3b8a5a' : '#c44a3c') : '#8a8279';
          html += `<div style="color:#c5bfb6;margin-top:2px">Prior year: ${cfg.format(priorVal)}</div>`;
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
              {labels[labels.length - 1]}
            </Typography>
          </div>
          <div className="mt-0.5 flex gap-4 text-[11px]" style={{ color: '#8a8279' }}>
            {priorMonthValue !== null && (
              <span>Prior month: {cfg.format(priorMonthValue)}</span>
            )}
            {lastYearValue !== null && lastYearValue > 0 && (
              <span>Year ago: {cfg.format(lastYearValue)}</span>
            )}
          </div>
        </div>

        <div className="flex gap-1">
          {metricsList.map((m) => (
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

      {hasPriorYear && (
        <div className="flex gap-4 px-6 pb-1 text-[10px]" style={{ color: '#8a8279' }}>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4" style={{ backgroundColor: '#000' }} /> Last 12 months
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 border-t border-dashed" style={{ borderColor: '#c5bfb6' }} /> Prior year
          </span>
        </div>
      )}

      <div className="px-2 pb-4" style={{ height: 280 }}>
        <ReactApexChart options={chartOptions} series={series} type="line" height="100%" />
      </div>
    </Paper>
  );
}

export default memo(HistoricalPerformance);
