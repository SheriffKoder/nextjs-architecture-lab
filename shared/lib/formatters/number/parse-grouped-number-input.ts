/**
 * Normalize display text (commas, spaces, stray characters) to a raw numeric string for storage or `Number()`.
 * Allows partial input while typing (`-`, `12.`, `.5`) similar in spirit to `parseRawUsPhoneDigits`.
 */

export type ParseGroupedNumberInputOptions = {
  /** Leading literal stripped once before parsing (pair with formatters), e.g. `"$"`. */
  prefix?: string;
  /** Trailing literal stripped once before parsing (pair with formatters), e.g. `" mi"` or `"/mo"`. */
  suffix?: string;
};

/**
 * True when the integer segment (before `.`) ends with `,` after stripping affixes — user is typing a manual thousands separator (e.g. `$1,` before the next digit group).
 */
export function groupedInputIntegerEndsWithComma(
  input: string,
  options?: ParseGroupedNumberInputOptions,
): boolean {
  let s = input.trim();
  const p = options?.prefix?.trim() ?? "";
  const suf = options?.suffix?.trim() ?? "";
  if (p && s.startsWith(p)) {
    s = s.slice(p.length).trim();
  }
  if (suf && s.endsWith(suf)) {
    s = s.slice(0, -suf.length).trim();
  }
  const dot = s.indexOf(".");
  const intSeg = (dot >= 0 ? s.slice(0, dot) : s).replace(/\s/g, "");
  if (intSeg === "" || intSeg === "-") {
    return false;
  }
  return intSeg.endsWith(",");
}

/**
 * Calculator-style normalization before `Number(...)`: `.5` → `0.5`, `-.5` → `-0.5`, `.` → `0.`, `-.` → `-0.`.
 * `parseRawGroupedNumberInput` already keeps a single `.`; pass its result here.
 */
export function normalizeCalculatorDecimalRaw(raw: string): string {
  if (raw === "" || raw === "-") {
    return raw;
  }
  if (raw === ".") {
    return "0.";
  }
  if (raw === "-.") {
    return "-0.";
  }
  if (raw.startsWith(".")) {
    return `0${raw}`;
  }
  if (raw.startsWith("-.")) {
    return `-0.${raw.slice(2)}`;
  }
  return raw;
}

/**
 * Strips grouping/spaces and keeps an optional leading `-`, digits, and at most one `.` (decimal separator).
 */
export function parseRawGroupedNumberInput(
  input: string,
  options?: ParseGroupedNumberInputOptions,
): string {
  let s = input.trim();
  const p = options?.prefix?.trim() ?? "";
  const suf = options?.suffix?.trim() ?? "";
  if (p && s.startsWith(p)) {
    s = s.slice(p.length).trim();
  }
  if (suf && s.endsWith(suf)) {
    s = s.slice(0, -suf.length).trim();
  }
  const cleaned = s.replace(/,/g, "").replace(/\s/g, "");
  if (cleaned === "") {
    return "";
  }

  let sign = "";
  let pos = 0;
  if (cleaned[0] === "-") {
    sign = "-";
    pos = 1;
  }

  let body = "";
  let dotSeen = false;
  for (; pos < cleaned.length; pos++) {
    const ch = cleaned[pos];
    if (ch >= "0" && ch <= "9") {
      body += ch;
    } else if (ch === "." && !dotSeen) {
      body += ".";
      dotSeen = true;
    }
  }

  if (body === "" && sign === "-") {
    return "-";
  }

  return sign + body;
}

/**
 * Parses grouped input to a finite number, or `null` if empty / incomplete / non-finite.
 */
export function groupedInputToNumber(
  input: string,
  options?: ParseGroupedNumberInputOptions,
): number | null {
  const raw0 = parseRawGroupedNumberInput(input, options);
  if (raw0 === "" || raw0 === "-" || raw0 === "." || raw0 === "-.") {
    return null;
  }
  const raw = normalizeCalculatorDecimalRaw(raw0);
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
