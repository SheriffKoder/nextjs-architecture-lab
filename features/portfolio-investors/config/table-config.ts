/**
 * Investors Table Configuration
 * 
 * Purpose: Defines column structure and formatting for investors virtualized table
 * Used in: Investors page with VirtualizedTable component
 * Why: Provides consistent column definitions with proper formatting
 * 
 * Columns: Name, Email, Total Invested, Projects count, Next maturity Date
 */

import React from "react";
import { TableColumn } from "@/features/filtering-wrapper-multi-display/types";
import { User, Allocation } from "@/lib/types";

/**
 * Investor table data type for table items
 * Based on User type from lib/types.ts with calculated fields
 */
export interface InvestorTableItem extends User {
  // Link back to the investor org (when row is from orgs API)
  org_id?: string | null;
  // Calculated fields from allocations
  totalInvested?: number | null;
  projectsCount?: number | null;
  noteMaturityDate?: string | null;
  allocations?: Allocation[];
}

////////////////////////////////////
// Centralized Column Definitions: All columns defined once
////////////////////////////////////

/**
 * Centralized column definitions for investors table
 * All columns are defined here and can be referenced by name
 */
export const allColumns: Record<string, TableColumn<InvestorTableItem>> = {
  name: {
    key: "name",
    name: "Name",
    sortable: true,
    // width: "200px",
    minWidth: "150px",
    isSearchable: true,
    sticky: true,
    stickyPosition: 0,
    fixedWidth: 200,
    formatter: (value) => {
      if (value === null || value === undefined) return 'No name';
      return String(value);
    },
    cellRenderer: (value): React.ReactElement | null => {
      const displayName = value === null || value === undefined ? 'No name' : String(value);
      return React.createElement('div', {
        className: 'TableTextClass'
      }, displayName);
    },
    getDropdownItems: async (columnKey: string) => {
      // Dummy data for testing
      return [
        { "item": "John Doe", "count": 5 },
        { "item": "Jane Smith", "count": 3 },
        { "item": "Bob Johnson", "count": 8 }
      ];
      
      // Uncomment below when ready to use real API
      // const apiUrl = `/api/investors/${columnKey}`;
      // try {
      //   const response = await fetch(apiUrl);
      //   if (!response.ok) {
      //     throw new Error(`Failed to fetch dropdown items: ${response.statusText}`);
      //   }
      //   const data = await response.json();
      //   return data;
      // } catch (error) {
      //   console.error(`Error fetching dropdown items for ${columnKey}:`, error);
      //   return [];
      // }
    }
  },

  email: {
    key: "email",
    name: "Email",
    sortable: true,
    // width: "250px",
    minWidth: "200px",
    isSearchable: true,
    formatter: (value) => {
      if (value === null || value === undefined) return 'No email';
      return String(value);
    },
    cellRenderer: (value): React.ReactElement | null => {
      if (!value) {
        return React.createElement('span', {
          className: 'TableTextClass italic'
        }, 'No email');
      }
      return React.createElement('div', {
        className: 'TableTextClass'
      }, String(value));
    },
    // getDropdownItems: async (columnKey: string) => {
    //   const apiUrl = `/api/investors/${columnKey}`; // Use column key in URL path
    //   try {
    //     const response = await fetch(apiUrl);
    //     if (!response.ok) {
    //       throw new Error(`Failed to fetch dropdown items: ${response.statusText}`);
    //     }
    //     const data = await response.json();
    //     return data; // Expecting array of objects: [{ item: string | number, count: number }, ...]
    //   } catch (error) {
    //     console.error(`Error fetching dropdown items for ${columnKey}:`, error);
    //     return [];
    //   }
    // }
  },

  totalInvested: {
    key: "totalInvested",
    name: "Total Invested",
    sortable: true,
    // width: "150px",
    minWidth: "130px",
    isSearchable: false,
    isNumberField: true,
    formatter: (value) => {
      if (value === null || value === undefined) return '$0';
      return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    },
    cellRenderer: (value): React.ReactElement | null => {
      const displayValue = value === null || value === undefined 
        ? '$0' 
        : `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      return React.createElement('div', {
        className: 'TableTextClass'
      }, displayValue);
    }
  },

  projectsCount: {
    key: "projectsCount",
    name: "Projects count",
    sortable: true,
    // width: "130px",
    minWidth: "110px",
    isSearchable: false,
    isDateField: true,
    formatter: (value) => {
      if (value === null || value === undefined) return '0';
      return String(value);
    },
    cellRenderer: (value): React.ReactElement | null => {
      const displayValue = value === null || value === undefined ? '0' : String(value);
      return React.createElement('div', {
        className: 'TableTextClass'
      }, displayValue);
    }
  },

  // noteMaturityDate: {
  //   key: "noteMaturityDate",
  //   name: "Note Maturity Date",
  //   sortable: true,
  //   // width: "180px",
  //   minWidth: "150px",
  //   isSearchable: false,
  //   isDateField: true,
  //   formatter: (value) => {
  //     if (value === null || value === undefined) return 'N/A';
  //     try {
  //       const date = new Date(value);
  //       return date.toLocaleDateString('en-US', { 
  //         year: 'numeric', 
  //         month: 'short', 
  //         day: 'numeric' 
  //       });
  //     } catch {
  //       return 'Invalid date';
  //     }
  //   },
  //   cellRenderer: (value): React.ReactElement | null => {
  //     if (!value) {
  //       return React.createElement('span', {
  //         className: 'TableTextClass italic'
  //       }, 'N/A');
  //     }
  //     try {
  //       const date = new Date(value);
  //       const displayValue = date.toLocaleDateString('en-US', { 
  //         year: 'numeric', 
  //         month: 'short', 
  //         day: 'numeric' 
  //       });
  //       return React.createElement('div', {
  //         className: 'TableTextClass'
  //       }, displayValue);
  //     } catch {
  //       return React.createElement('span', {
  //         className: 'TableTextClass italic'
  //       }, 'Invalid date');
  //     }
  //   }
  // }
};

////////////////////////////////////
// Column Arrays: Reference columns by name from allColumns
////////////////////////////////////

/**
 * Helper function to create column arrays from allColumns
 */
function createColumnArray(keys: string[]): TableColumn<InvestorTableItem>[] {
  return keys.map(key => allColumns[key]).filter(Boolean) as TableColumn<InvestorTableItem>[];
}

/**
 * Columns to display in the table
 * Order determines display order
 */
export const tableColumns = createColumnArray([
  'name',
  'email',
  'totalInvested',
  'projectsCount'
]);

/**
 * Columns to display in the header (same as table columns for now)
 */
export const headerColumns = createColumnArray([
  'name',
  'email',
  'totalInvested',
  'projectsCount'
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
  searchPlaceholder: "Search investors by name, email...",
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
  emptyMessage: "No investors available",
  
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
