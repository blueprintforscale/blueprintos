'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

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
  leads: Lead[] | undefined;
  onClose: () => void;
};

function FunnelDrawer({ open, stage, leads, onClose }: Props) {
  const filtered = leads && Array.isArray(leads) ? filterByStage(leads, stage) : [];

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
          <Typography className="text-base font-bold text-white">{stageLabels[stage]}</Typography>
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
                  className="border-b px-5 py-3 hover:bg-gray-50"
                  style={{ borderColor: '#f0ede6' }}
                >
                  {/* Row 1: Name + source badge + revenue */}
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </Drawer>
  );
}

export default memo(FunnelDrawer);
