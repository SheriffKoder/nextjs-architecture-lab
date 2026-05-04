/**
 * Admin User Management Table Configuration
 * 
 * Purpose: Defines column structure and formatting for admin user management virtualized table
 * Used in: Admin user management page with VirtualizedTable component
 * Why: Provides consistent column definitions with proper formatting
 * 
 * Columns: Name, Email, Phone, Role
 */

import React from "react";
import { TableColumn } from "@/features/filtering-wrapper-multi-display/types";
import { RoleEnum } from "@/lib/constants";

/**
 * Admin user management data type for table items
 */
export interface AdminUserTableItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
}

////////////////////////////////////
// Centralized Column Definitions: All columns defined once
////////////////////////////////////

/**
 * Centralized column definitions for admin user management table
 * All columns are defined here and can be referenced by name
 */
export const allColumns: Record<string, TableColumn<AdminUserTableItem>> = {
  name: {
    key: "name",
    name: "Name",
    sortable: true,
    minWidth: '150px',
    isSearchable: true,
    isSearchFilter: true,
    filterApiParams: {
      text: "name_search",
      isArray: false,
    },
    formatter: (value) => {
      if (value === null || value === undefined) return 'N/A';
      return String(value);
    },
    cellRenderer: (value): React.ReactElement | null => {
      const displayValue = value === null || value === undefined ? 'N/A' : String(value);
      return React.createElement('div', {
        className: 'TableTextClass'
      }, displayValue);
    }
  },

  email: {
    key: "email",
    name: "Email",
    sortable: false,
    minWidth: '150px',
    isSearchable: true,
    isSearchFilter: true, 
    filterApiParams: {
      text: "email_search",
      isArray: false,
    },  

    formatter: (value) => {
      if (!value) return 'N/A';
      return String(value);
    },
    cellRenderer: (value): React.ReactElement | null => {
      if (!value) {
        return React.createElement('span', {
          className: 'TableTextClass italic'
        }, 'N/A');
      }
      return React.createElement('a', {
        className: 'TableTextClass text-primary hover:underline',
        href: `mailto:${value}`,
        onClick: (e) => e.stopPropagation() // Prevent row click when clicking email
      }, String(value));
    }
  },

  phone: {
    key: "phone",
    name: "Phone",
    sortable: false,
    minWidth: '150px',
    isSearchable: true,
    isSearchFilter: true,
    filterApiParams: {
      text: "phone_search",
      isArray: false,
    },
    formatter: (value) => {
      if (!value) return 'N/A';
      return String(value);
    },
    cellRenderer: (value): React.ReactElement | null => {
      if (!value) {
        return React.createElement('span', {
          className: 'TableTextClass italic'
        }, 'N/A');
      }
      return React.createElement('a', {
        className: 'TableTextClass text-primary hover:underline',
        href: `tel:${value}`,
        onClick: (e) => e.stopPropagation() // Prevent row click when clicking phone
      }, String(value));
    }
  },

  role: {
    key: "role",
    name: "Role",
    sortable: true,
    minWidth: '120px',
    uniqueValues: { key: "role_unique_values" },
    filterApiParams: {
      text: "role_ids",
      isArray: true,
      valueField: "id",
    },
    formatter: (value) => {
      if (!value) return 'N/A';
      return String(value);
    },
    cellRenderer: (value): React.ReactElement | null => {
      if (!value) {
        return React.createElement('span', {
          className: 'TableTextClass italic'
        }, 'N/A');
      }
      
      const roleValue = String(value).toLowerCase();
      
      // Define badge styles for different roles
      const getRoleBadgeStyle = (role: string) => {
        switch (role) {
          case RoleEnum.ADMIN:
            return 'bg-purple-100 text-purple-800 border-purple-200';
          case RoleEnum.USER:
            return 'bg-blue-100 text-blue-800 border-blue-200';
          default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
        }
      };
      
      return React.createElement('span', {
        className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeStyle(roleValue)}`
      }, String(value));
    }
  }
};

////////////////////////////////////
// Column Arrays: Reference columns by name from allColumns
////////////////////////////////////

/**
 * Helper function to create column arrays from allColumns
 */
function createColumnArray(keys: string[]): TableColumn<AdminUserTableItem>[] {
  return keys.map(key => allColumns[key]).filter(Boolean) as TableColumn<AdminUserTableItem>[];
}

/**
 * Columns to display in the table
 * Order determines display order
 */
export const tableColumns = createColumnArray([
  'name',
  'email',
  'phone',
  'role'
]);

/**
 * Columns to display in the header (same as table columns for now)
 */
export const headerColumns = createColumnArray([
  'name',
  'email',
  'phone',
  'role'
]);

////////////////////////////////////
// Filter Configuration
////////////////////////////////////

/**
 * Filter configuration object for FilteringWrapper component
 */
export const filterConfig = {
  // Sorting configuration
  initialSortKey: "name" as const,
  
  // Filter dropdown configuration
  autoApplyDropdown: false,
  showBadgesDropdown: true,
  rangeOpen: false,
  
  // Search configuration
  searchPlaceholder: "Search by name, email, phone...",
  searchHighlightStyle: "bg-yellow-200 font-medium px-0 rounded text-inherit",
  hideTopLevelFilterSorting: true,
  hideTopLevelFiltering: true,
  
  // Header configuration
  headerColumns: headerColumns, // Empty array - no header columns for filtering
  
  // Filter controls configuration
  showPill: true,
  showIndependentDateFilter: false,
  
  // Pagination configuration
  initialPaginationMode: true,
  itemsPerPage: 20,
  hidePaginationSwitch: true,
};

////////////////////////////////////
// Table Configuration
////////////////////////////////////

/**
 * Table configuration object for FilteringWrapper component
 */
export const tableConfig = {
  // Row height configuration
  rowHeight: 40,
  minRowHeight: 40,
  
  // Display configuration
  dynamicRowHeight: false,
  tableHeight: undefined,
  emptyMessage: "No users available",
  
  // Loading configuration
  loading: undefined,
  loadingStateShimmer: true,
  
  // Row expansion configuration
  rowExpansion: undefined,
  
  // Action configuration
  actionMode: 'inline' as const,
  
  // Selection and editing
  editableColumns: undefined,
  
  // Styling configuration
  groupStylerConfig: undefined,
  rowStyler: undefined,
};
