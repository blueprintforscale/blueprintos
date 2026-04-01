'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { CallAnalyticsData } from '../../../api/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const HOUR_LABELS = [
  '12a','1a','2a','3a','4a','5a','6a','7a',
  '8a','9a','10a','11a','12p','1p','2p','3p',
  '4p','5p','6p','7p','8p','9p','10p','11p',
];

type Props = { data: CallAnalyticsData | undefined; dateFrom?: string; dateTo?: string };

function HourlyMissedChart({ data, dateFrom, dateTo }: Props) {
  if (!data || !data.hourly_missed) return null;

  const hasData = data.hourly_missed.some((v) => v > 0);
  if (!hasData) return null;

  const bizStart = data.biz_hours?.start ?? 8;
  const bizEnd = data.biz_hours?.end ?? 18;

  const colors = data.hourly_missed.map((_, i) =>
    i >= bizStart && i < bizEnd ? '#E85D4D' : '#d4a08a'
  );

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: { borderRadius: 2, columnWidth: '60%', distributed: true },
    },
    colors,
    dataLabels: { enabled: false },
    xaxis: {
      categories: HOUR_LABELS,
      labels: {
        style: { fontSize: '9px', colors: HOUR_LABELS.map((_, i) => i >= bizStart && i < bizEnd ? '#5a554d' : '#c5bfb6') },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: '10px', colors: ['#8a8279'] } },
      forceNiceScale: true,
    },
    grid: { borderColor: '#e8e3d8', strokeDashArray: 3 },
    tooltip: {
      y: { formatter: (val: number) => `${val} missed` },
    },
    legend: { show: false },
    annotations: {
      xaxis: [{
        x: HOUR_LABELS[bizStart],
        x2: HOUR_LABELS[bizEnd - 1],
        fillColor: 'rgba(59, 138, 90, 0.06)',
        borderColor: 'transparent',
        label: { text: '' },
      }],
    },
  };

  const series = [{ name: 'Missed Calls', data: data.hourly_missed }];

  return (
    <Paper className="rounded-xl p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <Typography className="text-sm font-extrabold uppercase tracking-wider" style={{ color: '#000' }}>
            When Are Calls Being Missed?
          </Typography>
          <Typography className="text-[11px] font-medium" style={{ color: '#8a8279' }}>
            All sources · missed + hung up
            {dateFrom && dateTo && ` · ${new Date(dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(dateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </Typography>
        </div>
        <div className="flex items-center gap-3 text-[10px]" style={{ color: '#8a8279' }}>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#E85D4D' }} />Biz hrs</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#d4a08a' }} />After hrs</span>
        </div>
      </div>
      <ReactApexChart options={options} series={series} type="bar" height={220} />
    </Paper>
  );
}

export default memo(HourlyMissedChart);
