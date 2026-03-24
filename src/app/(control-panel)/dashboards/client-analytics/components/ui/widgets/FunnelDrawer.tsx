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
  estimate_sent: boolean;
  estimate_approved: boolean;
  job_scheduled: boolean;
  job_completed: boolean;
  approved_revenue: number;
  invoiced_revenue: number;
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
  | 'job_completed';

const stageLabels: Record<FunnelStage, string> = {
  leads: 'All Leads',
  inspection_scheduled: 'Inspection Scheduled',
  inspection_completed: 'Inspection Completed',
  estimate_sent: 'Estimate Sent',
  estimate_approved: 'Estimate Approved',
  job_scheduled: 'Job Scheduled',
  job_completed: 'Job Completed',
};

const answerColors: Record<string, string> = {
  answered: 'bg-green-100 text-green-700',
  missed: 'bg-red-100 text-red-700',
  abandoned: 'bg-amber-100 text-amber-700',
};

const stageStyles: Record<string, { bg: string; text: string }> = {
  'Job Completed': { bg: '#3b8a5a', text: '#fff' },
  'Job Scheduled': { bg: '#e6f3ec', text: '#3b8a5a' },
  'Estimate Approved': { bg: '#3b8a5a', text: '#fff' },
  'Estimate Sent': { bg: '#EEEAD9', text: '#5a554d' },
  'Inspection Complete': { bg: '#E85D4D', text: '#fff' },
  'Inspection Scheduled': { bg: '#fde8e4', text: '#c44a3c' },
  'Lead': { bg: '#EEEAD9', text: '#8a8279' },
};

function getHighestStage(lead: Lead): string {
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
  onClose: () => void;
};

function FunnelDrawer({ open, stage, title, leads, customerId, onClose }: Props) {
  const filtered = leads && Array.isArray(leads) ? filterByStage(leads, stage) : [];
  const [flagModal, setFlagModal] = useState<Lead | null>(null);
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

  // Calculate total revenue for this stage
  const totalRevenue = filtered.reduce((sum, lead) => {
    const approved = parseFloat(String(lead.approved_revenue)) || 0;
    const invoiced = parseFloat(String(lead.invoiced_revenue)) || 0;
    return sum + approved + invoiced;
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
              const revenue = approvedRev + invoicedRev;
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
                  {/* Row 1: Name + source badge + flag badge + revenue */}
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
                    </div>
                    {revenue > 0 && (
                      <Typography className="text-sm font-bold" style={{ color: '#3b8a5a' }}>
                        {formatDollars(revenue)}
                      </Typography>
                    )}
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

                  {/* Revenue breakdown if both exist */}
                  {approvedRev > 0 && invoicedRev > 0 && (
                    <div className="mt-0.5 text-[10px]" style={{ color: '#c5bfb6' }}>
                      Est: {formatDollars(approvedRev)} · Inv: {formatDollars(invoicedRev)}
                    </div>
                  )}

                  {/* Flag button */}
                  <div className="mt-1.5 flex justify-end">
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
