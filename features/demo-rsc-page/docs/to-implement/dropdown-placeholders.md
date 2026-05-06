Implementing placeholder badges and stabilizing header counts during filter-options loading. Wiring filterOptionsLoading from the tasks query and adding automatic detection when labels can't be resolved.

Implementing placeholder badges and stabilizing dropdown header counts during filter refetches; wiring filterOptionsLoading from tasks and users pages.

1. ActiveFiltersSection (active-filters-section.tsx)
New prop: usePlaceholderBadges (default false).
When true, it still shows “Active Filters:” and Clear All, but replaces real chips with 1–2 neutral animate-pulse bars (width scales with how many URL values you have, capped at 2).
2. DropdownHeader (dropdown-header.tsx)
New prop: countsPending (default false).
When true, the badge shows —/— with a light pulse instead of {selected}/{available}, so you don’t get the 2/3 → 2/0 → 2/3 flash while the option list is empty or stale.
3. DropdownFilter (dropdown-filter.tsx)
Implements filterOptionsLoading (was in types / FiltersHeader but not wired on the component).
Smart path (no extra wiring): for multi/single-select, if any URL activeFilters value has no row in filterOptions, it treats that like loading → placeholders + pending counts.
Combines with the prop:
showBadgePlaceholders = filterOptionsLoading || smartBadgePlaceholder
headerCountsPending = filterOptionsLoading or (pendingSelections.length > 0 && filteredOptions.length === 0) for those filter types.
4. Tasks page (tasks-client.tsx)
Reads isPlaceholderData and isFetching from useTaskFilterOptions (still using keepPreviousData).
Sets
filterOptionsLoading = isPlaceholderData || (isFetching && data === undefined)
and passes it into TasksContent → FiltersHeader (that path was already there).
5. Admin users (useUserFilterOptions.ts, users-container.tsx, users-content.tsx)
Same keepPreviousData + filterOptionsLoading wiring so the users tab behaves like tasks.
Using this on other pages
Pass filterOptionsLoading into FiltersHeader whenever your filter-options query is in a placeholder or first fetch state (same formula as tasks). DropdownFilter will still apply smart placeholders if options are briefly empty while the URL already has selections.

Note: StandardFilterDropdown (older table filter) was not changed; only the dropdown-2 / DropdownFilter stack used by FiltersHeader.