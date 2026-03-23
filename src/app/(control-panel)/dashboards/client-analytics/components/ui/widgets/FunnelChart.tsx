'use client';

import { memo } from 'react';
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

  const stages: { label: string; key: FunnelStage; count: number; value: number | null; color: string }[] = [
    { label: 'Leads', key: 'leads', count: data.leads, value: null, color: '#000000' },
    { label: 'Inspection Scheduled', key: 'inspection_scheduled', count: data.inspection_scheduled, value: null, color: '#E85D4D' },
    { label: 'Inspection Completed', key: 'inspection_completed', count: data.inspection_completed, value: null, color: '#c44a3c' },
    { label: 'Estimate Sent', key: 'estimate_sent', count: data.estimate_sent, value: data.estimate_sent_value, color: '#5a554d' },
    { label: 'Estimate Approved', key: 'estimate_approved', count: data.estimate_approved, value: data.estimate_approved_value, color: '#3b8a5a' },
    { label: 'Job Scheduled', key: 'job_scheduled', count: data.job_scheduled, value: data.job_value, color: '#2d7a4a' },
    { label: 'Job Completed', key: 'job_completed', count: data.job_completed, value: null, color: '#1a6638' },
  ];

  const maxCount = Math.max(data.leads, 1);

  return (
    <Paper className="flex flex-col rounded-xl p-6 shadow-sm">
      <Typography className="mb-6 text-lg font-semibold">Conversion Funnel</Typography>
      <div className="flex flex-col gap-2">
        {stages.map((stage, i) => {
          const width = Math.max((stage.count / maxCount) * 100, 8);
          const convRate = i > 0 && stages[i - 1].count > 0
            ? ((stage.count / stages[i - 1].count) * 100).toFixed(1)
            : null;

          return (
            <div
              key={stage.label}
              className={`flex items-center gap-4 ${onStageClick ? 'cursor-pointer' : ''}`}
              onClick={() => onStageClick?.(stage.key)}
            >
              <div className="relative flex-1">
                <div
                  className={`flex items-center rounded-md px-4 py-3 transition-all duration-300 ${onStageClick ? 'hover:opacity-80' : ''}`}
                  style={{
                    width: `${width}%`,
                    backgroundColor: stage.color,
                    minWidth: '120px',
                  }}
                >
                  <span className="text-sm font-medium text-white">{stage.label}</span>
                </div>
                {convRate && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                    {convRate}%
                  </span>
                )}
              </div>
              <div className="flex w-24 flex-col items-end">
                <span className="text-2xl font-bold">{stage.count}</span>
                {stage.value ? (
                  <span className="text-xs text-gray-400">{formatDollars(stage.value)}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {data.leads > 0 && (
        <Typography className="mt-4 text-center text-xs text-gray-400">
          Overall conversion rate: {((data.job_completed / data.leads) * 100).toFixed(1)}%
        </Typography>
      )}
    </Paper>
  );
}

export default memo(FunnelChart);
