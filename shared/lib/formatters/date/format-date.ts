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
