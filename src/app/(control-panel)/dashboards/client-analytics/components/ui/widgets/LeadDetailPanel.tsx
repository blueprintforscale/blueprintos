'use client';

import { memo } from 'react';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';

type Props = {
  customerId: number;
  hcpCustomerId: string;
  fieldMgmt?: string;
};

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDollars(cents: number | null) {
  if (!cents) return '-';
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

// Normalize HCP statuses to client-friendly pipeline labels
function normalizeStatus(status: string): string {
  const map: Record<string, string> = {
    'scheduled': 'Scheduled',
    'in progress': 'In Progress',
    'needs scheduling': 'Needs Scheduling',
    'complete rated': 'Complete',
    'complete unrated': 'Complete',
    'user canceled': 'Canceled',
    'pro canceled': 'Canceled',
    'sent': 'Sent',
    'approved': 'Approved',
    'declined': 'Declined',
    'draft': 'Draft',
    'invoiced': 'Invoiced',
    'paid': 'Paid',
    'unpaid': 'Unpaid',
    'active': 'Active',
  };
  return map[status?.toLowerCase()] || status || '-';
}

const statusColors: Record<string, string> = {
  'Complete': 'bg-green-100 text-green-700',
  'Approved': 'bg-green-100 text-green-700',
  'Paid': 'bg-green-100 text-green-700',
  'Invoiced': 'bg-green-100 text-green-700',
  'Sent': 'bg-blue-100 text-blue-700',
  'Scheduled': 'bg-purple-100 text-purple-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Declined': 'bg-red-100 text-red-700',
  'Canceled': 'bg-red-100 text-red-700',
  'Draft': 'bg-gray-100 text-gray-500',
};

function StatusBadge({ status }: { status: string }) {
  const label = normalizeStatus(status);
  const colorClass = statusColors[label] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

function LeadDetailPanel({ customerId, hcpCustomerId, fieldMgmt }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['leadDetail', customerId, hcpCustomerId],
    queryFn: () => fetch(`/api/blueprint/clients/${customerId}/lead-detail/${hcpCustomerId}`).then(r => r.json()),
    enabled: !!hcpCustomerId,
  });

  if (isLoading) {
    return <div className="px-6 py-4 text-sm" style={{ color: '#8a8279' }}>Loading details...</div>;
  }

  if (!data || data.error) {
    return <div className="px-6 py-4 text-sm" style={{ color: '#8a8279' }}>No details available</div>;
  }

  const inspections = data.inspections || [];
  const estimates = data.estimates || [];
  const jobs = data.jobs || [];
  const invoices = data.invoices || [];

  const hcpUrl = `https://pro.housecallpro.com/pro/customers/${hcpCustomerId.replace('cus_', '')}`;

  return (
    <div className="border-t px-6 py-4" style={{ borderColor: '#ddd8cb', backgroundColor: '#F5F1E8' }}>
      <div className="flex flex-col gap-4">

        {/* Header with CRM arrow link */}
        <div className="flex items-center justify-between">
          <div>
            <Typography className="text-sm font-semibold">{data.first_name} {data.last_name}</Typography>
            <div className="mt-0.5 flex flex-wrap gap-3 text-[11px]" style={{ color: '#8a8279' }}>
              {data.phone && <span>{data.phone}</span>}
              {data.email && <span>{data.email}</span>}
              {data.contact_date && <span>Created {formatDate(data.contact_date)}</span>}
            </div>
          </div>
          <a
            href={hcpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-white"
            style={{ color: '#E85D4D' }}
            title="Open in HouseCall Pro"
          >
            HCP <span className="text-base">&#8599;</span>
          </a>
        </div>

        {/* Inspections */}
        {inspections.length > 0 && (
          <div>
            <Typography className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8a8279' }}>
              Inspections
            </Typography>
            <div className="space-y-1.5">
              {inspections.map((insp: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={insp.status} />
                    <span style={{ color: '#5a554d' }}>
                      {insp.scheduled_at && `Scheduled ${formatDate(insp.scheduled_at)}`}
                      {insp.completed_at && ` · Completed ${formatDate(insp.completed_at)}`}
                    </span>
                  </div>
                  {insp.total_cents > 0 && (
                    <span className="font-semibold">{formatDollars(insp.total_cents)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estimates */}
        {estimates.length > 0 && (
          <div>
            <Typography className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8a8279' }}>
              Estimates
            </Typography>
            <div className="space-y-2">
              {estimates.map((est: any, i: number) => (
                <div key={i} className="rounded-lg bg-white px-3 py-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={est.status} />
                      {est.estimate_type && (
                        <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: '#EEEAD9', color: '#5a554d' }}>
                          {est.estimate_type}
                        </span>
                      )}
                      {est.sent_at && <span style={{ color: '#8a8279' }}>Sent {formatDate(est.sent_at)}</span>}
                    </div>
                    <span className="font-semibold">
                      {est.status === 'approved' ? formatDollars(est.approved_total_cents) : formatDollars(est.highest_option_cents)}
                    </span>
                  </div>
                  {/* Options */}
                  {est.options && est.options.length > 0 && (
                    <div className="mt-2 ml-1 space-y-1 border-l-2 pl-3" style={{ borderColor: '#ddd8cb' }}>
                      {est.options.map((opt: any, j: number) => (
                        <div key={j} className="flex items-center justify-between" style={{ color: '#5a554d' }}>
                          <span className="truncate">{opt.name || `Option ${j + 1}`}</span>
                          <div className="flex items-center gap-2">
                            <span>{formatDollars(opt.total_cents)}</span>
                            {opt.approval_status && <StatusBadge status={opt.approval_status} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jobs */}
        {jobs.length > 0 && (
          <div>
            <Typography className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8a8279' }}>
              Jobs
            </Typography>
            <div className="space-y-1.5">
              {jobs.map((job: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={job.status} />
                    <span style={{ color: '#5a554d' }}>
                      {job.description || ''}
                      {job.scheduled_at && ` · ${formatDate(job.scheduled_at)}`}
                      {job.completed_at && ` · Done ${formatDate(job.completed_at)}`}
                    </span>
                  </div>
                  {job.total_cents > 0 && (
                    <span className="font-semibold">{formatDollars(job.total_cents)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices */}
        {invoices.length > 0 && (
          <div>
            <Typography className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8a8279' }}>
              Invoices
            </Typography>
            <div className="space-y-1.5">
              {invoices.map((inv: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inv.status} />
                    <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: '#EEEAD9', color: '#5a554d' }}>
                      {inv.invoice_type}
                    </span>
                    <span style={{ color: '#8a8279' }}>{formatDate(inv.invoice_date)}</span>
                    {inv.paid_at && <span style={{ color: '#3b8a5a' }}>Paid {formatDate(inv.paid_at)}</span>}
                  </div>
                  <span className="font-semibold">{formatDollars(inv.amount_cents)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {inspections.length === 0 && estimates.length === 0 && jobs.length === 0 && invoices.length === 0 && (
          <Typography className="text-xs" style={{ color: '#8a8279' }}>
            No funnel activity yet
          </Typography>
        )}
      </div>
    </div>
  );
}

export default memo(LeadDetailPanel);
