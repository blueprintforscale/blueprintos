'use client';

import React, { memo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
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
  // For unmatched/new leads, show answer status instead
  if (lead.answer_status === 'form') return 'Form Lead';
  if (lead.answer_status === 'answered' || (lead.duration && lead.duration > 30)) return 'Answered';
  if (lead.answer_status === 'missed') return 'Missed';
  if (lead.answer_status === 'abandoned') return 'Abandoned';
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
  'Google Ads': 'text-white',
  'Google Business Profile': 'text-white',
  'Direct / Organic': 'text-white',
  'Referral': 'text-white',
  'LSA': 'text-white',
};

const sourceBgColors: Record<string, string> = {
  'Google Ads': '#3b8a5a',
  'Google Business Profile': '#c4890a',
  'Direct / Organic': '#5a554d',
  'Referral': '#E85D4D',
  'LSA': '#000000',
};

const stageStyles: Record<string, { bg: string; text: string }> = {
  'Job Completed': { bg: '#3b8a5a', text: '#fff' },
  'Job Scheduled': { bg: '#e6f3ec', text: '#3b8a5a' },
  'Estimate Approved': { bg: '#3b8a5a', text: '#fff' },
  'Estimate Sent': { bg: '#EEEAD9', text: '#5a554d' },
  'Inspection Complete': { bg: '#E85D4D', text: '#fff' },
  'Inspection Scheduled': { bg: '#fde8e4', text: '#c44a3c' },
  'Answered': { bg: '#e6f3ec', text: '#3b8a5a' },
  'Form Lead': { bg: '#EEEAD9', text: '#5a554d' },
  'Missed': { bg: '#fde8e4', text: '#c44a3c' },
  'Abandoned': { bg: '#EEEAD9', text: '#c5bfb6' },
  'New Lead': { bg: '#EEEAD9', text: '#8a8279' },
};


type Props = { data: Lead[] | undefined; customerId?: number };

function LeadSpreadsheet({ data, customerId }: Props) {
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  if (!data || !Array.isArray(data)) return null;

  const filtered = data;
  const matched = filtered.filter((l) => l.match_status === 'matched').length;
  const unmatched = filtered.length - matched;

  return (
    <Paper className="flex flex-col overflow-hidden rounded-xl shadow-sm">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <Typography className="text-lg font-semibold">Lead Journey</Typography>
        <Typography className="text-xs" style={{ color: '#8a8279' }}>
          {filtered.length} leads ({matched} in CRM, {unmatched} unmatched)
        </Typography>
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
                    <span
                      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                      style={{ backgroundColor: sourceBgColors[source] || '#5a554d' }}
                    >
                      {source}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: lead.lead_type === 'form' ? '#EEEAD9' : '#f5f5f5',
                        color: lead.lead_type === 'form' ? '#5a554d' : '#8a8279',
                      }}
                    >
                      {lead.lead_type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5" style={{ color: '#8a8279' }}>{formatDuration(lead.duration)}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: (stageStyles[stage] || stageStyles['New Lead']).bg,
                        color: (stageStyles[stage] || stageStyles['New Lead']).text,
                      }}
                    >
                      {stage}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium">
                    {revenue > 0 ? `$${revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '-'}
                  </td>
                </tr>
                {isExpanded && canExpand && customerId && (
                  <tr>
                    <td colSpan={8} className="p-0">
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
