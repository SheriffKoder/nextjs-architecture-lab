# Grouped number input

Thousands separators, optional prefix/suffix (`$`, ` mi`), calculator-style decimals, and manual trailing commas while typing — aligned with `@/shared/lib/formatters/number` and table `EditableCell` behavior.

## Import

```ts
import {
  GroupedNumberInput,
  useGroupedNumberInput,
  commitGroupedNumberInput,
  formatGroupedFieldValue,
  type EditableGroupedNumberConfig,
} from '@/shared/ui/inputs/grouped-number-input'
```

Prefer the barrel. Do not deep-import `ui/`, `hooks/`, or `lib/` from outside this unit.

## Structure

```text
grouped-number-input/
├── index.ts
├── ui/                 # GroupedNumberInput component
├── hooks/              # useGroupedNumberInput
└── lib/                # apply / commit / format helpers
```

## `GroupedNumberInput` (forms)

Numeric `value` is controlled by the parent; the input keeps an internal formatted string. Commit on **blur** (or submit) with `commitGroupedNumberInput`:

```tsx
'use client'

import { useRef, useState } from 'react'
import {
  GroupedNumberInput,
  commitGroupedNumberInput,
  type EditableGroupedNumberConfig,
} from '@/shared/ui/inputs/grouped-number-input'

const config: EditableGroupedNumberConfig = {
  prefix: '$',
  allowDecimals: true,
  maxDecimalPlaces: 2,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

export function PriceField() {
  const [amount, setAmount] = useState(99.5)
  const ref = useRef<HTMLInputElement>(null)

  return (
    <GroupedNumberInput
      ref={ref}
      value={amount}
      groupedNumber={config}
      className="w-full rounded border px-2 py-1"
      onBlur={() => {
        const n = commitGroupedNumberInput(ref.current?.value ?? '', config)
        if (n !== null) setAmount(n)
      }}
    />
  )
}
```

## `useGroupedNumberInput` (custom markup)

Use when you render your own `<input>` or embed in a table cell. Variants: `"grouped"` | `"plainNumber"` | `"text"`.

```tsx
const { inputValue, onChange, resetInput } = useGroupedNumberInput({
  value: row.price,
  variant: 'grouped',
  groupedNumber: columnConfig,
})
// resetInput() on cancel or invalid save
```

## Read-only display

```tsx
import { formatGroupedFieldValue } from '@/shared/ui/inputs/grouped-number-input'

formatGroupedFieldValue(1234.5, {
  prefix: '$',
  allowDecimals: true,
  maximumFractionDigits: 2,
})
```

## Low-level helpers (`lib/`)

- `applyGroupedNumberInputChange(next, config)` — one keystroke’s worth of display string
- `commitPlainNumericInput(text)` — plain numeric text field (no grouping)
- `formatPlainNumberForInput(value)` — seed plain-number variant display
