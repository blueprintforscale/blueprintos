'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

type SeoMetrics = {
  has_seo: boolean;
  days_on_seo: number;
  baseline_quality: string;
  baseline_method: string;
  baseline_period_start: string;
  baseline_period_end: string;
  baseline_period_days: number;
  baseline_lead_count: number;
  baseline_leads_per_mo: number;
  seo_era_lead_count: number;
  current_leads_per_mo: number;
  baseline_total_revenue: number;
  baseline_revenue_per_mo: number;
  current_total_revenue: number;
  current_revenue_per_mo: number;
  leads_lift_per_mo: number;
  revenue_lift_per_mo: number;
};

type Props = { data: SeoMetrics | undefined };

function formatDollars(n: number): string {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function SeoMetricsCards({ data }: Props) {
  if (!data || !data.has_seo) return null;

  const isEarly = data.days_on_seo < 60;
  const leadsLiftPositive = data.leads_lift_per_mo > 0;
  const leadsLiftPct = data.baseline_leads_per_mo > 0
    ? Math.round((data.leads_lift_per_mo / data.baseline_leads_per_mo) * 100)
    : null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {/* Baseline */}
      <Paper className="flex flex-col rounded-xl border p-5 shadow-none" sx={{ borderColor: '#ddd8cb' }}>
        <Typography className="text-xs font-semibold uppercase tracking-wide" sx={{ color: '#8a8279' }}>
          Baseline
        </Typography>
        <Typography className="mt-1 text-3xl font-bold tracking-tight">
          {data.baseline_leads_per_mo.toFixed(1)}
          <span className="text-base font-normal" style={{ color: '#8a8279' }}> leads/mo</span>
        </Typography>
        <Typography className="mt-1 text-xs" sx={{ color: '#8a8279' }}>
          {data.baseline_total_revenue > 0
            ? `${formatDollars(data.baseline_revenue_per_mo)}/mo revenue`
            : 'No revenue from baseline cohort'}
        </Typography>
        <Typography className="mt-1 text-[10px]" sx={{ color: '#c5bfb6' }}>
          Pre-SEO {data.baseline_period_days}d ({formatDateRange(data.baseline_period_start, data.baseline_period_end)})
        </Typography>
      </Paper>

      {/* Current */}
      <Paper className="flex flex-col rounded-xl border p-5 shadow-none" sx={{ borderColor: '#ddd8cb' }}>
        <Typography className="text-xs font-semibold uppercase tracking-wide" sx={{ color: '#8a8279' }}>
          Current Rate
        </Typography>
        <Typography className="mt-1 text-3xl font-bold tracking-tight">
          {data.current_leads_per_mo.toFixed(1)}
          <span className="text-base font-normal" style={{ color: '#8a8279' }}> leads/mo</span>
        </Typography>
        <Typography className="mt-1 text-xs" sx={{ color: '#8a8279' }}>
          {formatDollars(data.current_revenue_per_mo)}/mo revenue
        </Typography>
        <Typography className="mt-1 text-[10px]" sx={{ color: '#c5bfb6' }}>
          {data.seo_era_lead_count} leads · {data.days_on_seo} days on SEO
        </Typography>
      </Paper>

      {/* SEO Lift — BLACK hero card */}
      <Paper
        className="flex flex-col rounded-xl border p-5 shadow-none relative"
        sx={{ borderColor: '#E85D4D', backgroundColor: '#000000' }}
      >
        <Typography className="text-xs font-semibold uppercase tracking-wide" sx={{ color: '#E85D4D' }}>
          SEO Lift
        </Typography>
        <div className="mt-1 flex items-baseline gap-2">
          <Typography
            className="text-3xl font-bold tracking-tight"
            sx={{ color: leadsLiftPositive ? '#fff' : '#5a554d' }}
          >
            {leadsLiftPositive ? '+' : ''}{data.leads_lift_per_mo.toFixed(1)}
          </Typography>
          <Typography className="text-base" sx={{ color: '#c5bfb6' }}>
            leads/mo
          </Typography>
        </div>
        {isEarly ? (
          <Typography className="mt-1 text-xs" sx={{ color: '#c5bfb6' }}>
            Revenue maturing — accumulates over 60–90 days
          </Typography>
        ) : (
          <Typography className="mt-1 text-xs" sx={{ color: '#c5bfb6' }}>
            {data.revenue_lift_per_mo > 0 ? '+' : ''}{formatDollars(data.revenue_lift_per_mo)}/mo revenue
            {leadsLiftPct !== null && ` · ${leadsLiftPct > 0 ? '+' : ''}${leadsLiftPct}%`}
          </Typography>
        )}
        <Typography className="mt-1 text-[10px]" sx={{ color: '#5a554d' }}>
          Above pre-SEO baseline
        </Typography>
      </Paper>
    </div>
  );
}

export default memo(SeoMetricsCards);
