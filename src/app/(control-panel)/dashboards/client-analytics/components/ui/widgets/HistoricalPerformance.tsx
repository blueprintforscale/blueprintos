'use client';

import { memo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { MonthlyTrend } from '../../../api/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = { data: MonthlyTrend[] | undefined };

type Metric = 'leads' | 'spend' | 'cpl' | 'roas' | 'revenue';

const metricConfig: Record<Metric, { label: string; format: (v: number) => string; color: string }> = {
  leads: { label: 'Leads', format: (v) => String(v), color: '#1a1a1a' },
  spend: { label: 'Ad Spend', format: (v) => `$${(v / 1000).toFixed(1)}K`, color: '#6366f1' },
  cpl: { label: 'Cost Per Lead', format: (v) => `$${v.toFixed(0)}`, color: '#E85D4D' },
  roas: { label: 'ROAS', format: (v) => `${v.toFixed(1)}x`, color: '#10b981' },
  revenue: { label: 'Revenue', format: (v) => `$${(v / 1000).toFixed(1)}K`, color: '#f59e0b' },
};

function HistoricalPerformance({ data }: Props) {
  const theme = useTheme();
  const [metric, setMetric] = useState<Metric>('leads');
  const [showPriorYear, setShowPriorYear] = useState(false);

  if (!data || data.length === 0) return null;

  const cfg = metricConfig[metric];
  const labels = data.map((d) => (d as any).short_label || d.label);
  const years = [...new Set(data.map((d) => (d as any).year))].sort();
  const hasMultipleYears = years.length > 1;

  // Split by year for comparison
  const currentYear = years[years.length - 1];
  const priorYear = years.length > 1 ? years[years.length - 2] : null;

  const currentData = data.filter((d) => (d as any).year === currentYear);
  const priorData = priorYear ? data.filter((d) => (d as any).year === priorYear) : [];

  const getValue = (d: MonthlyTrend): number => {
    const raw = (d as any)[metric];
    return parseFloat(raw) || 0;
  };

  const currentValues = currentData.map(getValue);
  const currentLabels = currentData.map((d) => (d as any).short_label || d.label);

  // Moving average (3-month)
  const movingAvg = currentValues.map((_, i) => {
    const start = Math.max(0, i - 2);
    const slice = currentValues.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });

  const series: ApexAxisChartSeries = [
    { name: `${cfg.label} ${currentYear}`, type: 'column', data: currentValues },
    { name: 'Trend (3-mo avg)', type: 'line', data: movingAvg },
  ];

  const colors = [cfg.color, '#999'];
  const strokeWidth = [0, 3];
  const dashArray = [0, 5];

  if (showPriorYear && priorData.length > 0) {
    const priorValues = priorData.map(getValue);
    // Pad to align months
    const padded = new Array(Math.max(0, currentValues.length - priorValues.length)).fill(null).concat(priorValues);
    series.push({ name: `${cfg.label} ${priorYear}`, type: 'column', data: padded as number[] });
    colors.push('#d4d4d4');
    strokeWidth.push(0);
    dashArray.push(0);
  }

  const chartOptions: ApexOptions = {
    chart: { fontFamily: 'inherit', foreColor: 'inherit', toolbar: { show: false }, zoom: { enabled: false } },
    colors,
    stroke: { width: strokeWidth, curve: 'smooth', dashArray },
    plotOptions: { bar: { columnWidth: '50%', borderRadius: 4 } },
    xaxis: { categories: currentLabels },
    yaxis: {
      labels: { formatter: (v: number) => cfg.format(v) },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (v: number) => cfg.format(v) },
    },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
    legend: { position: 'top' },
    dataLabels: { enabled: false },
  };

  return (
    <Paper className="flex flex-col rounded-xl p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography className="text-lg font-semibold">Performance Over Time</Typography>
          <Typography className="text-xs text-gray-400">Monthly metrics with trend line</Typography>
        </div>
        <div className="flex items-center gap-3">
          {hasMultipleYears && (
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-500">
              <input type="checkbox" checked={showPriorYear} onChange={(e) => setShowPriorYear(e.target.checked)} className="rounded" />
              Compare to {priorYear}
            </label>
          )}
        </div>
      </div>

      <ToggleButtonGroup
        value={metric}
        exclusive
        onChange={(_, v) => v && setMetric(v)}
        size="small"
        className="mb-4"
      >
        {(Object.keys(metricConfig) as Metric[]).map((key) => (
          <ToggleButton key={key} value={key} className="text-xs capitalize">
            {metricConfig[key].label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <div className="h-80">
        <ReactApexChart options={chartOptions} series={series} type="line" height="100%" />
      </div>
    </Paper>
  );
}

export default memo(HistoricalPerformance);
