# url-kit

Reusable URL-driven UX primitives for list pages: filters, sorting, pagination, view/group chrome, AI filter assistant, and drawer URL params.

## Philosophy

URL should represent meaningful application state — filters, pagination, sorting, view mode — not transient UI (drawer open state on hybrid pages, confirm modals, etc.).

## `url-params/` — transport layer

**Not every folder uses this.** `url-params/` is the pluggable boundary between URL chrome and the address bar:

- **Router mode (RSC default):** `router.replace` + optimistic reads — no provider required.
- **Shallow mode (hybrid):** `history.replaceState` — mount `<ShallowUrlProvider>` at the page root.

Import from `@/platform/url-kit/url-params`. See [`url-params/README.md`](./url-params/README.md) for layout and API.

### Uses `url-params` today

| Area | How |
|------|-----|
| `filters/feature-filtering/hooks/useUrlFilters` | `useUrlParamsTransport()` |
| `filters/feature-filtering/components/search-bar` | `useEffectiveSearchParams()` |
| `filters/feature-filtering/components/PillFilter/pill-search-bar` | `useEffectiveSearchParams()` |
| `filters/feature-filtering/components/expandable-search/` | `useEffectiveSearchParams()` |
| `filters/feature-filtering/components/dropdown-filter/` | `useEffectiveSearchParams()` + hook getters |
| `filters/feature-sorting/hooks/useUrlSorting` | `useUrlParamsTransport()` |
| `filters/feature-sorting/hooks/useInitialSorts` | via canonical `useUrlSorting` |
| `filters/feature-sorting/hooks/use-initial-sorts` | via canonical `useUrlSorting` (`useInitialSortSpecs`) |
| `filters/feature-sorting-builder-control/` | Imports canonical `useUrlSorting` |
| `filters/feature-query-builder-filter/hooks/use-url-query-filter` | `useUrlParamsTransport()` |
| `filters/feature-pagination/hooks/useUrlPagination` | `useUrlParamsTransport()` |
| `filters/feature-pagination/components/pagination-wrapper` | `useEffectiveSearchParams()` |
| `filters/feature-pagination/components/pagination-mobile` | `useEffectiveSearchParams()` |
| `filters/components/pagination-footer` | `useEffectiveSearchParams()` |
| `minimal-controls/hooks/use-url-grouping` | `useUrlParamsTransport()` |
| `minimal-controls/hooks/use-initial-grouping` | via `useUrlGrouping` |
| `minimal-controls/hooks/use-view-resolution` | `useUrlParamsTransport()` |
| `ai-filter/` | `useUrlParamsTransport()` (NL assistant + text search hook) |

`filter-toolbar/` consumes grouping/view through **`minimal-controls`** hooks (transport-aware). It does not define its own URL hooks.

### Does not use `url-params` yet (direct `useRouter` / `useSearchParams`)

| Area | Notes |
|------|--------|
| `url-drawer/`, `drawer/` | Drawer open/mode/id params |
| `confirm/` | Confirm-action URL params |

These still work on RSC pages. Hybrid pages should enable drawer/confirm only after wiring through `url-params`.

### Internal to router transport

| Area | Role |
|------|------|
| `filters/lib/use-optimistic-url-search-params` | Optimistic reads for router adapter |
| `filters/navigation-transition-context` | `wrapNavigation` for RSC pending dimmer |

## Top-level folders

| Folder | Responsibility |
|--------|----------------|
| [`url-params/`](./url-params/) | Transport adapters (router, shallow, future nuqs) |
| [`filters/`](./filters/) | Filtering, pagination, sorting engines + shared list chrome |
| [`filter-toolbar/`](./filter-toolbar/) | Desktop/mobile filter toolbar composition |
| [`minimal-controls/`](./minimal-controls/) | Grouping, view resolution, compact control strip |
| [`view-switchers/`](./view-switchers/) | View switcher + folder tabs |
| [`ai-filter/`](./ai-filter/) | NL filter assistant |
| [`url-drawer/`](./url-drawer/) | URL-driven drawer shell |
| [`drawer/`](./drawer/) | Drawer param types + parsers |
| [`confirm/`](./confirm/) | URL confirm-action helper |

## Adding URL writes to a new component

1. Prefer existing hooks (`useUrlFilters`, `useUrlPagination`, …) — they already use transport.
2. For new hook-coupled code, call `useUrlParamsTransport()` — do not import `useRouter` directly unless the feature is RSC-only and documented as such.
3. For read-only URL sync in presentational components, use `useEffectiveSearchParams()`.
