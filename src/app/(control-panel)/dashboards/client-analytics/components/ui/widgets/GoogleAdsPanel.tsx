'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type CampaignRow = {
  campaign_name: string;
  campaign_type: string;
  impressions: number;
  clicks: number;
  cost: string;
  conversions: string;
  ctr: string;
};

type SearchTermRow = {
  search_term: string;
  impressions: number;
  clicks: number;
  cost: string;
  conversions: string;
};

type DailySpendRow = {
  date: string;
  spend: string;
};

type Props = {
  campaigns: CampaignRow[] | undefined;
  searchTerms: SearchTermRow[] | undefined;
  dailySpend: DailySpendRow[] | undefined;
};

function formatCost(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

const TYPE_LABELS: Record<string, string> = {
  SEARCH: 'Search',
  PERFORMANCE_MAX: 'PMax',
  DISPLAY: 'Display',
  LOCAL_SERVICES: 'LSA',
  SMART: 'Smart',
};

function GoogleAdsPanel({ campaigns, searchTerms, dailySpend }: Props) {
  // Sparkline chart options
  const spendData = (dailySpend || []).map((d) => parseFloat(d.spend) || 0);
  const spendDates = (dailySpend || []).map((d) => d.date);
  const totalSpend = spendData.reduce((a, b) => a + b, 0);

  const sparkOptions: ApexOptions = {
    chart: {
      type: 'area',
      sparkline: { enabled: true },
      toolbar: { show: false },
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] },
    },
    colors: ['#E85D4D'],
    tooltip: {
      fixed: { enabled: false },
      x: { show: true, formatter: (_, opts) => spendDates[opts.dataPointIndex] || '' },
      y: { formatter: (v: number) => `$${v.toFixed(0)}` },
      theme: 'dark',
    },
    xaxis: { categories: spendDates },
  };

  return (
    <Paper
      className="flex flex-col overflow-hidden rounded-xl border-0 shadow-none"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      <div className="px-5 pt-5 pb-2">
        <Typography className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#8a8279' }}>
          Google Ads Details
        </Typography>
      </div>

      {/* Daily Spend Sparkline */}
      {dailySpend && dailySpend.length > 0 && (
        <div className="px-5 pb-3">
          <div className="flex items-baseline justify-between mb-1">
            <Typography className="text-xs" style={{ color: '#5a554d' }}>Daily Spend</Typography>
            <Typography className="text-xs font-semibold" style={{ color: '#c5bfb6' }}>
              {formatCost(totalSpend)} total
            </Typography>
          </div>
          <ReactApexChart
            options={sparkOptions}
            series={[{ name: 'Spend', data: spendData }]}
            type="area"
            height={60}
          />
        </div>
      )}

      {/* Campaign Breakdown */}
      {campaigns && campaigns.length > 0 && (
        <div className="px-5 pb-3">
          <Typography className="text-xs font-semibold mb-2" style={{ color: '#5a554d' }}>
            Campaigns
          </Typography>
          <div className="flex flex-col gap-1.5">
            {campaigns.slice(0, 6).map((c) => (
              <div key={c.campaign_name} className="flex items-center gap-2">
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold"
                  style={{ backgroundColor: '#2a2a2a', color: '#8a8279', border: '1px solid #333' }}
                >
                  {TYPE_LABELS[c.campaign_type] || c.campaign_type}
                </span>
                <span className="flex-1 truncate text-xs text-white" title={c.campaign_name}>
                  {c.campaign_name.replace(/^\[Core\]\s*/i, '').replace(/^\[.*?\]\s*/g, '')}
                </span>
                <span className="shrink-0 text-xs font-semibold" style={{ color: '#c5bfb6' }}>
                  {formatCost(parseFloat(c.cost))}
                </span>
                <span className="shrink-0 text-[10px] w-12 text-right" style={{ color: '#5a554d' }}>
                  {c.clicks} clk
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mx-5 h-px" style={{ backgroundColor: '#2a2a2a' }} />

      {/* Top Search Terms */}
      {searchTerms && searchTerms.length > 0 && (
        <div className="px-5 py-3">
          <Typography className="text-xs font-semibold mb-2" style={{ color: '#5a554d' }}>
            Top Search Terms
          </Typography>
          <div className="flex flex-col gap-1">
            {searchTerms.slice(0, 8).map((t, i) => (
              <div key={t.search_term} className="flex items-center gap-2">
                <span className="text-[10px] w-4 text-right" style={{ color: '#5a554d' }}>
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-xs" style={{ color: '#c5bfb6' }} title={t.search_term}>
                  {t.search_term}
                </span>
                <span className="shrink-0 text-[10px]" style={{ color: '#5a554d' }}>
                  {t.clicks} clk
                </span>
                <span className="shrink-0 text-[10px]" style={{ color: '#5a554d' }}>
                  {formatCost(parseFloat(t.cost))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Paper>
  );
}

export default memo(GoogleAdsPanel);
