/**
 * Status Badge Component
 * 
 * Purpose: Common component for displaying status as a colored badge
 * Used in: All virtualized tables and status displays across the application
 * Why: Provides consistent status visualization with support for project, allocation, and generic statuses
 */

import React from "react";
import { AllocationStatusEnum, ProjectStatusEnum } from '@/lib/constants';
import { capitalizeAllFirstLetters } from '@/utils/formatters';

interface StatusBadgeProps {
  status: string | null | undefined;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }): React.ReactElement | null => {
  // Handle null/undefined values gracefully
  if (status === null || status === undefined) {
    return React.createElement('span', {
      className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200'
    }, 'Unknown');
  }
  
  // Convert to string and get badge styling
  const statusValue = String(status).toLowerCase();
  
  // Define badge styles for different status values
  const getBadgeStyle = (status: string): string => {
    // Project Statuses
    switch (status) {
      case ProjectStatusEnum.ACTIVE_CONSTRUCTION:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ProjectStatusEnum.SOLD:
        return 'bg-green-100 text-green-800 border-green-200';
      case ProjectStatusEnum.FOR_SALE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ProjectStatusEnum.PENDING_PURCHASE:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ProjectStatusEnum.RENTAL_PROPERTIES:
        return 'bg-purple-100 text-purple-800 border-purple-200';

      // Allocation Statuses
      case AllocationStatusEnum.ACTIVE:
        return 'bg-green-100 text-green-800 border-green-200';
      case AllocationStatusEnum.INACTIVE:
        return 'bg-red-100 text-red-800 border-red-200';

      // Generic Statuses
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in progress':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get display name for status
  const getDisplayName = (status: string): string => {
    switch (status) {
      case ProjectStatusEnum.ACTIVE_CONSTRUCTION:
        return 'Active Construction';
      case ProjectStatusEnum.SOLD:
        return 'Sold';
      case ProjectStatusEnum.FOR_SALE:
        return 'For Sale';
      case ProjectStatusEnum.PENDING_PURCHASE:
        return 'Pending Purchase';
      case ProjectStatusEnum.RENTAL_PROPERTIES:
        return 'Rental Properties';
      default:
        return capitalizeAllFirstLetters(status);
    }
  };
  
  return React.createElement('span', {
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle(statusValue)}`
  }, getDisplayName(statusValue));
}; 