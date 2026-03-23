'use client';

import { memo } from 'react';
import Chip from '@mui/material/Chip';
import type { SourceTab } from '../../api/types';

type Props = {
  tabs: SourceTab[] | undefined;
  activeTab: string;
  onTabChange: (key: string) => void;
};

function SourceTabs({ tabs, activeTab, onTabChange }: Props) {
  if (!tabs || !Array.isArray(tabs)) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Chip
          key={tab.key}
          label={
            tab.coming_soon ? (
              <span>
                {tab.label}{' '}
                <span className="ml-1 rounded-full bg-amber-600 px-1.5 py-0.5 text-[9px] text-white">
                  Coming Soon
                </span>
              </span>
            ) : (
              tab.label
            )
          }
          variant={activeTab === tab.key ? 'filled' : 'outlined'}
          color={activeTab === tab.key ? 'primary' : 'default'}
          onClick={tab.coming_soon ? undefined : () => onTabChange(tab.key)}
          sx={{
            opacity: tab.coming_soon ? 0.5 : 1,
            cursor: tab.coming_soon ? 'default' : 'pointer',
          }}
        />
      ))}
    </div>
  );
}

export default memo(SourceTabs);
