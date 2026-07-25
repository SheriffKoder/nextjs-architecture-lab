# `config/data` — responsibility map

Query, cache, pagination, validation, and domain option vocabularies. Changing these files can change what the server returns.

| File | Responsibility |
|------|----------------|
| `demo-rsc-views-config.ts` | Which display modes need the full filtered set (`?all=1`) and the default view id. |
| `nl-filter-assistant-config.ts` | NL assistant: URL keys it must not overwrite; allowed sort field keys. |
| `rental-car-base-filters.ts` | Base `FilterConfig[]` for facet generation / `getFilterOptionsServer` (no icons or FiltersHeader layout). |
| `rental-car-pagination-config.ts` | Default page size, size options, show-all — used by list query + PaginationFooter. |
| `rental-car-search-config.ts` | Server-side `SearchConfig` for `q` filtering (built from `contract/rental-car-search-fields`). |

Stand-in option lists live in [`../mocks/`](../mocks/), not here.

## Dependency rule

May import `config/contract`. Must not import `config/ui` or `config/mocks`.
