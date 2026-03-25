'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FlagLeadModal from './FlagLeadModal';

type Lead = {
  hcp_customer_id: string | null;
  name: string;
  phone: string;
  contact_date: string;
  match_status: string;
  lead_type: string;
  answer_status: string | null;
  duration: number | null;
  inspection_scheduled: boolean;
  inspection_completed: boolean;
  inspection_completed_inferred?: boolean;
  estimate_sent: boolean;
  estimate_approved: boolean;
  job_scheduled: boolean;
  job_completed: boolean;
  revenue_closed: boolean;
  approved_revenue: number;
  invoiced_revenue: number;
  estimate_value?: number;
  client_flag_reason?: string | null;
  client_flag_at?: string | null;
  service_address?: string | null;
};

export type FunnelStage =
  | 'leads'
  | 'inspection_scheduled'
  | 'inspection_completed'
  | 'estimate_sent'
  | 'estimate_approved'
  | 'job_scheduled'
  | 'job_completed'
  | 'revenue_closed'
  | 'open_estimates';

const stageLabels: Record<FunnelStage, string> = {
  leads: 'All Leads',
  inspection_scheduled: 'Inspection Scheduled',
  inspection_completed: 'Inspection Completed',
  estimate_sent: 'Estimate Sent',
  estimate_approved: 'Estimate Approved',
  job_scheduled: 'Job Scheduled',
  job_completed: 'Job Completed',
  revenue_closed: 'Revenue Closed',
  open_estimates: 'Open Estimates',
};

const answerColors: Record<string, string> = {
  answered: 'bg-green-100 text-green-700',
  missed: 'bg-red-100 text-red-700',
  abandoned: 'bg-amber-100 text-amber-700',
};

const stageStyles: Record<string, { bg: string; text: string }> = {
  'Revenue Closed': { bg: '#2d7a4a', text: '#fff' },
  'Job Completed': { bg: '#3b8a5a', text: '#fff' },
  'Job Scheduled': { bg: '#e6f3ec', text: '#3b8a5a' },
  'Estimate Approved': { bg: '#3b8a5a', text: '#fff' },
  'Estimate Sent': { bg: '#EEEAD9', text: '#5a554d' },
  'Inspection Complete': { bg: '#E85D4D', text: '#fff' },
  'Inspection Scheduled': { bg: '#fde8e4', text: '#c44a3c' },
  'Lead': { bg: '#EEEAD9', text: '#8a8279' },
};

function getHighestStage(lead: Lead): string {
  if (lead.revenue_closed) return 'Revenue Closed';
  if (lead.job_completed) return 'Job Completed';
  if (lead.job_scheduled) return 'Job Scheduled';
  if (lead.estimate_approved) return 'Estimate Approved';
  if (lead.estimate_sent) return 'Estimate Sent';
  if (lead.inspection_completed) return 'Inspection Complete';
  if (lead.inspection_scheduled) return 'Inspection Scheduled';
  return 'Lead';
}

