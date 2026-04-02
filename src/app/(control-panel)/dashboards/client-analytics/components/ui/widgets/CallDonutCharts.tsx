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
    chart: { type: 'donut', background: 'transparent', sparkline: { enabled: true } },
    colors,
    labels,
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: { show: false },
        },
      },
    },
    stroke: { width: 2, colors: ['#fff'] },
    tooltip: { enabled: true, y: { formatter: (val: number) => `${val} calls` } },
    states: {
      active: { filter: { type: 'darken' } },
    },
  };

  return (
    <div className="flex flex-col items-center rounded-xl p-4" style={{ backgroundColor: '#EEEAD9' }}>
      <Typography
        className="mb-0.5 text-center text-[9px] font-extrabold uppercase tracking-widest"
        style={{ color: '#E85D4D' }}
      >
        {donut.label}
      </Typography>
      <Typography className="mb-2 text-center text-[9px] font-medium" style={{ color: '#8a8279' }}>
        {subtitle}
      </Typography>
      {total === 0 ? (
        <div className="flex h-[140px] w-[140px] items-center justify-center">
          <span className="text-center text-xs font-medium" style={{ color: '#8a8279' }}>
            No biz-hour calls<br />in this period
          </span>
        </div>
      ) : (
        <>
          <div className="relative" style={{ width: 140, height: 140 }}>
            <ReactApexChart options={options} series={series} type="donut" width={140} height={140} />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-extrabold" style={{ color: '#000' }}>{answerRate}%</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[10px]" style={{ color: '#5a554d' }}>
            <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#3b8a5a' }} />
              {donut.answered} ans</span>
            <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#E85D4D' }} />
              {donut.missed} miss</span>
            {donut.abandoned > 0 && (
              <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#c4890a' }} />
                {donut.abandoned} hung up</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

type Props = { data: CallAnalyticsData | undefined };

function CallDonutCharts({ data }: Props) {
  if (!data) return null;

  return (
    <Paper className="rounded-xl p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <DonutCard donut={data.donut_google_ads} subtitle="First-Time Callers · Business Hours" />
        <DonutCard donut={data.donut_overall} subtitle="All Sources · Business Hours" />
      </div>
    </Paper>
  );
}

export default memo(CallDonutCharts);
