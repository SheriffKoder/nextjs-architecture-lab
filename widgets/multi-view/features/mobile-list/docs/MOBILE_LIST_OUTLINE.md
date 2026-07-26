# Mobile List — Card View Outline (Draft)

## Objective

Add a **mobile-list** feature implementing the **`cards`** multi-view: a thin vertical stack of cards for small viewports (and as an explicit `?view=cards` before we force it on mobile). Reuse shared table/list contracts (stylers, drawers, actions, pagination, grouping, expansion) while introducing a **card composition config** that is independent of grid columns and unrelated to kanban.

**Not in scope for this view:** header filters / column sort chrome, manual sort / DnD, inline text editing, hover prefetch. Kanban board columns are not a model for this.

**Reference image:** [`docs/assets/mobile-list-card-reference.png`](./assets/mobile-list-card-reference.png)

---

## UI / UX gain

| Today (table / list / subheadings on mobile) | Target |
|-----------------------------------------------|--------|
| Wide column grid / sticky / header filters cramped | Thin cards; one column; no column header chrome |
| Accordion columns collapse horizontally | “Show more” expands accordion **field groups** inside the card |
| Inline text cells hard to edit on touch | Text edits live in the drawer; dropdowns / toggles may stay on-card |
| Hover prefetch | None — open drawer (or near-viewport later if needed) |
| Manual row reorder | Not supported |

---

## Locked product decisions

1. **View key** — URL / `availableViews` / view pills use **`cards`**. Feature folder stays `mobile-list/` (implementation name ≠ URL key).
2. **Composition config** — card layout is driven by ordered field arrays, not by placing every `TableColumn` in a grid:
   - `primary[]` — header line, joined with ` · ` (e.g. `Camry · Toyota`)
   - `secondary[]` — muted meta line (e.g. `2022 · Black · ABC-1234`)
   - `badges[]` — right column, **stacked vertically**; each field uses its own badge styling
3. **Actions cluster (top-right)** — `[ delete ] [ actions ]` at the **top right** of the card. Actions render as dropdown **or** inline row based on `actionMode` / config (same contract as table). Propagation stopped so controls don’t open the drawer. Open chevron stays with the main row (near badges / trailing edge), not mixed into the action buttons unless we decide otherwise in Step 1.
4. **Edit policy** — no inline free-text. Dropdowns and toggles may remain on-card (or in expanded section). Free-text / rich edits → URL drawer.
5. **Grouping** — supported (URL `groupBy` / shared grouping). Section headers like `Available (5)`.
6. **Accordion / show more** — **one** “Show more” control reveals **all** accordion groups inside the card:
   ```text
   [ Show more ]

   Group 1
   XXXX
   XXXX
   -----
   Group 2
   XXXX
   XXXX
   ```
7. **Row expansion** — supported (shared `rowExpansion` contract), separate from accordion show-more. Expanded content renders **below the main card as another card**: different surface color, slightly **lifted** (`relative` + negative/offset top) so it tucks under / overlaps the parent; parent stack needs **extra top padding** so the lift doesn’t collide with the previous item.
8. **Pagination** — same as table: normal page size + `all` option. Not a `useAllItems` view by default.
9. **No header filters / header sort** — filter & sort stay in the filter toolbar (already mobile-friendly).
10. **No manual sort / DnD.**
11. **No hover prefetch** (`onRowPointerEnter` unused here).
12. **Search highlight** — highlight matches in primary / secondary / expanded field text.
13. **Selection / indicators** — reuse `rowStyler` (left status bar) and `rowHighlighting` / `selectedItemId` chrome.
14. **Virtualization** — `@tanstack/react-virtual` for the card list (new dependency; table still may use `react-window`).

---

## Card anatomy (from reference + decisions)

```text
┌─────────────────────────────────────────────────────────────┐
│ ▌  Camry · Toyota              [Available]    [🗑] [⋯]     │  ← badges (col) + actions top-right
│ ▌  2022 · Black · ABC-1234                          [ > ]   │  ← chevron / open affordance
│ ▌  [ Show more ]                                            │
│ ▌  Group 1 … / Group 2 …   (when expanded)                  │
└─────────────────────────────────────────────────────────────┘
         ┌─ lifted expansion card (different bg, relative ↑) ─┐
         │  rowExpansion content                              │
         └────────────────────────────────────────────────────┘
```

- Thin height; two text lines when collapsed.
- Badges stack **vertically** in the right content column.
- Actions sit **top-right**: delete + actions (dropdown or row per config).
- Rounded border, quiet surface; works in light/dark via theme tokens.
- Group section label above stacks: `Available (5)`.
- When `rowExpansion` is open: sibling card below, offset upward; list item padding-top absorbs the overlap.

---

## Config shape (draft)

Consumer display config (e.g. `views/.../displays/mobile-list-config.ts`) will look table-like where it reuses shared concerns, plus a **card composition** block.

### Reused from table / list display configs

