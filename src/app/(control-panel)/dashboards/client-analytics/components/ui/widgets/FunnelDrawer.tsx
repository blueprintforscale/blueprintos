'use client';

import { memo } from 'react';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';

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

function filterByStage(leads: Lead[], stage: FunnelStage): Lead[] {
  if (stage === 'leads') return leads;
  return leads.filter((l) => l[stage] === true);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPhone(p: string) {
  if (!p || p.length !== 10) return p || '';
  return `(${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`;
}

function formatDollars(n: number) {
  if (!n) return '';
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

const answerColors: Record<string, string> = {
  answered: 'bg-green-100 text-green-700',
  missed: 'bg-red-100 text-red-700',
  abandoned: 'bg-amber-100 text-amber-700',
};

const stageColors: Record<string, string> = {
  'Job Completed': 'bg-green-600 text-white',
  'Job Scheduled': 'bg-green-500 text-white',
  'Estimate Approved': 'bg-blue-600 text-white',
  'Estimate Sent': 'bg-blue-400 text-white',
  'Inspection Complete': 'bg-purple-500 text-white',
  'Inspection Scheduled': 'bg-purple-400 text-white',
  'Lead': 'bg-gray-400 text-white',
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
        sx: { width: { xs: '100%', sm: 480 }, p: 0 },
      }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
        <div>
          <Typography className="text-lg font-semibold">{stageLabels[stage]}</Typography>
          <Typography className="text-xs text-gray-400">{filtered.length} leads</Typography>
        </div>
        <IconButton onClick={onClose} size="small">
          <span className="text-lg">&#x2715;</span>
        </IconButton>
      </div>

      {/* Lead list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400">
            No leads at this stage
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((lead, i) => {
              const revenue = (lead.approved_revenue || 0) + (lead.invoiced_revenue || 0);
              const highestStage = getHighestStage(lead);
              const stageColor = stageColors[highestStage] || 'bg-gray-400 text-white';
              return (
                <div key={`${lead.phone}-${i}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50">
                  {/* Middle: details */}
                  <div className="min-w-0 flex-1">
                    {/* Name + source badge */}
                    <div className="flex items-center gap-2">
                      <Typography className="truncate text-sm font-medium">
                        {lead.name || 'Unknown'}
                      </Typography>
                      <span className="inline-block rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Google Ads
                      </span>
                    </div>

                    {/* Date + phone */}
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatDate(lead.contact_date)}</span>
                      <span>{formatPhone(lead.phone)}</span>
                    </div>

                    {/* Stage badge */}
                    <div className="mt-1.5">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium ${stageColor}`}>
                        {highestStage}
                      </span>
                    </div>
                  </div>

                  {/* Right: revenue */}
                  <div className="flex flex-col items-end">
                    {revenue > 0 && (
                      <Typography className="text-sm font-bold text-green-700">
                        {formatDollars(revenue)}
                      </Typography>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default memo(FunnelDrawer);
