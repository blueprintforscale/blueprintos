'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type MonthlyPoint = { month_start: string; short_label: string; leads: number };
type Props = {
  data: { monthly: MonthlyPoint[]; seo_start: string | null; baseline_per_mo: number | null } | undefined;
};

function SeoTrendChart({ data }: Props) {
  if (!data || !data.monthly || data.monthly.length === 0) return null;

  const labels = data.monthly.map((d) => d.short_label);
  const leadCounts = data.monthly.map((d) => d.leads);
  const baseline = data.baseline_per_mo || 0;

  // Find SEO start month index for the vertical marker
  let seoStartIdx = -1;
  if (data.seo_start) {
    const seoStartDate = new Date(data.seo_start);
    seoStartIdx = data.monthly.findIndex((d) => {
      const ms = new Date(d.month_start);
      return (
        ms.getUTCFullYear() === seoStartDate.getFullYear() &&
        ms.getUTCMonth() === seoStartDate.getMonth()
      );
    });
  }

  // Color bars: gray pre-SEO, coral post-SEO
  const barColors = data.monthly.map((_, i) => {
    if (seoStartIdx === -1) return '#000000';
    return i >= seoStartIdx ? '#E85D4D' : '#c5bfb6';
  });

  const maxLeads = Math.max(...leadCounts, baseline);

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 400 },
    },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        borderRadius: 4,
        distributed: true,
      },
    },
    colors: barColors,
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: labels,
      labels: {
        style: { fontSize: '10px', colors: '#8a8279' },
        rotate: -45,
        rotateAlways: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: '10px', colors: '#8a8279' },
        formatter: (v) => Math.round(v).toString(),
      },
      max: Math.ceil(maxLeads * 1.15),
    },
    grid: {
      borderColor: '#f0ede6',
      strokeDashArray: 3,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      y: { formatter: (v) => `${v} quality SEO leads` },
    },
    annotations: {
      yaxis: baseline > 0 ? [{
        y: baseline,
        borderColor: '#5a554d',
        strokeDashArray: 6,
        label: {
          borderColor: '#5a554d',
          style: { color: '#fff', background: '#5a554d', fontSize: '10px', fontWeight: 600 },
          text: `Baseline: ${baseline.toFixed(1)}/mo`,
          position: 'left',
          offsetX: 80,
        },
      }] : [],
      xaxis: seoStartIdx >= 0 ? [{
        x: labels[seoStartIdx],
        borderColor: '#E85D4D',
        strokeDashArray: 4,
        label: {
          borderColor: '#E85D4D',
          style: { color: '#fff', background: '#E85D4D', fontSize: '10px', fontWeight: 600 },
          text: 'SEO Start',
          orientation: 'horizontal',
          position: 'top',
        },
      }] : [],
    },
  };

  const series = [{ name: 'Quality SEO Leads', data: leadCounts }];

  return (
    <Paper className="rounded-xl border p-5 shadow-none" sx={{ borderColor: '#ddd8cb' }}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <Typography className="text-lg font-semibold">SEO Leads Trend</Typography>
          <Typography className="text-xs" sx={{ color: '#8a8279' }}>
            Quality, deduped leads from non-paid sources (GBP, Organic, Direct, etc.)
          </Typography>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: '#c5bfb6' }} />
            <span style={{ color: '#8a8279' }}>Pre-SEO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: '#E85D4D' }} />
            <span style={{ color: '#8a8279' }}>Post-SEO</span>
          </div>
        </div>
      </div>
      <ReactApexChart options={options} series={series} type="bar" height={320} />
    </Paper>
  );
}

export default memo(SeoTrendChart);