| Concern | Source pattern |
|---------|----------------|
| `emptyMessage`, loading / shimmer | `TableConfig` |
| `rowStyler`, `rowHighlighting` | shared row chrome |
| `rowExpansion` | shared expand panel |
| `actionMode`, `actionConfigs` wiring | orchestrator |
| `editableColumns` (dropdown / toggle keys only) | subset of table keys |
| Grouping formatters / spacing | list-style grouping |
| Pagination | footer + URL pagination (not view-owned) |

### New: card composition

```ts
// Draft — names TBD in types step
type MobileListCardComposition = {
  /** Header line fields, render order left → right, joined with · */
  primary: string[]   // e.g. ['model', 'make']
  /** Secondary muted line */
  secondary: string[] // e.g. ['year', 'color', 'licensePlate']
  /** Right column badges (flex-col, vertical stack); each key uses column/badge styling */
  badges: string[]    // e.g. ['status']
}

type MobileListFieldDef<T> = {
  key: string
  label?: string
  formatter?: (value: unknown, item: T) => string
  cellRenderer?: (...) => ReactNode  // badges / toggles / dropdowns
  groupId?: string                   // accordion / show-more group
  // dropdown / toggle metadata as needed (mirror TableColumn subset)
}

type MobileListConfig<T> = {
  fields: MobileListFieldDef<T>[]    // field registry (format + render)
  card: MobileListCardComposition
  // + shared display bits: rowStyler, rowHighlighting, rowExpansion, emptyMessage, ...
  accordionGroups?: { id: string; label: string }[]  // show-more labels
}
```

**Ordering rule:** arrays in `card.primary` / `secondary` / `badges` define both membership and left-to-right (or top-to-bottom for badges) order. Field defs own formatting / badge chrome / editability — not layout slots.

**Field keys not listed** in primary/secondary/badges may still appear only under accordion show-more if they have a `groupId`.

---

## Shared contracts (orchestrator)

Reuse the same wiring as table/list from `demo-rsc-content` / `ViewOrchestrator`:

| Contract | Mobile-list behavior |
|----------|----------------------|
| `onRowClick` | Card body / chevron → drawer view |
| `columnActions` (delete, setActivity, …) | Top-right actions cluster; `stopPropagation` |
| `onActionClick` / `actionConfigs` | Top-right: dropdown **or** inline row (`actionMode`) |
| `onCellValueChange` | Dropdowns / toggles only on-card |
| `selectedItemId` | Selected card surface |
| `globalSearchText` | Highlight in composed text |
| `filters` / URL grouping | Section headers when grouped |
| `onRowPointerEnter` | **Not used** |

---

## Target folder structure

```text
widgets/multi-view/features/mobile-list/
├── docs/
│   ├── MOBILE_LIST_OUTLINE.md
│   ├── responsibilities.md
│   ├── initial-take.md
│   └── assets/
│       └── mobile-list-card-reference.png
├── types/
│   ├── config/                         # schema: config, fields, composition, accordion
│   │   ├── mobile-list-config.ts
│   │   ├── mobile-list-field.ts
│   │   ├── mobile-list-card-composition.ts
│   │   ├── mobile-list-accordion-group.ts
│   │   └── index.ts
│   ├── virtualization/                 # flat virtual-row model
│   │   ├── mobile-list-virtual-row.ts
│   │   └── index.ts
│   └── index.ts
├── lib/
│   ├── formatting/                     # field registry, format, compose · lines
│   ├── search/                         # search highlight
│   ├── interactions/                   # propagation + dropdown-only edit policy
│   ├── virtualization/                 # build-virtual-rows (Step 4)
│   └── index.ts
├── components/
│   ├── card/                           # card subarea
│   │   ├── composition/                # primary, secondary, badges
│   │   ├── actions/                    # delete, actions, chevron
│   │   ├── interactions/               # InteractionZone, CardFieldControl, resolve actions
│   │   ├── expansion/                  # Show more accordion + lifted row-expansion
│   │   ├── mobile-card.tsx             # shell orchestrator
│   │   ├── mobile-card-item.tsx        # card + optional expansion sibling
│   │   └── index.ts
│   ├── list/                           # list host + section headers + virtualizer
│   │   ├── group-section-header.tsx
│   │   ├── mobile-list-wrapper.tsx
│   │   └── index.ts
│   └── index.ts
└── index.ts
```

See [`responsibilities.md`](./responsibilities.md) for group boundaries.

Consumer:

```text
views/demo-rsc-page/config/ui/displays/mobile-list-config.ts
```

Force on mobile: below `md`, `table` / `list` / `subheadings` render as **`cards`** via `resolveForcedMobileView` (URL unchanged).

---

## Virtualization (`@tanstack/react-virtual`)

- Install `@tanstack/react-virtual` for this feature (trial; do not migrate table off `react-window` in this pass).
- Parent scroll container owns the virtualizer.
- Row model is a **flat list** of virtual items: `group-header | card` (card height includes in-card accordion when open; row-expansion sibling adds height + top padding for lift).
- Variable row height expected — measure or estimate + `measureElement`.
- Shimmer / empty states sit outside or as non-virtual placeholders.

