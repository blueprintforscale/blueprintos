'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { CallAnalyticsData } from '../../../api/types';

function formatDuration(seconds: number) {
  if (!seconds) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

function trendBadge(current: number, previous: number, invert = false) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return null;
  const delta = ((current - previous) / previous) * 100;
  const rounded = Math.round(Math.abs(delta) * 10) / 10;
  if (Math.abs(delta) < 1) return null;
  const direction = delta > 0 ? 'up' : 'down';
  const isPositive = invert ? direction === 'down' : direction === 'up';
  const arrow = direction === 'up' ? '\u2191' : '\u2193';
  const sign = direction === 'up' ? '+' : '-';
  return (
    <span
      className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{
        backgroundColor: isPositive ? '#e6f3ec' : '#fde8e6',
        color: isPositive ? '#2d6e46' : '#c44a3c',
      }}
    >
      {arrow} {sign}{rounded}%
    </span>
  );
}

type Props = { data: CallAnalyticsData | undefined };

function CallSummaryCards({ data }: Props) {
  if (!data) return null;

  const { summary, trends } = data;
  const cards = [
    {
      label: 'Total Calls',
      value: String(summary.total_calls),
      sub: `${formatDuration(summary.avg_duration)} avg`,
      trend: trendBadge(summary.total_calls, trends.total_calls_prev),
      highlight: false,
    },
    {
      label: 'First-Time',
      value: String(summary.first_time_calls),
      sub: 'New callers',
      trend: trendBadge(summary.first_time_calls, trends.first_time_calls_prev),
      highlight: false,
    },
    {
      label: 'Missed',
      value: String(summary.missed_calls),
      sub: null,
      trend: trendBadge(summary.missed_calls, trends.missed_calls_prev, true),
      highlight: summary.missed_calls > 0,
    },
    {
      label: 'Missed Biz Hrs',
      value: String(summary.missed_biz_hours),
      sub: 'During business hours',
      trend: trendBadge(summary.missed_biz_hours, trends.missed_biz_hours_prev, true),
      highlight: summary.missed_biz_hours > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Paper
          key={card.label}
          className="flex flex-col rounded-xl p-5 shadow-sm"
          sx={card.highlight ? { backgroundColor: '#E85D4D', color: '#fff' } : {}}
        >
          <Typography
            className={`text-xs font-medium uppercase tracking-wide ${card.highlight ? 'text-red-100' : 'text-gray-400'}`}
          >
            {card.label}
          </Typography>
          <Typography className="mt-1 text-3xl font-bold tracking-tight">
            {card.value}
          </Typography>
          {card.sub && (
            <Typography className={`mt-1 text-xs ${card.highlight ? 'text-red-100' : 'text-gray-400'}`}>
              {card.sub}
            </Typography>
          )}
          {card.trend && <div>{card.trend}</div>}
        </Paper>
      ))}
    </div>
  );
}

export default memo(CallSummaryCards);
