# Mobile-list — responsibilities

Feature folder: `widgets/multi-view/features/mobile-list/`  
URL view key: `cards`

## Layers

| Layer | Responsibility |
|-------|----------------|
| `types/` | Contracts only — no runtime logic |
| `lib/` | Pure helpers (format, search highlight, virtualization math) |
| `components/` | React UI — card subarea + list host |
| `docs/` | Plans and boundary docs |

## Responsibility groups

### `types/config/`
Display schema: `MobileListConfig`, field defs, card composition arrays, accordion group labels.

### `types/virtualization/`
Flat virtual-row model (`group-header` \| `card`) for `@tanstack/react-virtual`.

### `lib/formatting/`
Field registry lookup, value formatting, `·`-joined primary/secondary lines.

### `lib/search/`
Search-term highlight for composed text lines.

### `lib/interactions/`
Propagation guards (`stopCardInteractionPropagation`, `isInteractiveEventTarget`) and card edit policy (`isCardSurfaceEditable` — dropdown-only on surface).

### `lib/virtualization/`
`buildVirtualRows` (flat `group-header | card` model) and size estimates for `@tanstack/react-virtual`.

Beginner guide: [`TANSTACK_VIRTUAL_GUIDE.md`](./TANSTACK_VIRTUAL_GUIDE.md).

### `lib/viewport/`
Pure resolve for Step 6 force-on-mobile: `resolveForcedMobileView` swaps `table` / `list` / `subheadings` → `cards` below `md` without mutating the URL. Hook lives in `widgets/multi-view/hooks/use-is-mobile.ts`; orchestrator applies the swap.

### `components/card/`
Self-contained card subarea:
- `composition/` — primary line, secondary line, badges column
- `actions/` — top-right delete, action menu/row, open chevron
- `interactions/` — `InteractionZone`, `CardFieldControl` (dropdown/toggle), action config resolve
- `expansion/` — single Show more (all accordion groups) + lifted `rowExpansion` sibling + toggle
- `mobile-card.tsx` — shell orchestrator (styler, selection, highlight, open)
- `mobile-card-item.tsx` — main card + optional expansion sibling with lift padding

### `components/list/`
List host: loading/empty, `GroupSectionHeader`, virtualized scroll via `useVirtualizer` + `measureElement`. Passes orchestrator contracts and `selectedGroupBy`. Owns `useRowExpansion` state for the stack.

## Dependency direction (inside the feature)

```text
components → lib → types
components/card/composition → lib/formatting, lib/search, card/interactions
components/card/actions → lib/interactions; external ActionButton
components/card/interactions → lib/interactions; EditableCell (dropdown)
components/list → components/card
```

Consumers import only from `@/widgets/multi-view/features/mobile-list` (feature barrel).
