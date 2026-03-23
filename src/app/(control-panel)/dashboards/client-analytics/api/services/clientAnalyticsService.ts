import type {
  Client,
  AdPerformance,
  FunnelData,
  LeadContact,
  MonthlyTrend,
  RecentActivity,
  SourceTab,
  RiskData,
} from '../types';

const BASE = '/api/blueprint';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const clientAnalyticsService = {
  getClients: () => fetchJson<Client[]>('clients'),

  getClient: (customerId: number) => fetchJson<Client>(`clients/${customerId}`),

  getAdPerformance: (customerId: number, days = 30) =>
    fetchJson<AdPerformance>(`clients/${customerId}/ad-performance?days=${days}`),

  getFunnel: (customerId: number, source = 'all', dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams({ source });
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    return fetchJson<FunnelData>(`clients/${customerId}/funnel?${params}`);
  },

  getLeads: (customerId: number, source = 'google_ads', dateFrom?: string, dateTo?: string, limit = 50) => {
    const params = new URLSearchParams({ source, limit: String(limit) });
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    return fetchJson<LeadContact[]>(`clients/${customerId}/leads?${params}`);
  },

  getMonthlyTrend: (customerId: number, months = 6) =>
    fetchJson<MonthlyTrend[]>(`clients/${customerId}/monthly-trend?months=${months}`),

  getRecentActivity: (customerId: number, limit = 10) =>
    fetchJson<RecentActivity[]>(`clients/${customerId}/recent-activity?limit=${limit}`),

  getSourceTabs: (customerId: number) =>
    fetchJson<SourceTab[]>(`clients/${customerId}/source-tabs`),

  getRisk: (customerId: number, days = 30) =>
    fetchJson<RiskData>(`clients/${customerId}/risk?days=${days}`),

  getAllRisk: (days = 30) =>
    fetchJson<RiskData[]>(`dashboard/risk?days=${days}`),
};
