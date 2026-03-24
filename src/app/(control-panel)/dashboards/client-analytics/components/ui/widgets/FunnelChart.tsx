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
    { label: 'Revenue Closed', key: 'revenue_closed', count: data.revenue_closed ?? 0 },
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

      <div className="flex flex-col px-5 pb-4">
        {stages.map((stage, i) => {
          const barPct = Math.max((stage.count / maxCount) * 100, 3);
          const convRate = i > 0 && stages[i - 1].count > 0
            ? ((stage.count / stages[i - 1].count) * 100).toFixed(1)
            : null;

          return (
            <div key={stage.key}>
              {/* Connector with percentage pill */}
              {i > 0 && (
                <div className="flex items-center py-1" style={{ marginLeft: 0 }}>
                  {/* Left: thin vertical line from label area */}
                  <div className="w-36 shrink-0 flex justify-center">
                    <div className="h-5 w-px" style={{ backgroundColor: '#333' }} />
                  </div>
                  {/* Center: pill */}
                  <div className="flex-1 flex items-center">
                    <div className="flex-1 h-px" style={{ backgroundColor: '#333' }} />
                    {convRate && (
                      <span
                        className="shrink-0 rounded-full px-3 py-0.5 text-[11px] font-semibold mx-2"
                        style={{ backgroundColor: '#2a2a2a', color: '#c5bfb6', border: '1px solid #3a3a3a' }}
                      >
                        {convRate}%
                      </span>
                    )}
                    <div className="flex-1 h-px" style={{ backgroundColor: '#333' }} />
                  </div>
                  {/* Right: line to count area */}
                  <div className="w-20 shrink-0 flex justify-center">
                    <div className="h-5 w-px" style={{ backgroundColor: '#333' }} />
                  </div>
                </div>
              )}

              {/* Stage row */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className={`flex items-center gap-3 ${onStageClick ? 'cursor-pointer group' : ''}`}
                onClick={() => onStageClick?.(stage.key)}
              >
                {/* Label */}
                <span className="text-sm font-semibold text-white whitespace-nowrap w-36 shrink-0">
                  {stage.label}
                </span>

                {/* Bar */}
                <div className="flex-1 flex items-center">
                  <div
                    className={`h-11 rounded-md transition-all duration-300 ${onStageClick ? 'group-hover:brightness-125' : ''}`}
                    style={{
                      width: `${barPct}%`,
                      minWidth: '4px',
                      backgroundColor: `rgba(232, 93, 77, ${1 - i * 0.1})`,
                    }}
                  />
                  {/* Connecting line from bar end to count */}
                  <div className="flex-1 h-px" style={{ backgroundColor: '#333' }} />
                </div>

                {/* Count */}
                <span className="text-3xl font-extrabold text-white w-20 text-right shrink-0">
                  {stage.count}
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Overall */}
      {data.leads > 0 && (
        <div className="border-t px-6 py-3" style={{ borderColor: '#2a2a2a' }}>
          <Typography className="text-center text-xs" style={{ color: '#5a554d' }}>
            Overall: <strong style={{ color: '#c5bfb6' }}>{data.leads}</strong> leads → <strong style={{ color: '#c5bfb6' }}>{data.job_completed}</strong> jobs = <strong style={{ color: '#E85D4D' }}>{((data.job_completed / data.leads) * 100).toFixed(1)}%</strong>
          </Typography>
        </div>
      )}
    </Paper>
  );
}

export default memo(FunnelChart);
