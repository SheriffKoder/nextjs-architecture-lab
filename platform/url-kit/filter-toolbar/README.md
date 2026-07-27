# filter-toolbar

URL filter chrome for list pages. Desktop and mobile are separate layout components
(`filter-toolbar-desktop.tsx` / `filter-toolbar-mobile.tsx`); hooks live in the orchestrator.

**Desktop (`md+`) — one row**

```text
[ filter ] [ grouped ]   [ search …… ] ---- [ label filters ] [ view ] [ date ]
```

**Mobile (`< md`) — two rows**

```text
[ search …… ] ---- [ filter ] [ group ] [ label ] [ date ]
──────────────── separator ────────────────
[ view pills … ]
```

View pills (and the separator) render only when more than one available view is configured.

## Dependencies

Does **not** depend on `FiltersHeader` or `MinimalControls`. Couples only to low-level filter engines plus shared UI primitives.

```text
filter-toolbar
├── owns: chrome, icon trigger, grouping/view hooks, layout, label UI
├── url-kit/filters (engine)  ← main coupling
├── @/components/ui/dropdown-menu
├── @/shared/lib/utils (cn)
├── next/navigation
├── react
└── lucide-react
```

### `platform/url-kit/filters` (only sibling kit dependency)

| Import | Used by |
|--------|---------|
| `useUrlFilters` | filter-control, date-control, label selection |
| `FilterConfig` / `SearchConfig` (types) | props + controls |
| `FilterColumnList` + `FilterOptionsPanel` | filter-control (pill panel body) |
| `SearchBar` | search-control |
| `ReactDateFilterDropDown` + `date-display-utils` | date-control |
| `feature-pagination/utils` (`all=1` sync) | `use-view-resolution` |
| `navigation-transition-context` | grouping + view URL writes |

**Not imported:** `FiltersHeader`, `MinimalControls`, `PillFilter` shell, `FilterOptionsButtons` (label-filters owns its own chips/dropdown).

### Outside url-kit

| Package / path | Role |
|----------------|------|
| `react` | UI + hooks |
| `next/navigation` | `useSearchParams` / `router` / `pathname` in grouping + view hooks |
| `@/components/ui/dropdown-menu` | group, view, label dropdown |
| `lucide-react` | icons |
| `@/shared/lib/utils` | `cn` |

### Owned internally

- `config/chrome.ts` — trigger / search classes
- `hooks/use-url-grouping.ts`, `hooks/use-view-resolution.ts`, `lib/resolve-view.ts`
- `ui/shared/icon-trigger-button.tsx`
- All slot UIs under `ui/*`

## Controls

| Folder | Role |
|--------|------|
| `ui/filter-control/` | Icon → pill filter dropdown |
| `ui/group-control/` | Icon → groupBy / subGroupBy menu |
| `ui/search-control/` | Wide search (`max-w` + opacity surface) |
| `ui/label-filters/` | Option chips at `xl+`; compact icon+label dropdown below `xl` |
| `ui/view-control/` | Desktop: icon → view menu. Mobile: `ViewPills` row |
| `ui/filter-toolbar-desktop.tsx` | One-row layout (`md+`) |
| `ui/filter-toolbar-mobile.tsx` | Two-row layout (`< md`) |
| `ui/date-control/` | Icon → date range dropdown |

## Usage

```tsx
import { FilterToolbar } from '@/platform/url-kit/filter-toolbar'

<FilterToolbar
  filters={filters}
  searchConfig={searchConfig}
  labelFilterKey="status"
  dateFilterKey="rentalStartDate"
  groupableFields={[…]}
  availableViews={[…]}
  defaultView="table"
  useAllItems={[…]}
  enabledFilterKeys={['status', 'make', 'location']}
  placeholderMarquee={{ desktop: true, mobile: true }}
/>
```

### `placeholderMarquee`

Optional. Scrolls overflowing search placeholder text.

| Value | Effect |
|-------|--------|
| omitted / `false` | off |
| `true` | desktop + mobile |
| `{ cycleMs: 12000 }` | both, shared timing |
| `{ mobile: true }` | mobile only |
| `{ desktop: true, mobile: true }` | both |
| `{ desktop: false, mobile: { cycleMs: 8000 } }` | mobile only, custom cycle |