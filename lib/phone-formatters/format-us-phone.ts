/**
 * US national phone format (XXX-XXX-XXXX) for NANP numbers.
 * Strips non-digits; treats a leading 1 as country code when 11 digits are present.
 */

function digitsOnly(input: string | number): string {
  return String(input).replace(/\D/g, "");
}

/**
 * Formats a value as a US phone number with hyphens (e.g. `415-555-9876`).
 * Supports partial input for progressive display (e.g. while typing).
 */
export function formatUsPhoneNumber(input: string | number): string {
  let d = digitsOnly(input);
  if (d.length === 0) {
    return "";
  }
  if (d.length === 11 && d.startsWith("1")) {
    d = d.slice(1);
  }
  if (d.length > 10) {
    d = d.slice(-10);
  }

  if (d.length <= 3) {
    return d;
  }
  if (d.length <= 6) {
    return `${d.slice(0, 3)}-${d.slice(3)}`;
  }
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}`;
}
