export const EXPORT_CSV_LIMIT = 10000;

export function toCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  const keys = Object.keys(data[0]);
  const header = keys.map(escapeCsvCell).join(",");
  const rows = data.map((row) => keys.map((k) => escapeCsvCell(row[k])).join(","));
  return [header, ...rows].join("\r\n");
}

export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
