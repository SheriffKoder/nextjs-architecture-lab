export function parseDDMMYYYY(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;

  const parts = dateString.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  // Validate the date (e.g., 31/02/2024 would be invalid)
  if (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  ) {
    return date;
  }

  return null;
}
