'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SharedDashboard, { type Resource } from './SharedDashboard';

const queryClient = new QueryClient({
  // 60s stale + refetchOnWindowFocus keeps share/embed pages in sync with data updates
  // without hammering the API. Clients returning to the tab see fresh numbers.
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: true } },
});

// Map URL ?tab= values to tab indices in SharedDashboard.
const TAB_MAP: Record<string, number> = {
  overview: 0,
  leads: 1,
  calls: 2,
  trends: 3,
};

// Whitelist of FunnelStage drawer values that can be opened via ?drawer=.
const DRAWER_STAGES = new Set([
  'leads',
  'inspection_scheduled',
  'inspection_completed',
  'estimate_sent',
  'estimate_approved',
  'job_scheduled',
  'job_completed',
  'revenue_closed',
  'open_estimates',
  'cpl_leads',
]);

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const embed = searchParams.get('embed') === 'true';
  const tabParam = (searchParams.get('tab') || '').toLowerCase();
  const drawerParam = (searchParams.get('drawer') || '').toLowerCase();
  const daysParam = parseInt(searchParams.get('days') || '', 10);
  const initialDays = (daysParam > 0 && daysParam <= 365) ? daysParam : null; // null = use 90-day default
  const initialTab = TAB_MAP[tabParam] ?? 0;
  const initialDrawerStage = (DRAWER_STAGES.has(drawerParam) ? drawerParam : null) as
    | 'leads' | 'inspection_scheduled' | 'inspection_completed' | 'estimate_sent'
    | 'estimate_approved' | 'job_scheduled' | 'job_completed' | 'revenue_closed'
    | 'open_estimates' | 'cpl_leads' | null;
  const [resource, setResource] = useState<Resource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blueprint/share/validate/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setResource(data as Resource);
        }
      })
      .catch(() => setError('Unable to load dashboard'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#F5F1E8' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200" style={{ borderTopColor: '#000' }} />
          <span className="text-sm" style={{ color: '#8a8279' }}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#F5F1E8' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#000' }}>Invalid Link</h1>
          <p className="mt-2 text-sm" style={{ color: '#8a8279' }}>{error || 'This dashboard link is no longer valid.'}</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SharedDashboard resource={resource} embed={embed} initialTab={initialTab} initialDrawerStage={initialDrawerStage} initialDays={initialDays} />
    </QueryClientProvider>
  );
}
