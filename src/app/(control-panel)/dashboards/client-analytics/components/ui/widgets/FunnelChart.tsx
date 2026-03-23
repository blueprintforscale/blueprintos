'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { FunnelData } from '../../../api/types';
import type { FunnelStage } from './FunnelDrawer';

function formatDollars(n: number) {
  if (!n) return '';
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

type Props = {
  data: FunnelData | undefined;
  onStageClick?: (stage: FunnelStage) => void;
};

function FunnelChart({ data, onStageClick }: Props) {
  if (!data) return null;

  const stages: { label: string; key: FunnelStage; count: number; value: number | null }[] = [
    { label: 'Leads', key: 'leads', count: data.leads, value: null },
    { label: 'Inspection Scheduled', key: 'inspection_scheduled', count: data.inspection_scheduled, value: null },
    { label: 'Inspection Completed', key: 'inspection_completed', count: data.inspection_completed, value: null },
    { label: 'Estimate Sent', key: 'estimate_sent', count: data.estimate_sent, value: data.estimate_sent_value },
    { label: 'Estimate Approved', key: 'estimate_approved', count: data.estimate_approved, value: data.estimate_approved_value },
    { label: 'Job Scheduled', key: 'job_scheduled', count: data.job_scheduled, value: data.job_value },
    { label: 'Job Completed', key: 'job_completed', count: data.job_completed, value: null },
  ];

  const maxCount = Math.max(data.leads, 1);

  return (
    <Paper
      className="flex flex-col overflow-hidden rounded-xl border-0 shadow-none"
      style={{ backgroundColor: '#000' }}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-3">
        <Typography className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#8a8279' }}>
          Conversion Funnel
        </Typography>
      </div>

      {/* Funnel bars */}
      <div className="flex flex-col gap-1.5 px-5 pb-5">
        {stages.map((stage, i) => {
          const widthPct = Math.max((stage.count / maxCount) * 100, 12);
          const convRate = i > 0 && stages[i - 1].count > 0
            ? ((stage.count / stages[i - 1].count) * 100).toFixed(1)
            : null;

          // Tapered funnel: each bar gets progressively more rounded and slightly indented
          const indent = i * 2;

          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3, ease: 'easeOut' }}
              className={`flex items-center gap-3 ${onStageClick ? 'cursor-pointer' : ''}`}
              onClick={() => onStageClick?.(stage.key)}
              style={{ paddingLeft: indent }}
            >
              {/* Bar */}
              <div className="relative flex-1">
                <div
                  className={`flex items-center rounded-md px-4 py-2.5 transition-all duration-200 ${onStageClick ? 'hover:brightness-110' : ''}`}
                  style={{
                    width: `${widthPct}%`,
                    minWidth: '100px',
                    backgroundColor: i === 0 ? '#E85D4D' : `rgba(232, 93, 77, ${1 - i * 0.12})`,
                  }}
                >
                  <span className="text-xs font-semibold text-white">{stage.label}</span>
                </div>
                {/* Conversion rate badge */}
                {convRate && (
                  <span
                    className="absolute top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      left: `calc(${widthPct}% + 8px)`,
                      color: '#8a8279',
                    }}
                  >
                    {convRate}%
                  </span>
                )}
              </div>

              {/* Count + value */}
              <div className="flex w-20 flex-col items-end">
                <span className="text-xl font-bold text-white">{stage.count}</span>
                {stage.value ? (
                  <span className="text-[10px]" style={{ color: '#8a8279' }}>{formatDollars(stage.value)}</span>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Overall conversion */}
      {data.leads > 0 && (
        <div className="border-t px-6 py-3" style={{ borderColor: '#222' }}>
          <Typography className="text-center text-[11px]" style={{ color: '#5a554d' }}>
            Overall conversion rate: {((data.job_completed / data.leads) * 100).toFixed(1)}%
          </Typography>
        </div>
      )}
    </Paper>
  );
}

export default memo(FunnelChart);
