'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { CallAnalyticsData, CallDonut } from '../../../api/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

function DonutCard({ donut, subtitle }: { donut: CallDonut; subtitle: string }) {
  const total = donut.answered + donut.missed + donut.abandoned;
  const answerRate = total > 0
    ? Math.round((donut.answered / Math.max(donut.answered + donut.missed, 1)) * 1000) / 10
    : 0;

  const series = [donut.answered, donut.missed, donut.abandoned].filter((v) => v > 0);
  const colors: string[] = [];
  const labels: string[] = [];
  if (donut.answered > 0) { colors.push('#3b8a5a'); labels.push('Answered'); }
  if (donut.missed > 0) { colors.push('#E85D4D'); labels.push('Missed'); }
  if (donut.abandoned > 0) { colors.push('#c4890a'); labels.push('Hung Up'); }

  if (series.length === 0) {
    series.push(1);
    colors.push('#e8e3d8');
    labels.push('No calls');
  }

  const options: ApexOptions = {
    chart: { type: 'donut', background: 'transparent' },
    colors,
    labels,
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: '62%',
          labels: {
            show: true,
            name: { show: true, offsetY: 4, fontSize: '11px', color: '#8a8279' },
            value: { show: true, offsetY: -2, fontSize: '28px', fontWeight: '800', color: '#000000',
              formatter: () => `${answerRate}%`,
            },
            total: {
              show: true, label: 'Answer Rate',
              formatter: () => `${answerRate}%`,
            },
          },
        },
      },
    },
    stroke: { width: 3, colors: ['#F5F1E8'] },
    tooltip: { enabled: true, y: { formatter: (val: number) => `${val} calls` } },
  };

  return (
    <div className="flex flex-col items-center">
      <Typography
        className="mb-1 text-center text-[10px] font-extrabold uppercase tracking-widest"
        style={{ color: '#E85D4D' }}
      >
        {donut.label}
      </Typography>
      <Typography className="mb-3 text-center text-[10px] font-medium" style={{ color: '#8a8279' }}>
        {subtitle}
      </Typography>
      <ReactApexChart options={options} series={series} type="donut" width={180} height={180} />
      <div className="mt-3 flex items-center gap-4 text-[10px]" style={{ color: '#8a8279' }}>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#3b8a5a' }} />
          {donut.answered} answered</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#E85D4D' }} />
          {donut.missed} missed</span>
        {donut.abandoned > 0 && (
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#c4890a' }} />
            {donut.abandoned} hung up</span>
        )}
      </div>
    </div>
  );
}

type Props = { data: CallAnalyticsData | undefined };

function CallDonutCharts({ data }: Props) {
  if (!data) return null;

  return (
    <Paper className="rounded-xl p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <DonutCard donut={data.donut_google_ads} subtitle="First-Time Callers · Business Hours" />
        <DonutCard donut={data.donut_overall} subtitle="All Sources · Business Hours" />
      </div>
    </Paper>
  );
}

export default memo(CallDonutCharts);
