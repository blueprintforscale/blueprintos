'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

type Lead = {
  hcp_customer_id: string | null;
  name: string;
  phone: string;
  contact_date: string;
  match_status: 'matched' | 'unmatched';
  lead_type: string;
  answer_status: string | null;
  duration: number | null;
  inspection_scheduled: boolean;
  inspection_completed: boolean;
  estimate_sent: boolean;
  estimate_approved: boolean;
  job_scheduled: boolean;
  job_completed: boolean;
  approved_revenue: number;
  invoiced_revenue: number;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPhone(p: string) {
  if (!p || p.length !== 10) return p || '-';
  return `(${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`;
}

function formatDuration(s: number | null) {
  if (!s) return '-';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function StageCell({ active, label }: { active: boolean; label: string }) {
  return (
    <td className="px-3 py-2.5 text-center">
      {active ? (
        <span className="inline-block h-5 w-5 rounded-full bg-green-500 text-[10px] font-bold leading-5 text-white">✓</span>
      ) : (
        <span className="inline-block h-5 w-5 rounded-full bg-gray-100 text-[10px] leading-5 text-gray-300">–</span>
      )}
    </td>
  );
}

const answerColors: Record<string, string> = {
  answered: 'bg-green-100 text-green-800',
  missed: 'bg-red-100 text-red-800',
  abandoned: 'bg-amber-100 text-amber-800',
  form: 'bg-blue-100 text-blue-800',
};

type Props = { data: Lead[] | undefined };

function LeadSpreadsheet({ data }: Props) {
  if (!data) return null;

  const matched = data.filter((l) => l.match_status === 'matched').length;
  const unmatched = data.length - matched;

  return (
    <Paper className="flex flex-col overflow-hidden rounded-xl shadow-sm">
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div>
          <Typography className="text-lg font-semibold">Lead Journey</Typography>
          <Typography className="text-xs text-gray-400">
            {data.length} leads ({matched} in CRM, {unmatched} unmatched)
          </Typography>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
              <th className="sticky left-0 bg-gray-50 px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-3 py-2.5">Phone</th>
              <th className="px-3 py-2.5">Type</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Duration</th>
              <th className="px-3 py-2.5 text-center">Insp Sched</th>
              <th className="px-3 py-2.5 text-center">Insp Comp</th>
              <th className="px-3 py-2.5 text-center">Est Sent</th>
              <th className="px-3 py-2.5 text-center">Est Approved</th>
              <th className="px-3 py-2.5 text-center">Job Sched</th>
              <th className="px-3 py-2.5 text-center">Job Comp</th>
              <th className="px-3 py-2.5 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((lead, i) => {
              const revenue = (lead.approved_revenue || 0) + (lead.invoiced_revenue || 0);
              const answerClass = answerColors[lead.answer_status || ''] || 'bg-gray-100 text-gray-600';
              return (
                <tr
                  key={`${lead.phone}-${i}`}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${lead.match_status === 'unmatched' ? 'opacity-60' : ''}`}
                >
                  <td className="sticky left-0 whitespace-nowrap bg-white px-4 py-2.5 text-gray-500">{formatDate(lead.contact_date)}</td>
                  <td className="max-w-[160px] truncate px-4 py-2.5 font-medium">{lead.name || '-'}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-gray-500">{formatPhone(lead.phone)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${lead.lead_type === 'call' ? 'bg-gray-100' : lead.lead_type === 'form' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {lead.lead_type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {lead.answer_status && (
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${answerClass}`}>
                        {lead.answer_status}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{formatDuration(lead.duration)}</td>
                  <StageCell active={lead.inspection_scheduled} label="Insp Sched" />
                  <StageCell active={lead.inspection_completed} label="Insp Comp" />
                  <StageCell active={lead.estimate_sent} label="Est Sent" />
                  <StageCell active={lead.estimate_approved} label="Est Approved" />
                  <StageCell active={lead.job_scheduled} label="Job Sched" />
                  <StageCell active={lead.job_completed} label="Job Comp" />
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium">
                    {revenue > 0 ? `$${revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Paper>
  );
}

export default memo(LeadSpreadsheet);
