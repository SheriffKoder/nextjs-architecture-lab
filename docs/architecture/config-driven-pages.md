# Config-driven pages

The starter kit's core ability: **compose a dashboard list page from configuration**, not by rebuilding filters, table chrome, view modes, and URL wiring for every route.

You describe *what* the page should show and how it should behave. Platform widgets (`url-kit`, `multi-view`) and the view orchestrator read those configs. Your view layer wires **data** and **handlers** once — fetch boundary (RSC vs hybrid), row click, mutations — then passes configs down.

This model is **stack-agnostic**: the same config shape works on `/demo-rsc-page` and `/demo-hybrid-page`. Only the fetch/mutation boundary changes.

**Shipped presentation modes:** **list** (`?view=table`) and **cards**. The kit also supports optional **data-driven / data-visualization** views — kanban boards, calendars, maps, timelines, grouped layouts, and similar — when a page needs them. Register only what you ship in `availableViews`; the orchestrator pattern is the same.

---

## Configure vs wire

| You **configure** (declarative) | You **wire** (imperative, once per page) |
|-----------------------------------|------------------------------------------|
| Which filters exist and their types | Server loaders or TanStack hooks |
| Search fields, pagination presets | Row click → open drawer |
| Available views (`list`, `cards`, …) | Column actions (delete, toggle activity) |
| Column defs, cell formatters, row styling | Mutations + cache invalidation |
| Per-view display (row height, header filters, sort placement) | Error/retry toasts |
| Grouping/sort whitelists for toolbar | View-specific interaction callbacks (when a data-viz mode needs them) |
| URL param keys shared by data + UI | |

**Rule of thumb:** if changing it should alter layout, labels, or which controls appear → **config**. If it touches network, cache, or business rules → **view/entity code**, referenced from config via renderers and `columnActions` — not embedded inside config files.

Display configs explicitly avoid fetch and router imports. Example from the table display config:

```10:12:views/demo-hybrid-page/config/ui/displays/table-config.ts
 * Important: This file should NOT import TanStack hooks, router, or handle mutations.
 * It should only describe columns, cell renderers, and which props they expect.
```

---

## How configs flow through the page

```text
views/<route>/config/
├── contract/     shared keys (field map, URL param names)
├── data/         fetch/cache semantics (base filters, pagination, views list)
└── ui/           presentation (columns, displays/*, toolbar layout, cells)

         ┌─────────────────────────────────────────┐
         │  Page shell (filters-section, etc.)      │
         │  reads data/ + ui/ toolbar configs       │
         └─────────────────┬───────────────────────┘
                           │
         ┌─────────────────▼───────────────────────┐
         │  url-kit — FilterToolbar, PaginationFooter │
         │  minimal-controls, view-switchers        │
         └─────────────────┬───────────────────────┘
                           │  URL params (shareable)
         ┌─────────────────▼───────────────────────┐
         │  ViewOrchestrator + display configs     │
         │  list · cards · (+ optional data-viz)    │
         └─────────────────────────────────────────┘
```

**URL** remains the runtime source of truth for list intent (`page`, `sort`, filters, `view`, `groupBy`). **Configs** define which keys are valid, how they render, and which view mode consumes them — not the live values.

---

## Config folders (per view)

Each demo keeps view-local config under `views/<route>/config/`. Split by responsibility so presentation changes do not accidentally change fetch identity.

| Folder | Owns | Examples |
|--------|------|----------|
| **`contract/`** | Keys both data and UI must agree on | Field map, data vs UI-only URL param lists |
| **`data/`** | What the server/API fetches and caches | Base `FilterConfig[]`, pagination defaults, `availableViews`, search field list |
| **`ui/`** | How the page looks and wires chrome | Columns, `displays/*`, filter toolbar layout, cell renderers, row actions shape |
| **`mocks/`** | Temporary stand-ins until APIs exist | Form option lists, stand-in journey data |

Dependency rule:

```text
ui   → contract
data → contract
ui   ✗ data        (presentation must not import fetch policy)
data ✗ ui
```

Detail: [`views/demo-hybrid-page/config/README.md`](../../views/demo-hybrid-page/config/README.md) · per-folder `responsibilities.md` files.

---

## What platform systems consume

### `platform/url-kit`

Reads **data** and **ui** configs for list chrome — independent of render strategy.

| Config type | Defined in | Consumed by |
|-------------|------------|-------------|
| `FilterConfig[]` | `config/data/*-base-filters.ts` | FilterToolbar, facet API, server loaders |
| `SearchConfig` | `config/data/*-search-config.ts` | Search bar, NL filter catalog |
| `PaginationConfig` | `config/data/*-pagination-config.ts` | PaginationFooter |
| `FiltersHeaderConfig` | `config/ui/*-filters-header-config.ts` | FiltersHeader (legacy layout) |
| Minimal controls bundle | `config/ui/*-minimal-controls-config.ts` | FilterToolbar — grouping, views, sort whitelist |
| `SortConfig[]` | display configs or minimal controls | Column sort, dropdown sort controls |

