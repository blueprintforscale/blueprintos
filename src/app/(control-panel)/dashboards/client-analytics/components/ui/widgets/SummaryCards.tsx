'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { FunnelData } from '../../../api/types';
import type { FunnelStage } from './FunnelDrawer';

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

type Props = {
  data: ExtendedFunnel | undefined;
  onStageClick?: (stage: FunnelStage, title?: string) => void;
};

function SummaryCards({ data, onStageClick }: Props) {
  if (!data) return null;

  const rawContacts = parseInt(data.total_contacts as any) || 0;
  const quality = parseInt(data.quality_leads as any) || parseInt(data.leads as any) || 0;
  const contacts = Math.max(rawContacts, quality);
  const spam = Math.max(contacts - quality, 0);
  const closedRev = parseFloat(data.closed_rev as any) || 0;
  const openEst = parseFloat(data.open_est_rev as any) || 0;
  const estSent = parseInt(data.estimate_sent as any) || 0;
  const estApproved = parseInt(data.estimate_approved as any) || 0;
  const openEstCount = Math.max(estSent - estApproved, 0);
  const avgOpenEst = openEstCount > 0 ? openEst / openEstCount : 0;
  const convRate = parseInt(data.leads as any) > 0
    ? ((parseInt(data.job_completed as any) || 0) / parseInt(data.leads as any) * 100)
    : 0;

  const cards: { label: string; value: string; sub: string | null; highlight: boolean; stage?: FunnelStage }[] = [
    {
      label: 'Contacts',
      value: String(contacts),
      sub: spam > 0 ? `${quality} quality leads · ${spam} removed` : `${quality} quality leads`,
      highlight: false,
      stage: 'leads',
    },
    {
      label: 'Revenue Closed',
      value: formatDollars(closedRev),
      sub: null,
      highlight: true,
      stage: 'estimate_approved',
    },
    {
      label: 'Open Estimates',
      value: formatDollars(openEst),
      sub: openEstCount > 0 ? `${openEstCount} estimates · avg ${formatDollars(avgOpenEst)}` : 'Pipeline value',
      highlight: false,
      stage: 'estimate_sent',
    },
    {
      label: 'Conversion Rate',
      value: `${convRate.toFixed(1)}%`,
      sub: 'Lead → Job Completed',
      highlight: false,
      stage: 'job_completed',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Paper
          key={card.label}
          className={`flex flex-col rounded-xl p-5 shadow-sm transition-all ${card.stage && onStageClick ? 'cursor-pointer hover:shadow-md' : ''}`}
          sx={card.highlight ? { backgroundColor: '#E85D4D', color: '#fff' } : {}}
          onClick={() => card.stage && onStageClick?.(card.stage, card.label)}
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
