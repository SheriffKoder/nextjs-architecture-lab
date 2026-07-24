# Collapsible Card

Expand/collapse section shell with a clickable header and optional Lucide icons.

## Import

```ts
import CollapsibleCard from '@/shared/ui/collapsible-card'
// or
import { CollapsibleCard } from '@/shared/ui/collapsible-card'
```

## Usage

```tsx
import { ChevronDown, Car } from 'lucide-react'
import CollapsibleCard from '@/shared/ui/collapsible-card'

<CollapsibleCard
  headerText="Vehicle details"
  leftIcon={Car}
  rightIcon={ChevronDown}
  variant="sm"
  defaultOpen
>
  {/* rows, forms, or any content */}
</CollapsibleCard>
```

## Props

| Prop | Type | Default | Notes |
|------|------|---------|--------|
| `headerText` | `string` | required | Header label |
| `children` | `ReactNode` | required | Collapsible body |
| `leftIcon` / `rightIcon` | Lucide icon component | — | Optional |
| `defaultOpen` | `boolean` | `true` | Initial open state |
| `variant` | `'default' \| 'sm'` | `'default'` | Size / padding |
| `hideScrollbar` | `boolean` | `false` | Hide body scrollbar |
| `isExpandedView` | `boolean` | `true` | Border + body background |
| `className` | `string` | `''` | Root classes |

## Structure

```text
collapsible-card/
├── index.ts
└── collapsible-card.tsx
```
