'use client';

import Typography from '@mui/material/Typography';

type Section = {
  title: string;
  icon: string;
  content?: string[];
  list?: [string, string][];
  subsections?: { subtitle: string; content?: string[]; list?: [string, string][]; footer?: string }[];
  footer?: string;
  callout?: { text: string; color: 'green' | 'amber' };
};

const sections: Section[] = [
  {
    title: 'Your Leads',
    icon: '01',
    content: [
      'When someone clicks one of your Google Ads and reaches out — whether they call your tracking number or fill out a form on your website — that counts as a lead. Each unique person is counted once, even if they call and submit a form.',
      'Your dashboard shows two numbers:',
    ],
    list: [
      ['Contacts', 'Everyone who reached out through your ads, including wrong numbers and spam.'],
      ['Quality Leads', 'Contacts minus any that were disqualified (see below).'],
    ],
    callout: { text: 'Your ads get credit for genuinely new business and reactivated cold leads — but not for returning customers or people who were already in your pipeline.', color: 'green' },
  },
  {
    title: 'Disqualified Leads',
    icon: '02',
    content: [
      'Not every contact is a real opportunity. When a lead is marked in your CRM as "spam," "not a lead," "wrong number," "out of area," or "wrong service," that lead is automatically removed from your quality lead count.',
      'This means your quality lead number is something you have direct control over — if a lead is legitimate, make sure it\'s not marked with one of those statuses. If it\'s junk, mark it and your numbers will adjust automatically.',
      'There is one exception: if a disqualified lead later gets booked for an inspection, receives an estimate, or has any real activity in your field management software, they\'re automatically rescued from the spam filter. Real business activity always wins.',
    ],
    callout: { text: 'Once disqualified, a lead stays excluded unless they show real activity in your CRM — like a booked inspection or sent estimate. That automatically overrides the disqualification.', color: 'amber' },
  },
  {
    title: 'Returning & Reactivated Leads',
    icon: '03',
    content: [
      'Sometimes someone who previously contacted your business clicks a Google Ad and reaches out again. Your dashboard handles these automatically:',
    ],
    list: [
      ['New lead', 'First time reaching out through your ads — counts as a new quality lead.'],
      ['Recent contact', 'Already in touch within the last 60 days — not counted as a new ad lead. They were already engaged.'],
      ['Reactivated lead', 'Contacted you 60+ days ago but never got treatment, then clicks an ad — this counts. Your ad brought back a cold lead.'],
      ['Returning customer', 'Previously had treatment done — not counted as a new ad lead. They\'re an existing customer.'],
    ],
  },
  {
    title: 'Inspections vs. Jobs',
    icon: '04',
    content: [
      'Your dashboard distinguishes between inspections (assessments, testing, evaluations) and treatment jobs (remediation, dry fog, removal). How we tell the difference depends on your software.',
    ],
    subsections: [
      {
        subtitle: 'HouseCall Pro',
        content: ['We look at the job description and amount to classify each record:'],
        list: [
          ['Inspection', 'Records mentioning assessments, testing, mold inspections, sampling, or evaluations. Also any job under $1,000 with pre-treatment testing or air quality tests.'],
          ['Treatment Job', 'Records mentioning remediation, dry fog, treatment, removal, abatement, or encapsulation. Jobs without those keywords at $1,000+ are treated as jobs.'],
        ],
        footer: 'If a record mentions both — like "air quality test + remediation" — it counts as treatment, since that\'s the primary service.',
      },
      {
        subtitle: 'Jobber',
        content: ['Jobber uses a "request" and "job" structure:'],
        list: [
          ['Inspection', 'Any Jobber request is treated as an inspection inquiry. When converted to a quote or job, we track that progression.'],
          ['Treatment Job', 'Jobber jobs and quotes above the minimum threshold are classified as treatment work.'],
        ],
      },
    ],
    footer: 'Sometimes a description is vague or missing. Small amounts (under $1,000) default to inspection, larger amounts default to treatment. If something looks wrong, let your account manager know.',
  },
  {
    title: 'Estimates & Revenue',
    icon: '05',
    content: ['Your dashboard tracks the full sales pipeline from estimate to close:'],
    list: [
      ['Estimate Sent', 'A treatment estimate (not an inspection fee) was sent to the customer.'],
      ['Estimate Approved', 'The customer approved the estimate (minimum $1,000 for treatment work).'],
      ['Revenue Closed', 'The approved estimate amount or completed job total, whichever is higher.'],
    ],
    footer: 'When you send multiple options (good/better/best), they\'re grouped as one. If any option is approved, it counts as approved.',
  },
  {
    title: 'Ad Performance',
    icon: '06',
    content: ['These metrics show how efficiently your ad spend converts into revenue:'],
    list: [
      ['Ad Spend', 'How much was spent on your Google Ads during the selected period.'],
      ['Cost Per Lead (CPL)', 'Ad spend divided by quality leads. Lower is better.'],
      ['ROAS (Return on Ad Spend)', 'Closed revenue divided by ad spend. A 5x ROAS means $5 earned for every $1 spent.'],
    ],
  },
  {
    title: 'Cohort Benchmarks',
    icon: '07',
    content: [
      'The four tiles labeled Contacts, Book Rate, Close Rate, and Full Funnel compare your performance to aspirational ranges we see across similar clients. These are different from the main conversion funnel above them, in two important ways:',
    ],
    list: [
      ['Fixed time window', 'The cohort tiles always use a 60-day window regardless of the date range selected on the main dashboard, because rates need enough data to be meaningful.'],
      ['Maturation delay', 'The rates exclude leads from the most recent 14–30 days so those leads have time to book, close, or be invoiced before being counted. See below.'],
    ],
    subsections: [
      {
        subtitle: 'Why a maturation delay',
        content: [
          'A lead that came in 3 days ago hasn\'t had time to book an inspection, let alone close an estimate. Including them in the rate would make the rate look worse than it is. To give an honest picture, we only count leads that have had enough time to progress through your funnel.',
          'Different metrics need different delays because sales cycles vary:',
        ],
        list: [
          ['Book Rate', '14-day delay. By day 14, about 93% of bookings that will happen have already happened.'],
          ['Close Rate', '30-day delay. Closes take longer — by day 30, about 74% of eventual closes are in.'],
          ['Full Funnel', '30-day delay, same as close rate.'],
        ],
        footer: 'Recent leads still show up everywhere else on the dashboard — in your lead table, in the main conversion funnel, in new-lead counts. They just don\'t feed into these four cohort rate tiles yet.',
      },
      {
        subtitle: 'What the benchmark ranges mean',
        content: ['Each tile shows your current rate against a target range:'],
        list: [
          ['Book Rate', '30% – 45% target. Share of quality leads that schedule an inspection.'],
          ['Close Rate', '25% – 35% target. Share of inspections that result in an approved estimate.'],
          ['Full Funnel', '5% – 10% target. Share of quality leads that become approved estimates.'],
        ],
        footer: 'These are aspirational targets based on client data. Landing inside the range is healthy performance. Above the range is top-tier.',
      },
    ],
    callout: { text: 'Your cohort tiles reflect mature data — what your real book rate, close rate, and funnel look like once recent leads have had time to progress. The main conversion funnel above shows activity in the exact date range you selected.', color: 'green' },
  },
  {
    title: 'Guarantee Progress',
    icon: '08',
    content: [
      'Your guarantee tracks total closed revenue against your program investment over the life of your engagement — not just a single month. The progress bar shows how close you are to hitting your guarantee target.',
    ],
  },
  {
    title: 'Monthly Projection',
    icon: '09',
    content: [
      'When you\'re partway through a month, the dashboard projects where your lead count will land by month\'s end. This blends two signals:',
    ],
    list: [
      ['Your current pace', 'How leads are trending day by day compared to past months at the same point.'],
      ['Your recent average', 'Your typical monthly volume over the last few months.'],
    ],
    footer: 'Early in the month, the projection leans on recent history. As the month progresses, your actual pace takes over.',
  },
  {
    title: 'Campaign Breakdown',
    icon: '10',
    content: [
      'If you\'re running multiple campaigns, toggle "By Campaign" on the trends chart to see how each campaign contributes. Click any campaign name to isolate it and see its trend in detail.',
    ],
  },
];