function filterByStage(leads: Lead[], stage: FunnelStage): Lead[] {
  if (stage === 'leads') return leads;
  if (stage === 'open_estimates') {
    return leads.filter((l) => l.estimate_sent && !l.estimate_approved && !l.revenue_closed);
  }
  return leads.filter((l) => l[stage] === true);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPhone(p: string) {
  if (!p || p.length !== 10) return p || '';
  return `(${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`;
}

function formatDollars(n: number) {
  if (!n) return '';
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

type Props = {
  open: boolean;
  stage: FunnelStage;
  title?: string;
  leads: Lead[] | undefined;
  customerId?: number;
  crm?: string;
  adSpend?: number;
  programPrice?: number;
  closedRev?: number;
  periodAdSpend?: number;
  onClose: () => void;
};

// Detect CRM per-lead: Jobber IDs are base64 GraphQL node IDs, HCP IDs start with cus_
function detectLeadCrm(id: string, clientCrm?: string): 'jobber' | 'hcp' {
  if (clientCrm === 'jobber') return 'jobber';
  if (id.startsWith('cus_')) return 'hcp';
  try {
    const decoded = atob(id);
    if (decoded.includes('Jobber')) return 'jobber';
  } catch { /* not base64 */ }
  return 'hcp';
}

function getCrmUrl(id: string | null, crm?: string): string | null {
  if (!id) return null;
  const leadCrm = detectLeadCrm(id, crm);
  if (leadCrm === 'jobber') {
    try {
      const decoded = atob(id);
      const numericId = decoded.split('/').pop();
      return numericId ? `https://secure.getjobber.com/clients/${numericId}` : null;
    } catch { return null; }
  }
  return `https://pro.housecallpro.com/pro/customers/${id.replace('cus_', '')}`;
}

function FunnelDrawer({ open, stage, title, leads, customerId, crm, adSpend, programPrice, closedRev, periodAdSpend, onClose }: Props) {
  const filtered = leads && Array.isArray(leads) ? filterByStage(leads, stage) : [];
  const [flagModal, setFlagModal] = useState<Lead | null>(null);
  const [projectedCloses, setProjectedCloses] = useState<Set<string>>(new Set());
  const [flaggedLocally, setFlaggedLocally] = useState<Set<string>>(new Set());

  const handleFlag = async (reason: string, notes: string) => {
    if (!flagModal || !customerId) return;
    await fetch(`/api/blueprint/clients/${customerId}/flag-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hcp_customer_id: flagModal.hcp_customer_id || null,
        phone: flagModal.phone,
        name: flagModal.name,
        reason,
        notes,
      }),
    });
    setFlaggedLocally((prev) => new Set(prev).add(flagModal.phone));
  };

  const isLeadFlagged = (lead: Lead) =>
    !!lead.client_flag_reason || flaggedLocally.has(lead.phone);

  // Calculate total revenue — contextual to the stage we drilled into
  const totalRevenue = filtered.reduce((sum, lead) => {
    const approved = parseFloat(String(lead.approved_revenue)) || 0;
    const invoiced = parseFloat(String(lead.invoiced_revenue)) || 0;
    const estVal = parseFloat(String(lead.estimate_value)) || 0;
    let rev = 0;
    if (stage === 'estimate_sent') rev = estVal;
    else if (stage === 'estimate_approved') rev = approved;
    else if (stage === 'job_scheduled' || stage === 'job_completed') rev = invoiced > 0 ? invoiced : approved;
    else if (stage === 'revenue_closed') rev = invoiced;
    else rev = (approved + invoiced) > 0 ? (approved + invoiced) : estVal;
    return sum + rev;
  }, 0);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 440 }, p: 0, backgroundColor: '#fff' },
      }}
    >
      {/* Header — black background like the portal funnel */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
        style={{ backgroundColor: '#000' }}
      >
        <div>
          <div className="flex items-center gap-3">
            <Typography className="text-base font-bold text-white">{title || stageLabels[stage]}</Typography>
            {totalRevenue > 0 && (
              <Typography className="text-base font-bold" style={{ color: '#3b8a5a' }}>
                {formatDollars(totalRevenue)}
              </Typography>
            )}
          </div>
          <Typography className="text-xs" style={{ color: '#c5bfb6' }}>{filtered.length} leads</Typography>
        </div>
        <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
          <span className="text-lg">&#x2715;</span>
        </IconButton>
      </div>

      {/* Guarantee breakdown — shown when programPrice is provided */}
      {programPrice !== undefined && programPrice > 0 && (
        <div className="border-b px-5 py-3" style={{ borderColor: '#f0ede6', backgroundColor: '#fafaf7' }}>
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: '#8a8279' }}>All-Time Google Ads Revenue</span>
            <span className="font-bold" style={{ color: '#3b8a5a' }}>{formatDollars(totalRevenue)}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span style={{ color: '#8a8279' }}>Program Investment</span>
            <span className="font-bold">{formatDollars(programPrice)}</span>
          </div>
          <div className="mt-2 border-t pt-2 flex items-center justify-between" style={{ borderColor: '#e8e4d9' }}>
            <span className="text-xs" style={{ color: '#8a8279' }}>Guarantee</span>
            <span className="text-sm font-bold">
              {formatDollars(totalRevenue)} / {formatDollars(programPrice)} = <span style={{ color: '#E85D4D' }}>{(totalRevenue / programPrice).toFixed(1)}x</span>
            </span>
          </div>
          <div className="mt-1 text-[10px]" style={{ color: '#c5bfb6' }}>
            For every $1 invested in the program, Google Ads has generated ${(totalRevenue / programPrice).toFixed(2)} in revenue
          </div>
        </div>
      )}

      {/* ROAS breakdown — shown when adSpend is provided */}
      {adSpend !== undefined && adSpend > 0 && !programPrice && (
        <div className="border-b px-5 py-3" style={{ borderColor: '#f0ede6', backgroundColor: '#fafaf7' }}>
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: '#8a8279' }}>Total Revenue</span>
            <span className="font-bold" style={{ color: '#3b8a5a' }}>{formatDollars(totalRevenue)}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span style={{ color: '#8a8279' }}>Ad Spend</span>
            <span className="font-bold">{formatDollars(adSpend)}</span>
          </div>
          <div className="mt-2 border-t pt-2 flex items-center justify-between" style={{ borderColor: '#e8e4d9' }}>
            <span className="text-xs" style={{ color: '#8a8279' }}>ROAS</span>
            <span className="text-sm font-bold">
              {formatDollars(totalRevenue)} / {formatDollars(adSpend)} = <span style={{ color: '#E85D4D' }}>{(totalRevenue / adSpend).toFixed(1)}x</span>
            </span>
          </div>
        </div>
      )}

      {/* Projected ROAS — shown on estimate_sent stage */}
      {stage === 'estimate_sent' && periodAdSpend !== undefined && periodAdSpend > 0 && (
        <div className="sticky top-[68px] z-10 border-b px-5 py-3" style={{ borderColor: '#f0ede6', backgroundColor: '#fafaf7' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#8a8279' }}>Projected ROAS</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold" style={{ color: '#E85D4D' }}>
                  {periodAdSpend > 0
                    ? (((closedRev || 0) + [...projectedCloses].reduce((sum, id) => {
                        const lead = filtered.find(l => (l as any).hcp_customer_id === id || (l as any).phone === id);
                        return sum + (lead ? (parseFloat(String(lead.estimate_value)) || 0) : 0);
                      }, 0)) / periodAdSpend).toFixed(1)
                    : '0.0'}x
                </span>
                <span className="text-[10px]" style={{ color: '#c5bfb6' }}>
                  if {projectedCloses.size} estimate{projectedCloses.size !== 1 ? 's' : ''} close
                </span>
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: '#c5bfb6' }}>
                Current: {periodAdSpend > 0 ? ((closedRev || 0) / periodAdSpend).toFixed(1) : '0.0'}x
                → +{formatDollars([...projectedCloses].reduce((sum, id) => {
                  const lead = filtered.find(l => (l as any).hcp_customer_id === id || (l as any).phone === id);
                  return sum + (lead ? (parseFloat(String(lead.estimate_value)) || 0) : 0);
                }, 0))} projected
              </div>
            </div>
            {projectedCloses.size > 0 && (
              <button
                onClick={async () => {
                  if (customerId) {
                    await fetch(`/api/blueprint/clients/${customerId}/projected-roas/clear`, { method: 'POST' });
                  }
                  setProjectedCloses(new Set());
                }}
                className="rounded px-2 py-1 text-[10px] font-medium transition-colors hover:bg-gray-100"
                style={{ color: '#E85D4D', border: '1px solid #f0ddd9' }}
              >
                Clear
              </button>
            )}
          </div>
          <div className="mt-2 text-[9px]" style={{ color: '#c5bfb6' }}>
            Toggle estimates below to project what ROAS would be if they close
          </div>
        </div>
      )}

      {/* Lead list with staggered animation */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm" style={{ color: '#8a8279' }}>
            No leads at this stage
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((lead, i) => {
              const approvedRev = parseFloat(String(lead.approved_revenue)) || 0;
              const invoicedRev = parseFloat(String(lead.invoiced_revenue)) || 0;
              const estValue = parseFloat(String(lead.estimate_value)) || 0;
              // Revenue is contextual to the funnel stage we drilled into
              let revenue = 0;
              if (stage === 'estimate_sent') revenue = estValue;
              else if (stage === 'estimate_approved') revenue = approvedRev;
              else if (stage === 'job_scheduled' || stage === 'job_completed') revenue = invoicedRev > 0 ? invoicedRev : approvedRev;
              else if (stage === 'revenue_closed') revenue = invoicedRev;
              else revenue = (approvedRev + invoicedRev) > 0 ? (approvedRev + invoicedRev) : estValue;
              const highestStage = getHighestStage(lead);
              const stageStyle = stageStyles[highestStage] || stageStyles['Lead'];

              return (
                <motion.div
                  key={`${lead.phone}-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className={`border-b px-5 py-3 hover:bg-gray-50 ${lead.client_flag_reason ? 'opacity-70' : ''}`}
                  style={{ borderColor: '#f0ede6', borderLeft: lead.client_flag_reason ? '3px solid #c4890a' : undefined }}
                >
                  {/* Row 1: Name + source badge + flag badge + revenue + HCP link */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Typography className="text-sm font-semibold" style={{ color: '#000' }}>
                        {lead.name || 'Unknown'}
                      </Typography>
                      <span
                        className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: '#3b8a5a' }}
                      >
                        Google Ads
                      </span>
                      {lead.client_flag_reason && (
                        <span
                          className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: '#fdf8ed', color: '#c4890a', border: '1px solid #e8d9a8' }}
                        >
                          Flagged
                        </span>
                      )}
                      {lead.inspection_completed_inferred && (stage === 'inspection_completed' || stage === 'inspection_scheduled') && (
                        <span
                          className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: '#fef9e6', color: '#c4a55a', border: '1px solid #e8d9a8' }}
                        >
                          Inferred
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {revenue > 0 && (
                        <Typography className="text-sm font-bold" style={{ color: '#3b8a5a' }}>
                          {formatDollars(revenue)}
                        </Typography>
                      )}
                      {lead.hcp_customer_id && getCrmUrl(lead.hcp_customer_id, crm) && (
                        <a
                          href={getCrmUrl(lead.hcp_customer_id, crm)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center rounded-full p-1 transition-colors hover:bg-gray-100"
                          title={detectLeadCrm(lead.hcp_customer_id, crm) === 'jobber' ? 'Open in Jobber' : 'Open in Housecall Pro'}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8279" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Date · Phone · Stage badge */}
                  <div className="mt-1 flex items-center gap-1.5 text-[11px]" style={{ color: '#8a8279' }}>
                    <span>{formatDate(lead.contact_date)}</span>
                    <span>·</span>
                    <span>{formatPhone(lead.phone)}</span>
                    {highestStage !== 'Lead' && (
                      <>
                        <span>·</span>
                        <span
                          className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: stageStyle.bg, color: stageStyle.text }}
                        >
                          {highestStage}
                        </span>
                      </>
                    )}
                    {highestStage === 'Lead' && lead.answer_status && lead.answer_status !== 'form' && (
                      <>
                        <span>·</span>
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${answerColors[lead.answer_status] || ''}`}>
                          {lead.answer_status}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Revenue breakdown — itemized */}
                  {(approvedRev > 0 || invoicedRev > 0) && (
                    <div className="mt-0.5 text-[10px]" style={{ color: '#c5bfb6' }}>
                      {approvedRev > 0 && <span>Est: {formatDollars(approvedRev)}</span>}
                      {approvedRev > 0 && invoicedRev > 0 && <span> · </span>}
                      {invoicedRev > 0 && <span>Inv: {formatDollars(invoicedRev)}</span>}
                    </div>
                  )}

                  {/* Actions row: projected close toggle + flag */}
                  <div className="mt-1.5 flex items-center justify-between">
                    {/* Projected close toggle — only on estimate_sent */}
                    {stage === 'estimate_sent' && periodAdSpend !== undefined && estValue > 0 ? (
                      <button
                        onClick={async () => {
                          const leadId = lead.hcp_customer_id || lead.phone;
                          const isOn = projectedCloses.has(leadId);
                          const next = new Set(projectedCloses);
                          if (isOn) { next.delete(leadId); } else { next.add(leadId); }
                          setProjectedCloses(next);
                          if (customerId) {
                            fetch(`/api/blueprint/clients/${customerId}/projected-roas/toggle`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                estimate_id: lead.hcp_customer_id || lead.phone,
                                estimate_type: crm || 'hcp',
                                value_cents: Math.round(estValue * 100),
                                projected_close: !isOn,
                              }),
                            });
                          }
                        }}
                        className="rounded px-2.5 py-1 text-[10px] font-semibold transition-all"
                        style={projectedCloses.has(lead.hcp_customer_id || lead.phone)
                          ? { backgroundColor: '#3b8a5a', color: '#fff' }
                          : { backgroundColor: 'transparent', color: '#8a8279', border: '1px solid #ddd8cb' }
                        }
                      >
                        {projectedCloses.has(lead.hcp_customer_id || lead.phone) ? 'Will close' : 'Will close?'}
                      </button>
                    ) : <div />}

                    {/* Flag button */}
                    <div>
                      {isLeadFlagged(lead) ? (
                        <span
                          className="inline-block rounded px-2 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: '#fdf8ed', color: '#c4890a', border: '1px solid #e8d9a8' }}
                        >
                          Flagged
                        </span>
                      ) : (
                        <button
                          onClick={() => setFlagModal(lead)}
                          className="rounded px-2 py-0.5 text-[10px] font-medium transition-colors hover:bg-gray-100"
                          style={{ color: '#c5bfb6', border: '1px solid #e8e4d9' }}
                        >
                          Flag
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Flag modal */}
      <FlagLeadModal
        open={flagModal !== null}
        leadName={flagModal?.name || ''}
        onClose={() => setFlagModal(null)}
        onSubmit={handleFlag}
      />
    </Drawer>
  );
}

export default memo(FunnelDrawer);
