# `config/ui` — responsibility map

Presentation and FilteringWrapper chrome. Changing these files should not change cache keys or list query semantics (except via keys that already live in `contract/`).

| File / folder | Responsibility |
|---------------|----------------|
| `accordion-config.ts` | Column accordion group colors and open behavior. |
| `columns.ts` | Column defs: labels, formatters, layout hints, action columns. |
| `demo-rsc-row-action-configs.ts` | Row action dropdown entries (View / Edit) + menu styles. |
| `minimal-controls-config.ts` | Grouping / sort / query-builder / search chrome for FilteringWrapper (search built from `contract/`, not `data/`). |
| `rental-car-filter-icons.ts` | Lucide icons keyed by filter id. |
| `rental-car-filters-header-config.ts` | FiltersHeader layout: filter type, which keys show above the table, search/column-options toggles. |
| `row-highlighting.tsx` | Row styler + highlight overlay rules. |
| `cells/` | Cell renderers and option formatters used by columns / editable cells. |
| `cells/rental-car-location-options.ts` | Location badge formatters + editable column keys (options from `mocks/location-options-mock.ts`). |
| `cells/rental-car-status-format.tsx` | Status label + badge cell rendering. |
| `cells/rental-car-set-activity-cell.tsx` | Set-activity checkbox cell. |
| `displays/` | Per-view display configs passed into FilteringWrapper. |
| `displays/table-config.ts` | Table row height, editing, header filters/sort, row styling. |
| `displays/list-config.ts` | List (grouped table) display + grouping + header chrome. |
| `displays/subheadings-config.ts` | Subheadings view display + grouping + header chrome. |
| `displays/kanban-config.ts` | Kanban board field / column mapping. |
| `displays/calendar-config.ts` | Calendar date/title field mapping. |
| `displays/map-config.ts` | Map location field mapping. |
| `displays/timeline-config.ts` | Timeline date/title field mapping. |

## Dependency rule

May import `config/contract` and (temporarily) `config/mocks`. Must not import `config/data`.
