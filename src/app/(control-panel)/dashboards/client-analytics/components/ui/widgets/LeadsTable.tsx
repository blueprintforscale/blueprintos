'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import type { LeadContact } from '../../../api/types';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatDuration(s: number | null) {
  if (!s) return '-';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function formatPhone(p: string) {
  if (!p || p.length !== 10) return p;
  return `(${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`;
}

const answerColors: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  answered: 'success',
  missed: 'error',
  abandoned: 'warning',
  form: 'info',
};

type Props = { data: LeadContact[] | undefined };

function LeadsTable({ data }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <Paper className="flex flex-col overflow-hidden rounded-xl shadow-sm">
      <div className="flex items-center justify-between p-6 pb-0">
        <Typography className="text-lg font-semibold">Google Ads Leads</Typography>
        <Typography className="text-xs text-gray-400">{data.length} contacts</Typography>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Duration</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((lead) => (
              <tr key={lead.callrail_id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-3 text-xs text-gray-500">{formatDate(lead.contact_date)}</td>
                <td className="px-6 py-3 font-medium">{lead.name || '-'}</td>
                <td className="whitespace-nowrap px-6 py-3 text-gray-500">{formatPhone(lead.phone)}</td>
                <td className="px-6 py-3">
                  <Chip label={lead.type} size="small" variant="outlined" />
                </td>
                <td className="px-6 py-3 text-gray-500">{formatDuration(lead.duration)}</td>
                <td className="px-6 py-3">
                  <Chip
                    label={lead.answer_status}
                    size="small"
                    color={answerColors[lead.answer_status] || 'default'}
                    variant="filled"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Paper>
  );
}

export default memo(LeadsTable);
