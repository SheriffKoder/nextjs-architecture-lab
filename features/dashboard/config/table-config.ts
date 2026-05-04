/**
 * Dashboard Table Configuration
 * 
 * Purpose: Defines column structure and formatting for dashboard virtualized table
 * Used in: Dashboard page with FilteringWrapper component
 * Why: Provides consistent column definitions with proper formatting
 * 
 * Columns: Created At, Company, Investor, Project
 */

import React from "react";
import { TableColumn } from "@/features/filtering-wrapper-multi-display/types";

/**
 * Dashboard table data type for table items
 */
export interface DashboardTableItem {
  id: string;
  created_at: string;
  company: string;
  investor: string;
  project: string;
}

////////////////////////////////////
// Centralized Column Definitions: All columns defined once
////////////////////////////////////

/**
 * Centralized column definitions for dashboard table
 * All columns are defined here and can be referenced by name
 */
export const allColumns: Record<string, TableColumn<DashboardTableItem>> = {
  created_at: {
    key: "created_at",
    name: "Created At",
    sortable: true,
    width: "150px",
    minWidth: "120px",
    isSearchable: false,
    isDateField: true,
    formatter: (value) => {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch {
        return String(value);
      }
    },
    cellRenderer: (value): React.ReactElement | null => {
      if (!value) {
        return React.createElement('span', {
          className: 'TableTextClass italic'
        }, 'N/A');
      }
      try {
        const date = new Date(value);
        const displayValue = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        return React.createElement('div', {
          className: 'TableTextClass'
        }, displayValue);
      } catch {
        return React.createElement('div', {
          className: 'TableTextClass'
        }, String(value));
      }
    }
  },

  company: {
    key: "company",
    name: "Company",
    sortable: true,
    minWidth: "120px",
    isSearchable: false,
    sticky: true,
    stickyPosition: 0,
    fixedWidth: 150,
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

  investor: {
    key: "investor",
    name: "Investor",
    sortable: true,
    width: "150px",
    minWidth: "120px",
    isSearchable: false,
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
      return React.createElement('div', {
        className: 'TableTextClass'
      }, String(value));
    }
  },

  project: {
    key: "project",
    name: "Project",
    sortable: true,
    width: "200px",
    minWidth: "150px",
    isSearchable: false,
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
      return React.createElement('div', {
        className: 'TableTextClass'
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
function createColumnArray(keys: string[]): TableColumn<DashboardTableItem>[] {
  return keys.map(key => allColumns[key]).filter(Boolean) as TableColumn<DashboardTableItem>[];
}

/**
 * Columns to display in the table
 * Order determines display order
 */
export const tableColumns = createColumnArray([
  'created_at',
  'company',
  'investor',
  'project'
]);

/**
 * Columns to display in the header (same as table columns for now)
 */
export const headerColumns = createColumnArray([
  'company',
  'investor',
  'project'
]);

////////////////////////////////////
// Filter Configuration
////////////////////////////////////

/**
 * Filter configuration object for FilteringWrapper component
 */
export const filterConfig = {
  // Sorting configuration
  initialSortKey: "created_at" as const,
  
  // Filter dropdown configuration
  autoApplyDropdown: false,
  showBadgesDropdown: true,
  rangeOpen: false,
  
  // Search configuration
  searchPlaceholder: "Search by company, investor, project...",
  searchHighlightStyle: "bg-tertiary text-background font-medium px-0 rounded",
  hideTopLevelFilterSorting: true,
  hideTopLevelFiltering: false,
  hideTopLevelSearch: true,

  // Header configuration
  headerColumns: headerColumns,
  
  // Filter controls configuration
  showPill: false,
  showIndependentDateFilter: true,
  showDateFilterHeader: true, // Show the date filter header (mode selector)
  
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
  emptyMessage: "No data available",
  
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
