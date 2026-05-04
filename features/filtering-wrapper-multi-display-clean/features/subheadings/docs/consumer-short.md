Here’s what was added or fixed for features/demo-client-page:

demo-client-filtering-content.tsx
Local tableData state synced from data with useEffect when the query/filters change.
onSubheadingsItemUpdate:
If the current page’s rows are the same set as ctx.data (same length and ids), tableData is replaced with ctx.data so subheadings order matches the reducer.
Otherwise rows are patched by id so paginated slices don’t get replaced by a short list after a drag.
FilteringWrapper now uses tableData and passes onSubheadingsItemUpdate (with manualSorting: true already on the spread config).
config/displays/subheadings-config.ts
Already includes manualSorting: true (no change needed).
config/lib/data-source.ts
assignManualSortingForSubheadingsDemo + rentalCarsBase → rentalCars export (API still serves full mock list with manual_sorting per status).
Removed a duplicate export const rentalCars line left from a bad merge.
types/rental-car-table-item.ts
Already has optional manual_sorting (no change needed).
Subheadings on the client demo should now behave like the RSC demo for manual drag, while staying safe under pagination.