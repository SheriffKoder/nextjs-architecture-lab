/**
 * Compact “thousand / million” style labels via `Intl` (`12K`, `1.2M`, `5B`) for dense UI.
 * For full-precision display with commas, use `formatGroupedNumber` instead.
 */

export type FormatCompactNumberOptions = {
  locale?: string;
  maximumFractionDigits?: number;
  /** Prepended when the compact value is non-empty (e.g. `"~"` or currency symbol). */
  prefix?: string;
  /** Appended when the compact value is non-empty (e.g. `"+"` or `" pts"`). */
  suffix?: string;
};

function stripGroupingAndSpaces(input: string): string {
  return input.replace(/,/g, "").replace(/\s/g, "");
}

function stripAffixedNumericString(
  value: string,
  prefix?: string,
  suffix?: string,
): string {
  let s = value.trim();
  const p = prefix?.trim() ?? "";
  const suf = suffix?.trim() ?? "";
  if (p && s.startsWith(p)) {
    s = s.slice(p.length).trim();
  }
  if (suf && s.endsWith(suf)) {
    s = s.slice(0, -suf.length).trim();
  }
  return stripGroupingAndSpaces(s);
}

/**
 * `1234` → `1.2K` (en-US short compact). Non-finite / empty → `""`.
 */
export function formatCompactNumber(
  value: number | string | null | undefined,
  options?: FormatCompactNumberOptions,
): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const prefix = options?.prefix ?? "";
  const suffix = options?.suffix ?? "";

  const raw =
    typeof value === "number"
      ? value
      : Number(
          stripAffixedNumericString(String(value), prefix, suffix),
        );

  if (!Number.isFinite(raw)) {
    return "";
  }

  const locale = options?.locale ?? "en-US";
  const maximumFractionDigits = options?.maximumFractionDigits ?? 1;

  const formatted = new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits,
  }).format(raw);

  return `${prefix}${formatted}${suffix}`;
}
