/**
 * Project Board Table Configuration
 * 
 * Purpose: Defines column structure and formatting for project board virtualized table
 * Used in: Project board page with VirtualizedTable component
 * Why: Provides consistent column definitions with proper formatting
 * 
 * Columns: Address, Owner, Lender, ARV, Mortgage, Investor Total Equity, Leverage %, Status
 */

import React from "react";
import { TableColumn } from "@/features/filtering-wrapper-multi-display/types";
import { Project } from "@/lib/types";
import { StatusBadge } from "@/features/filtering-wrapper-multi-display/features/virtualized-table/components/rows/cell-status-badge";
import { ProjectStatusEnum } from "@/lib/constants";
import { capitalizeAllFirstLetters } from "@/lib/utils";

/**
 * Project board data type for table items
 * Based on Project type from lib/types.ts
 */
export interface ProjectBoardTableItem extends Project {
  // Owner and Lender can be derived from allocations or company
  // For now, we'll use placeholders that can be populated from data
  owner?: string | null;
  lender?: string | null;
  titleCompany?: string | null;
}

////////////////////////////////////
// Centralized Column Definitions: All columns defined once
////////////////////////////////////

/**
 * Centralized column definitions for project board table
 * All columns are defined here and can be referenced by name
 */
export const allColumns: Record<string, TableColumn<ProjectBoardTableItem>> = {
  address: {
    key: "address",
    name: "Address",
    sortable: true,
    width: "250px",
    minWidth: "200px",
    headerWidth: "282px", // 250px + 32px
    headerMinWidth: "232px", // 200px + 32px
    isSearchable: true,
    sticky: true,
    stickyPosition: 0,
    fixedWidth: 250,
    isSearchFilter: true,
    filterApiParams: {
      text: 'address_search',
      isArray: false,
    },
    formatter: (value) => {
      if (value === null || value === undefined) return 'No address';
      return String(value);
    },
    cellRenderer: (value): React.ReactElement | null => {
      const displayAddress = value === null || value === undefined ? 'No address' : String(value);
      return React.createElement('div', {
        className: 'TableTextClass font-semibold'
      }, displayAddress);
    },
  },

  owner: {
    key: "owner",
    name: "Owner",
    sortable: true,
    width: "150px",
    minWidth: "120px",
    isSearchable: true,
    uniqueValues: { key: "company_unique_values" },
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
    },
    // getDropdownItems: async (columnKey: string) => {
    //   const apiUrl = `/api/companies?limit=1000`;
    //   try {
    //     const response = await fetch(apiUrl);
    //     if (!response.ok) {
    //       throw new Error(`Failed to fetch dropdown items: ${response.statusText}`);
    //     }
    //     const result = await response.json();
    //     // Map companies to the format expected by the filter component: [{ id: string, item: string, count?: number }]
    //     // We use the company name as the 'item' value for display, and include the id for data tracking
    //     return (result.data || []).map((company: { id: string, name: string, projects_count?: number }) => ({
    //       id: company.id,
    //       item: company.name,
    //     }));
    //   } catch (error) {
    //     console.error(`Error fetching dropdown items for ${columnKey}:`, error);
    //     return [];
    //   }
    // },
    filterApiParams: {
      text: 'company_ids',
      isArray: true,
      valueField: 'id'
    }
  },

  lender: {
    key: "lender",
    name: "Lender",
    sortable: true,
    width: "150px",
    minWidth: "120px",
    isSearchable: true,
    uniqueValues: { key: "lender_unique_values" },
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
    },
    getDropdownItems: async (columnKey: string) => {
      const apiUrl = `/api/orgs?limit=1000&org_type=lender&includeAdmins=true`;
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch dropdown items: ${response.statusText}`);
        }
        const result = await response.json();
        // Map organizations to the format expected by the filter component: [{ id: string, item: string }]
        // Use the admin member's ID and name, or fall back to org ID and name
        return (result.data || []).map((org: { id: string, name: string, members: { id: string, name: string }[] }) => ({
          id: org.members?.[0]?.id || org.id,
          item: org.members?.[0]?.name || org.name,
        }));
      } catch (error) {
        console.error(`Error fetching dropdown items for ${columnKey}:`, error);
        return [];
      }
    },
    filterApiParams: {
      text: 'lender_ids',
      isArray: true,
      valueField: 'id'
    }
  },

  arv: {
    key: "after_repair_value",
    name: "ARV",
    sortable: true,
    width: "120px",
    minWidth: "100px",
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
    },
    filterApiParams: {
      number: {
        from: 'after_repair_value_filter_from',
        to: 'after_repair_value_filter_to'
      }
    }
  },

  mortgage: {
    key: "mortgage_amount",
    name: "Mortgage",
    sortable: true,
    width: "120px",
    minWidth: "100px",
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
    },
    filterApiParams: {
      number: {
        from: 'mortgage_amount_filter_from',
        to: 'mortgage_amount_filter_to'
      }
    }
  },

  investorTotalEquity: {
    key: "investor_capital",
    name: "Investor Total Equity",
    sortable: true,
    width: "160px",
    minWidth: "140px",
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
    },
    filterApiParams: {
      number: {
        from: 'investor_capital_filter_from',
        to: 'investor_capital_filter_to'
      }
    }
  },

  leveragePercentage: {
    key: "leverage_percentage",
    name: "Leverage %",
    sortable: true,
    width: "120px",
    minWidth: "100px",
    isSearchable: false,
    isNumberField: true,
    formatter: (value) => {
      if (value === null || value === undefined) return '0%';
      return `${(Number(value) * 100).toFixed(1)}%`;
    },
    cellRenderer: (value): React.ReactElement | null => {
      const displayValue = value === null || value === undefined 
        ? '0%' 
        : `${(Number(value) * 100).toFixed(1)}%`;
      return React.createElement('div', {
        className: 'TableTextClass'
      }, displayValue);
    },
    filterApiParams: {
      number: {
        from: 'leverage_percentage_filter_from',
        to: 'leverage_percentage_filter_to'
      }
    }
  },

  status: {
    key: "status",
    name: "Status",
    sortable: true,
    width: "150px",
    minWidth: "130px",
    isSearchable: false,
    isDropdown: true,
    dropdownOptions: Object.values(ProjectStatusEnum).map((status) => ({ value: status, label: capitalizeAllFirstLetters(status) })),
    cellRenderer: (value): React.ReactElement | null => {
      return React.createElement(StatusBadge, { status: value });
    },

    uniqueValues: { key: "status_unique_values", formatter: (v) => capitalizeAllFirstLetters(v) },
    getDropdownItems: async (columnKey: string) => {
      return Object.values(ProjectStatusEnum).map((status) => ({ 
        item: capitalizeAllFirstLetters(status) as string
      }));
    },
    filterApiParams: {
      text: 'status',
      isArray: true,
      valueField: 'item'
    }
  },

  titleCompany: {
    key: "titleCompany",
    name: "Title Company",
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
  },

  closingDate: {
    key: "purchase_closing_date",
    name: "Closing Date",
    sortable: true,
    width: "140px",
    minWidth: "120px",
    isSearchable: false,
    isDateField: true,
    formatter: (value) => {
      if (!value) return 'N/A';
      // Format date from YYYY-MM-DD to MM/DD/YYYY
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'N/A';
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    },
    cellRenderer: (value): React.ReactElement | null => {
      if (!value) {
        return React.createElement('span', {
          className: 'TableTextClass italic'
        }, 'N/A');
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return React.createElement('span', {
          className: 'TableTextClass italic'
        }, 'N/A');
      }
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      const displayValue = `${month}/${day}/${year}`;
      return React.createElement('div', {
        className: 'TableTextClass'
      }, displayValue);
    }
  }
};

////////////////////////////////////
// Column Arrays: Reference columns by name from allColumns
////////////////////////////////////

/**
 * Helper function to create column arrays from allColumns
 */
function createColumnArray(keys: string[]): TableColumn<ProjectBoardTableItem>[] {
  return keys.map(key => allColumns[key]).filter(Boolean) as TableColumn<ProjectBoardTableItem>[];
}

/**
 * Columns to display in the table
 * Order determines display order
 */
export const tableColumns = createColumnArray([
  'address',
  'owner',
  'lender',
  'titleCompany',
  'closingDate',
  'arv',
  'mortgage',
  'investorTotalEquity',
  'leveragePercentage',
  'status'
]);

/**
 * Columns to display in the header (same as table columns for now)
 */
export const headerColumns = createColumnArray([
  'address',
  'owner',
  'lender',
  'titleCompany',
  'closingDate',
  'arv',
  'mortgage',
  'investorTotalEquity',
  'leveragePercentage',
  'status'
]);

////////////////////////////////////
// Filter Configuration
////////////////////////////////////

/**
 * Filter configuration object for FilteringWrapper component
 */
export const filterConfig = {
  // Sorting configuration
  initialSortKey: "address" as const,
  
  // Filter dropdown configuration
  autoApplyDropdown: false,
  showBadgesDropdown: true,
  rangeOpen: false,
  
  // Search configuration
  searchPlaceholder: "Search projects by address, owner, lender, title company...",
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
  itemsPerPage: 1000,
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
  emptyMessage: "No projects available",
  
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