---

## Implementation steps (proposed)

### Step 0 — Scaffold + types ✅
- Folders, barrels, `MobileListConfig` / composition types.
- Add `@tanstack/react-virtual` dependency.
- **Outcome:** types compile; no UI yet.
- **Done:** `@tanstack/react-virtual` installed; `types/` + stub `components/` / `lib/` barrels; public export from `features/mobile-list/index.ts`.

### Step 1 — Card shell + composition ✅
- `MobileCard` with left indicator (`rowStyler`), primary/secondary lines, vertical badges column, top-right actions, open chevron.
- Wire formatters from field defs; search highlight; selection chrome.
- **Outcome:** static list of cards matches reference anatomy (non-virtual OK).
- **Done:** `composeFieldLine` + field helpers; card atoms; `MobileListWrapper` static stack (loading shimmer / empty); public barrels updated. No view registration yet (Step 5).

### Step 2 — Interactions ✅
- Card open → `onRowClick`; stopPropagation on badges/actions/dropdowns/toggles.
- Top-right delete + actions (dropdown or row per `actionMode`); dropdown/toggle edits only.
- **Outcome:** drawer + mutations parity with table for supported actions.
- **Done:** `lib/interactions` guards + `isCardSurfaceEditable`; `InteractionZone` / `CardFieldControl`; actions resolve (no delete in menu); wrapper wires `onCellValueChange` / `onActionClick` / `columnActions`. View registration still Step 5.

### Step 3 — Accordion show-more + row expansion ✅
- Single “Show more” reveals all `groupId` / `accordionGroups` blocks inside the card.
- `rowExpansion` → lifted sibling card below (different color, `relative` offset, extra item padding-top).
- **Outcome:** collapsed thin card; in-card groups + optional expansion card under it.
- **Done:** `buildAccordionGroups`; `CardAccordionExpand` / `CardRowExpansion` / toggle; `MobileCardItem` stack; wrapper uses `useRowExpansion`.

### Step 4 — Grouping + virtualization ✅
- Section headers (`Available (5)`); flat virtual row model.
- `@tanstack/react-virtual` in wrapper.
- **Outcome:** grouped scroll performance on long pages / `all`.
- **Done:** `buildVirtualRows` + `GroupSectionHeader`; wrapper uses `useVirtualizer` with `measureElement`; `selectedGroupBy` prop overrides `config.groupBy`.
- **Guide:** beginner walkthrough — [`TANSTACK_VIRTUAL_GUIDE.md`](./TANSTACK_VIRTUAL_GUIDE.md).

### Step 5 — Display config + orchestrator wiring ✅
- `mobile-list-config.ts` (copy shared stylers/actions patterns from table/list; new `card` arrays).
- Register view key **`cards`** in available views / `ViewOrchestrator` / view pills.
- Pagination: keep table-style (not `DEMO_RSC_USE_ALL_ITEMS_VIEWS`).
- **Outcome:** selectable `?view=cards` end-to-end on demo RSC page.
- **Done:** `views/demo-rsc-page/config/ui/displays/mobile-list-config.ts`; `DEMO_RSC_AVAILABLE_VIEWS` includes `cards` (not in useAllItems); `ViewOrchestrator` renders `MobileListWrapper`; view pills / switchers / folder-tabs catalog entry.

### Step 6 — Force on mobile ✅
- Below `md`, force `cards` when URL view is table / list / subheadings.
- Document override behavior; keep desktop views unchanged.
- **Done:** `resolveForcedMobileView` (`lib/viewport/`) + `useIsMobile` in `ViewOrchestrator`.
- **Override contract:**
  | Viewport | URL / resolved view | What renders |
  |----------|---------------------|--------------|
  | `< md` | `table` / `list` / `subheadings` | `cards` (if `mobileListConfig` exists) |
  | `< md` | `cards`, kanban, calendar, map, timeline, … | unchanged |
  | `≥ md` | anything | unchanged |
- **URL preserved** — no rewrite to `?view=cards`; resize back to desktop restores the URL view.
- Debug attrs on orchestrator root: `data-resolved-view`, `data-render-view`, `data-mobile-forced`.

---

## Explicit non-goals (this draft)

- Kanban column boards / card DnD
- Header filter / sort buttons
- Manual sorting
- Inline text / number free typing on the card
- Hover prefetch
- Replacing `react-window` in existing table/list

---

## Resolved decisions

| Question | Decision |
|----------|----------|
| View key | **`cards`** in URL / `availableViews` (folder remains `mobile-list/`) |
| Multiple badges | Stack **vertically** in the right column |
| Accordion | **One** “Show more” reveals all groups |
| `rowExpansion` vs accordion | Expansion is a **lifted sibling card below** the main card (not inside accordion); extra top padding on the item |
| Actions placement | **Top-right** of the card: `[ delete ] [ actions dropdown \| row ]` per config |

---

## Next

Mobile cards feature is end-to-end (including force-on-mobile). Optional follow-ups: hide table/list/subheadings pills on mobile, or mark them desktop-only in the switcher.
