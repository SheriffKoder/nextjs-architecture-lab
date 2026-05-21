export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `$${value.toLocaleString()}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "N/A";
  try {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeAllFirstLetters(str: string): string {
  return str.split(" ").map(capitalizeFirstLetter).join(" ");
}

// Format percentage values
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A'
  return `${(value * 100).toFixed(1)}%`
}


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


/**
 * Converts MM-DD-YYYY date string to ISO format (YYYY-MM-DD)
 * @param dateStr - Date string in MM-DD-YYYY format
 * @returns ISO format date string (YYYY-MM-DD)
 */
export function convertDateToISO(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr; // Return as-is if format is unexpected
}