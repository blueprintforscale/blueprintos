'use client';

import { useQuery } from '@tanstack/react-query';
import { clientAnalyticsService } from '../services/clientAnalyticsService';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: clientAnalyticsService.getClients,
  });
}

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: clientAnalyticsService.getGroups,
  });
}

export function useClient(customerId: number) {
  return useQuery({
    queryKey: ['client', customerId],
    queryFn: () => clientAnalyticsService.getClient(customerId),
    enabled: !!customerId,
  });
}

export function useAdPerformance(customerId: number, days = 30) {
  return useQuery({
    queryKey: ['adPerformance', customerId, days],
    queryFn: () => clientAnalyticsService.getAdPerformance(customerId, days),
    enabled: !!customerId,
  });
}

export function useFunnel(customerId: number, source = 'all', dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['funnel', customerId, source, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getFunnel(customerId, source, dateFrom, dateTo),
    enabled: !!customerId,
  });
}

export function useGroupFunnel(slug: string, source = 'all', dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['groupFunnel', slug, source, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getGroupFunnel(slug, source, dateFrom, dateTo),
    enabled: !!slug,
  });
}

export function useLeads(customerId: number, source = 'google_ads', dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['leads', customerId, source, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getLeads(customerId, source, dateFrom, dateTo),
    enabled: !!customerId,
  });
}

export function useMonthlyTrend(customerId: number, months = 6) {
  return useQuery({
    queryKey: ['monthlyTrend', customerId, months],
    queryFn: () => clientAnalyticsService.getMonthlyTrend(customerId, months),
    enabled: !!customerId,
  });
}

export function useRecentActivity(customerId: number) {
  return useQuery({
    queryKey: ['recentActivity', customerId],
    queryFn: () => clientAnalyticsService.getRecentActivity(customerId),
    enabled: !!customerId,
  });
}

export function useSourceTabs(customerId: number) {
  return useQuery({
    queryKey: ['sourceTabs', customerId],
    queryFn: () => clientAnalyticsService.getSourceTabs(customerId),
    enabled: !!customerId,
  });
}

export function useGroupSourceTabs(slug: string) {
  return useQuery({
    queryKey: ['groupSourceTabs', slug],
    queryFn: () => clientAnalyticsService.getGroupSourceTabs(slug),
    enabled: !!slug,
  });
}

export function useCallAnalytics(customerId: number, dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['callAnalytics', customerId, dateFrom, dateTo],
    queryFn: () => clientAnalyticsService.getCallAnalytics(customerId, dateFrom, dateTo),
    enabled: !!customerId,
  });
}

export function useRisk(customerId: number) {
  return useQuery({
    queryKey: ['risk', customerId],
    queryFn: () => clientAnalyticsService.getRisk(customerId),
    enabled: !!customerId,
  });
}
