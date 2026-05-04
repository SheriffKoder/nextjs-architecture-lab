/**
 * Format Currency Utility
 * 
 * Purpose: Formats numbers as currency for table display
 * Used in: VirtualizedTable component and format-cell-value utility
 * Why: Provides self-contained currency formatting without external dependencies
 * 
 * Steps:
 * 1. Handle null/undefined values
 * 2. Format number with currency symbol and decimal places
 * 3. Return formatted string
 */

////////////////////////////////////
// Type Definitions: Currency formatting parameters
////////////////////////////////////

/**
 * Currency type for formatting options
 */
export type Currency = "USD" | "EUR" | "GBP" | "CHF" | "CAD" | "AUD" | "JPY";

/**
 * Parameters for currency formatting
 */
interface FormatCurrencyParams {
  // Amount to format
  amount: number;
  // Currency to use (optional, defaults to USD)
  currency?: Currency;
  // Number of decimal places (optional, defaults to 2)
  decimalPlaces?: number;
}

////////////////////////////////////
// Currency Formatting Logic: Format numbers as currency
////////////////////////////////////

/**
 * Formats a number as currency with proper symbol and decimal places
 * Handles null/undefined values and provides consistent formatting
 * 
 * @param {FormatCurrencyParams} params - Formatting parameters
 * @returns {string} Formatted currency string
 * 
 * @example
 * ```tsx
 * const formatted = formatCurrency({ amount: 123.45, currency: "USD" });
 * // Returns: "$123.45"
 * 
 * const formatted = formatCurrency({ amount: 123.45, decimalPlaces: 3 });
 * // Returns: "$123.450"
 * ```
 */
export function formatCurrency({
  amount,
  currency = "USD",
  decimalPlaces = 2
}: FormatCurrencyParams): string {
  // Handle null/undefined values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return currency === "USD" ? "$0.00" : "0.00";
  }

  // Format the number using Intl.NumberFormat for proper localization
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(amount);
}

/**
 * Legacy function signature for backward compatibility
 * 
 * @param {number} amount - Amount to format
 * @param {Currency | number} currencyOrDecimalPlaces - Currency or decimal places
 * @returns {string} Formatted currency string
 * 
 * @example
 * ```tsx
 * const formatted = formatCurrency(123.45, "USD");
 * // Returns: "$123.45"
 * 
 * const formatted = formatCurrency(123.45, 3);
 * // Returns: "$123.450"
 * ```
 */
export function formatCurrencyLegacy(
  amount: number,
  currencyOrDecimalPlaces?: Currency | number
): string {
  // Determine if the second parameter is a currency or decimal places
  if (typeof currencyOrDecimalPlaces === "string") {
    // It's a currency
    return formatCurrency({
      amount,
      currency: currencyOrDecimalPlaces as Currency
    });
  } else {
    // It's decimal places or undefined
    return formatCurrency({
      amount,
      decimalPlaces: currencyOrDecimalPlaces
    });
  }
} 