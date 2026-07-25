# Demo RSC docs index

Paths are relative to `views/demo-rsc-page/docs/`.

## Numbered series

**[2-drawer-system](drawers/2-drawer-system.md)**  
URL-param drawer system for entity, mode, and action changes.

**[3-query-vs-params](architecture/3-query-vs-params.md)**  
When to use route params vs query string for URL-driven RSC state.

**[4-rsc-bottleneck](bottlenecks/4-rsc-bottleneck.md)**  
useTransition + Suspense islands so URL updates don’t block the whole page.

**[5-server-forms](forms/5-server-forms.md)**  
What RSC owns vs client forms, validation, and server actions.

**[5-1-create-drawer](forms/5-1-create-drawer.md)**  
Plan for create-car drawer: schema, `createCarAction`, revalidation.

**[6-row-fetch](ui/6-row-fetch.md)**  
Drawer loads a single row by `id`, independent of the list fetch.

**[6-1-rsc-bottleneck-2](bottlenecks/6-1-rsc-bottleneck-2.md)**  
Drawer URL params invalidating filter/list cache and slowing drawer open.

**[6-2-rsc-bottleneck-3](bottlenecks/6-2-rsc-bottleneck-3.md)**  
Hover prefetch vs drawer open causing duplicate by-id fetches.

**[6-3-bottleneck-fixes](bottlenecks/6-3-bottleneck-fixes.md)**  
Applied fixes: transitions, `unstable_cache` keys, UI-only params out of cache key.

**[7-drawer-expaned-view](drawers/7-drawer-expaned-view.md)**  
Full-width expanded drawer and journey layout via drawer chrome context.

**[8-cell-optimistic-server-action](ui/8-cell-optimistic-server-action.md)**  
Set-activity column: `columnActions`, optimistic UI, `rowStatusUpdateAction`.

**[9-rsc-conclusion](reflections/9-rsc-conclusion.md)**  
When to keep RSC vs client/TanStack; summary of architecture choices.

## Other docs (alphabetical)

**[architecture](architecture/architecture.md)**  
Overall RSC page architecture: URL state, Suspense sections, modular layout.

**[architecture-cleanup](cleanup/architecture-cleanup.md)**  
Cleanup checklist: shared query builder, cached loaders, split sections.

**[architeture-cleanup-ref](cleanup/architeture-cleanup-ref.md)**  
Reference notes for architecture cleanup (query builder, data flow).

**[CLEANUP_PLAN](cleanup/CLEANUP_PLAN.md)**  
Plan to remove filter/sort/pagination from old filtering-wrapper tree.

**[filters-integration](filters-integration.md)**  
Plan to add filters header above content and pagination footer below.

## to-implement — done

**[row-actions](to-implement/done/row-actions.md)**  
Row click vs action buttons; event bubbling and drawer open behavior.

**[scrollable-tables](to-implement/done/scrollable-tables.md)**  
Fixed layout so only the table body scrolls, not header/pagination.

**[table-checkbox-column-outside-handler](to-implement/done/table-checkbox-column-outside-handler.md)**  
`columnActions` pattern for interactive cells owned by the page.

## to-implement — not done

**[dropdown-placeholders](to-implement/dropdown-placeholders.md)**  
Placeholder badges and stable counts while filter options load.

**[filter-labels-url-ids](to-implement/filter-labels-url-ids.md)**  
Show labels in UI while keeping IDs/slugs in the URL.

**[nuqs](to-implement/nuqs.md)**  
Evaluate `nuqs` vs custom URL filter/sort/pagination stack.

**[portalized-multiline-textarea](to-implement/portalized-multiline-textarea.md)**  
Portalized multiline textarea for overlay editing without clipping.

**[table-cell-overlay-z-index-scroll](to-implement/table-cell-overlay-z-index-scroll.md)**  
Table cell overlay z-index / scroll stacking issues.

**[task-grouping](to-implement/subheadings-grouping/task-grouping.ts)**  
Reference multi-level grouping comparator for tasks (not demo RSC).

**[task-list-grouping](to-implement/subheadings-grouping/task-list-grouping.md)**  
Tasks list default ordering by project → phase across pages.

**[task-list-query-server](to-implement/subheadings-grouping/task-list-query-server.ts)**  
Reference server pipeline: filter → sort → paginate tasks.
