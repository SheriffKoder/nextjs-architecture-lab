/*
 * Grouped number input — apply keystroke change
 *
 * Purpose: Derive the next display string from the input string after each keystroke for grouped numeric fields.
 * Used in: components/grouped-number-input/use-grouped-number-input.ts
 * Used for: Live formatting (prefix/suffix, thousands separators, decimals, user-typed trailing comma) before commit.
 *
 * Function Index:
 * applyGroupedNumberInputChange(next, config): formatted string to show in the controlled input
 * Example input: next = "$12.3", config with prefix "$" and allowDecimals true
 * Example output: "$12.30" or partial forms per rules (e.g. trailing "$12." preserved when applicable)
 *
 * Steps:
 * 1. Build parse options, live format options (strip minimumFractionDigits while typing), and trailing-comma helper.
 * 2. If allowDecimals: parse → normalize calculator decimals → cap fraction length → handle lone trailing dot → else format number.
 * 3. Else: integer-only path — parse int segment, truncate, format with grouping.
 */

import type { EditableGroupedNumberConfig } from "@/shared/lib/formatters/number";
import {
  appendTrailingThousandsComma,
  formatGroupedInteger,
  formatGroupedNumber,
} from "@/shared/lib/formatters/number";
import {
  groupedInputIntegerEndsWithComma,
  normalizeCalculatorDecimalRaw,
  parseRawGroupedNumberInput,
} from "@/shared/lib/formatters/number";

/**
 * Computes the next visible input string after the user typed `next`.
 * @param next - Raw input value from the field (may include prefix/suffix from user paste).
 * @param config - Column-style grouped number options (align with `EditableGroupedNumberConfig`).
 */
export function applyGroupedNumberInputChange(
  next: string,
  config: EditableGroupedNumberConfig,
): string {
  ///////////////////////////////////////////////////////////////
  // 1. Config slices: affixes for parsing; live Intl omits minimumFractionDigits so "$12." does not jump to "$12.00".
  const { allowDecimals, maxDecimalPlaces, ...fmtOpts } = config;
  const liveFmt = (() => {
    const { minimumFractionDigits, ...rest } = fmtOpts;
    void minimumFractionDigits;
    return rest;
  })();
  const parseOpts = {
    prefix: config.prefix,
    suffix: config.suffix,
  };
  const affixPick = {
    prefix: config.prefix,
    suffix: config.suffix,
  };
  const withTrailingTypedComma = (formatted: string) =>
    groupedInputIntegerEndsWithComma(next, parseOpts)
      ? appendTrailingThousandsComma(formatted, affixPick)
      : formatted;

  if (allowDecimals) {
    ///////////////////////////////////////////////////////////////
    // 2. Decimal branch: partial states, calculator ".", max fraction digits, then full format.
    const raw0 = parseRawGroupedNumberInput(next, parseOpts);
    if (raw0 === "" || raw0 === "-") {
      return raw0;
    }
    let raw = normalizeCalculatorDecimalRaw(raw0);

    if (raw.includes(".") && maxDecimalPlaces !== undefined) {
      const [iPart, fPart = ""] = raw.split(".");
      if (fPart.length > maxDecimalPlaces) {
        raw = `${iPart}.${fPart.slice(0, maxDecimalPlaces)}`;
      }
    }

    const trailingDotOnly =
      raw.endsWith(".") && (raw.match(/\./g) ?? []).length === 1;

    if (trailingDotOnly) {
      const head = raw.slice(0, -1);
      const n = Number(head);
      if (head === "" || head === "-" || !Number.isFinite(n)) {
        return next;
      }
      const base = formatGroupedNumber(n, liveFmt);
      return base.includes(".") ? base : `${base}.`;
    }

    const n = Number(raw);
    if (!Number.isFinite(n)) {
      return next;
    }
    return withTrailingTypedComma(formatGroupedNumber(n, liveFmt));
  }

  ///////////////////////////////////////////////////////////////
  // 3. Integer branch: ignore fractional part, truncate, re-apply grouping (+ trailing comma if user ended int with ",").
  const raw = parseRawGroupedNumberInput(next, parseOpts);
  if (raw === "" || raw === "-") {
    return raw;
  }
  const intSeg = raw.split(".")[0] ?? "";
  if (intSeg === "" || intSeg === "-") {
    return intSeg === "-" ? "-" : "";
  }
  const n = Number(intSeg);
  if (!Number.isFinite(n)) {
    return next;
  }
  return withTrailingTypedComma(formatGroupedInteger(Math.trunc(n), fmtOpts));
}
