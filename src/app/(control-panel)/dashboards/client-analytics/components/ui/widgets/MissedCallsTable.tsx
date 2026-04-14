'use client';

import { memo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { MissedCallRow } from '../../../api/types';

function formatPhone(raw: string) {
  if (!raw) return 'Unknown';
  const digits = raw.replace(/\D/g, '').slice(-10);
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch {
    return iso;
  }
}

function formatDuration(seconds: number | null | undefined) {
  if (seconds == null || seconds === 0) return '\u2014';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

type Props = { data: MissedCallRow[] | undefined };

function MissedCallsTable({ data }: Props) {
  const [search, setSearch] = useState('');

  if (!data || data.length === 0) return null;

  const filtered = search
    ? data.filter((c) =>
        (c.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.caller_phone || '').includes(search) ||
        (c.source_name || '').toLowerCase().includes(search.toLowerCase())
      )
    : data;

  return (
    <Paper className="rounded-xl p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Typography className="text-sm font-extrabold uppercase tracking-wider" style={{ color: '#E85D4D' }}>
            Missed Calls
          </Typography>
          <Typography className="text-[11px] font-medium" style={{ color: '#8a8279' }}>
            {data.length} missed · excludes hang-ups (&lt;10s)
          </Typography>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-xs"
          style={{ borderColor: '#ddd8cb', backgroundColor: '#EEEAD9', color: '#000', width: 160 }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr style={{ color: '#8a8279' }}>
              <th className="border-b px-3 py-2 text-[9px] font-bold uppercase tracking-widest" style={{ borderColor: '#ddd8cb' }}>Phone</th>
              <th className="border-b px-3 py-2 text-[9px] font-bold uppercase tracking-widest" style={{ borderColor: '#ddd8cb' }}>When</th>
              <th className="border-b px-3 py-2 text-[9px] font-bold uppercase tracking-widest" style={{ borderColor: '#ddd8cb' }}>Duration</th>
              <th className="border-b px-3 py-2 text-[9px] font-bold uppercase tracking-widest" style={{ borderColor: '#ddd8cb' }}>Source</th>
              <th className="border-b px-3 py-2 text-[9px] font-bold uppercase tracking-widest" style={{ borderColor: '#ddd8cb' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((call) => (
              <tr key={`${call.caller_phone}-${call.start_time}`} className="transition-colors hover:bg-gray-50">
                <td className="border-b px-3 py-2 font-mono text-xs" style={{ borderColor: '#eee', color: '#000' }}>
                  {formatPhone(call.caller_phone)}
                  {call.first_call && (
                    <span className="ml-1 inline-block rounded-full px-1.5 py-0.5 text-[8px] font-semibold"
                      style={{ backgroundColor: '#fde8e6', color: '#c44a3c' }}>1st</span>
                  )}
                </td>
                <td className="border-b px-3 py-2 text-[11px]" style={{ borderColor: '#eee', color: '#5a554d' }}>
                  {formatTime(call.start_time)}
                  {call.classified_period === 'business_hours' && (
                    <span className="ml-1 inline-block rounded-full px-1.5 py-0.5 text-[8px] font-semibold"
                      style={{ backgroundColor: '#fef3d1', color: '#a87408' }}>Biz Hrs</span>
                  )}
                </td>
                <td className="border-b px-3 py-2 text-[11px] font-mono" style={{ borderColor: '#eee', color: '#5a554d' }}>
                  {formatDuration(call.duration)}
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: '#eee' }}>
                  {call.classified_source === 'google_ads' ? (
                    <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold"
                      style={{ backgroundColor: '#e6f3ec', color: '#2d6e46' }}>Google Ads</span>
                  ) : (
                    <span className="text-[10px]" style={{ color: '#8a8279' }}>{call.source_name || 'Other'}</span>
                  )}
                </td>
                <td className="border-b px-3 py-2" style={{ borderColor: '#eee' }}>
                  {call.classified_status === 'missed' ? (
                    <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold"
                      style={{ backgroundColor: '#fde8e6', color: '#c44a3c' }}>Missed</span>
                  ) : (
                    <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold"
                      style={{ backgroundColor: '#fef3d1', color: '#a87408' }}>Hung Up</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Paper>
  );
}

export default memo(MissedCallsTable);
