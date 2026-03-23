'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { AdPerformance } from '../../../api/types';

function formatDollars(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

type Props = { data: AdPerformance | undefined };

function AdMetricsCards({ data }: Props) {
  if (!data) return null;

  const cards = [
    { label: 'Ad Spend', value: formatDollars(data.ad_spend), sub: '30-day' },
    { label: 'Cost Per Lead', value: `$${data.cpl.toFixed(0)}`, sub: `${data.actual_quality_leads} quality leads` },
    { label: 'ROAS', value: `${data.roas.toFixed(1)}x`, sub: `${formatDollars(data.total_closed_rev)} / ${formatDollars(data.ad_spend)}` },
    { label: 'Guarantee', value: `${data.guarantee.toFixed(1)}x`, sub: 'All-time' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Paper key={card.label} className="flex flex-col rounded-xl p-5 shadow-sm">
          <Typography className="text-sm font-medium text-gray-500">{card.label}</Typography>
          <Typography className="mt-1 text-3xl font-bold tracking-tight">{card.value}</Typography>
          <Typography className="mt-1 text-xs text-gray-400">{card.sub}</Typography>
        </Paper>
      ))}
    </div>
  );
}

export default memo(AdMetricsCards);
