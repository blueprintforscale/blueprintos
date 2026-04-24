'use client';

import { memo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { MonthlyTrend } from '../../../api/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type CampaignTrend = { name: string; data: { month_start: string; short_label: string; leads: number }[] };
type SeoMonthlyPoint = { month_start: string; short_label: string; leads: number; contacts?: number };
type SeoTrendData = { monthly: SeoMonthlyPoint[]; seo_start: string | null; baseline_per_mo: number | null };
type Props = {
  data: MonthlyTrend[] | undefined;
  startDate?: string;
  trendStartDate?: string;
  showSuperQuality?: boolean;
  hiddenMetrics?: string[];
  campaignTrend?: CampaignTrend[];
  seoTrend?: SeoTrendData;
  activeSource?: string;
};
type Metric = 'leads' | 'contacts' | 'super_quality' | 'spend' | 'cpl' | 'conversions' | 'close_rate' | 'book_rate' | 'roas' | 'revenue' | 'seo_leads';

// Set to true to show book rate and close rate pills on the trend chart
const SHOW_RATE_METRICS = false;

const metricsList: { key: Metric; label: string; format: (v: number) => string; color: string; projectable: boolean; hidden?: boolean }[] = [
  { key: 'leads', label: 'Leads', format: (v) => String(Math.round(v)), color: '#000000', projectable: true },
  { key: 'contacts', label: 'Contacts', format: (v) => String(Math.round(v)), color: '#8a8279', projectable: true },
  { key: 'super_quality', label: 'Super Quality', format: (v) => String(Math.round(v)), color: '#375078', projectable: true },
  { key: 'spend', label: 'Ad Spend', format: (v) => `$${(v / 1000).toFixed(1)}K`, color: '#5a554d', projectable: true },
  { key: 'cpl', label: 'CPL', format: (v) => `$${v.toFixed(0)}`, color: '#E85D4D', projectable: false, hidden: true },
  { key: 'conversions', label: 'Conversions', format: (v) => String(Math.round(v)), color: '#6366f1', projectable: true },
  { key: 'close_rate', label: 'Close Rate', format: (v) => `${v.toFixed(0)}%`, color: '#2A9D8F', projectable: false, hidden: !SHOW_RATE_METRICS },
  { key: 'book_rate', label: 'Book Rate', format: (v) => `${v.toFixed(0)}%`, color: '#D4A843', projectable: false, hidden: !SHOW_RATE_METRICS },
  { key: 'roas', label: 'ROAS', format: (v) => `${v.toFixed(1)}x`, color: '#8B5CF6', projectable: false, hidden: true },
  { key: 'revenue', label: 'Revenue', format: (v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${Math.round(v)}`, color: '#3b8a5a', projectable: false, hidden: true },
  { key: 'seo_leads', label: 'SEO Leads', format: (v) => String(Math.round(v)), color: '#0ea5e9', projectable: false },
];

function isCurrentMonth(monthStart: string): boolean {
  const now = new Date();
  const d = new Date(monthStart);
  return d.getUTCFullYear() === now.getFullYear() && d.getUTCMonth() === now.getMonth();
}

function getMonthProgress(): { dayElapsed: number; daysInMonth: number; fraction: number } {
  const now = new Date();
  const dayElapsed = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return { dayElapsed, daysInMonth, fraction: dayElapsed / daysInMonth };
}

const CAMPAIGN_COLORS = ['#6366f1', '#E85D4D', '#2A9D8F', '#D4A843', '#8B5CF6', '#F97316', '#06B6D4', '#EC4899'];

function HistoricalPerformance({ data, startDate, trendStartDate, showSuperQuality, hiddenMetrics, campaignTrend, seoTrend, activeSource }: Props) {
  const isSeoSource = activeSource === 'seo';
  const [metric, setMetric] = useState<Metric>('leads');
  const [overlays, setOverlays] = useState<Metric[]>([]);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [rateDenom, setRateDenom] = useState<'quality' | 'contacts'>('quality');
  const [revSource, setRevSource] = useState<'waterfall' | 'invoices'>('waterfall');

  if (!data || !Array.isArray(data) || data.length === 0) return null;

  // Trim leading months: start from MIN(program_start, today - 12 months) — capped at full data range
  // This avoids long flat zero regions before the program existed
  // Per-client override via dashboard_config.trend_start_date takes priority
  const trimmedData = (() => {
    if (!startDate && !trendStartDate) return data;
    let effectiveStart: Date;
    if (trendStartDate) {
      effectiveStart = new Date(trendStartDate);
    } else {
      const programStart = new Date(startDate!);
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setUTCMonth(twelveMonthsAgo.getUTCMonth() - 12);
      twelveMonthsAgo.setUTCDate(1);
      effectiveStart = programStart < twelveMonthsAgo ? programStart : twelveMonthsAgo;
    }
    return data.filter((d) => {
      const ms = new Date((d as any).month_start);
      return ms >= effectiveStart;
    });
  })();
  const chartData = trimmedData.length > 0 ? trimmedData : data;

  // Build month-keyed maps of SEO leads + contacts for quick lookup
  const seoLeadsByMonth = new Map<string, number>();
  const seoContactsByMonth = new Map<string, number>();
  if (seoTrend?.monthly) {
    for (const m of seoTrend.monthly) {
      // Key by YYYY-MM for matching
      const d = new Date(m.month_start);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      seoLeadsByMonth.set(key, m.leads);
      if (typeof m.contacts === 'number') seoContactsByMonth.set(key, m.contacts);
    }
  }
  const hasSeoData = seoLeadsByMonth.size > 0;

  const hidden = new Set(hiddenMetrics || []);
  const visibleMetrics = (showSuperQuality ? metricsList : metricsList.filter((m) => m.key !== 'super_quality'))
    .filter((m) => !m.hidden)
    .filter((m) => m.key !== 'seo_leads' || hasSeoData) // only show SEO Leads pill when client has SEO
    .filter((m) => !hidden.has(m.key)); // per-client hidden metrics from dashboard_config

  const cfg = visibleMetrics.find((m) => m.key === metric) || visibleMetrics[0];
  const getValue = (d: MonthlyTrend, key: Metric): number => {
    const ms = new Date((d as any).month_start);
    const k = `${ms.getUTCFullYear()}-${String(ms.getUTCMonth() + 1).padStart(2, '0')}`;
    if (key === 'seo_leads') return seoLeadsByMonth.get(k) || 0;
    // When SEO source is active, route Contacts + Leads to SEO-filtered data
    if (isSeoSource && key === 'contacts') return seoContactsByMonth.get(k) || 0;
    if (isSeoSource && key === 'leads') return seoLeadsByMonth.get(k) || 0;
    if (key === 'contacts') return parseFloat((d as any).leads) || 0;
    if (key === 'leads') {
      const leads = parseFloat((d as any).leads) || 0;
      const spam = parseFloat((d as any).spam) || 0;
      const excludedAbandoned = parseFloat((d as any).excluded_abandoned) || 0;
      return leads - spam - excludedAbandoned;
    }
    if (key === 'super_quality') {
      const leads = parseFloat((d as any).leads) || 0;
      const spam = parseFloat((d as any).spam) || 0;
      const abandoned = parseFloat((d as any).abandoned) || 0;
      return leads - spam - abandoned;
    }
    // Compute book_rate and close_rate dynamically based on denominator toggle
    if (key === 'book_rate') {
      const insp = parseFloat((d as any).inspections_booked) || 0;
      const denom = rateDenom === 'contacts'
        ? (parseFloat((d as any).leads) || 0)
        : (parseFloat((d as any).leads) || 0) - (parseFloat((d as any).spam) || 0) - (parseFloat((d as any).excluded_abandoned) || 0);
      return denom > 0 ? Math.round(insp / denom * 1000) / 10 : 0;
    }
    if (key === 'close_rate') {
      // Always: est approved / inspections booked (no toggle)
      const estApp = parseFloat((d as any).estimates_approved) || 0;
      const insp = parseFloat((d as any).inspections_booked) || 0;
      return insp > 0 ? Math.round(estApp / insp * 1000) / 10 : 0;
    }
    if (key === 'revenue') {
      return parseFloat((d as any)[revSource === 'invoices' ? 'invoice_revenue' : 'revenue']) || 0;
    }
    if (key === 'roas') {
      return parseFloat((d as any)[revSource === 'invoices' ? 'invoice_roas' : 'roas']) || 0;
    }
    return parseFloat((d as any)[key]) || 0;
  };

  // Display last 12 months on the chart. Prior-year lookups below still traverse the full
  // data array, so year-over-year comparison is preserved.
  const recent = chartData.slice(-12);
  // Use the full label ("Mar 2026") as the internal category key so annotations anchor
  // unambiguously. Display is shortened to just the month name via xaxis.labels.formatter.
  const labels = recent.map((d) => d.label || (d as any).short_label);

  // Detect program start month index
  const startMonthIdx = startDate ? recent.findIndex((d) => {
    const ms = new Date((d as any).month_start);
    const sd = new Date(startDate);
    return ms.getUTCFullYear() === sd.getFullYear() && ms.getUTCMonth() === sd.getMonth();
  }) : -1;
  const values = recent.map((d) => getValue(d, metric));

  // Detect current (incomplete) month
  const lastIsIncomplete = recent.length > 0 && isCurrentMonth((recent[recent.length - 1] as any).month_start);
  const forecastCount = lastIsIncomplete ? 1 : 0;

  // Projection for current month (suppress before day 7 or before 4 months of data)
  const { dayElapsed, daysInMonth, fraction: monthFraction } = getMonthProgress();
  const currentValue = lastIsIncomplete ? values[values.length - 1] : null;
  const monthsOfData = startMonthIdx >= 0 ? recent.length - startMonthIdx : recent.length;
  const canProject = dayElapsed >= 7 && monthsOfData >= 4;

  // Smart projection: blend historical pace extrapolation with recent average
  const currentMonthData = lastIsIncomplete ? recent[recent.length - 1] : null;
  const paceFraction = (currentMonthData as any)?.projection_pace_fraction ?? null;
  const recentAvg = (currentMonthData as any)?.projection_recent_avg ?? null;

  let projectedValue: number | null = null;
  if (lastIsIncomplete && cfg.projectable && canProject && currentValue !== null && monthFraction > 0) {
    // Pace-adjusted extrapolation: use historical day-of-month curve if available
    const fraction = (metric === 'leads' || metric === 'super_quality') && paceFraction && paceFraction > 0
      ? paceFraction : monthFraction;
    const paceProjection = Math.round(currentValue / fraction);

    // Blend with recent average: weight increases as month progresses
    const weight = dayElapsed / daysInMonth;
    if ((metric === 'leads' || metric === 'super_quality') && recentAvg !== null && recentAvg > 0) {
      projectedValue = Math.round(paceProjection * weight + recentAvg * (1 - weight));
    } else {
      projectedValue = paceProjection;
    }
  }

  // Prior year for primary metric
  const priorValues = recent.map((d) => {
    const shortLabel = (d as any).short_label;
    const year = (d as any).year;
    const priorMatch = data.find((p) => (p as any).short_label === shortLabel && (p as any).year === year - 1);
    return priorMatch ? getValue(priorMatch, metric) : null;
  });
  const hasPriorYear = priorValues.some((v) => v !== null && v > 0);

  // Headline: use last complete month
  const lastCompleteIdx = lastIsIncomplete ? values.length - 2 : values.length - 1;
  const latestValue = values[lastCompleteIdx] || 0;
  const incompleteValue = lastIsIncomplete ? values[values.length - 1] : null;
  const priorMonthValue = lastCompleteIdx > 0 ? values[lastCompleteIdx - 1] : null;
  const lastYearValue = priorValues[lastCompleteIdx];

  // Trend line (linear regression starting from program start)
  const trendStart = startMonthIdx >= 0 ? startMonthIdx : 0;
  const trendInputs = lastIsIncomplete && projectedValue !== null && cfg.projectable
    ? [...values.slice(0, -1), projectedValue]
    : values;
  const trendSlice = trendInputs.slice(trendStart);
  const nPts = trendSlice.length;
  let trendLine: (number | null)[] | null = null;
  if (nPts >= 2) {
    const sX = trendSlice.reduce((s, _, i) => s + i, 0);
    const sY = trendSlice.reduce((s, v) => s + v, 0);
    const sXY = trendSlice.reduce((s, v, i) => s + i * v, 0);
    const sX2 = trendSlice.reduce((s, _, i) => s + i * i, 0);
    const sl = (nPts * sXY - sX * sY) / (nPts * sX2 - sX * sX);
    const ic = (sY - sl * sX) / nPts;
    // null before start, straight regression from start onward
    trendLine = trendInputs.map((_, i) =>
      i < trendStart ? null : Math.max(Math.round(ic + sl * (i - trendStart)), 0)
    );
  }

  // Projection series: dashed line from last complete month value to projected value
  // This creates the visual "trajectory" line showing where the month is heading
  const projectionSeries: (number | null)[] | null = projectedValue !== null && lastIsIncomplete && currentValue !== null
    ? values.map((_, i) => {
        if (i === values.length - 2) return values[values.length - 2]; // last complete month
        if (i === values.length - 1) return projectedValue; // projected at current month
        return null;
      })
    : null;

  // Campaign breakdown series (only when viewing leads and toggled on)
  const visibleCampaigns = showCampaigns && (metric === 'leads' || metric === 'contacts') && campaignTrend?.length
    ? (selectedCampaign ? campaignTrend.filter((c) => c.name === selectedCampaign) : campaignTrend)
    : [];
  // Only isolate if the selected campaign has actual data points
  const campaignIsolated = selectedCampaign !== null && visibleCampaigns.length > 0
    && visibleCampaigns[0].data.some((d) => d.leads > 0);

  // Build series — when a single campaign is isolated, hide the aggregate line so the chart rescales
  const series: ApexAxisChartSeries = [];
  const seriesColors: string[] = [];
  const strokeWidth: number[] = [];
  const dashArray: number[] = [];
  const strokeCurve: ('smooth' | 'straight')[] = [];

  if (!campaignIsolated) {
    series.push({ name: cfg.label, data: values });
    seriesColors.push(cfg.color);
    strokeWidth.push(3);
    dashArray.push(0);
    strokeCurve.push('smooth');

    if (hasPriorYear) {
      series.push({ name: `${cfg.label} (prior year)`, data: priorValues as number[] });
      seriesColors.push('#c5bfb6');
      strokeWidth.push(2);
      dashArray.push(5);
      strokeCurve.push('smooth');
    }

    if (trendLine) {
      series.push({ name: 'Trend', data: trendLine as any });
      seriesColors.push('#ddd8cb');
      strokeWidth.push(1.5);
      dashArray.push(6);
      strokeCurve.push('straight');
    }

    if (projectionSeries) {
      series.push({ name: 'Projected', data: projectionSeries as any });
      seriesColors.push(cfg.color);
      strokeWidth.push(2);
      dashArray.push(5);
      strokeCurve.push('straight');
    }

    overlays.forEach((ovKey) => {
      const ovCfg = metricsList.find((m) => m.key === ovKey)!;
      const ovValues = recent.map((d) => getValue(d, ovKey));
      series.push({ name: ovCfg.label, data: ovValues });
      seriesColors.push(ovCfg.color);
      strokeWidth.push(2);
      dashArray.push(3);
      strokeCurve.push('smooth');
    });
  }

  if (visibleCampaigns.length > 0) {
    visibleCampaigns.forEach((camp) => {
      const ci = campaignTrend!.findIndex((c) => c.name === camp.name);
      const campValues = recent.map((d) => {
        const ms = new Date((d as any).month_start).toISOString().slice(0, 10);
        const match = camp.data.find((cd) => new Date(cd.month_start).toISOString().slice(0, 10) === ms);
        return match?.leads ?? 0;
      });
      const shortName = camp.name.length > 25 ? camp.name.slice(0, 22) + '...' : camp.name;
      series.push({ name: shortName, data: campValues });
      seriesColors.push(CAMPAIGN_COLORS[ci % CAMPAIGN_COLORS.length]);
      strokeWidth.push(campaignIsolated ? 3 : 2);
      dashArray.push(0);
      strokeCurve.push('smooth');
    });
  }

  // Projection: point annotation at projected value for current month
  const annotations: ApexOptions['annotations'] = {};
  const xaxisAnnotations: NonNullable<ApexOptions['annotations']>['xaxis'] = [];
  if (startMonthIdx >= 0 && !campaignIsolated) {
    xaxisAnnotations.push({
      x: labels[startMonthIdx],
      borderColor: '#E85D4D',
      strokeDashArray: 3,
      opacity: 0.6,
      label: {
        text: 'Program Start',
        borderColor: 'transparent',
        position: 'top',
        orientation: 'horizontal',
        offsetY: -5,
        style: {
          background: '#E85D4D',
          color: '#fff',
          fontSize: '9px',
          fontWeight: 600,
          padding: { left: 4, right: 4, top: 2, bottom: 2 },
        },
      },
    });
  }
  // Program start vertical line — marks when Blueprint engagement began. Distinguishes
  // pre-program traffic (client's prior history) from the Blueprint era.
  if (startDate && !campaignIsolated) {
    const programStartDate = new Date(startDate);
    const programMonthIdx = recent.findIndex((d) => {
      const ms = new Date((d as any).month_start);
      return ms.getUTCFullYear() === programStartDate.getUTCFullYear() && ms.getUTCMonth() === programStartDate.getUTCMonth();
    });
    if (programMonthIdx >= 0) {
      xaxisAnnotations.push({
        x: labels[programMonthIdx],
        borderColor: '#9ca3af',
        strokeDashArray: 3,
        opacity: 0.6,
        label: {
          text: 'Program start',
          borderColor: 'transparent',
          position: 'top',
          orientation: 'horizontal',
          offsetY: -5,
          style: {
            background: '#9ca3af',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 600,
            padding: { left: 4, right: 4, top: 2, bottom: 2 },
          },
        },
      });
    }
  }
  // SEO Started vertical line — shown on any source tab when client has SEO, to give context
  // for how SEO era correlates with other channels (Google Ads, etc.)
  if (seoTrend?.seo_start && !campaignIsolated) {
    const seoStartDate = new Date(seoTrend.seo_start);
    const seoMonthIdx = recent.findIndex((d) => {
      const ms = new Date((d as any).month_start);
      return ms.getUTCFullYear() === seoStartDate.getUTCFullYear() && ms.getUTCMonth() === seoStartDate.getUTCMonth();
    });
    if (seoMonthIdx >= 0) {
      xaxisAnnotations.push({
        x: labels[seoMonthIdx],
        borderColor: '#0ea5e9',
        strokeDashArray: 3,
        opacity: 0.7,
        label: {
          text: 'SEO Started',
          borderColor: 'transparent',
          position: 'top',
          orientation: 'horizontal',
          offsetY: -5,
          style: {
            background: '#0ea5e9',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 600,
            padding: { left: 4, right: 4, top: 2, bottom: 2 },
          },
        },
      });
    }
  }
  if (xaxisAnnotations.length > 0) {
    annotations.xaxis = xaxisAnnotations;
  }
  if (projectedValue !== null && projectedValue > 0 && !campaignIsolated && cfg.projectable) {
    annotations.points = [{
      x: labels[labels.length - 1],
      y: projectedValue,
      seriesIndex: 0,
      marker: {
        size: 5,
        fillColor: '#fff',
        strokeColor: cfg.color,
        strokeWidth: 2,
        shape: 'circle',
      },
      label: {
        text: `→ ${cfg.format(projectedValue)}`,
        borderColor: 'transparent',
        offsetY: 0,
        offsetX: 15,
        style: {
          background: 'transparent',
          color: cfg.color,
          fontSize: '12px',
          fontWeight: 700,
          padding: { left: 2, right: 2, top: 0, bottom: 0 },
        },
      },
    }];
  }

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: 'inherit',
      foreColor: '#5a554d',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
    },
    colors: seriesColors,
    stroke: { width: strokeWidth, curve: strokeCurve as any, dashArray },
    markers: {
      size: series.map((_, i) => campaignIsolated ? 4 : (i === 0 ? 4 : 0)),
      colors: seriesColors,
      strokeWidth: 0,
    },
    forecastDataPoints: { count: campaignIsolated ? 0 : forecastCount, dashArray: 6, strokeWidth: 2 },
    xaxis: {
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: '#8a8279', fontSize: '11px' },
        // Categories are "Mon YYYY" for uniqueness; display just "Mon" (chart stays readable)
        formatter: (val: string) => (val || '').split(' ')[0],
      },
    },
    yaxis: overlays.length > 0 ? [
      // Primary axis (index 0) — used by main series, prior year, trend, projection
      { seriesName: cfg.label, labels: { formatter: cfg.format, style: { colors: '#8a8279', fontSize: '11px' } }, min: 0 },
      // Hidden axes for prior year, trend, projection — bind to primary axis
      ...(hasPriorYear ? [{ seriesName: `${cfg.label} (prior year)`, show: false, min: 0 }] : []),
      ...(trendLine ? [{ seriesName: 'Trend', show: false, min: 0 }] : []),
      ...(projectionSeries ? [{ seriesName: 'Projected', show: false, min: 0 }] : []),
      // Overlay axes (opposite side)
      ...overlays.map((ovKey) => {
        const ovCfg = metricsList.find((m) => m.key === ovKey)!;
        return { seriesName: ovCfg.label, opposite: true, labels: { formatter: ovCfg.format, style: { colors: ovCfg.color, fontSize: '10px' } }, min: 0 };
      }),
    ] : {
      labels: { formatter: cfg.format, style: { colors: '#8a8279', fontSize: '11px' } },
      min: 0,
    },
    tooltip: {
      theme: 'light',
      shared: true,
      intersect: false,
      y: { formatter: (val: number, opts: { seriesIndex: number; dataPointIndex: number }) => {
        if (campaignIsolated) return val != null ? `${Math.round(val)} leads` : '';
        const idx = opts.seriesIndex;
        const sName = series[idx]?.name;
        if (sName === 'Trend') return val != null ? cfg.format(val) : '';
        if (sName === 'Projected' && val != null) {
          const priorMonth = values.length >= 2 ? values[values.length - 2] : null;
          if (priorMonth && priorMonth > 0) {
            const pctChange = ((val - priorMonth) / priorMonth) * 100;
            const sign = pctChange >= 0 ? '+' : '';
            const arrow = pctChange >= 0 ? '↑' : '↓';
            return `~${cfg.format(val)} (${arrow} ${sign}${pctChange.toFixed(0)}% vs prior mo)`;
          }
          return `~${cfg.format(val)}`;
        }
        if (idx === 0) return cfg.format(val);
        if (hasPriorYear && idx === 1) return cfg.format(val);
        const ovIdx = idx - (hasPriorYear ? 2 : 1) - (trendLine ? 1 : 0) - (projectionSeries ? 1 : 0);
        if (ovIdx >= 0 && ovIdx < overlays.length) {
          const ovCfg = metricsList.find((m) => m.key === overlays[ovIdx])!;
          return ovCfg.format(val);
        }
        return String(val);
      }},
    },
    grid: { borderColor: '#EEEAD9', xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } }, padding: { top: 20 } },
    legend: { show: false },
    dataLabels: { enabled: false },
    annotations,
  };

  const toggleOverlay = (key: Metric) => {
    if (key === metric) return;
    setOverlays((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : prev.length >= 2 ? [prev[1], key] : [...prev, key]);
  };

  return (
    <Paper className="flex flex-col rounded-xl border shadow-none" style={{ borderColor: '#ddd8cb' }}>
      <div className="flex flex-col gap-3 px-6 pt-5 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Typography className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#8a8279' }}>
            {campaignIsolated ? selectedCampaign : cfg.label}
          </Typography>
          <div className="flex items-baseline gap-2">
            <Typography className="text-3xl font-bold" style={{ color: '#000' }}>
              {cfg.format(latestValue)}
            </Typography>
            <Typography className="text-xs" style={{ color: '#8a8279' }}>
              {labels[lastCompleteIdx]}
            </Typography>
          </div>
          <div className="mt-0.5 flex flex-col gap-0.5">
            <div className="flex gap-4 text-[11px]" style={{ color: '#8a8279' }}>
              {priorMonthValue !== null && <span>Prior month: {cfg.format(priorMonthValue)}</span>}
              {lastYearValue !== null && lastYearValue > 0 && <span>Year ago: {cfg.format(lastYearValue)}</span>}
            </div>
            {incompleteValue !== null && (
              <div className="flex items-center gap-3 text-[11px]" style={{ color: '#c5bfb6' }}>
                <span>{labels[labels.length - 1]} so far: {cfg.format(incompleteValue)}</span>
                {projectedValue !== null && (() => {
                  const priorVal = lastCompleteIdx >= 0 ? values[lastCompleteIdx] : null;
                  const pctChange = priorVal && priorVal > 0 ? ((projectedValue - priorVal) / priorVal) * 100 : null;
                  return (
                    <>
                      <span>Projected: ~{cfg.format(projectedValue)}</span>
                      {pctChange !== null && (
                        <span style={{ color: pctChange >= 0 ? '#2A9D8F' : '#E85D4D' }}>
                          {pctChange >= 0 ? '↑' : '↓'} {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(0)}% vs prior mo
                        </span>
                      )}
                      <span
                        title="Projection blends two signals: (1) your historical daily pace — what fraction of monthly leads typically arrive by this day, and (2) your recent 3-month average. Early in the month the projection leans on recent history; as the month progresses, current pace takes over. Requires 4+ months of data."
                        className="cursor-help"
                        style={{ color: '#c5bfb6', fontSize: '10px' }}
                      >
                        &#9432;
                      </span>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Primary metric pills */}
        <div className="flex flex-wrap gap-1">
          {visibleMetrics.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMetric(m.key); setOverlays((prev) => prev.filter((k) => k !== m.key)); }}
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

      {/* Overlay toggles */}
      <div className="flex items-center gap-2 px-6 pb-2">
        <span className="text-[10px] font-medium" style={{ color: '#c5bfb6' }}>Compare:</span>
        <div className="flex flex-wrap gap-1">
          {visibleMetrics.filter((m) => m.key !== metric).map((m) => {
            const isActive = overlays.includes(m.key);
            return (
              <button
                key={m.key}
                onClick={() => toggleOverlay(m.key)}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? m.color : 'transparent',
                  color: isActive ? '#fff' : '#c5bfb6',
                  border: `1px solid ${isActive ? m.color : '#ddd8cb'}`,
                }}
              >
                {m.label}
              </button>
            );
          })}
          {/* Campaign breakdown toggle — only for leads/contacts metrics */}
          {campaignTrend && campaignTrend.length > 0 && (metric === 'leads' || metric === 'contacts') && (
            <button
              onClick={() => { setShowCampaigns((prev) => !prev); setSelectedCampaign(null); }}
              className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors"
              style={{
                backgroundColor: showCampaigns ? '#6366f1' : 'transparent',
                color: showCampaigns ? '#fff' : '#c5bfb6',
                border: `1px solid ${showCampaigns ? '#6366f1' : '#ddd8cb'}`,
              }}
            >
              By Campaign
            </button>
          )}
        </div>
      </div>

      {/* Denominator toggle for book rate */}
      {metric === 'book_rate' && (
        <div className="flex items-center gap-2 px-6 pb-2">
          <span className="text-[10px] font-medium" style={{ color: '#c5bfb6' }}>Inspections /</span>
          <div className="flex gap-0.5 rounded-full p-0.5" style={{ backgroundColor: '#EEEAD9' }}>
            <button
              onClick={() => setRateDenom('quality')}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors"
              style={{
                backgroundColor: rateDenom === 'quality' ? '#000' : 'transparent',
                color: rateDenom === 'quality' ? '#fff' : '#8a8279',
              }}
            >
              Quality Leads
            </button>
            <button
              onClick={() => setRateDenom('contacts')}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors"
              style={{
                backgroundColor: rateDenom === 'contacts' ? '#000' : 'transparent',
                color: rateDenom === 'contacts' ? '#fff' : '#8a8279',
              }}
            >
              Contacts
            </button>
          </div>
        </div>
      )}

      {/* Revenue source toggle for revenue and ROAS */}
      {(metric === 'revenue' || metric === 'roas') && (
        <div className="flex items-center gap-2 px-6 pb-2">
          <span className="text-[10px] font-medium" style={{ color: '#c5bfb6' }}>Revenue from:</span>
          <div className="flex gap-0.5 rounded-full p-0.5" style={{ backgroundColor: '#EEEAD9' }}>
            <button
              onClick={() => setRevSource('waterfall')}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors"
              style={{
                backgroundColor: revSource === 'waterfall' ? '#000' : 'transparent',
                color: revSource === 'waterfall' ? '#fff' : '#8a8279',
              }}
            >
              Approved Estimates
            </button>
            <button
              onClick={() => setRevSource('invoices')}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors"
              style={{
                backgroundColor: revSource === 'invoices' ? '#000' : 'transparent',
                color: revSource === 'invoices' ? '#fff' : '#8a8279',
              }}
            >
              Invoices
            </button>
          </div>
        </div>
      )}

      {/* Campaign legend when active — clickable to isolate */}
      {showCampaigns && campaignTrend && campaignTrend.length > 0 && (metric === 'leads' || metric === 'contacts') && (
        <div className="flex flex-wrap items-center gap-2 px-6 pb-2">
          <button
            onClick={() => setSelectedCampaign(null)}
            className="rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors"
            style={{
              backgroundColor: selectedCampaign === null ? '#000' : 'transparent',
              color: selectedCampaign === null ? '#fff' : '#c5bfb6',
              border: `1px solid ${selectedCampaign === null ? '#000' : '#ddd8cb'}`,
            }}
          >
            All
          </button>
          {campaignTrend.map((camp, ci) => {
            const isActive = selectedCampaign === camp.name;
            const color = CAMPAIGN_COLORS[ci % CAMPAIGN_COLORS.length];
            return (
              <button
                key={camp.name}
                onClick={() => setSelectedCampaign(isActive ? null : camp.name)}
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? color : 'transparent',
                  color: isActive ? '#fff' : '#8a8279',
                  border: `1px solid ${isActive ? color : '#ddd8cb'}`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isActive ? '#fff' : color }} />
                {camp.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Chart */}
      <div className="px-2 pb-4" style={{ height: overlays.length > 0 ? 360 : 300 }}>
        <ReactApexChart key={selectedCampaign || 'all'} options={chartOptions} series={series} type="line" height="100%" />
      </div>

      {/* Projection methodology note */}
      {projectedValue !== null && (
        <div className="px-6 pb-4">
          <p className="text-[10px] leading-relaxed" style={{ color: '#c5bfb6' }}>
            Projection blends your historical daily pace (what fraction of monthly leads typically arrive by this day) with your recent 3-month average. Early in the month the projection leans on recent history; as the month progresses, current pace takes over. Available after 4 months of data.
          </p>
        </div>
      )}
    </Paper>
  );
}

export default memo(HistoricalPerformance);
