/**
 * Note Expirations Table Configuration
 * 
 * Purpose: Defines column structure and formatting for note expirations virtualized table
 * Used in: Note expirations page with VirtualizedTable component
 * Why: Provides consistent column definitions with proper formatting
 * 
 * Columns: Company, Investor, Property, Inv. Amount, Rate %, Expiration Date, Days Until Expiration, Contact Info
 */

import React from "react";
import { TableColumn } from "@/features/filtering-wrapper-multi-display/types";

/**
 * Note expiration data type for table items
 */
export interface NoteExpirationTableItem {
  id: string;
  company: string;
  investor: string;
  property: string;
  invAmount: number;
  rate: number;
  expirationDate: string;
  daysUntilExpiration: number | null;
  contactInfo: string;
}

////////////////////////////////////
// Centralized Column Definitions: All columns defined once
////////////////////////////////////

/**
 * Centralized column definitions for note expirations table
 * All columns are defined here and can be referenced by name
 */
export const allColumns: Record<string, TableColumn<NoteExpirationTableItem>> = {
  company: {
    key: "company",
    name: "Company",
    sortable: true,
    minWidth: "120px",
    isSearchable: true,
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
      return React.createElement('div', {
        className: 'TableTextClass'
      }, String(value));
    }
  },

  invAmount: {
    key: "invAmount",
    name: "Inv. Amount",
    sortable: true,
    width: "120px",
    minWidth: "100px",
    isSearchable: false,
    formatter: (value) => {
      if (value === null || value === undefined) return '$0.00';
      return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    cellRenderer: (value): React.ReactElement | null => {
      const displayValue = value === null || value === undefined 
        ? '$0.00' 
        : `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      return React.createElement('div', {
        className: 'TableTextClass'
      }, displayValue);
    }
  },

  rate: {
    key: "rate",
    name: "Rate %",
    sortable: true,
    width: "100px",
    minWidth: "80px",
    isSearchable: false,
    formatter: (value) => {
      if (value === null || value === undefined) return '0.00%';
      return `${Number(value).toFixed(2)}%`;
    },
    cellRenderer: (value): React.ReactElement | null => {
      const displayValue = value === null || value === undefined 
        ? '0.00%' 
        : `${Number(value).toFixed(2)}%`;
      return React.createElement('div', {
        className: 'TableTextClass'
      }, displayValue);
    }
  },

  expirationDate: {
    key: "expirationDate",
    name: "Expiration Date",
    sortable: true,
    width: "140px",
    minWidth: "120px",
    isSearchable: false,
    formatter: (value) => {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
        const displayValue = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  daysUntilExpiration: {
    key: "daysUntilExpiration",
    name: "Days Until Expiration",
    sortable: true,
    width: "160px",
    minWidth: "140px",
    isSearchable: false,
    formatter: (value) => {
      if (value === null || value === undefined) return 'N/A';
      const days = Number(value);
      if (days < 0) return `${Math.abs(days)} days overdue`;
      if (days === 0) return 'Expires today';
      return `${days} days`;
    },
    cellRenderer: (value): React.ReactElement | null => {
      if (value === null || value === undefined) {
        return React.createElement('span', {
          className: 'TableTextClass italic'
        }, 'N/A');
      }
      const days = Number(value);
      let displayValue: string;
      let colorClass: string;
      
      if (days < 0) {
        displayValue = `${Math.abs(days)} days overdue`;
        colorClass = 'text-destructive';
      } else if (days === 0) {
        displayValue = 'Expires today';
        colorClass = 'text-destructive';
      } else if (days <= 30) {
        displayValue = `${days} days`;
        colorClass = 'text-yellow-600 dark:text-yellow-400';
      } else {
        displayValue = `${days} days`;
        colorClass = 'text-foreground';
      }
      
      return React.createElement('div', {
        className: `TableTextClass ${colorClass}`
      }, displayValue);
    }
  },

  contactInfo: {
    key: "contactInfo",
    name: "Contact Info",
    sortable: true,
    width: "180px",
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
function createColumnArray(keys: string[]): TableColumn<NoteExpirationTableItem>[] {
  return keys.map(key => allColumns[key]).filter(Boolean) as TableColumn<NoteExpirationTableItem>[];
}

/**
 * Columns to display in the table
 * Order determines display order
 */
export const tableColumns = createColumnArray([
  'company',
  'investor',
  'property',
  'invAmount',
  'rate',
  'expirationDate',
  'daysUntilExpiration',
  'contactInfo'
]);

/**
 * Columns to display in the header (same as table columns for now)
 */
export const headerColumns = createColumnArray([
  'company',
  'investor',
  'property',
  'invAmount',
  'rate',
  'expirationDate',
  'daysUntilExpiration',
  'contactInfo'
]);

////////////////////////////////////
// Filter Configuration
////////////////////////////////////

/**
 * Filter configuration object for FilteringWrapper component
 */
export const filterConfig = {
  // Sorting configuration
  initialSortKey: "expirationDate" as const,
  
  // Filter dropdown configuration
  autoApplyDropdown: false,
  showBadgesDropdown: true,
  rangeOpen: false,
  
  // Search configuration
  searchPlaceholder: "Search expirations by company, investor, property...",
  searchHighlightStyle: "bg-tertiary text-background font-medium px-0 rounded",
  hideTopLevelFilterSorting: true,
  hideTopLevelFiltering: true,
  
  // Header configuration
  headerColumns: headerColumns,
  
  // Filter controls configuration
  showPill: true,
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
  emptyMessage: "No expirations available",
  
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
  rowStyler: (rowData: NoteExpirationTableItem): string => {
    const days = rowData.daysUntilExpiration;
    if (days == null) return 'bg-green-500/15 dark:bg-green-950/30';

    // Red: within 7 days or already expired (<= 7 days)
    if (days <= 7) {
      return 'bg-red-500/15 dark:bg-red-950/30';
    }

    // Orange: within 60 days but more than 7 days (8-60 days)
    if (days <= 60) {
      return 'bg-yellow-500/15 dark:bg-yellow-500/10';
    }

    // Green: more than 60 days
    return 'bg-green-500/15 dark:bg-green-950/30';
  },
};
