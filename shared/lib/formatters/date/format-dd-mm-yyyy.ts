/**
 * Formats a Date object or ISO string to DD/MM/YYYY format.
 */
export function formatDDMMYYYY(date: Date | string | null | undefined): string {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}
