/**
 * ExpandedRowContent Component
 * 
 * Purpose: Renders content below an expanded row
 * Used in: VirtualizedTableRow component
 * Why: Separates expanded content rendering logic
 */

import React from 'react';
import { LoadingSpinner } from '../../../../components/loading-spinner';

interface ExpandedRowContentProps<T = any> {
  item: T;
  expandedChildren: any[];
  isLoading?: boolean;
  renderContent?: (item: T, children: any[], onRowClick?: (row: T) => void) => React.ReactElement | null;
  height?: number;
  onRowClick?: (row: T) => void;
}

/**
 * Component to render expanded content below a row
 * 
 * @param props - ExpandedRowContentProps
 * @returns Expanded content JSX
 */
export function ExpandedRowContent<T = any>({
  item,
  expandedChildren,
  isLoading = false,
  renderContent,
  height = 200,
  onRowClick
}: ExpandedRowContentProps<T>) {
  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-50/60 border-t border-gray-200 px-4 py-4  z-10 flex items-center justify-center">
        <LoadingSpinner message="Loading sub tasks..." className="text-xs" />
      </div>
    );
  }

  if (expandedChildren.length === 0) {
    return (
      <div className="w-full bg-gray-50 border-t border-gray-200 px-4 py-4">
        <div className="text-center text-sm text-gray-500 py-4">
          No children found
        </div>
      </div>
    );
  }

  // Use custom render function if provided
  if (renderContent) {
    return (
      <div className="w-full bg-gray-50">
        {renderContent(item, expandedChildren, onRowClick)}
      </div>
    );
  }

  // Default rendering: simple list of children
  return (
    <div className="w-full px-4 py-4">
      <div className="space-y-2">
        {expandedChildren.map((child, index) => (
          <div key={child.id || index} className="text-sm text-gray-700">
            {JSON.stringify(child)}
          </div>
        ))}
      </div>
    </div>
  );
}
