/**
 * Newsletter Tracker Table Configuration
 * 
 * Purpose: Defines column structure and formatting for newsletter tracker virtualized table
 * Used in: Newsletter tracker page with VirtualizedTable component
 * Why: Provides consistent column definitions with proper formatting
 * 
 * Columns: Company, Investor, Property, Email
 */

import React from "react";
import { Home, Building } from "lucide-react";
import { TableColumn } from "@/features/filtering-wrapper-multi-display/types";

/**
 * Newsletter tracker data type for table items
 */
export interface NewsletterTrackerTableItem {
  id: string;
  company: string;
  investor: string;
  property: string;
  email: string;
}

////////////////////////////////////
// Centralized Column Definitions: All columns defined once
////////////////////////////////////

/**
 * Centralized column definitions for newsletter tracker table
 * All columns are defined here and can be referenced by name
 */
export const allColumns: Record<string, TableColumn<NewsletterTrackerTableItem>> = {
  company: {
    key: "company",
    name: "Company",
    sortable: true,
    width: "250px",
    minWidth: "220px",
    isSearchable: false,
    sticky: true,
    stickyPosition: 0,
    fixedWidth: 150,
    filterIcon: Building,
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
    isSearchable: true,
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

  property: {
    key: "property",
    name: "Property",
    sortable: true,
    // width: "200px",
    minWidth: "150px",
    isSearchable: false,
    filterIcon: Home,
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

  email: {
    key: "email",
    name: "Email",
    sortable: true,
    width: "200px",
    minWidth: "150px",
    isSearchable: true,
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
  }
};

////////////////////////////////////
// Column Arrays: Reference columns by name from allColumns
////////////////////////////////////

/**
 * Helper function to create column arrays from allColumns
 */
function createColumnArray(keys: string[]): TableColumn<NewsletterTrackerTableItem>[] {
  return keys.map(key => allColumns[key]).filter(Boolean) as TableColumn<NewsletterTrackerTableItem>[];
}

/**
 * Columns to display in the table
 * Order determines display order
 */
export const tableColumns = createColumnArray([
  'company',
  'investor',
  'property',
  'email'
]);

/**
 * Columns to display in the header (same as table columns for now)
 */
export const headerColumns = createColumnArray([
  'company',
  'property',
]);

////////////////////////////////////
// Filter Configuration
////////////////////////////////////

/**
 * Filter configuration object for FilteringWrapper component
 */
export const filterConfig = {
  // Sorting configuration
  initialSortKey: "investor" as const,
  
  // Filter dropdown configuration
  autoApplyDropdown: false,
  showBadgesDropdown: true,
  rangeOpen: false,
  
  // Search configuration
  searchPlaceholder: "Search by investor or email...",
  searchHighlightStyle: "bg-tertiary text-background font-medium px-0 rounded",
  hideTopLevelFilterSorting: true,
  hideTopLevelFiltering: false, // Different: false (shows top level filtering)
  
  // Header configuration
  headerColumns: headerColumns, // Different: only company and property
  
  // Filter controls configuration
  showPill: false, // Different: false (no pill filter)
  showIndependentDateFilter: false,
  
  // Pagination configuration
  initialPaginationMode: true,
  itemsPerPage: 10,
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
  emptyMessage: "No newsletter subscribers available",
  
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
