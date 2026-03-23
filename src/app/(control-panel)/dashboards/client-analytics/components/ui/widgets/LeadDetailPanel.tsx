'use client';

import { memo } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  sent: 'bg-blue-100 text-blue-700',
  declined: 'bg-red-100 text-red-700',
  scheduled: 'bg-purple-100 text-purple-700',
  'complete rated': 'bg-green-100 text-green-700',
  'complete unrated': 'bg-green-100 text-green-700',
  'in progress': 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  unpaid: 'bg-red-100 text-red-700',
};

function LeadDetailPanel({ customerId, hcpCustomerId, fieldMgmt }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['leadDetail', customerId, hcpCustomerId],
    queryFn: () => fetch(`/api/blueprint/clients/${customerId}/lead-detail/${hcpCustomerId}`).then(r => r.json()),
    enabled: !!hcpCustomerId,
  });

  if (isLoading) {
    return <div className="px-6 py-4 text-sm text-gray-400">Loading details...</div>;
  }

  if (!data || data.error) {
    return <div className="px-6 py-4 text-sm text-gray-400">No details available</div>;
  }

  const inspections = data.inspections || [];
  const estimates = data.estimates || [];
  const jobs = data.jobs || [];
  const invoices = data.invoices || [];

  // HCP deep link
  const hcpUrl = `https://pro.housecallpro.com/pro/customers/${hcpCustomerId.replace('cus_', '')}`;

  return (
    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
      <div className="flex flex-col gap-4">

        {/* Header with CRM link */}
        <div className="flex items-center justify-between">
          <Typography className="text-sm font-semibold text-gray-700">
            {data.first_name} {data.last_name}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            href={hcpUrl}
            target="_blank"
            sx={{ fontSize: '0.7rem', textTransform: 'none', borderRadius: 2 }}
          >
            Open in HouseCall Pro &rarr;
          </Button>
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          {data.phone && <span>Phone: {data.phone}</span>}
          {data.email && <span>Email: {data.email}</span>}
          {data.contact_date && <span>Created: {formatDate(data.contact_date)}</span>}
        </div>

        {/* Inspections */}
        {inspections.length > 0 && (
          <div>
            <Typography className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Inspections ({inspections.length})
            </Typography>
            <div className="space-y-1.5">
              {inspections.map((insp: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded bg-white px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Chip label={insp.status} size="small"
                      className={statusColors[insp.status] || 'bg-gray-100'}
                      sx={{ height: 20, fontSize: '0.65rem' }} />
                    <span className="text-gray-500">
                      {insp.scheduled_at ? `Scheduled ${formatDate(insp.scheduled_at)}` : ''}
                      {insp.completed_at ? ` · Completed ${formatDate(insp.completed_at)}` : ''}
                    </span>
                  </div>
                  <span className="font-medium">{formatDollars(insp.total_cents)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estimates */}
        {estimates.length > 0 && (
          <div>
            <Typography className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Estimates ({estimates.length})
            </Typography>
            <div className="space-y-2">
              {estimates.map((est: any, i: number) => (
                <div key={i} className="rounded bg-white px-3 py-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Chip label={est.status} size="small"
                        className={statusColors[est.status] || 'bg-gray-100'}
                        sx={{ height: 20, fontSize: '0.65rem' }} />
                      <span className="text-gray-400">{est.estimate_type}</span>
                      {est.sent_at && <span className="text-gray-500">Sent {formatDate(est.sent_at)}</span>}
                    </div>
                    <span className="font-medium">
                      {est.status === 'approved' ? formatDollars(est.approved_total_cents) : formatDollars(est.highest_option_cents)}
                    </span>
                  </div>
                  {/* Options */}
                  {est.options && est.options.length > 0 && (
                    <div className="mt-1.5 ml-3 space-y-1 border-l-2 border-gray-200 pl-3">
                      {est.options.map((opt: any, j: number) => (
                        <div key={j} className="flex items-center justify-between text-gray-500">
                          <span>{opt.name || `Option ${j + 1}`}</span>
                          <div className="flex items-center gap-2">
                            <span>{formatDollars(opt.total_cents)}</span>
                            {opt.approval_status && (
                              <Chip label={opt.approval_status} size="small"
                                className={statusColors[opt.approval_status] || 'bg-gray-100'}
                                sx={{ height: 18, fontSize: '0.6rem' }} />
                            )}
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
            <Typography className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Jobs ({jobs.length})
            </Typography>
            <div className="space-y-1.5">
              {jobs.map((job: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded bg-white px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Chip label={job.status} size="small"
                      className={statusColors[job.status] || 'bg-gray-100'}
                      sx={{ height: 20, fontSize: '0.65rem' }} />
                    <span className="text-gray-500">
                      {job.description || ''}
                      {job.scheduled_at ? ` · ${formatDate(job.scheduled_at)}` : ''}
                    </span>
                  </div>
                  <span className="font-medium">{formatDollars(job.total_cents)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices */}
        {invoices.length > 0 && (
          <div>
            <Typography className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Invoices ({invoices.length})
            </Typography>
            <div className="space-y-1.5">
              {invoices.map((inv: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded bg-white px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Chip label={`${inv.invoice_type} · ${inv.status}`} size="small"
                      className={statusColors[inv.status] || 'bg-gray-100'}
                      sx={{ height: 20, fontSize: '0.65rem' }} />
                    <span className="text-gray-500">{formatDate(inv.invoice_date)}</span>
                    {inv.paid_at && <span className="text-green-600">Paid {formatDate(inv.paid_at)}</span>}
                  </div>
                  <span className="font-medium">{formatDollars(inv.amount_cents)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for unmatched leads */}
        {inspections.length === 0 && estimates.length === 0 && jobs.length === 0 && invoices.length === 0 && (
          <Typography className="text-xs text-gray-400">
            No funnel activity yet — this lead hasn't been booked in {fieldMgmt === 'jobber' ? 'Jobber' : 'HouseCall Pro'}
          </Typography>
        )}
      </div>
    </div>
  );
}

export default memo(LeadDetailPanel);
