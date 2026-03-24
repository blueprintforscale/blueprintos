'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { FunnelData } from '../../../api/types';
import type { FunnelStage } from './FunnelDrawer';

type Props = {
  data: FunnelData | undefined;
  onStageClick?: (stage: FunnelStage) => void;
};

function FunnelChart({ data, onStageClick }: Props) {
  if (!data) return null;

  const stages: { label: string; key: FunnelStage; count: number }[] = [
    { label: 'Leads', key: 'leads', count: data.leads },
    { label: 'Insp. Scheduled', key: 'inspection_scheduled', count: data.inspection_scheduled },
    { label: 'Insp. Completed', key: 'inspection_completed', count: data.inspection_completed },
    { label: 'Est. Sent', key: 'estimate_sent', count: data.estimate_sent },
    { label: 'Est. Approved', key: 'estimate_approved', count: data.estimate_approved },
    { label: 'Job Scheduled', key: 'job_scheduled', count: data.job_scheduled },
    { label: 'Job Completed', key: 'job_completed', count: data.job_completed },
  ];

  const maxCount = Math.max(data.leads, 1);

  return (
    <Paper
      className="flex flex-col overflow-hidden rounded-xl border-0 shadow-none"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      <div className="px-6 pt-5 pb-3">
        <Typography className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#8a8279' }}>
          Conversion Funnel
        </Typography>
      </div>

      <div className="flex flex-col gap-0.5 px-5 pb-4">
        {stages.map((stage, i) => {
          const barPct = Math.max((stage.count / maxCount) * 100, 3);
          const convRate = i > 0 && stages[i - 1].count > 0
            ? ((stage.count / stages[i - 1].count) * 100).toFixed(1)
            : null;

          return (
            <div key={stage.key}>
              {/* Stage row: label on left, bar in middle, count on right */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className={`flex items-center gap-3 py-1 ${onStageClick ? 'cursor-pointer group' : ''}`}
                onClick={() => onStageClick?.(stage.key)}
              >
                {/* Label — fixed width */}
                <span className="text-xs font-semibold text-white whitespace-nowrap w-28 shrink-0">
                  {stage.label}
                </span>

                {/* Bar — proportional width */}
                <div className="flex-1 flex items-center">
                  <div
                    className={`h-8 rounded-md transition-all duration-300 ${onStageClick ? 'group-hover:brightness-125' : ''}`}
                    style={{
                      width: `${barPct}%`,
                      minWidth: '4px',
                      backgroundColor: `rgba(232, 93, 77, ${1 - i * 0.1})`,
                    }}
                  />
                </div>

                {/* Count */}
                <span className="text-2xl font-extrabold text-white w-16 text-right shrink-0">
                  {stage.count}
                </span>
              </motion.div>

              {/* Conversion rate pill */}
              {convRate && (
                <div className="flex justify-center py-0.5">
                  <span
                    className="rounded-full px-4 py-1 text-xs font-semibold"
                    style={{ backgroundColor: '#2a2a2a', color: '#c5bfb6', border: '1px solid #3a3a3a' }}
                  >
                    {convRate}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall */}
      {data.leads > 0 && (
        <div className="border-t px-6 py-3" style={{ borderColor: '#2a2a2a' }}>
          <Typography className="text-center text-xs" style={{ color: '#5a554d' }}>
            Overall conversion: <strong style={{ color: '#c5bfb6' }}>{((data.job_completed / data.leads) * 100).toFixed(1)}%</strong>
          </Typography>
        </div>
      )}
    </Paper>
  );
}

export default memo(FunnelChart);
