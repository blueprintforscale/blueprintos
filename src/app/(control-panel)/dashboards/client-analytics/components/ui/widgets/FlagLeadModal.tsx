'use client';

import { memo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const FLAG_REASONS = [
  { value: 'not_google_ads', label: 'Not from Google Ads' },
  { value: 'spam', label: 'Spam / not a lead' },
  { value: 'out_of_area', label: 'Out of area' },
  { value: 'wrong_service', label: 'Wrong service' },
  { value: 'wrong_person', label: 'Wrong person / bad match' },
  { value: 'wrong_revenue', label: 'Revenue amount is incorrect' },
  { value: 'duplicate', label: 'Duplicate lead' },
  { value: 'other', label: 'Other' },
];

type Props = {
  open: boolean;
  leadName: string;
  onClose: () => void;
  onSubmit: (reason: string, notes: string) => Promise<void>;
};

function FlagLeadModal({ open, leadName, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState('not_google_ads');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(reason, notes);
      setReason('not_google_ads');
      setNotes('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography className="text-base font-bold">Flag This Lead</Typography>
        <Typography className="text-xs" sx={{ color: '#8a8279' }}>Flagging: {leadName}</Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography className="text-xs font-medium mb-1" sx={{ color: '#5a554d' }}>
          What's the issue?
        </Typography>
        <Select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 2, fontSize: '0.85rem' }}
        >
          {FLAG_REASONS.map((r) => (
            <MenuItem key={r.value} value={r.value} sx={{ fontSize: '0.85rem' }}>
              {r.label}
            </MenuItem>
          ))}
        </Select>

        <Typography className="text-xs font-medium mb-1" sx={{ color: '#5a554d' }}>
          Additional details (optional)
        </Typography>
        <TextField
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tell us more so we can fix it..."
          multiline
          rows={3}
          size="small"
          fullWidth
          sx={{ '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small" sx={{ color: '#8a8279', textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          size="small"
          variant="contained"
          sx={{
            backgroundColor: '#E85D4D',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#c44a3c' },
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Flag'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(FlagLeadModal);
