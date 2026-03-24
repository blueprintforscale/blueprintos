'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { MonthlyTrend } from '../../../api/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = { data: MonthlyTrend[] | undefined };

// Detect if a month_start is the current (incomplete) month
function isCurrentMonth(monthStart: string): boolean {
  const now = new Date();
  const d = new Date(monthStart + 'T00:00:00');
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function MonthlyTrendChart({ data }: Props) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  const labels = data.map((d) => (d as any).short_label || d.label);
  const incompleteIdx = data.findIndex((d) => isCurrentMonth((d as any).month_start));
  const hasIncomplete = incompleteIdx >= 0;

  const qualityLeads = data.map((d) => {
    const total = parseInt(d.leads, 10) || 0;
    const spam = parseInt((d as any).spam, 10) || 0;
    return total - spam;
  });
  const spamLeads = data.map((d) => parseInt((d as any).spam, 10) || 0);
  const cpl = data.map((d) => parseFloat(d.cpl));

  // Split CPL into solid (complete) and dashed (incomplete) series
  const cplComplete = cpl.map((v, i) => (hasIncomplete && i === incompleteIdx) ? null : v);
  const cplIncomplete: (number | null)[] = hasIncomplete
    ? cpl.map((v, i) => (i === incompleteIdx || i === incompleteIdx - 1) ? v : null)
    : [];

  // Dim the bar opacity for the incomplete month
  const barColors = qualityLeads.map((_, i) =>
    hasIncomplete && i === incompleteIdx ? '#00000040' : '#000000'
  );
  const spamBarColors = spamLeads.map((_, i) =>
    hasIncomplete && i === incompleteIdx ? '#ddd8cb80' : '#ddd8cb'
  );

  const series: any[] = [
    { name: 'Quality Leads', type: 'bar' as const, data: qualityLeads, group: 'leads' },
    { name: 'Contacts (removed)', type: 'bar' as const, data: spamLeads, group: 'leads' },
    { name: 'CPL', type: 'line' as const, data: cplComplete },
  ];

  const strokeWidths = [0, 0, 3];
  const dashArrays = [0, 0, 0];

  if (hasIncomplete) {
    series.push({ name: 'CPL (in progress)', type: 'line' as const, data: cplIncomplete });
    strokeWidths.push(2);
    dashArrays.push(6);
  }

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: 'inherit',
      foreColor: '#5a554d',
      toolbar: { show: false },
      zoom: { enabled: false },
      stacked: true,
      background: 'transparent',
    },
    colors: hasIncomplete
      ? ['#000000', '#ddd8cb', '#E85D4D', '#E85D4D']
      : ['#000000', '#ddd8cb', '#E85D4D'],
    stroke: { width: strokeWidths, curve: 'smooth', dashArray: dashArrays },
    fill: {
      opacity: data.map((_, i) => (hasIncomplete && i === incompleteIdx) ? 0.3 : 1),
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 3,
        borderRadiusApplication: 'end',
        colors: {
          ranges: hasIncomplete ? [{
            from: -Infinity,
            to: Infinity,
            color: '#000000',
          }] : undefined,
        },
      },
    },
    xaxis: {
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: 0,
        hideOverlappingLabels: false,
        style: {
          colors: labels.map((_, i) => (hasIncomplete && i === incompleteIdx) ? '#c5bfb6' : '#8a8279'),
          fontSize: '11px',
        },
      },
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
        const cplVal = s[2] ? s[2][dataPointIndex] : (s[3] ? s[3][dataPointIndex] : null);
        const month = labels[dataPointIndex];
        const isIncomplete = hasIncomplete && dataPointIndex === incompleteIdx;

        let html = `<div style="padding:10px 14px;font-size:12px;line-height:1.6">`;
        html += `<div style="font-weight:700;color:#000;margin-bottom:2px">${month}${isIncomplete ? ' <span style="color:#c5bfb6;font-weight:400">(in progress)</span>' : ''}</div>`;
        html += `<div><span style="color:#000">&#9632;</span> Quality leads: <strong>${quality}</strong></div>`;
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
    annotations: hasIncomplete ? {
      xaxis: [{
        x: labels[incompleteIdx],
        borderColor: '#ddd8cb',
        strokeDashArray: 4,
        label: {
          text: 'In progress',
          borderColor: 'transparent',
          style: { background: 'transparent', color: '#c5bfb6', fontSize: '9px', fontWeight: 400, padding: { left: 4, right: 4, top: 2, bottom: 2 } },
          position: 'top',
          orientation: 'horizontal',
        },
      }],
    } : undefined,
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
        </div>
      </div>
      <div className="px-2 pb-4" style={{ height: 260 }}>
        <ReactApexChart options={chartOptions} series={series} type="line" height="100%" />
      </div>
    </Paper>
  );
}

export default memo(MonthlyTrendChart);
