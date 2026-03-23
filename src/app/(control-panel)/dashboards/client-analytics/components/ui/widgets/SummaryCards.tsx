'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { FunnelData } from '../../../api/types';

function formatDollars(n: number) {
  if (!n) return '$0';
  if (n >= 1000) return `$${(n / 1000).toFixed(0).toLocaleString()}K`;
  return `$${n.toFixed(0)}`;
}

type ExtendedFunnel = FunnelData & {
  total_contacts?: number;
  quality_leads?: number;
  spam_count?: number;
  closed_rev?: number;
  open_est_rev?: number;
};

type Props = { data: ExtendedFunnel | undefined };

function SummaryCards({ data }: Props) {
  if (!data) return null;

  const contacts = parseInt(data.total_contacts as any) || 0;
  const quality = parseInt(data.quality_leads as any) || parseInt(data.leads as any) || 0;
  const spam = parseInt(data.spam_count as any) || 0;
  const closedRev = parseFloat(data.closed_rev as any) || 0;
  const openEst = parseFloat(data.open_est_rev as any) || 0;
  const convRate = parseInt(data.leads as any) > 0
    ? ((parseInt(data.job_completed as any) || 0) / parseInt(data.leads as any) * 100)
    : 0;

  const cards = [
    {
      label: 'Contacts',
      value: String(contacts),
      sub: `${quality} quality leads${spam > 0 ? ` · ${spam} spam (${contacts > 0 ? ((spam / contacts) * 100).toFixed(1) : 0}%)` : ''}`,
      highlight: false,
    },
    {
      label: 'Revenue Closed',
      value: formatDollars(closedRev),
      sub: null,
      highlight: true,
    },
    {
      label: 'Open Estimates',
      value: formatDollars(openEst),
      sub: 'Pipeline value',
      highlight: false,
    },
    {
      label: 'Conversion Rate',
      value: `${convRate.toFixed(1)}%`,
      sub: 'Lead → Job Completed',
      highlight: false,
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
          <Typography className={`text-xs font-medium uppercase tracking-wide ${card.highlight ? 'text-red-100' : 'text-gray-400'}`}>
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
        </Paper>
      ))}
    </div>
  );
}

export default memo(SummaryCards);
