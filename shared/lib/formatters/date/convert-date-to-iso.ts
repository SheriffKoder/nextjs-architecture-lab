/**
 * Converts MM-DD-YYYY date string to ISO format (YYYY-MM-DD)
 * @param dateStr - Date string in MM-DD-YYYY format
 * @returns ISO format date string (YYYY-MM-DD)
 */
export function convertDateToISO(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateStr; // Return as-is if format is unexpected
}
