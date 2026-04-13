'use client';

import { memo, useState } from 'react';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

type DateRange = { from: string; to: string; days: number | null };

const presets = [
  { label: '90d', days: 90 },
  { label: '60d', days: 60 },
  { label: '30d', days: 30 },
  { label: '7d', days: 7 },
];

const LIFETIME = -1;

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  startDate?: string;
  /** Earliest date with reliable Google Ads attribution (first CallRail call/form). Used as min for date picker and Lifetime label. */
  trackingStartDate?: string;
};

function DateRangePicker({ value, onChange, startDate, trackingStartDate }: Props) {
  const [showCustom, setShowCustom] = useState(false);

  // Use tracking_start_date if available (reliable GA attribution floor), fall back to program start_date
  const lifetimeFloor = trackingStartDate || startDate;

  const handlePreset = (days: number) => {
    const to = toDateStr(new Date());
    if (days === LIFETIME && lifetimeFloor) {
      onChange({ from: lifetimeFloor, to, days: LIFETIME });
    } else {
      onChange({ from: toDateStr(new Date(Date.now() - days * 86400000)), to, days });
    }
    setShowCustom(false);
  };

  const isLifetime = value.days === LIFETIME;

  return (
    <div className="flex items-center gap-1.5">
      {/* Lifetime pill */}
      {lifetimeFloor && (
        <Tooltip
          title={trackingStartDate ? `Reliable Google Ads tracking since ${formatShortDate(trackingStartDate)}` : ''}
          placement="top"
          arrow
        >
          <button
            onClick={() => handlePreset(LIFETIME)}
            className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
            style={{
              backgroundColor: isLifetime && !showCustom ? '#000' : 'transparent',
              color: isLifetime && !showCustom ? '#fff' : '#8a8279',
              border: `1px solid ${isLifetime && !showCustom ? '#000' : '#ddd8cb'}`,
            }}
          >
            Lifetime{isLifetime ? ` (since ${formatShortDate(lifetimeFloor)})` : ''}
          </button>
        </Tooltip>
      )}

      {/* Preset pills */}
      {presets.map((p) => (
        <button
          key={p.days}
          onClick={() => handlePreset(p.days)}
          className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
          style={{
            backgroundColor: value.days === p.days && !showCustom ? '#000' : 'transparent',
            color: value.days === p.days && !showCustom ? '#fff' : '#8a8279',
            border: `1px solid ${value.days === p.days && !showCustom ? '#000' : '#ddd8cb'}`,
          }}
        >
          {p.label}
        </button>
      ))}

      {/* Custom toggle */}
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
        style={{
          backgroundColor: showCustom || value.days === null ? '#000' : 'transparent',
          color: showCustom || value.days === null ? '#fff' : '#8a8279',
          border: `1px solid ${showCustom || value.days === null ? '#000' : '#ddd8cb'}`,
        }}
      >
        Custom
      </button>

      {/* Custom date inputs */}
      {showCustom && (
        <div className="flex items-center gap-1.5 ml-1">
          <TextField
            type="date"
            size="small"
            value={value.from}
            onChange={(e) => onChange({ from: e.target.value, to: value.to, days: null })}
            inputProps={lifetimeFloor ? { min: lifetimeFloor } : undefined}
            sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem', py: 0.5, px: 1 }, width: 130 }}
          />
          <span className="text-xs" style={{ color: '#8a8279' }}>to</span>
          <TextField
            type="date"
            size="small"
            value={value.to}
            onChange={(e) => onChange({ from: value.from, to: e.target.value, days: null })}
            inputProps={lifetimeFloor ? { min: lifetimeFloor } : undefined}
            sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem', py: 0.5, px: 1 }, width: 130 }}
          />
        </div>
      )}
    </div>
  );
}

export default memo(DateRangePicker);
