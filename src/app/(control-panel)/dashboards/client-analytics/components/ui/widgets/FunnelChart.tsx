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
    { label: 'Inspection Scheduled', key: 'inspection_scheduled', count: data.inspection_scheduled },
    { label: 'Inspection Completed', key: 'inspection_completed', count: data.inspection_completed },
    { label: 'Estimate Sent', key: 'estimate_sent', count: data.estimate_sent },
    { label: 'Estimate Approved', key: 'estimate_approved', count: data.estimate_approved },
    { label: 'Job Scheduled', key: 'job_scheduled', count: data.job_scheduled },
    { label: 'Job Completed', key: 'job_completed', count: data.job_completed },
  ];

  const maxCount = Math.max(data.leads, 1);

  return (
    <Paper
      className="flex flex-col overflow-hidden rounded-xl border-0 shadow-none"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      <div className="px-6 pt-5 pb-2">
        <Typography className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#8a8279' }}>
          Conversion Funnel
        </Typography>
      </div>

      <div className="flex flex-col px-5 pb-4">
        {stages.map((stage, i) => {
          const barPct = Math.max((stage.count / maxCount) * 100, 8);
          const convRate = i > 0 && stages[i - 1].count > 0
            ? ((stage.count / stages[i - 1].count) * 100).toFixed(1)
            : null;

          return (
            <div key={stage.key}>
              {/* Stage row */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className={`flex items-center gap-4 py-1.5 ${onStageClick ? 'cursor-pointer group' : ''}`}
                onClick={() => onStageClick?.(stage.key)}
              >
                {/* Bar area */}
                <div className="relative flex-1">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center rounded-md px-4 py-3 transition-all duration-200 ${onStageClick ? 'group-hover:brightness-110' : ''}`}
                      style={{
                        width: `${barPct}%`,
                        minWidth: '100px',
                        backgroundColor: `rgba(232, 93, 77, ${1 - i * 0.1})`,
                      }}
                    >
                      <span className="text-sm font-bold text-white whitespace-nowrap">{stage.label}</span>
                    </div>
                    <div className="flex-1 border-b" style={{ borderColor: '#333' }} />
                  </div>
                </div>

                {/* Count only — no revenue */}
                <div className="flex items-baseline w-20 justify-end">
                  <span className="text-2xl font-extrabold text-white">{stage.count}</span>
                </div>
              </motion.div>

              {/* Conversion rate pill — bigger, more visible */}
              {convRate && (
                <div className="flex justify-center py-1">
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
