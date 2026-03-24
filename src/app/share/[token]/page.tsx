'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SharedDashboard from './SharedDashboard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

type ClientInfo = {
  customer_id: number;
  name: string;
  field_management_software: string;
  start_date?: string;
};

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blueprint/share/validate/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setClient(data);
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

  if (error || !client) {
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
      <SharedDashboard client={client} />
    </QueryClientProvider>
  );
}
