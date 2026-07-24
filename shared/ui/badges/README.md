# Badges

Reusable status / label pills with shared color palettes.

## Import

```ts
import {
  RoundedBadge,
  RoundedDotBadge,
  RoundedIconBadge,
  SemiRoundedBadge,
  badgeSemanticPalettes,
  notionBadgePalette,
  type BadgePalette,
} from '@/shared/ui/badges'
```

Prefer the barrel (`@/shared/ui/badges`). Do not deep-import `variants/` or `model/` from outside this unit.

## Structure

```text
badges/
├── index.ts
├── model/          # palette type + named palettes
└── variants/       # visual shapes (rounded, dot, icon, semi-rounded)
```

## Usage

Pass a `palette` object (`bg`, `border`, `text`, `icon`, optional `dotFill`) plus label children.

```tsx
import { RoundedDotBadge, badgeSemanticPalettes } from '@/shared/ui/badges'

<RoundedDotBadge palette={badgeSemanticPalettes.high}>
  Active
</RoundedDotBadge>
```

```tsx
import { RoundedIconBadge, notionBadgePalette } from '@/shared/ui/badges'
import { MapPin } from 'lucide-react'

<RoundedIconBadge palette={notionBadgePalette.blue} icon={MapPin}>
  Downtown
</RoundedIconBadge>
```

| Variant | Shape |
|---------|--------|
| `RoundedBadge` | Pill, label only |
| `RoundedDotBadge` | Pill + leading dot |
| `RoundedIconBadge` | Pill + leading Lucide icon |
| `SemiRoundedBadge` | `rounded-md` pill, label only |

## Custom palette

```ts
const custom: BadgePalette = {
  bg: 'bg-orange-100',
  border: 'border border-orange-300/40',
  text: 'text-orange-800',
  icon: 'text-orange-600',
  dotFill: 'bg-orange-600',
}
```
