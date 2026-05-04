/**
 * Utilities for US phone inputs: store raw digits (10 max) while showing XXX-XXX-XXXX.
 */

/**
 * Extracts NANP digits for storage: strips non-digits, drops a leading country `1` when 11 digits,
 * keeps at most 10 digits.
 */
export function parseRawUsPhoneDigits(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) {
    d = d.slice(1);
  }
  return d.slice(0, 10);
}

/**
 * How many digit characters appear in `formatted` strictly before `caretIndex`.
 */
export function digitCountBeforeCaretInFormatted(
  formatted: string,
  caretIndex: number,
): number {
  const head = formatted.slice(0, Math.max(0, caretIndex));
  return head.replace(/\D/g, "").length;
}

/**
 * Caret offset in a `formatUsPhoneNumber` string after `digitCount` digits (0–10).
 */
export function formattedCaretAfterDigitCount(digitCount: number): number {
  const n = Math.max(0, Math.min(10, digitCount));
  if (n <= 3) {
    return n;
  }
  if (n <= 6) {
    return n + 1;
  }
  return n + 2;
}
