'use client';

import React, { memo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LeadDetailPanel from './LeadDetailPanel';
import FlagLeadModal from './FlagLeadModal';

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
  estimate_value?: number;
  lost_reason?: string | null;
  job_description?: string | null;
  service_address?: string | null;
  client_flag_reason?: string | null;
  client_flag_at?: string | null;
  source_label?: string;
  excluded_from_quality?: boolean;
};

function getSource(lead: Lead): string {
  return lead.source_label || 'Unknown';
}

function getHighestStage(lead: Lead): string {
  if (lead.lost_reason) return 'Lost';
  if (lead.job_completed) return 'Job Completed';
  if (lead.job_scheduled) return 'Job Scheduled';
  if (lead.estimate_approved) return 'Estimate Approved';
  if (lead.estimate_sent) return 'Estimate Sent';
  if (lead.inspection_completed) return 'Inspection Complete';
  if (lead.inspection_scheduled) return 'Inspection Scheduled';
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

const sourceBgColors: Record<string, string> = {
  'Google Ads': '#3b8a5a',
  'LSA': '#000000',
  'Google Business Profile': '#c4890a',
  'Google Organic': '#1a73e8',
  'Bing Organic': '#0078d4',
  'Yahoo Organic': '#6001d2',
  'DuckDuckGo Organic': '#de5833',
  'AI Search': '#10a37f',
  'Direct': '#5a554d',
  'Direct / Organic': '#5a554d',
  'Facebook': '#1877f2',
  'Instagram': '#e1306c',
  'Yelp': '#d32323',
  'Referral': '#E85D4D',
  'Self-Gen': '#7c3aed',
  'Internal': '#9ca3af',
  'Unknown': '#6b7280',
  'Unknown Source': '#6b7280',
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
  'Lost': { bg: '#fde8e4', text: '#c44a3c' },
  'New Lead': { bg: '#EEEAD9', text: '#8a8279' },
};

type Props = { data: Lead[] | undefined; customerId?: number; crm?: string };

function LeadSpreadsheet({ data, customerId, crm }: Props) {
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [showLost, setShowLost] = useState(false);
  const [search, setSearch] = useState('');
  const [flagModal, setFlagModal] = useState<{ lead: Lead; index: number } | null>(null);
  const [flaggedLocally, setFlaggedLocally] = useState<Set<string>>(new Set());

  if (!data || !Array.isArray(data)) return null;

  const isExcluded = (l: Lead) => l.excluded_from_quality || !!l.lost_reason;
  const lostCount = data.filter(isExcluded).length;
  const afterLost = showLost ? data : data.filter((l) => !isExcluded(l));
  const filtered = search.trim()
    ? afterLost.filter((l) => {
        const q = search.toLowerCase().replace(/[^a-z0-9]/g, '');
        const name = (l.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const phone = (l.phone || '').replace(/[^0-9]/g, '');
        return name.includes(q) || phone.includes(q);
      })
    : afterLost;
  const matched = filtered.filter((l) => l.match_status === 'matched').length;
  const unmatched = filtered.length - matched;

  const handleFlag = async (reason: string, notes: string) => {
    if (!flagModal || !customerId) return;
    const lead = flagModal.lead;
    await fetch(`/api/blueprint/clients/${customerId}/flag-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hcp_customer_id: lead.hcp_customer_id || null,
        phone: lead.phone,
        callrail_id: null,
        name: lead.name,
        reason,
        notes,
      }),
    });
    setFlaggedLocally((prev) => new Set(prev).add(`${lead.phone}-${flagModal.index}`));
  };

  const isLeadFlagged = (lead: Lead, i: number) =>
    !!lead.client_flag_reason || flaggedLocally.has(`${lead.phone}-${i}`);

  return (
    <>
    <Paper className="flex flex-col overflow-hidden rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-2 px-6 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <Typography className="text-lg font-semibold">Lead Journey</Typography>
            <Typography className="text-xs" style={{ color: '#8a8279' }}>
              {filtered.length} leads ({matched} in CRM, {unmatched} unmatched)
              {!showLost && lostCount > 0 && ` · ${lostCount} lost hidden`}
              {search && ` · searching "${search}"`}
            </Typography>
          </div>
          {lostCount > 0 && (
            <label className="flex cursor-pointer items-center gap-1.5 text-xs" style={{ color: '#8a8279' }}>
              <input
                type="checkbox"
                checked={showLost}
                onChange={(e) => setShowLost(e.target.checked)}
                className="rounded"
              />
              Show lost ({lostCount})
            </label>
          )}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full max-w-xs rounded-md border px-3 py-1.5 text-xs outline-none transition-colors focus:border-gray-400"
          style={{ borderColor: '#ddd8cb', color: '#000' }}
        />
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
              <th className="px-3 py-2.5 text-center w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead, i) => {
              const revenue = (parseFloat(String(lead.approved_revenue)) || 0) + (parseFloat(String(lead.invoiced_revenue)) || 0);
              const source = getSource(lead);
              const stage = getHighestStage(lead);
              const flagged = isLeadFlagged(lead, i);

              const isExpanded = expandedLead === `${lead.phone}-${i}`;
              const canExpand = lead.match_status === 'matched' && lead.hcp_customer_id;
              return (
                <React.Fragment key={`${lead.phone}-${i}`}>
                <tr
                  className={`border-b border-gray-50 hover:bg-gray-50 ${lead.match_status === 'unmatched' ? 'opacity-60' : ''} ${canExpand ? 'cursor-pointer' : ''} ${isExpanded ? 'bg-gray-50' : ''} ${flagged ? 'opacity-70' : ''}`}
                  style={flagged ? { borderLeft: '3px solid #c4890a' } : undefined}
                  onClick={() => canExpand && setExpandedLead(isExpanded ? null : `${lead.phone}-${i}`)}
                >
                  <td className="sticky left-0 whitespace-nowrap bg-white px-4 py-2.5 text-gray-500">{formatDate(lead.contact_date)}</td>
                  <td className="max-w-[200px] px-4 py-2.5">
                    <div className="font-medium truncate">{lead.name || '-'}</div>
                    {lead.service_address && (
                      <div className="text-[9px] truncate" style={{ color: '#c5bfb6' }}>{lead.service_address}</div>
                    )}
                  </td>
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
                    {lead.lost_reason && (
                      <div className="mt-0.5 text-[9px]" style={{ color: '#c5bfb6' }}>{lead.lost_reason}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium">
                    {revenue > 0 ? `$${revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '-'}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {flagged ? (
                      <span
                        className="inline-block rounded px-2 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: '#fdf8ed', color: '#c4890a', border: '1px solid #e8d9a8' }}
                      >
                        Flagged
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setFlagModal({ lead, index: i }); }}
                        className="rounded px-2 py-0.5 text-[10px] font-medium transition-colors hover:bg-gray-100"
                        style={{ color: '#c5bfb6' }}
                      >
                        Flag
                      </button>
                    )}
                  </td>
                </tr>
                {isExpanded && canExpand && customerId && (
                  <tr>
                    <td colSpan={9} className="p-0">
                      <LeadDetailPanel customerId={customerId} hcpCustomerId={lead.hcp_customer_id!} fieldMgmt={crm} />
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

    {/* Flag modal */}
    <FlagLeadModal
      open={flagModal !== null}
      leadName={flagModal?.lead.name || ''}
      onClose={() => setFlagModal(null)}
      onSubmit={handleFlag}
    />
    </>
  );
}

export default memo(LeadSpreadsheet);
