# Grouped number input

Documentation for this folder follows the file-header pattern in `app/development/project-guidelines.js` (Name, Purpose, Used in, Used for, Function Index, Steps).

Thousands separators, optional prefix/suffix (`$`, ` mi`), calculator-style decimals, and manual trailing commas while typing—aligned with `utils/number-formatters` and table `EditableCell` behavior.

## `GroupedNumberInput` (forms)

Numeric `value` is controlled by the parent; the input keeps an internal formatted string. Commit on **blur** (or submit) with `commitGroupedNumberInput`:

```tsx
"use client";

import { useRef, useState } from "react";
import {
  GroupedNumberInput,
  commitGroupedNumberInput,
  type EditableGroupedNumberConfig,
} from "@/components/grouped-number-input";

const config: EditableGroupedNumberConfig = {
  prefix: "$",
  allowDecimals: true,
  maxDecimalPlaces: 2,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

export function PriceField() {
  const [amount, setAmount] = useState(99.5);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <GroupedNumberInput
      ref={ref}
      value={amount}
      groupedNumber={config}
      className="w-full rounded border px-2 py-1"
      onBlur={() => {
        const n = commitGroupedNumberInput(ref.current?.value ?? "", config);
        if (n !== null) setAmount(n);
      }}
    />
  );
}
```

## `useGroupedNumberInput` (custom markup)

Use when you render your own `<input>` or embed in a table cell. Variants: `"grouped"` | `"plainNumber"` | `"text"`.

```tsx
const { inputValue, onChange, resetInput } = useGroupedNumberInput({
  value: row.price,
  variant: "grouped",
  groupedNumber: columnConfig,
});
// resetInput() on cancel or invalid save
```

## Read-only display

```tsx
import { formatGroupedFieldValue } from "@/components/grouped-number-input";

formatGroupedFieldValue(1234.5, { prefix: "$", allowDecimals: true, maximumFractionDigits: 2 });
```

## Low-level helpers

- `applyGroupedNumberInputChange(next, config)` — one keystroke’s worth of display string (tests / advanced wiring).
- `commitPlainNumericInput(text)` — plain numeric text field (no grouping).
