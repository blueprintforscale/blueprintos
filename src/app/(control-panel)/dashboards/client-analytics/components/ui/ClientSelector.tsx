'use client';

import { memo } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import type { Client } from '../../api/types';

type Props = {
  clients: Client[] | undefined;
  selectedId: number | null;
  onSelect: (customerId: number | null) => void;
};

function ClientSelector({ clients, selectedId, onSelect }: Props) {
  if (!clients) return null;

  const selected = clients.find((c) => c.customer_id === selectedId) || null;

  return (
    <Autocomplete
      options={clients}
      getOptionLabel={(c) => c.name}
      value={selected}
      onChange={(_, newVal) => onSelect(newVal?.customer_id ?? null)}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Select a client..."
          variant="outlined"
          size="small"
          sx={{ minWidth: 300 }}
        />
      )}
      isOptionEqualToValue={(opt, val) => opt.customer_id === val.customer_id}
    />
  );
}

export default memo(ClientSelector);
