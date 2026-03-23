'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { MonthlyTrend } from '../../../api/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = { data: MonthlyTrend[] | undefined };

function MonthlyTrendChart({ data }: Props) {
  const theme = useTheme();

  if (!data || !Array.isArray(data) || data.length === 0) return null;

  const labels = data.map((d) => d.label);
  const leads = data.map((d) => parseInt(d.leads, 10));
  const cpl = data.map((d) => parseFloat(d.cpl));
  const spend = data.map((d) => parseFloat(d.spend));

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: 'inherit',
      foreColor: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['#000000', '#E85D4D'],
    stroke: { width: [3, 2], curve: 'smooth', dashArray: [0, 5] },
    xaxis: { categories: labels },
    yaxis: [
      { title: { text: 'Leads' }, min: 0 },
      { opposite: true, title: { text: 'CPL ($)' }, min: 0 },
    ],
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number, opts: { seriesIndex: number }) =>
          opts.seriesIndex === 1 ? `$${val.toFixed(0)}` : `${val}`,
      },
    },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
    legend: { position: 'top' },
  };

  const series = [
    { name: 'Leads', type: 'column', data: leads },
    { name: 'CPL', type: 'line', data: cpl },
  ];

  return (
    <Paper className="flex flex-col rounded-xl p-6 shadow-sm">
      <Typography className="mb-2 text-lg font-semibold">Monthly Trend</Typography>
      <Typography className="mb-4 text-xs text-gray-400">Leads and cost per lead over time</Typography>
      <div className="h-72">
        <ReactApexChart options={chartOptions} series={series} type="line" height="100%" />
      </div>
    </Paper>
  );
}

export default memo(MonthlyTrendChart);
