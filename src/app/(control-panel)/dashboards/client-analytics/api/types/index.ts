export type Client = {
  customer_id: number;
  name: string;
  status: string;
  ads_manager: string;
  budget: number;
  start_date: string;
  field_management_software: string;
  inspection_type: string;
  months_in_program: number;
  parent_customer_id: number | null;
  dashboard_token?: string;
};

export type AdPerformance = {
  ad_spend: number;
  quality_leads: number;
  actual_quality_leads: number;
  cpl: number;
  total_closed_rev: number;
  total_open_est_rev: number;
  roas: number;
  all_time_rev: number;
  all_time_spend: number;
  program_price?: number;
  projected_close_total?: number;
  months_in_program?: number;
  guarantee: number;
  lsa_spend: number;
  lsa_leads: number;
};

export type FunnelData = {
  leads: number;
  total_contacts?: number;
  quality_leads?: number;
  spam_count?: number;
  inspection_scheduled: number;
  inspection_completed: number;
  estimate_sent: number;
  estimate_approved: number;
  job_scheduled: number;
  job_completed: number;
  revenue_closed?: number;
  estimate_sent_value: number;
  estimate_approved_value: number;
  job_value: number;
  ad_spend?: number;
  closed_rev?: number;
  open_est_rev?: number;
};

export type LeadContact = {
  contact_date: string;
  name: string | null;
  phone: string;
  type: 'call' | 'form';
  duration: number | null;
  answer_status: string;
  source_name: string;
  callrail_id: string;
};

export type MonthlyTrend = {
  month_start: string;
  label: string;
  short_label?: string;
  year?: number;
  leads: string;
  spam?: string;
  spend: string;
  cpl: string;
  revenue?: string;
  roas?: string;
};

export type RecentActivity = {
  event_type: 'job_completed' | 'estimate_approved' | 'inspection';
  customer_name: string;
  event_date: string;
  amount: string;
  source: string;
};

export type SourceTab = {
  key: string;
  label: string;
  coming_soon?: boolean;
};

export type CallDonut = {
  answered: number;
  missed: number;
  abandoned: number;
  total: number;
  label: string;
};

export type MissedCallRow = {
  caller_phone: string;
  start_time: string;
  customer_name: string | null;
  source_name: string;
  classified_source: string;
  classified_period: string;
  first_call: boolean;
  duration: number;
  classified_status: string;
};

export type CallAnalyticsData = {
  summary: {
    total_calls: number;
    first_time_calls: number;
    missed_calls: number;
    missed_biz_hours: number;
    abandoned_calls: number;
    answered_calls: number;
    avg_duration: number;
    answer_rate: number;
  };
  trends: {
    total_calls_prev: number;
    first_time_calls_prev: number;
    missed_calls_prev: number;
    missed_biz_hours_prev: number;
    answered_calls_prev: number;
    answer_rate_prev: number;
  };
  donut_google_ads: CallDonut;
  donut_overall: CallDonut;
  hourly_missed: number[];
  biz_hours: { start: number; end: number };
  missed_by_attempt: { first: number; second: number; third: number };
  missed_calls_table: MissedCallRow[];
};

export type CampaignBreakdown = {
  campaign_name: string;
  campaign_type: string;
  impressions: number;
  clicks: number;
  cost: string;
  conversions: string;
  ctr: string;
};

export type SearchTermData = {
  search_term: string;
  impressions: number;
  clicks: number;
  cost: string;
  conversions: string;
};

export type DailySpend = {
  date: string;
  spend: string;
};

export type RiskData = {
  customer_id: number;
  client_name: string;
  status: string;
  risk_type: string;
  risk_triggers: string[];
  flag_triggers: string[];
  flag_count: number;
  sort_priority: number;
  quality_leads: number;
  actual_quality_leads: number;
  ad_spend: number;
  total_closed_rev: number;
  days_since_lead: number;
  months_in_program: number;
};
