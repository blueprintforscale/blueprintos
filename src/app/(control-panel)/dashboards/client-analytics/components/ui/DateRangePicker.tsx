'use client';

import { memo, useState } from 'react';
import TextField from '@mui/material/TextField';

type DateRange = { from: string; to: string; days: number | null };

const presets = [
  { label: '90d', days: 90 },
  { label: '60d', days: 60 },
  { label: '30d', days: 30 },
  { label: '7d', days: 7 },
];

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

function DateRangePicker({ value, onChange }: Props) {
  const [showCustom, setShowCustom] = useState(false);

  const handlePreset = (days: number) => {
    const to = toDateStr(new Date());
    const from = toDateStr(new Date(Date.now() - days * 86400000));
    onChange({ from, to, days });
    setShowCustom(false);
  };

  return (
    <div className="flex items-center gap-1.5">
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
            sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem', py: 0.5, px: 1 }, width: 130 }}
          />
          <span className="text-xs" style={{ color: '#8a8279' }}>to</span>
          <TextField
            type="date"
            size="small"
            value={value.to}
            onChange={(e) => onChange({ from: value.from, to: e.target.value, days: null })}
            sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem', py: 0.5, px: 1 }, width: 130 }}
          />
        </div>
      )}
    </div>
  );
}

export default memo(DateRangePicker);
