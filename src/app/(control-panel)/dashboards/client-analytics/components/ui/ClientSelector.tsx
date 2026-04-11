'use client';

import { memo } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import type { Client, Group } from '../../api/types';

export type Selection =
  | { type: 'client'; id: number }
  | { type: 'group'; slug: string };

type Option =
  | { kind: 'client'; section: string; client: Client; label: string }
  | { kind: 'group'; section: string; group: Group; label: string };

type Props = {
  clients: Client[] | undefined;
  groups?: Group[] | undefined;
  selected: Selection | null;
  onSelect: (selection: Selection | null) => void;
};

function ClientSelector({ clients, groups, selected, onSelect }: Props) {
  if (!clients || !Array.isArray(clients) || clients.length === 0) return null;

  const groupOptions: Option[] = (groups || []).map((g) => ({
    kind: 'group',
    section: 'Combined',
    group: g,
    label: `${g.name} (Combined)`,
  }));

  const clientOptions: Option[] = clients.map((c) => ({
    kind: 'client',
    section: 'Clients',
    client: c,
    label: c.name,
  }));

  const options: Option[] = [...groupOptions, ...clientOptions];

  const selectedOption =
    selected?.type === 'group'
      ? options.find((o) => o.kind === 'group' && o.group.slug === selected.slug) || null
      : selected?.type === 'client'
      ? options.find((o) => o.kind === 'client' && o.client.customer_id === selected.id) || null
      : null;

  return (
    <Autocomplete
      options={options}
      groupBy={(o) => o.section}
      getOptionLabel={(o) => o.label}
      value={selectedOption}
      onChange={(_, newVal) => {
        if (!newVal) return onSelect(null);
        if (newVal.kind === 'group') return onSelect({ type: 'group', slug: newVal.group.slug });
        return onSelect({ type: 'client', id: newVal.client.customer_id });
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Select a client..."
          variant="outlined"
          size="small"
          sx={{ minWidth: 300 }}
        />
      )}
      isOptionEqualToValue={(opt, val) => {
        if (opt.kind !== val.kind) return false;
        if (opt.kind === 'group' && val.kind === 'group') return opt.group.slug === val.group.slug;
        if (opt.kind === 'client' && val.kind === 'client')
          return opt.client.customer_id === val.client.customer_id;
        return false;
      }}
    />
  );
}

export default memo(ClientSelector);