Filter/sort/pagination **hooks** live in url-kit; you do not reimplement URL encoding per page.

Entry: [`platform/url-kit/README.md`](../../platform/url-kit/README.md)

### `widgets/multi-view`

Reads **ui** display configs per view mode. One orchestrator resolves `?view=` and mounts the matching feature.

**Shipped (typical page):**

| Config | View mode | Controls |
|--------|-----------|----------|
| `tableConfig` + `columns` | `table` (list) | Row height, header filters, sort placement, editing, actions mode |
| `mobileListConfig` | `cards` | Card composition (primary, secondary, badges), grouping, expansion |

**Optional data-driven / data-visualization modes** (same orchestrator; add config + register in `availableViews` when needed):

| Config pattern | Example modes | Purpose |
|----------------|---------------|---------|
| Field/column map config | kanban | Board columns from a status or stage field |
| Date/title field config | calendar, timeline | Time-based layouts |
| Location field config | map | Geo visualization |
| Grouped list config | list, subheadings | Section headers, manual reorder, nested groups |
| `accordionConfig` | (with table) | Column group expand/collapse |

Demos may wire extra modes for exploration; a production page usually passes only **list + cards** configs and lists those keys in `availableViews`.

The view passes configs into `ViewOrchestrator`; the orchestrator picks the container from `?view=`:

```tsx
<ViewOrchestrator
  data={rows}
  columns={tableColumns}
  filters={filters}
  tableConfig={tableConfig}
  mobileListConfig={mobileListConfig}
  availableViews={['table', 'cards']}
  onRowClick={handleRowClick}
  columnActions={{ /* wired handlers */ }}
  /* optional: kanbanConfig, calendarConfig, … when the page ships a data-viz mode */
/>
```

Entry: [`widgets/multi-view/view-orchestrator.tsx`](../../widgets/multi-view/view-orchestrator.tsx)

---

## Enabling features through config flags

Many behaviors are toggled in display config rather than forked components:

| Flag / block | Effect |
|--------------|--------|
| `tableConfig.headerFilters` | Per-column filter dropdowns in the table header |
| `sortPlacement: 'dropdown'` | In-filter sort controls; hides header sort button |
| `editableColumns` | Inline edit keys; saves go through wired `columnActions` |
| `actionMode: 'dropdown' \| 'inline'` | Row actions presentation |
| `rowHighlighting` / `rowStyler` | Conditional row/card styling |
| `mobileListConfig.card` | Primary/secondary/badges layout for cards view |
| `allowShowAll` on pagination config | Exposes All mode → infinite or showAll fetch path |
| `availableViews` in views config | Which view pills appear in the toolbar |

Adding a column to a page is usually: extend the row type → add a column def → optionally map it in header filters or card composition — not a new table component.

Full type reference: [`views/demo-rsc-page/implementation-plan.md#configuration-options-reference`](../../views/demo-rsc-page/implementation-plan.md#configuration-options-reference).

---

## Same configs, different fetch boundary

Config-driven composition is why RSC and hybrid demos look identical in the browser but differ only in **where rows come from**:

| Concern | RSC demo | Hybrid demo |
|---------|----------|-------------|
| Config location | `views/demo-rsc-page/config/` | `views/demo-hybrid-page/config/` (same shape) |
| List data | Server loaders in Suspense islands | TanStack after `HydrationBoundary` |
| URL writes | Router adapter | Shallow adapter |
| Mutations | Server actions + refresh | Route handlers + cache patch |

When you copy the kit to a new page, **copy the config folder structure first**, then pick an implementation plan for the data boundary.

---

## Bootstrap checklist for a new list page

1. **Entity** — row type, list query type, loaders or query hooks.
2. **`config/contract/`** — field map, URL keys (data vs UI-only).
3. **`config/data/`** — base filters, search, pagination; `availableViews` for list + cards (or your subset).
4. **`config/ui/`** — columns, `displays/table-config.ts`, `displays/mobile-list-config.ts` (or other data-viz display configs if you add them).
5. **View shell** — filters section + content section; pass configs to url-kit and `ViewOrchestrator`.
6. **Wire handlers** — `onRowClick`, `columnActions`, mutations; keep them out of config files.
7. **App route** — thin shell (RSC or client) that renders the view.

Step-by-step trees:

- RSC: [`views/demo-rsc-page/implementation-plan.md`](../../views/demo-rsc-page/implementation-plan.md)
- Hybrid: [`views/demo-hybrid-page/implementation-plan.md`](../../views/demo-hybrid-page/implementation-plan.md)

---

## Related docs

- [Project layers](./layers.md) — where config lives (`views/`) vs platform vs entities
- [Architecture philosophy](./philosophy.md) — when RSC vs hybrid; URL vs client state
- [Starter kit](../guides/README.md) — pick a bootstrap plan
- [Lab Phase 1](../lab/phase-1-rsc.md) / [Phase 2](../lab/phase-2-hybrid.md) — why config shape stayed stable across phases
