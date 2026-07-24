/**
 * Group Indicators Component
 * 
 * Purpose: Displays visual indicators for accordion groups
 * Used in: VirtualizedTable component beside pill filter
 * Why: Provides visual feedback about current group states
 */

import React, { useCallback } from 'react';
import { scrollContainerToGroupCenter } from '../utils/scroll-utils';

interface GroupIndicatorProps {
  groups: Array<{
    id: string;
    name: string;
    color: string;
    textColor: string;
  }>;
  openGroups: Set<string>;
  onGroupToggle: (groupId: string) => void;
  // Optional: pass the scroll container ref element to enable scroll behavior
  scrollContainer?: HTMLElement | null;
}

export function GroupIndicators({ groups, openGroups, onGroupToggle, scrollContainer }: GroupIndicatorProps) {
  const handleClick = useCallback((groupId: string, isOpen: boolean) => {
    // If currently closed (not active), open and scroll to it
    if (!isOpen) {
      onGroupToggle(groupId);
      if (scrollContainer) {
        // Defer to next frame to allow DOM to reflect open state; positions are based on first column cells
        requestAnimationFrame(() => scrollContainerToGroupCenter(scrollContainer, groupId));
      }
      return;
    }
    // If already open, just toggle close without scrolling
    onGroupToggle(groupId);
  }, [onGroupToggle, scrollContainer]);

  if (!groups || groups.length === 0) return null;

  return (
    <div className="flex flex-row items-center gap-2">
      {groups.map((group) => {
        const isOpen = openGroups.has(group.id);
        
        return (
          <button
            key={group.id}
            onClick={() => handleClick(group.id, isOpen)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
              transition-all duration-200 hover:opacity-80
              ${group.color} ${group.textColor}
            `}
            title={`${isOpen ? 'Close' : 'Open'} ${group.name} group`}
          >
            {/* Group indicator dot */}
            <div className={`
              w-3 h-3 rounded-full border-2 transition-all duration-200
              ${isOpen 
                ? 'bg-current border-current' 
                : 'bg-transparent border-current'
              }
            `} />
            
            {/* Group name */}
            <span>{group.name}</span>
          </button>
        );
      })}
    </div>
  );
}
