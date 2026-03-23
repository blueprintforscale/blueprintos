'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import type { RecentActivity } from '../../../api/types';

const eventLabels: Record<string, { label: string; color: 'success' | 'info' | 'warning' }> = {
  job_completed: { label: 'Job Completed', color: 'success' },
  estimate_approved: { label: 'Estimate Approved', color: 'info' },
  inspection: { label: 'Inspection', color: 'warning' },
};

function formatDate(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatAmount(a: string) {
  const n = parseFloat(a);
  if (!n || n === 0) return '';
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

type Props = { data: RecentActivity[] | undefined };

function RecentActivityWidget({ data }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <Paper className="flex flex-col rounded-xl p-6 shadow-sm">
      <Typography className="mb-4 text-lg font-semibold">Recent Activity</Typography>
      <div className="flex flex-col gap-3">
        {data.map((item, i) => {
          const evt = eventLabels[item.event_type] || { label: item.event_type, color: 'info' as const };
          const amount = formatAmount(item.amount);
          return (
            <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-center gap-3">
                <Chip label={evt.label} color={evt.color} size="small" variant="outlined" />
                <div>
                  <Typography className="text-sm font-medium">{item.customer_name}</Typography>
                  <Typography className="text-xs text-gray-400">{formatDate(item.event_date)}</Typography>
                </div>
              </div>
              {amount && (
                <Typography className="text-sm font-bold">{amount}</Typography>
              )}
            </div>
          );
        })}
      </div>
    </Paper>
  );
}

export default memo(RecentActivityWidget);
