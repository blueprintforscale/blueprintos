'use client';

import { memo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { AdPerformance } from '../../../api/types';

function formatDollars(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

type Props = {
  data: AdPerformance | undefined;
  onClick?: () => void;
};

function GuaranteeBar({ data, onClick }: Props) {
  if (!data || !data.program_price) return null;

  const guarantee = data.guarantee;
  const months = data.months_in_program || 0;

  return (
    <Paper
      className={`flex flex-col rounded-xl border p-5 shadow-none ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      sx={{ borderColor: '#ddd8cb' }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <Typography className="text-xs font-semibold uppercase tracking-wide" sx={{ color: '#8a8279' }}>Guarantee</Typography>
          <Typography className="mt-1 text-3xl font-bold tracking-tight">{guarantee.toFixed(1)}x</Typography>
          <Typography className="mt-1 text-xs" sx={{ color: '#8a8279' }}>
            {formatDollars(data.all_time_rev)} / {formatDollars(data.program_price)}
          </Typography>
        </div>
        <div className="text-right">
          <Typography className="text-sm font-bold" sx={{ color: guarantee >= 1 ? '#3b8a5a' : '#E85D4D' }}>
            {guarantee >= 1 ? '✓ Guarantee met' : `${formatDollars((1 - guarantee) * data.program_price)} to go`}
          </Typography>
          <Typography className="text-[10px]" sx={{ color: '#8a8279' }}>
            {months} mo{months > 12 ? ' (12mo cap)' : ''}
          </Typography>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-3">
        <div className="relative h-4 w-full rounded-full overflow-hidden" style={{ backgroundColor: '#f0ede6' }}>
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(guarantee * 100, 100)}%`,
              backgroundColor: guarantee >= 1 ? '#3b8a5a' : '#E85D4D',
            }}
          />
        </div>
      </div>
    </Paper>
  );
}

export default memo(GuaranteeBar);
