/**
 * Monthly Distributions Table Configuration
 * 
 * Purpose: Defines column structure and formatting for monthly distributions virtualized table
 * Used in: Monthly distributions page with VirtualizedTable component
 * Why: Provides consistent column definitions with proper formatting
 * 
 * Columns: Company, Investor, Property, Type, Amount, Interest Rate, Accrued Interest, Payment Due, Status, Date
 */

import React from "react";
import { TableColumn } from "@/features/filtering-wrapper-multi-display/types";
import { StatusBadge } from "@/features/filtering-wrapper-multi-display/features/virtualized-table/components/rows/cell-status-badge";

/**
 * Monthly distribution data type for table items
 */
export interface MonthlyDistributionTableItem {
  id: string;
  company: string;
  investor: string;
  property: string;
  type: string;
  amount: number;
  interestRate: number;
  accruedInterest: number;
  paymentDue: string;
  status: string;
  date: string;
}

////////////////////////////////////
// Centralized Column Definitions: All columns defined once
////////////////////////////////////

/**
 * Centralized column definitions for monthly distributions table
 * All columns are defined here and can be referenced by name
 */
export const allColumns: Record<string, TableColumn<MonthlyDistributionTableItem>> = {
  company: {
    key: "company",
    name: "Company",
    sortable: true,
    // width: "150px",
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

  type: {
    key: "type",
    name: "Type",
    sortable: true,
    width: "120px",
    minWidth: "100px",
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

  amount: {
    key: "amount",
    name: "Amount",
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

  interestRate: {
    key: "interestRate",
    name: "Interest Rate",
    sortable: true,
    width: "120px",
    minWidth: "100px",
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

  accruedInterest: {
    key: "accruedInterest",
    name: "Accrued Interest",
    sortable: true,
    width: "140px",
    minWidth: "120px",
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

  paymentDue: {
    key: "paymentDue",
    name: "Payment Due",
    sortable: true,
    width: "120px",
    minWidth: "100px",
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

  status: {
    key: "status",
    name: "Status",
    sortable: true,
    width: "120px",
    minWidth: "100px",
    isSearchable: false,
    isDropdown: true,
    dropdownOptions: [
      { value: 'pending', label: 'Pending' },
      { value: 'paid', label: 'Paid' },
      { value: 'overdue', label: 'Overdue' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'active', label: 'Active' }
    ],
    
    formatter: (value) => {
      if (!value) return 'N/A';
      return String(value);
    },
    cellRenderer: (value): React.ReactElement | null => {
      return React.createElement(StatusBadge, { status: value });
    }
  },

  date: {
    key: "date",
    name: "Date",
    sortable: true,
    width: "120px",
    minWidth: "100px",
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
  }
};

////////////////////////////////////
// Column Arrays: Reference columns by name from allColumns
////////////////////////////////////

/**
 * Helper function to create column arrays from allColumns
 */
function createColumnArray(keys: string[]): TableColumn<MonthlyDistributionTableItem>[] {
  return keys.map(key => allColumns[key]).filter(Boolean) as TableColumn<MonthlyDistributionTableItem>[];
}

/**
 * Columns to display in the table
 * Order determines display order
 */
export const tableColumns = createColumnArray([
  'company',
  'investor',
  'property',
  'type',
  'amount',
  'interestRate',
  'accruedInterest',
  'paymentDue',
  'status',
  'date'
]);

/**
 * Columns to display in the header (same as table columns for now)
 */
export const headerColumns = createColumnArray([
  'company',
  'investor',
  'property',
  'type',
  'amount',
  'interestRate',
  'accruedInterest',
  'paymentDue',
  'status',
  'date'
]);

////////////////////////////////////
// Filter Configuration
////////////////////////////////////

/**
 * Filter configuration object for FilteringWrapper component
 */
export const filterConfig = {
  // Sorting configuration
  initialSortKey: "date" as const,
  
  // Filter dropdown configuration
  autoApplyDropdown: false,
  showBadgesDropdown: true,
  rangeOpen: false,
  
  // Search configuration
  searchPlaceholder: "Search distributions by company, investor, property...",
  searchHighlightStyle: "bg-tertiary text-background font-medium px-0 rounded",
  hideTopLevelFilterSorting: true,
  hideTopLevelFiltering: true,
  
  // Header configuration
  headerColumns: headerColumns,
  
  // Filter controls configuration
  showPill: true,
  showIndependentDateFilter: true,
  
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
  emptyMessage: "No distributions available",
  
  // Loading configuration
  loading: undefined,
  loadingStateShimmer: true,
  
  // Row expansion configuration
  rowExpansion: undefined,
  
  // Action configuration
  actionMode: 'inline' as const,
  
  // Selection and editing
  editableColumns: ['status'],
  
  // Styling configuration
  groupStylerConfig: undefined,
  rowStyler: undefined,
};
