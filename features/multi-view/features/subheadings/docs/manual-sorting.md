**Consumer guide (enable on a page):** see `manual-sorting-consumer-guide.md`.  
**Nested + manual roadmap:** see `manual-sorting-upgrade-plan.md`.

Guiding principle
Treat the copy’s doc as the checklist (Steps 0–11 + smoke tests). Implement in clean as additive work: manualSorting === false keeps today’s clean path (nested grouping, columnActions, filters, subheadingsDragEnd with extra args, etc.); manualSorting === true turns on the reducer + cell droppables + placeholder strip + onSubheadingsItemUpdate.

Do not replace clean’s whole subheadings-container.tsx with the copy file; merge branches so clean-only props stay wired.

Phase 0 — Inventory & alignment (short)
Read subheadings-manual-sort.md (copy) — baseline vs target table, Steps 8.8–8.9 (group shell: DroppableGroup only when legacy), Step 11 (persistence).
List clean-only surface you must preserve in the merged container:
nestedGrouping, selectedGroupBy, selectedSubGroupBy, minimalControlsConfig, effectiveNestedGrouping
columnActions, filters / header filter wiring from tableConfig
subheadingsDragEnd(updatedData, itemId?, targetGroupKey?)
subheadingsDisableRowDrag on DraggableRow
Decide data contract for manual sort: rows need stable idKey and, if you mirror the board, a numeric manual_sorting (or your field) per group; document in clean’s demo config.
Phase 1 — Port dnd/ building blocks into clean (low coupling)
Copy or re-implement under
features/filtering-wrapper-multi-display-clean/features/subheadings/dnd/:

Asset	Purpose
types.ts
SubheadingsUpdateContext, SubheadingsBoardState, SubheadingsBoardAction, extend DragSource if needed; keep existing exports clean code uses (SubHeadingsDragState naming may differ — unify exports in dnd/index.ts).
constants.ts
SUBHEADINGS_DROP_PLACEHOLDER_HEIGHT
utils/position-calculator.ts
createCellId / parseCellId / findItemPosition (:: separator)
utils/insert-index-from-pointer.ts
computeInsertIndexFromPointer, same-group adjust, no-op helper
components/droppable-row-cell.tsx
Per-slot useDroppable
dnd/index.ts
Re-export everything
Adjust imports to clean paths (e.g. no wrapper-specific unless you add it under clean).

Phase 2 — Reducer + legacy processGroupChange
In dnd/hooks/use-subheadings-state.ts (clean):

Add subheadingsBoardReducer + useSubheadingsReducerState per the doc (Steps 5–6): UPDATE_DATA, DRAG_START, DRAG_OVER, CLEAR_VIRTUAL_PLACEHOLDER, DRAG_END, DRAG_CANCEL; DRAG_END splices groups, optional manual_sorting reindex, then onSubheadingsItemUpdate(ctx).
Keep existing processGroupChange for manualSorting === false (cross-group field update only).
Wire isManualOnChangeRef only if you need to avoid UPDATE_DATA fighting parent updates (doc Step 6 / 8.3).

Phase 3 — useSubHeadingsDnd dual mode (single hook, no conditional hooks)
Per doc Step 7:

API: useSubHeadingsDnd({ manualSorting, dispatch?, groupedData?, idKey?, boardState?, pointerCoordinatesRef? })
Legacy: current useState drag state + handleDragEnd returning { itemId, targetGroupKey, dragSource } for processGroupChange → subheadingsDragEnd
Manual: handleDragOver / handleDragEnd dispatch reducer actions; use pointerCoordinatesRef + wrapped collisionDetection (doc 8.4) — do not use activatorEvent.clientY + delta for half-row hit testing.
Export types from dnd/index.ts.

Phase 4 — DraggableRow behavior in manual mode
Per doc Step 5:

When manualSorting, dragged row in list: transform: 'none' (list row stays put; DragOverlay shows the moving row).
Legacy mode can keep current transform behavior if you prefer parity with today’s clean UX.
Add disableDrag support if the copy’s DraggableRow doesn’t have it — clean relies on subheadingsDisableRowDrag.

