'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { MonthlyTrend } from '../../../api/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = { data: MonthlyTrend[] | undefined };

function isCurrentMonth(monthStart: string): boolean {
  const now = new Date();
  const d = new Date(monthStart + 'T00:00:00');
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function getMonthProgress(): { dayElapsed: number; daysInMonth: number; fraction: number } {
  const now = new Date();
  const dayElapsed = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return { dayElapsed, daysInMonth, fraction: dayElapsed / daysInMonth };
}

function MonthlyTrendChart({ data }: Props) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  const labels = data.map((d) => (d as any).short_label || d.label);
  const lastIsIncomplete = data.length > 0 && isCurrentMonth((data[data.length - 1] as any).month_start);
  const forecastCount = lastIsIncomplete ? 1 : 0;
  const { fraction: monthFraction } = getMonthProgress();

  const qualityLeads = data.map((d) => {
    const total = parseInt(d.leads, 10) || 0;
    const spam = parseInt((d as any).spam, 10) || 0;
    return total - spam;
  });
  const spamLeads = data.map((d) => parseInt((d as any).spam, 10) || 0);
  const cpl = data.map((d) => parseFloat(d.cpl));

  // Projection: ghost bar showing projected remaining leads for current month
  const currentLeads = lastIsIncomplete ? qualityLeads[qualityLeads.length - 1] : null;
  const projectedLeads = lastIsIncomplete && currentLeads !== null && monthFraction > 0
    ? Math.round(currentLeads / monthFraction)
    : null;
  const projectedRemaining = projectedLeads !== null && currentLeads !== null
    ? Math.max(projectedLeads - currentLeads, 0)
    : 0;

  // Build ghost bar series (all zeros except current month shows the projected remaining)
  const ghostBar = data.map((_, i) =>
    lastIsIncomplete && i === data.length - 1 ? projectedRemaining : 0
  );
  const hasProjection = projectedRemaining > 0;

  const chartColors = hasProjection
    ? ['#000000', '#ddd8cb', '#00000020', '#E85D4D']
    : ['#000000', '#ddd8cb', '#E85D4D'];

  const strokeWidths = hasProjection ? [0, 0, 0, 3] : [0, 0, 3];
  const dashArrays = hasProjection ? [0, 0, 0, 0] : [0, 0, 0];

  const series: any[] = [
    { name: 'Quality Leads', type: 'bar' as const, data: qualityLeads, group: 'leads' },
    { name: 'Contacts (removed)', type: 'bar' as const, data: spamLeads, group: 'leads' },
  ];

  if (hasProjection) {
    series.push({ name: 'Projected', type: 'bar' as const, data: ghostBar, group: 'leads' });
  }

  series.push({ name: 'CPL', type: 'line' as const, data: cpl });

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: 'inherit',
      foreColor: '#5a554d',
      toolbar: { show: false },
      zoom: { enabled: false },
      stacked: true,
      background: 'transparent',
    },
    colors: chartColors,
    stroke: { width: strokeWidths, curve: 'smooth', dashArray: dashArrays },
    forecastDataPoints: { count: forecastCount, dashArray: 6, strokeWidth: 2 },
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 3,
        borderRadiusApplication: 'end',
      },
    },
    fill: {
      type: hasProjection
        ? ['solid', 'solid', 'pattern', 'solid']
        : ['solid', 'solid', 'solid'],
      pattern: {
        style: hasProjection ? ['', '', 'horizontalLines', ''] : undefined,
        strokeWidth: 1,
      },
      opacity: hasProjection ? [1, 1, 0.3, 1] : [1, 1, 1],
    },
    xaxis: {
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#8a8279', fontSize: '11px' } },
    },
    yaxis: [
      {
        title: { text: '' },
        labels: {
          style: { colors: '#8a8279', fontSize: '11px' },
          formatter: (v: number) => String(Math.round(v)),
        },
      },
      {
        opposite: true,
        title: { text: '' },
        labels: {
          style: { colors: '#E85D4D', fontSize: '11px' },
          formatter: (v: number) => `$${Math.round(v)}`,
        },
      },
    ],
    tooltip: {
      theme: 'light',
      custom: ({ series: s, dataPointIndex }) => {
        const quality = s[0][dataPointIndex] || 0;
        const spam = s[1][dataPointIndex] || 0;
        const total = quality + spam;
        const cplIdx = hasProjection ? 3 : 2;
        const cplVal = s[cplIdx] ? s[cplIdx][dataPointIndex] : null;
        const month = labels[dataPointIndex];
        const isIncomplete = lastIsIncomplete && dataPointIndex === data.length - 1;

        let html = `<div style="padding:10px 14px;font-size:12px;line-height:1.6">`;
        html += `<div style="font-weight:700;color:#000;margin-bottom:2px">${month}${isIncomplete ? ' <span style="color:#c5bfb6;font-weight:400">(in progress)</span>' : ''}</div>`;
        html += `<div><span style="color:#000">&#9632;</span> Quality leads: <strong>${quality}</strong></div>`;
        if (isIncomplete && projectedLeads !== null) {
          html += `<div style="color:#c5bfb6">Projected end of month: ~<strong>${projectedLeads}</strong></div>`;
        }
        if (spam > 0) {
          html += `<div><span style="color:#ddd8cb">&#9632;</span> Contacts: <strong>${total}</strong> <span style="color:#c5bfb6">(${spam} removed)</span></div>`;
        }
        if (cplVal !== null && cplVal > 0) {
          html += `<div style="color:#E85D4D;margin-top:2px">CPL (quality): $${Math.round(cplVal)}</div>`;
          if (total > 0 && total !== quality) {
            const contactCpl = (cplVal * quality) / total;
            html += `<div style="color:#8a8279">CPL (contacts): $${Math.round(contactCpl)}</div>`;
          }
        }
        html += `</div>`;
        return html;
      },
    },
    grid: {
      borderColor: '#EEEAD9',
      xaxis: { lines: { show: false } },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
  };

  return (
    <Paper className="flex flex-col rounded-xl border shadow-none" style={{ borderColor: '#ddd8cb' }}>
      <div className="px-6 pt-5 pb-1">
        <Typography className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#8a8279' }}>
          Monthly Trend
        </Typography>
        <div className="mt-1 flex gap-4 text-[10px]" style={{ color: '#8a8279' }}>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#000' }} /> Quality leads
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#ddd8cb' }} /> Contacts (removed)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4" style={{ backgroundColor: '#E85D4D' }} /> CPL
          </span>
          {hasProjection && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#00000015', border: '1px dashed #00000040' }} /> Projected
            </span>
          )}
        </div>
        {projectedLeads !== null && currentLeads !== null && (
          <div className="mt-1 text-[10px]" style={{ color: '#c5bfb6' }}>
            {labels[labels.length - 1]}: {currentLeads} leads so far — on pace for ~{projectedLeads}
          </div>
        )}
      </div>
      <div className="px-2 pb-4" style={{ height: 260 }}>
        <ReactApexChart options={chartOptions} series={series} type="line" height="100%" />
      </div>
    </Paper>
  );
}

export default memo(MonthlyTrendChart);
