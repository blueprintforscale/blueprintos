'use client';

import Typography from '@mui/material/Typography';

const sections = [
  {
    title: 'Your Leads',
    content: [
      'When someone clicks one of your Google Ads and reaches out — whether they call your tracking number or fill out a form on your website — that counts as a lead. Each unique person is counted once, even if they call and submit a form.',
      'Your dashboard shows two numbers:',
    ],
    list: [
      ['Contacts', 'Everyone who reached out through your ads, including wrong numbers and spam.'],
      ['Quality Leads', 'Contacts minus any that were marked as disqualified (see below).'],
    ],
  },
  {
    title: 'Disqualified Leads',
    content: [
      'Not every contact is a real opportunity. When a lead is marked in your CRM as "spam," "not a lead," "wrong number," "out of area," or "wrong service," that lead is automatically removed from your quality lead count.',
      'This means your quality lead number is something you have direct control over — if a lead is legitimate, make sure it\'s not marked with one of those statuses. If it\'s junk, mark it and your numbers will adjust automatically.',
      'Once a contact is disqualified, it stays disqualified permanently — even if they call again months later.',
    ],
  },
  {
    title: 'Inspections vs. Jobs',
    content: [
      'Your dashboard distinguishes between inspections (assessments, testing, evaluations) and treatment jobs (remediation, dry fog, removal). How we tell the difference depends on your field management software.',
    ],
    subsections: [
      {
        subtitle: 'HouseCall Pro',
        content: ['We look at the job description and amount to classify each record:'],
        list: [
          ['Inspection', 'Records that mention assessments, testing, mold inspections, sampling, consultations, or evaluations. Also includes any job under $1,000 that mentions pre-treatment testing or air quality tests.'],
          ['Treatment Job', 'Records that mention remediation, dry fog, treatment, removal, abatement, or encapsulation. For jobs without those keywords, anything $1,000 or above is treated as a job rather than an inspection.'],
        ],
        footer: 'If a record mentions both inspection and treatment terms — like "air quality test + remediation" — it counts as a treatment job, since the treatment is the primary service.',
      },
      {
        subtitle: 'Jobber',
        content: ['Jobber uses a "request" and "job" structure:'],
        list: [
          ['Inspection', 'Any Jobber request is treated as an inspection inquiry. When a request is converted to a quote or job, we track that progression.'],
          ['Treatment Job', 'Jobber jobs and quotes above the minimum threshold are classified as treatment work.'],
        ],
      },
    ],
    footer: 'Sometimes a job description is vague or missing. Small amounts (under $1,000) default to inspection, larger amounts default to treatment job. If you notice something classified incorrectly, let your account manager know.',
  },
  {
    title: 'Estimates & Revenue',
    content: ['Your dashboard tracks the full sales pipeline from estimate to close:'],
    list: [
      ['Estimate Sent', 'A treatment estimate (not an inspection fee) was sent to the customer.'],
      ['Estimate Approved', 'The customer approved the estimate (minimum $1,000 for treatment work).'],
      ['Revenue Closed', 'The approved estimate amount or completed job total, whichever is higher.'],
    ],
    footer: 'When you send multiple estimate options (good/better/best), they\'re grouped together and counted as one. If any option is approved, it counts as approved.',
  },
  {
    title: 'Returning & Reactivated Leads',
    content: [
      'Sometimes someone who previously contacted your business clicks a Google Ad and reaches out again. Your dashboard handles these situations automatically:',
    ],
    list: [
      ['New lead', 'If someone reaches out for the first time through your ads, they count as a new quality lead.'],
      ['Recent contact', 'If someone was already in touch within the last 60 days and then clicks an ad, they\'re not counted as a new Google Ads lead. They were already engaged.'],
      ['Reactivated lead', 'If someone contacted you more than 60 days ago but never moved forward with treatment, and then clicks an ad, they do count. Your ad brought back a lead that had gone cold.'],
      ['Returning customer', 'If someone previously had treatment done and clicks an ad later, they\'re not counted as a new Google Ads lead. They\'re an existing customer.'],
    ],
    footer: 'The key idea: your ads get credit for genuinely bringing in new business or reviving cold leads, but not for customers who were already active or had already been treated.',
  },
  {
    title: 'Ad Performance',
    content: ['These metrics help you understand how efficiently your ad spend converts into revenue:'],
    list: [
      ['Ad Spend', 'How much was spent on your Google Ads during the selected period.'],
      ['Cost Per Lead (CPL)', 'Your ad spend divided by your quality leads. Lower is better.'],
      ['ROAS (Return on Ad Spend)', 'Your closed revenue divided by your ad spend. A 5x ROAS means you earned $5 for every $1 spent on ads.'],
    ],
  },
  {
    title: 'Guarantee Progress',
    content: [
      'Your guarantee tracks total closed revenue against your program investment over the life of your engagement — not just a single month. The progress bar shows how close you are to hitting your guarantee target.',
    ],
  },
  {
    title: 'Monthly Projection',
    content: [
      'When you\'re partway through a month, the dashboard projects where your lead count will land by month\'s end. This projection blends two signals:',
    ],
    list: [
      ['Your current pace', 'How your leads are trending day by day compared to how past months played out at the same point.'],
      ['Your recent average', 'Your typical monthly lead volume over the last few months.'],
    ],
    footer: 'Early in the month, the projection leans more on your recent history. As the month progresses, your actual pace takes over. The projection appears after you have at least 4 months of data.',
  },
  {
    title: 'Campaign Breakdown',
    content: [
      'If you\'re running multiple Google Ads campaigns, you can toggle "By Campaign" on the trends chart to see how each campaign contributes to your lead volume. Click any campaign name to isolate it and see its trend in detail.',
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ebe7de' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#000' }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: '#E85D4D' }}>
              <span className="text-base font-black text-white">B</span>
            </div>
            <div>
              <Typography className="text-lg font-extrabold text-white tracking-tight">How Your Dashboard Works</Typography>
              <Typography className="text-[10px]" style={{ color: '#5a554d' }}>Blueprint for Scale</Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <div className="rounded-2xl shadow-sm px-8 py-10 md:px-12" style={{ backgroundColor: '#F5F1E8' }}>
          <p className="text-sm leading-relaxed mb-10" style={{ color: '#5a554d' }}>
            A quick guide to understanding the metrics on your performance dashboard.
          </p>

          <div className="flex flex-col gap-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-bold mb-3" style={{ color: '#000' }}>{section.title}</h2>

                {section.content?.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed mb-3" style={{ color: '#5a554d' }}>{p}</p>
                ))}

                {section.list && (
                  <ul className="flex flex-col gap-2 mb-3 ml-1">
                    {section.list.map(([term, desc]) => (
                      <li key={term} className="text-sm leading-relaxed" style={{ color: '#5a554d' }}>
                        <span className="font-semibold" style={{ color: '#000' }}>{term}</span> — {desc}
                      </li>
                    ))}
                  </ul>
                )}

                {section.subsections?.map((sub) => (
                  <div key={sub.subtitle} className="ml-1 mb-4">
                    <h3 className="text-sm font-semibold mb-2" style={{ color: '#000' }}>{sub.subtitle}</h3>
                    {sub.content?.map((p, i) => (
                      <p key={i} className="text-sm leading-relaxed mb-2" style={{ color: '#5a554d' }}>{p}</p>
                    ))}
                    {sub.list && (
                      <ul className="flex flex-col gap-2 mb-2 ml-1">
                        {sub.list.map(([term, desc]) => (
                          <li key={term} className="text-sm leading-relaxed" style={{ color: '#5a554d' }}>
                            <span className="font-semibold" style={{ color: '#000' }}>{term}</span> — {desc}
                          </li>
                        ))}
                      </ul>
                    )}
                    {sub.footer && (
                      <p className="text-sm leading-relaxed" style={{ color: '#8a8279' }}>{sub.footer}</p>
                    )}
                  </div>
                ))}

                {section.footer && (
                  <p className="text-sm leading-relaxed" style={{ color: '#8a8279' }}>{section.footer}</p>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6" style={{ borderTop: '1px solid #ddd8cb' }}>
            <p className="text-xs" style={{ color: '#c5bfb6' }}>
              Questions about your numbers? Reach out to your Blueprint for Scale account manager.
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
