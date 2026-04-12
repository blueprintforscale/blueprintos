import type {
  Client,
  Group,
  AdPerformance,
  FunnelData,
  LeadContact,
  MonthlyTrend,
  RecentActivity,
  SourceTab,
  RiskData,
  CallAnalyticsData,
  CampaignBreakdown,
  SearchTermData,
  DailySpend,
} from '../types';

const BASE = '/api/blueprint';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const clientAnalyticsService = {
  getClients: () => fetchJson<Client[]>('clients'),

  getGroups: () => fetchJson<Group[]>('groups'),

  getClient: (customerId: number) => fetchJson<Client>(`clients/${customerId}`),

  getAdPerformance: (customerId: number, days = 30) =>
    fetchJson<AdPerformance>(`clients/${customerId}/ad-performance?days=${days}`),

  getFunnel: (customerId: number, source = 'all', dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams({ source });
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    return fetchJson<FunnelData>(`clients/${customerId}/funnel?${params}`);
  },

  // Multi-client rollup via client_groups (HCP only)
  getGroupFunnel: (slug: string, source = 'all', dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams({ source });
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    return fetchJson<FunnelData>(`groups/${slug}/funnel?${params}`);
  },

  getLeads: (customerId: number, source = 'google_ads', dateFrom?: string, dateTo?: string, limit = 50) => {
    const params = new URLSearchParams({ source, limit: String(limit) });
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    return fetchJson<LeadContact[]>(`clients/${customerId}/leads?${params}`);
  },

  getMonthlyTrend: (customerId: number, months = 6) =>
    fetchJson<MonthlyTrend[]>(`clients/${customerId}/monthly-trend?months=${months}`),

  getCampaignTrend: (customerId: number, months = 12) =>
    fetchJson<{ name: string; data: { month_start: string; short_label: string; leads: number }[] }[]>(
      `clients/${customerId}/campaign-trend?months=${months}`
    ),

  getRecentActivity: (customerId: number, limit = 10) =>
    fetchJson<RecentActivity[]>(`clients/${customerId}/recent-activity?limit=${limit}`),

  getSourceTabs: (customerId: number) =>
    fetchJson<SourceTab[]>(`clients/${customerId}/source-tabs`),

  getGroupSourceTabs: (slug: string) =>
    fetchJson<SourceTab[]>(`groups/${slug}/source-tabs`),

  getCallAnalytics: (customerId: number, dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    return fetchJson<CallAnalyticsData>(`clients/${customerId}/call-analytics?${params}`);
  },

  getCampaignBreakdown: (customerId: number, dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    return fetchJson<CampaignBreakdown[]>(`clients/${customerId}/campaign-breakdown?${params}`);
  },

  getSearchTerms: (customerId: number, dateFrom?: string, dateTo?: string, limit = 10) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    return fetchJson<SearchTermData[]>(`clients/${customerId}/search-terms?${params}`);
  },

  getDailySpend: (customerId: number, dateFrom?: string, dateTo?: string) => {
    const days = dateFrom && dateTo
      ? Math.ceil((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000)
      : 90;
    return fetchJson<DailySpend[]>(`clients/${customerId}/ad-spend-daily?days=${days}`);
  },

  getRisk: (customerId: number, days = 30) =>
    fetchJson<RiskData>(`clients/${customerId}/risk?days=${days}`),

  getAllRisk: (days = 30) =>
    fetchJson<RiskData[]>(`dashboard/risk?days=${days}`),
};
