'use client';

import type { ReactNode } from 'react';

export interface GroupTabItem {
  id: number;
  name: string;
  color?: string;
  memberCount?: number;
}

export const DEFAULT_GROUP_TABS: GroupTabItem[] = [
  { id: 1, name: 'Web Developer Study', color: '#0077ff', memberCount: 4 },
  { id: 2, name: 'Python 스터디', color: '#10b981', memberCount: 4 },
];

interface GroupTabsCardProps {
  groups?: GroupTabItem[];
  activeGroupId: number;
  onSelect: (group: GroupTabItem) => void;
  children?: ReactNode;
  className?: string;
}

export default function GroupTabsCard({
  groups = DEFAULT_GROUP_TABS,
  activeGroupId,
  onSelect,
  children,
  className = '',
}: GroupTabsCardProps) {
  const visibleGroups = groups.length ? groups : DEFAULT_GROUP_TABS;
  const fallbackActiveId = activeGroupId || visibleGroups[0]?.id || 0;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
      <style>{`
        .group-tab-btn { transition: all .2s ease; cursor: pointer; }
        .group-tab-btn.active { color: #0077ff; border-bottom: 2px solid #0077ff; font-weight: 700; }
        .group-tab-badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; }
      `}</style>
      <div className="flex border-b border-slate-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {visibleGroups.map(group => {
          const isActive = fallbackActiveId === group.id;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => onSelect(group)}
              className={`group-tab-btn ${isActive ? 'active' : ''} px-5 py-3.5 text-sm text-slate-500 border-b-2 border-transparent -mb-px whitespace-nowrap`}
            >
              {group.name}
              <span
                className="ml-1.5 group-tab-badge"
                style={isActive
                  ? { background: '#dce6fd', color: '#0077ff' }
                  : { background: '#f1f5f9', color: '#64748b' }}
              >
                {group.memberCount ?? 4}명
              </span>
            </button>
          );
        })}
      </div>
      {children && <div className="px-4 sm:px-5 py-3 space-y-3">{children}</div>}
    </div>
  );
}
