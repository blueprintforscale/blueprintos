'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { CallAnalyticsData } from '../../../api/types';

type Props = { data: CallAnalyticsData | undefined };

function MissedByAttemptChart({ data }: Props) {
  if (!data?.missed_by_attempt) return null;

  const { first, second, third } = data.missed_by_attempt;
  if (first === 0) return null;

  const max = first;
  const steps = [
    { label: '1st Call', count: first, pct: 100 },
    { label: '2nd Call', count: second, pct: max > 0 ? Math.round((second / max) * 100) : 0 },
    { label: '3rd Call', count: third, pct: max > 0 ? Math.round((third / max) * 100) : 0 },
  ];

  return (
    <Paper className="rounded-xl p-6 shadow-sm">
      <Typography className="mb-1 text-sm font-extrabold uppercase tracking-wider" style={{ color: '#000' }}>
        Repeat Missed Callers
      </Typography>
      <Typography className="mb-4 text-[11px] font-medium" style={{ color: '#8a8279' }}>
        Of callers missed on their 1st attempt, how many were missed again?
      </Typography>

      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-3">
            <span className="w-16 text-right text-[11px] font-bold" style={{ color: '#5a554d' }}>
              {step.label}
            </span>
            <div className="relative flex-1 h-8 rounded" style={{ backgroundColor: '#EEEAD9' }}>
              <div
                className="absolute inset-y-0 left-0 flex items-center rounded px-3"
                style={{
                  width: `${Math.max(step.pct, 8)}%`,
                  backgroundColor: i === 0 ? '#E85D4D' : i === 1 ? '#c44a3c' : '#8b2e24',
                  transition: 'width 0.6s ease',
                }}
              >
                <span className="text-xs font-bold text-white">{step.count}</span>
              </div>
            </div>
            {i > 0 && step.count > 0 && (
              <span className="text-[10px] font-semibold" style={{ color: '#c44a3c' }}>
                {step.pct}%
              </span>
            )}
          </div>
        ))}
      </div>
    </Paper>
  );
}

export default memo(MissedByAttemptChart);