Phase 5 — subheadings-container.tsx merge (largest step)
Follow doc Step 8, but interleave with clean logic:

Props (8.1): add manualSorting?, idKey?, onSubheadingsItemUpdate?, loadingItemIds?, isManualOnChangeRef?, optional listView? if you need it — do not remove clean props (nestedGrouping, selectedSubGroupBy, columnActions, filters, …).

Derived groups (8.2): keep effectiveNestedGrouping and existing groupedData useMemo for legacy. When manualSorting, either:

build flat groups from the same displayData / filtered source clean uses today, then
sort each bucket by manual_sorting ascending (skip if your domain doesn’t use that field yet).
Reducer (8.3): useSubheadingsReducerState(derivedGroupedData, effectiveGroupByKey, …) — use effectiveGroupByKey (or whatever clean uses for the active group field) so nested + minimal controls still define the bucket key.

Effective groupedData (8.3):
groupedData = manualSorting ? boardState.groupedData : derivedGroupedData
(legacy path unchanged).

Pointer ref + collision (8.4): only when manualSorting.

Hook (8.5): pass config as in doc snippet.

DndContext / handlers (8.6–8.7):

onDragEnd: if manualSorting → delegate to hook (reducer + onSubheadingsItemUpdate); else existing processGroupChange + subheadingsDragEnd.
Group shell (8.8):

Manual: body rows in plain div (no DroppableGroup on the whole section), per doc.
Legacy: keep DroppableGroup.
Rows (8.9): manual path — placeholder strip + DroppableRowCell before each row / append / empty group; legacy path — current structure.

DragOverlay (8.10): resolve draggedItem for both modes; manual uses reducer activeId + groupedData.

loadingItemIds: pass through to row UI if copy does (spinner on row during API).

Regression guard: nested primary/secondary layout in clean must still use the same groupedData keys (effectiveNestedGrouping); manual sort is easiest when groups are flat buckets first; if you need nested + manual sort together, treat that as a Phase 2b spike (higher risk).

Phase 6 — Clean filtering-wrapper.tsx + types
Per doc Step 9:

Extend subheadingsConfig in
features/filtering-wrapper-multi-display-clean/filtering-wrapper.tsx
with: manualSorting?, idKey?, onSubheadingsItemUpdate?, loadingItemIds?, isManualOnChangeRef? (and listView? if used).

Pass them into SubHeadingsContainer alongside existing nestedGrouping, selectedGroupBy, selectedSubGroupBy, minimalControlsConfig, columnActions, filters.

Update TypeScript for subheadingsConfig in the same file (and any shared type module).

Phase 7 — Consumers & persistence (doc Step 10)
Demo / board: implement onSubheadingsItemUpdate (batch + refetch or optimistic cache) similar to portfolio-project-board copy, or a minimal demo that only mutates local state for smoke tests.

Avoid duplicate work: if legacy subheadingsDragEnd still runs on cross-group when manual sort already persisted, gate one path (doc Parent handler note).

Phase 8 — Docs, tests, rollout
Move or duplicate subheadings-manual-sort.md into
filtering-wrapper-multi-display-clean/features/subheadings/docs/
and adjust paths to say clean is canonical.

Smoke tests from doc Step 11 (same-group, cross-group, empty group, cancel, source row strip, half-row pointer).

Feature flag: ship with manualSorting: false everywhere until one route (e.g. dev page or project board on clean wrapper) opts in.

Dependency you may need outside subheadings
If persistence matches the board copy: buildManualSortUpsertRowsFromGrouped / getAffectedColumnKeys from kanban utils — either import from an existing clean path or duplicate minimal helpers under clean if you want zero dependency on non-clean kanban.

Suggested order of PRs
PR1: dnd/ types, constants, utils, DroppableRowCell, exports (no container change).
PR2: reducer + useSubHeadingsDnd dual mode + DraggableRow manual styling.
PR3: subheadings-container branches + overlay + collision ref.
PR4: filtering-wrapper + types + one consumer + doc.