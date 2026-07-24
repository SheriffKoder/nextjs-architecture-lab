# Formatters

Cross-domain pure display/parse helpers. No React, no I/O.

## Structure

```text
formatters/
├── number/   # grouping, compact, currency, percentage
├── phone/    # US NANP format + raw digit parse
├── date/     # locale short, DD/MM/YYYY, ISO conversion
└── string/   # capitalize helpers
```

## Import

Prefer the domain barrel:

```ts
import { formatGroupedNumber, formatCurrency } from "@/shared/lib/formatters/number";
import { formatUsPhoneNumber } from "@/shared/lib/formatters/phone";
import { formatDate, formatDDMMYYYY } from "@/shared/lib/formatters/date";
import { capitalizeAllFirstLetters } from "@/shared/lib/formatters/string";
```

The root `@/shared/lib/formatters` barrel re-exports everything when a mixed import is convenient.

## Conventions

- Keep **format** and **parse** for the same domain in the same folder.
- One file ≈ one operation (or a tightly related pair).
- Do not put UI or hooks here — those live next to the consuming component (e.g. `shared/ui/inputs/grouped-number-input`).

---

# date

### `convertDateToISO`
Converts `MM-DD-YYYY` → `YYYY-MM-DD`.

```ts
convertDateToISO("03-15-2024") // "2024-03-15"
```

### `formatDate`
ISO / parseable date string → short en-US display. Nullish → `"N/A"`.

```ts
formatDate("2024-03-15") // "Mar 15, 2024"
formatDate(null)         // "N/A"
```

### `formatDDMMYYYY`
`Date` or ISO string → `DD/MM/YYYY`. Invalid / empty → `""`.

```ts
formatDDMMYYYY(new Date(2024, 2, 15)) // "15/03/2024"
formatDDMMYYYY("2024-03-15")          // "15/03/2024"
```

### `parseDDMMYYYY`
`DD/MM/YYYY` string → `Date`, or `null` if invalid.

```ts
parseDDMMYYYY("15/03/2024") // Date(2024, 2, 15)
parseDDMMYYYY("31/02/2024") // null
```

---

# number

### `formatCurrency`
Number → `$`-prefixed locale string. Nullish → `"N/A"`.

```ts
formatCurrency(1234) // "$1,234"
formatCurrency(null) // "N/A"
```

### `formatPercentage`
Fraction (`0–1`) → percent string with 1 decimal. Nullish → `"N/A"`.

```ts
formatPercentage(0.156) // "15.6%"
formatPercentage(null)  // "N/A"
```

### `formatCompactNumber`
Number → short compact label (`K` / `M` / `B`). Optional `prefix` / `suffix`.

```ts
formatCompactNumber(1234)                         // "1.2K"
formatCompactNumber(1_200_000, { prefix: "~" })   // "~1.2M"
```

### `formatGroupedNumber`
Number → thousands-grouped display. Optional `prefix` / `suffix` / fraction digits.

```ts
formatGroupedNumber(1234567)                      // "1,234,567"
formatGroupedNumber(1234.5, { prefix: "$" })      // "$1,234.5"
```

### `formatGroupedInteger`
Same as `formatGroupedNumber` with 0 fraction digits.

```ts
formatGroupedInteger(1234.9) // "1,235"
```

### `appendTrailingThousandsComma`
Appends a trailing `,` on the integer segment (for mid-typing UX).

```ts
appendTrailingThousandsComma("$1", { prefix: "$" }) // "$1,"
```

### `parseRawGroupedNumberInput`
Typed display text → raw numeric string (keeps `-`, digits, one `.`).

```ts
parseRawGroupedNumberInput("$1,234.50", { prefix: "$" }) // "1234.50"
parseRawGroupedNumberInput("12.")                        // "12."
```

### `normalizeCalculatorDecimalRaw`
Calculator-style leading-dot fix before `Number(...)`.

```ts
normalizeCalculatorDecimalRaw(".5")  // "0.5"
normalizeCalculatorDecimalRaw("-.")  // "-0."
```

### `groupedInputToNumber`
Grouped input → finite `number`, or `null` if empty / incomplete.

```ts
groupedInputToNumber("1,234") // 1234
groupedInputToNumber("12.")   // null
```

### `groupedInputIntegerEndsWithComma`
`true` when the integer segment ends with `,` (user typing a thousands separator).

```ts
groupedInputIntegerEndsWithComma("$1,", { prefix: "$" }) // true
```

---

# phone

### `formatUsPhoneNumber`
Digits → US national `XXX-XXX-XXXX` (supports partial input).

```ts
formatUsPhoneNumber("4155559876") // "415-555-9876"
formatUsPhoneNumber("41555")      // "415-55"
```

### `parseRawUsPhoneDigits`
Formatted / messy input → up to 10 NANP digits for storage.

```ts
parseRawUsPhoneDigits("415-555-9876") // "4155559876"
parseRawUsPhoneDigits("1 (415) 555")  // "415555"
```

### `digitCountBeforeCaretInFormatted`
Count of digit chars strictly before `caretIndex` in a formatted string.

```ts
digitCountBeforeCaretInFormatted("415-5", 5) // 4
```

### `formattedCaretAfterDigitCount`
Caret offset in a formatted phone string after `n` digits.

```ts
formattedCaretAfterDigitCount(4) // 5  // after "415-5"
```

---

# string

### `capitalizeFirstLetter`
Capitalizes the first character of a string.

```ts
capitalizeFirstLetter("hello") // "Hello"
```

### `capitalizeAllFirstLetters`
Capitalizes the first letter of each space-separated word.

```ts
capitalizeAllFirstLetters("hello world") // "Hello World"
```
