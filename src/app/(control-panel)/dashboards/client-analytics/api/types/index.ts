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
  guarantee: number;
  lsa_spend: number;
  lsa_leads: number;
};

export type FunnelData = {
  leads: number;
  inspection_scheduled: number;
  inspection_completed: number;
  estimate_sent: number;
  estimate_approved: number;
  job_scheduled: number;
  job_completed: number;
  estimate_sent_value: number;
  estimate_approved_value: number;
  job_value: number;
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
  leads: string;
  spend: string;
  cpl: string;
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
