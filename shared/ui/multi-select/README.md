# Multi Select

Searchable multi-select dropdown with optional grouping, item counts, and custom label styling.

## Import

```ts
import DropdownSelect, {
  type DropdownItem,
} from '@/shared/ui/multi-select'
```

Prefer the barrel. Do not deep-import `ui/`, `lib/`, or `model/` from outside this unit.

## Structure

```text
multi-select/
├── index.ts
├── ui/                 # DropdownSelect component
├── model/              # DropdownItem and related types
├── lib/                # pure helpers (grouping, count, nested paths)
└── _demo/              # playground only (not for production imports)
```

## Item shape

```ts
type DropdownItem = {
  id: string | number
  label: string
  value: unknown
}
```

## Basic usage

```tsx
'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import DropdownSelect, { type DropdownItem } from '@/shared/ui/multi-select'

const items: DropdownItem[] = [
  { id: '1', label: 'Active', value: 'active' },
  { id: '2', label: 'Idle', value: 'idle' },
]

function StatusFilter() {
  const [selected, setSelected] = useState<DropdownItem[]>([])

  return (
    <DropdownSelect
      icon={Users}
      buttonText="Status"
      selectedText="statuses"
      items={items}
      selectedItems={selected}
      onSelectionChange={setSelected}
      searchable
      searchPlaceholder="Search status…"
    />
  )
}
```

## Useful props

| Prop | Purpose |
|------|---------|
| `items` / `selectedItems` / `onSelectionChange` | Controlled selection |
| `searchable` | Filter list by label |
| `groupBy` | Group items (`string` path or `(item) => key`) |
| `countBy` / `showItemCount` | Badge counts next to items |
| `getLabelClassName` | Optional per-item label classes (pass your own fn) |
| `showSelectedItems` | Show selected labels in the button |
| `singleChoice` | Allow only one selected item |

Pass presentation helpers like `getLabelClassName` from the **call site**. Hardcoded demo label colors live under `_demo/` and must not be imported in production screens.

## Demo

See `_demo/demo.tsx` for a local playground (mock users + sample `getLabelClassName`).
