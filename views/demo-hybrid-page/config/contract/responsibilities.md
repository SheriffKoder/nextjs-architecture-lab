# `config/contract` — responsibility map

Shared vocabulary only. No React, no icons, no pagination policy, no cache policy.

| File | Responsibility |
|------|----------------|
| `url-param-keys.ts` | Which search-param keys belong in the list/cache key vs UI-only chrome (`DEMO_RSC_LIST_DATA_*`, `DEMO_RSC_UI_ONLY_*`). |
| `rental-car-field-map.ts` | Filter/query key → `RentalCarTableItem` property map for list builders and facet loaders. |
| `rental-car-search-fields.ts` | Searchable field keys + placeholder + min length. Both `data/` and `ui/` build `SearchConfig` from this so neither imports the other. |

## Dependency rule

Consumers: `config/data`, `config/ui`, and view/entity code that needs key lists.

Do not import from `config/data` or `config/ui`.
