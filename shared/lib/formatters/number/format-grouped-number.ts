/**
 * Thousands grouping (e.g. en-US commas: `1,234,567`) for display and re-formatting typed values.
 * Complements `parseRawGroupedNumberInput` — same idea as `formatters/phone` (format vs raw parse).
 */

function stripGroupingAndSpaces(input: string): string {
  return input.replace(/,/g, "").replace(/\s/g, "");
}

/** Strips optional leading `prefix` / trailing `suffix`, then grouping spaces/commas, for string → number. */
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

export type FormatGroupedNumberOptions = {
  locale?: string;
  /** Prepended when the numeric result is non-empty (e.g. `"$"` → `$1,234`). */
  prefix?: string;
  /** Appended when the numeric result is non-empty (e.g. `" mi"` → `1,234 mi`). */
  suffix?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

/**
 * Formats a finite number with grouping. Numeric strings are accepted; commas/spaces are ignored before parsing.
 */
export function formatGroupedNumber(
  value: number | string | null | undefined,
  options?: FormatGroupedNumberOptions,
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

  const formatted = new Intl.NumberFormat(locale, {
    useGrouping: true,
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits:
      options?.maximumFractionDigits ?? (Number.isInteger(raw) ? 0 : 20),
  }).format(raw);

  return `${prefix}${formatted}${suffix}`;
}

/**
 * After `formatGroupedNumber` / `formatGroupedInteger`, append one `,` after the Intl numeric segment when the user typed a trailing comma on the integer part (before `.`), so `$1` becomes `$1,` while they continue typing.
 */
export function appendTrailingThousandsComma(
  formatted: string,
  options?: Pick<FormatGroupedNumberOptions, "prefix" | "suffix">,
): string {
  if (!formatted) {
    return formatted;
  }
  const prefix = options?.prefix ?? "";
  const suffix = options?.suffix ?? "";
  if (!prefix && !suffix) {
    if (formatted.includes(".")) {
      return formatted;
    }
    if (formatted.endsWith(",")) {
      return formatted;
    }
    return `${formatted},`;
  }
  if (prefix && !formatted.startsWith(prefix)) {
    return formatted;
  }
  if (suffix && !formatted.endsWith(suffix)) {
    return formatted;
  }
  const core = formatted.slice(
    prefix.length,
    suffix ? formatted.length - suffix.length : undefined,
  );
  if (core.includes(".")) {
    return formatted;
  }
  if (core.endsWith(",")) {
    return formatted;
  }
  return `${prefix}${core},${suffix}`;
}

/**
 * Integer grouping only (`1234567` → `1,234,567`).
 */
export function formatGroupedInteger(
  value: number | string | null | undefined,
  options?: Pick<FormatGroupedNumberOptions, "locale" | "prefix" | "suffix">,
): string {
  return formatGroupedNumber(value, {
    locale: options?.locale,
    prefix: options?.prefix,
    suffix: options?.suffix,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * `TableColumn` / `EditableCell`: show and edit with thousands separators while persisting a number.
 */
export type EditableGroupedNumberConfig = Pick<
  FormatGroupedNumberOptions,
  | "locale"
  | "prefix"
  | "suffix"
  | "minimumFractionDigits"
  | "maximumFractionDigits"
> & {
  /** When true, decimals use `formatGroupedNumber` (calculator-style `.` entry). Default = integers only. */
  allowDecimals?: boolean;
  /** Hard cap on digits after `.` while typing (e.g. `2` for cents). */
  maxDecimalPlaces?: number;
};
