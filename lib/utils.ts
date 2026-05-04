import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/lib/supabase/server";
import { RoleEnum } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Parses a date string in DD/MM/YYYY format to a Date object.
 * Returns null if the format is invalid.
 */
export function parseDDMMYYYY(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const year = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  
  // Validate the date (e.g., 31/02/2024 would be invalid)
  if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
    return date;
  }
  
  return null;
}

/**
 * Formats a Date object or ISO string to DD/MM/YYYY format.
 */
export function formatDDMMYYYY(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeAllFirstLetters(str: string) {
  return str.split(' ').map(word => capitalizeFirstLetter(word)).join(' ');
}

/**
 * Utility functions for mapping column keys to API filter parameter names
 */

/**
 * Maps a column key to the corresponding API search parameter name for string filters
 * @param columnKey - The column key from the table config
 * @returns The API parameter name for string search, or null if not a string filter
 */
export function getStringFilterParam(columnKey: string): string | null {

  // For other string filters, use the column key with _search suffix
  // Common string filter columns: address, status, etc.
  return `${columnKey}_search`;
}

/**
 * Maps a column key to the corresponding API filter parameter names for number range filters
 * @param columnKey - The column key from the table config (e.g., "after_repair_value", "mortgage_amount")
 * @returns Object with 'from' and 'to' parameter names, or null if not a number filter
 */
export function getNumberFilterParams(columnKey: string): { from: string; to: string } | null {
  // Generate parameter names directly from column key
  // Format: {columnKey}_filter_from and {columnKey}_filter_to
  return {
    from: `${columnKey}_filter_from`,
    to: `${columnKey}_filter_to`,
  };
}

/**
 * Maps a column key to the corresponding API filter parameter names for date range filters
 * @param columnKey - The column key from the table config (e.g., "purchase_closing_date", "sale_date")
 * @returns Object with 'start' and 'end' parameter names, or null if not a date filter
 */
export function getDateFilterParams(columnKey: string): { start: string; end: string } | null {
  // Special mappings for date columns that have different API parameter names
  const specialMappings: Record<string, { start: string; end: string }> = {
    'purchase_closing_date': { start: 'purchase_date_filter_start', end: 'purchase_date_filter_end' },
  };
  
  // If there's a special mapping, use it
  if (specialMappings[columnKey]) {
    return specialMappings[columnKey];
  }
  
  // For other date filters, generate from column key
  // Format: {columnKey}_filter_start and {columnKey}_filter_end
  return {
    start: `${columnKey}_filter_start`,
    end: `${columnKey}_filter_end`,
  };
}

/**
 * Converts filter items to API parameters based on column key and type
 * @param columnKey - The column key from the table config (e.g., "after_repair_value", "address")
 * @param items - Array of filter values (for text: array of strings, for range: [start, end])
 * @param type - The filter type: 'text', 'number', or 'date'
 * @param columnConfig - Optional column configuration with custom API parameter mapping
 * @returns Object with API parameter names as keys and values
 */
export function convertFilterToApiParams(
  columnKey: string,
  items: string[],
  type: string,
  columnConfig?: {
    filterApiParams?: {
      text?: string;
      number?: { from: string; to: string };
      date?: { start: string; end: string };
      isArray?: boolean;
      valueField?: 'id' | 'item';
    };
  }
): Record<string, string | number | string[]> {
  const params: Record<string, string | number | string[]> = {};
  
  if (type === 'text') {
    // Check for custom API parameter mapping first
    const customParam = columnConfig?.filterApiParams?.text;
    const stringParam = customParam || getStringFilterParam(columnKey);
    
    if (stringParam && items.length > 0) {
      // If isArray is true, send as array; otherwise send as comma-separated string or first item
      if (columnConfig?.filterApiParams?.isArray) {
        // For array parameters, send the full array
        params[stringParam] = items;
      } else {
        // For single value parameters, use first selection
        params[stringParam] = items[0];
      }
    }
  } else if (type === 'number') {
    // Check for custom API parameter mapping first
    const customParams = columnConfig?.filterApiParams?.number;
    const numberParams = customParams || getNumberFilterParams(columnKey);
    
    if (numberParams && items.length >= 2) {
      const from = items[0];
      const to = items[1];
      if (from && from.trim()) {
        params[numberParams.from] = Number(from);
      }
      if (to && to.trim()) {
        params[numberParams.to] = Number(to);
      }
    }
  } else if (type === 'date') {
    // Check for custom API parameter mapping first
    const customParams = columnConfig?.filterApiParams?.date;
    const dateParams = customParams || getDateFilterParams(columnKey);
    
    if (dateParams && items.length >= 2) {
      const start = items[0];
      const end = items[1];
      if (start && start.trim()) {
        // Convert MM-DD-YYYY to ISO format
        params[dateParams.start] = convertDateToISO(start);
      }
      if (end && end.trim()) {
        params[dateParams.end] = convertDateToISO(end);
      }
    }
  }
  
  return params;
}

/**
 * Converts MM-DD-YYYY date string to ISO format (YYYY-MM-DD)
 * @param dateStr - Date string in MM-DD-YYYY format
 * @returns ISO format date string (YYYY-MM-DD)
 */
function convertDateToISO(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr; // Return as-is if format is unexpected
}

/**
 * Converts a params object to URLSearchParams
 * Handles arrays (joins with comma), numbers (converts to string), and other types
 * @param params - Object with query parameters
 * @returns URLSearchParams instance
 */
export function buildQueryParams(params?: Record<string, any>): URLSearchParams {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        let stringValue: string;
        if (Array.isArray(value)) {
          stringValue = value.join(',');
        } else if (typeof value === 'number') {
          stringValue = value.toString();
        } else if (typeof value === 'boolean') {
          stringValue = value.toString();
        } else {
          stringValue = String(value);
        }
        queryParams.append(key, stringValue);
      }
    });
  }
  
  return queryParams;
}

/**
 * Check if the user has an internal admin or user role
 */
export function isInternalAdminOrUser(user: any) {
  if (!user || !user.org_memberships) return false;
  
  return user.org_memberships.some((membership: any) => 
    Array.isArray(membership.org?.org_types) &&
    membership.org.org_types.includes('internal') &&
    (membership.role.key === RoleEnum.ADMIN || membership.role.key === RoleEnum.USER)
  );
}


/**
 * Check if the user is an internal admin
 */
export function isInternalAdmin(user: any) {
  if (!user || !user.org_memberships) return false;
  
  return user.org_memberships.some((membership: any) => 
    Array.isArray(membership.org?.org_types) &&
    membership.org.org_types.includes('internal') &&
    membership.role.key === RoleEnum.ADMIN
  );
}

/**
 * Check if the user is an internal admin
 */
export function isInternalUser(user: any) {
  if (!user || !user.org_memberships) return false;
  
  return user.org_memberships.some((membership: any) => 
    Array.isArray(membership.org?.org_types) &&
    membership.org.org_types.includes('internal') &&
    membership.role.key === RoleEnum.USER
  );
}