const calloutStyles = {
  green: { bg: '#e6f3ec', border: '#3b8a5a', color: '#2d6e46' },
  amber: { bg: '#fef9e6', border: '#c4a55a', color: '#92400e' },
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ebe7de' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#000' }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#E85D4D' }}>
              <span className="text-lg font-black text-white">B</span>
            </div>
            <div>
              <Typography className="text-lg font-extrabold text-white tracking-tight">How Your Dashboard Works</Typography>
              <Typography className="text-[10px]" style={{ color: '#8a8279' }}>Blueprint for Scale</Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-2xl px-4 pt-10 md:px-6">
        <div className="rounded-t-2xl px-8 py-6 md:px-10" style={{ backgroundColor: '#000' }}>
          <p className="text-[15px] font-semibold text-white leading-relaxed">
            Everything you need to know about your performance metrics.
          </p>
          <p className="text-[12px] mt-1 leading-relaxed" style={{ color: '#8a8279' }}>
            This guide explains how each number on your dashboard is calculated and what it means for your business.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 pb-10 md:px-6">
        <div className="rounded-b-2xl shadow-sm px-8 py-6 md:px-10" style={{ backgroundColor: '#F5F1E8' }}>

          <div className="flex flex-col gap-0">
            {sections.map((section, si) => (
              <div
                key={section.title}
                id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                className="py-6 scroll-mt-20"
                style={si > 0 ? { borderTop: '1px solid #ddd8cb' } : undefined}
              >
                {/* Section header with number */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#E85D4D' }}>
                    {section.icon}
                  </div>
                  <h2 className="text-[14px] font-bold uppercase tracking-wide" style={{ color: '#000' }}>{section.title}</h2>
                </div>

                {section.content?.map((p, i) => (
                  <p key={i} className="text-[13px] leading-[1.8] mb-2.5 ml-10" style={{ color: '#5a554d' }}>{p}</p>
                ))}

                {section.list && (
                  <div className="flex flex-col gap-3 mb-3 mt-3 ml-10">
                    {section.list.map(([term, desc]) => (
                      <div key={term} className="flex gap-3 text-[13px] leading-[1.7]">
                        <span className="shrink-0 mt-[7px] h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#E85D4D' }} />
                        <span style={{ color: '#5a554d' }}><span className="font-semibold" style={{ color: '#000' }}>{term}</span> — {desc}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.callout && (
                  <div className="ml-10 mt-4 rounded-lg px-4 py-3" style={{
                    backgroundColor: calloutStyles[section.callout.color].bg,
                    borderLeft: `3px solid ${calloutStyles[section.callout.color].border}`,
                  }}>
                    <p className="text-[12px] leading-[1.7] font-medium" style={{ color: calloutStyles[section.callout.color].color }}>
                      {section.callout.text}
                    </p>
                  </div>
                )}

                {section.subsections?.map((sub) => (
                  <div key={sub.subtitle} className="mb-3 mt-3 ml-10 rounded-lg px-5 py-4" style={{ backgroundColor: '#ebe7de' }}>
                    <h3 className="text-[12px] font-bold uppercase tracking-wide mb-2" style={{ color: '#000' }}>{sub.subtitle}</h3>
                    {sub.content?.map((p, i) => (
                      <p key={i} className="text-[13px] leading-[1.7] mb-2" style={{ color: '#5a554d' }}>{p}</p>
                    ))}
                    {sub.list && (
                      <div className="flex flex-col gap-2 mb-2">
                        {sub.list.map(([term, desc]) => (
                          <div key={term} className="flex gap-3 text-[13px] leading-[1.7]">
                            <span className="shrink-0 mt-[7px] h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#E85D4D' }} />
                            <span style={{ color: '#5a554d' }}><span className="font-semibold" style={{ color: '#000' }}>{term}</span> — {desc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {sub.footer && (
                      <p className="text-[12px] leading-[1.7] mt-2" style={{ color: '#8a8279' }}>{sub.footer}</p>
                    )}
                  </div>
                ))}

                {section.footer && (
                  <p className="text-[12px] leading-[1.7] mt-2 ml-10" style={{ color: '#8a8279' }}>{section.footer}</p>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-5" style={{ borderTop: '1px solid #ddd8cb' }}>
            <p className="text-[12px] leading-relaxed" style={{ color: '#8a8279' }}>
              Questions about your numbers? Reach out to your Blueprint for Scale account manager — we're happy to walk through anything on a call.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center pb-6">
          <Typography className="text-[10px]" style={{ color: '#c5bfb6' }}>
            Powered by Blueprint for Scale
          </Typography>
        </div>
      </div>
    </div>
  );
}
