export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `$${value.toLocaleString()}`;
}
