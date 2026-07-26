You have (keep)
Row highlight / status indicator (rowStyler, rowHighlighting)
Field badges (cellRenderers like status/location)
Inline / tap edit (editableColumns, dropdowns)
Delete + actions (columnActions, actionMode, actionConfigs)
Missing but important
Card composition (separate config, like kanban)

Title / subtitle fields (e.g. model / make+year)
Primary vs secondary fields (what shows above the fold)
Field order + “show more” for accordion-ish columns (groupId: 'updates')
Which fields are badges vs plain text vs muted meta
Don’t reuse full TableColumn[] as the card layout; map from it (kanban already does cardTitle / cardContent)
Shared row contracts to reuse

Card tap → onRowClick / drawer
Selected state (selectedItemId)
Loading per card (loadingItemIds, shimmer)
Empty state
Search-match highlight
Formatters from columns (numbers, dates, dropdown labels)
Mobile interaction gaps

No hover prefetch → prefetch on open / near-viewport instead of onRowPointerEnter
Touch hit targets + stopPropagation so edit/delete don’t open the drawer
Edit UX: sheet / full-field edit vs tiny inline cells
Optional: long-press or overflow for secondary actions
Decide explicitly (support or drop)

Grouping sections (URL groupBy) — section headers vs flat list
Row expansion
DnD / manual sort (usually off on mobile)
Pagination vs all=1 (table/list are paginated; kanban/subheadings often aren’t)
Column header filters/sort — already live in toolbar on mobile; cards don’t get header chrome
Plumbing later (when forcing)

Register cards in available views + ViewOrchestrator
Force cards below md even if URL says table/list/subheadings
Practical shape
A thin card stack with a cards display config that picks title/meta/badges/editable keys/actions, and reuses the same orchestrator callbacks as table/list. Closest existing pattern: kanban’s field map, not the grid column pipeline.
If you want, next we can sketch the cards config type + a minimal card anatomy before implementing.
