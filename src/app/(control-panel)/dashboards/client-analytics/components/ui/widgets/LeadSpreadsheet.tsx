'use client';

import React, { memo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LeadDetailPanel from './LeadDetailPanel';

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

// Source detection — for now everything is Google Ads, but this is where
// we'll add GBP, Direct, Referral, etc. when multi-source goes live
function getSource(_lead: Lead): string {
  return 'Google Ads';
}

function getHighestStage(lead: Lead): string {
  if (lead.job_completed) return 'Job Completed';
  if (lead.job_scheduled) return 'Job Scheduled';
  if (lead.estimate_approved) return 'Estimate Approved';
  if (lead.estimate_sent) return 'Estimate Sent';
  if (lead.inspection_completed) return 'Inspection Complete';
  if (lead.inspection_scheduled) return 'Inspection Scheduled';
  return 'New Lead';
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDuration(s: number | null) {
  if (!s) return '-';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function formatPhone(p: string) {
  if (!p || p.length !== 10) return p || '-';
  return `(${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`;
}

const sourceColors: Record<string, string> = {
  'Google Ads': 'bg-green-600 text-white',
  'Google Business Profile': 'bg-amber-500 text-white',
  'Direct / Organic': 'bg-blue-500 text-white',
  'Referral': 'bg-purple-500 text-white',
  'LSA': 'bg-indigo-500 text-white',
};

const stageColors: Record<string, string> = {
  'Job Completed': 'bg-green-600 text-white',
  'Job Scheduled': 'bg-green-500 text-white',
  'Estimate Approved': 'bg-blue-600 text-white',
  'Estimate Sent': 'bg-blue-400 text-white',
  'Inspection Complete': 'bg-purple-500 text-white',
  'Inspection Scheduled': 'bg-purple-400 text-white',
  'New Lead': 'bg-gray-400 text-white',
};

const answerColors: Record<string, string> = {
  answered: 'bg-green-100 text-green-800',
  missed: 'bg-red-100 text-red-800',
  abandoned: 'bg-amber-100 text-amber-800',
  form: 'bg-blue-100 text-blue-800',
};

type Props = { data: Lead[] | undefined; customerId?: number };

function LeadSpreadsheet({ data, customerId }: Props) {
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  if (!data || !Array.isArray(data)) return null;

  // Build source options from data
  const allSources = [...new Set(data.map(getSource))].sort();
  const sourceOptions = [{ key: 'all', label: 'All Sources' }, ...allSources.map((s) => ({ key: s, label: s }))];

  // Filter
  const filtered = sourceFilter === 'all' ? data : data.filter((l) => getSource(l) === sourceFilter);

  const matched = filtered.filter((l) => l.match_status === 'matched').length;
  const unmatched = filtered.length - matched;

  return (
    <Paper className="flex flex-col overflow-hidden rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 px-6 pt-6 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography className="text-lg font-semibold">Lead Journey</Typography>
          <Typography className="text-xs text-gray-400">
            {filtered.length} leads ({matched} in CRM, {unmatched} unmatched)
          </Typography>
        </div>
        {/* Source filter chips */}
        <div className="flex flex-wrap gap-1.5">
          {sourceOptions.map((opt) => (
            <Chip
              key={opt.key}
              label={opt.label}
              size="small"
              variant={sourceFilter === opt.key ? 'filled' : 'outlined'}
              color={sourceFilter === opt.key ? 'primary' : 'default'}
              onClick={() => setSourceFilter(opt.key)}
              sx={{ fontSize: '0.7rem', height: 26 }}
            />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
              <th className="sticky left-0 bg-gray-50 px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-3 py-2.5">Phone</th>
              <th className="px-3 py-2.5">Source</th>
              <th className="px-3 py-2.5">Type</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Duration</th>
              <th className="px-3 py-2.5">Stage</th>
              <th className="px-3 py-2.5 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead, i) => {
              const revenue = (lead.approved_revenue || 0) + (lead.invoiced_revenue || 0);
              const source = getSource(lead);
              const stage = getHighestStage(lead);
              const answerClass = answerColors[lead.answer_status || ''] || 'bg-gray-100 text-gray-600';
              const sourceClass = sourceColors[source] || 'bg-gray-500 text-white';
              const stageClass = stageColors[stage] || 'bg-gray-400 text-white';

              const isExpanded = expandedLead === `${lead.phone}-${i}`;
              const canExpand = lead.match_status === 'matched' && lead.hcp_customer_id;
              return (
                <React.Fragment key={`${lead.phone}-${i}`}>
                <tr
                  className={`border-b border-gray-50 hover:bg-gray-50 ${lead.match_status === 'unmatched' ? 'opacity-60' : ''} ${canExpand ? 'cursor-pointer' : ''} ${isExpanded ? 'bg-gray-50' : ''}`}
                  onClick={() => canExpand && setExpandedLead(isExpanded ? null : `${lead.phone}-${i}`)}
                >
                  <td className="sticky left-0 whitespace-nowrap bg-white px-4 py-2.5 text-gray-500">{formatDate(lead.contact_date)}</td>
                  <td className="max-w-[160px] truncate px-4 py-2.5 font-medium">{lead.name || '-'}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-gray-500">{formatPhone(lead.phone)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${sourceClass}`}>
                      {source}
                    </span>
                  </td>
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
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${stageClass}`}>
                      {stage}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium">
                    {revenue > 0 ? `$${revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '-'}
                  </td>
                </tr>
                {isExpanded && canExpand && customerId && (
                  <tr>
                    <td colSpan={9} className="p-0">
                      <LeadDetailPanel customerId={customerId} hcpCustomerId={lead.hcp_customer_id!} />
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="flex h-24 items-center justify-center text-sm text-gray-400">
          No leads found for this filter
        </div>
      )}
    </Paper>
  );
}

export default memo(LeadSpreadsheet);
