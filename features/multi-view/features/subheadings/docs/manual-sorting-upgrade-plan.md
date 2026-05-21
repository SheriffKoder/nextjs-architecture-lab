# Plan: Upgrading manual subheadings sorting

This doc was the roadmap for **nested grouping + manual order**. The **baseline implementation is now in clean** (see `manual-sorting-consumer-guide.md` for how to use it). Remaining sections document optional follow-ups (flags, tests, mode tightening).

---

## Implemented (as of this codebase)

- `manualSortActive === manualSorting === true` (with or without nested).
- `derivedGroupedData` sorts every bucket by `manual_sorting` when `manualSorting` is on (flat and nested).
- `subheadingsBoardReducer` accepts nested config: **`DRAG_END`** updates **`primaryKey` / `secondaryKey`** from the target composite key when nested is enabled; otherwise it updates **`groupByKey`** to the target bucket string (`buildItemAfterManualSubheadingsDrop` in `use-subheadings-state.ts`).
- Nested UI: each secondary leaf uses the same **slot droppables + placeholder** as flat manual when `manualSorting` is on; legacy nested keeps `DroppableGroup` when manual is off.

---

## Previous baseline (historical)

- Manual DnD used to be disabled whenever nested grouping was on; nested UI used only whole-group `DroppableGroup`.

---

## Goal options (pick before coding)

**A — Nested + reorder only within the same leaf bucket**  
User may reorder rows inside one composite group (`primary|secondary`). No drag across secondary or primary. Smallest change: same reducer shape (`Record<compositeKey, T[]>`), no field updates on drop beyond `manual_sorting` reindex.

**B — Nested + cross-secondary (same primary)**  
On drop into another secondary under the **same** primary: update `secondaryKey` (and composite membership), reindex `manual_sorting` in source and target buckets.

**C — Nested + full cross-primary**  
Also update `primaryKey` when the target bucket belongs to another primary. Requires clear rules for invalid targets (e.g. hide droppables, or snap back).

Recommendation: implement **A** first (parity with “flat manual” UX inside each section), then **B** if product needs reparenting without leaving subheadings view.

---

## Phase 1 — Data model and derived groups

1. **Composite keys stay the bucket id**  
   Nested grouping already builds `Record<string, T[]>` with keys like `` `${primary}${separator}${secondary}` ``. Manual sort should treat that string as `groupKey` everywhere the reducer and `createCellId` / `parseCellId` run (already compatible if cell ids use `::` and keys do not embed that delimiter ambiguously).

2. **`manual_sorting` scope**  
   Document that `manual_sorting` is **per leaf bucket** (per composite key), not global across the whole table—same as flat mode being per `columnKey` value.

3. **`derivedGroupedData`**  
   When `manualSorting && effectiveNestedGrouping?.enabled`, after building `groups`, sort each `groups[k]` by `manual_sorting` ascending (mirror the existing flat-only block). Remove the artificial `!effectiveNestedGrouping` guard for this sort only.

4. **Separator / key safety**  
   Audit composite key construction: if `primary` or `secondary` can contain the nested `separator`, fix encoding (escape, hash segment, or structured ids) before enabling nested manual sort in production.

---

## Phase 2 — Reducer and `DRAG_END` semantics

File: `dnd/hooks/use-subheadings-state.ts` (`subheadingsBoardReducer`).

1. **Today**  
   `DRAG_END` sets `updatedItem[groupByKey] = targetGroup` where `groupByKey` is the flat grouping field (e.g. `status`). That is **wrong** for nested buckets: `targetGroup` is a **composite key**, not the value of a single column.

2. **Upgrade**  
   - Thread `effectiveNestedGrouping` (or a small “drop policy” object) into the reducer **or** normalize in the container before dispatch: e.g. pass `targetCompositeKey` plus explicit `{ primary, secondary }` for persistence.
   - For **A**: on `DRAG_END`, only splice arrays; **do not** assign `item[groupByKey] = targetGroup`. Either skip field mutation or restrict reducer to `manualSorting` reindex when `sourceGroup === targetGroup` for nested mode.
   - For **B/C**: map `targetGroup` composite string → `(primary, secondary)`, assign `(item as any)[primaryKey]`, `(item as any)[secondaryKey]`, then splice and reindex `manual_sorting` for affected buckets only.

3. **`SubheadingsUpdateContext`**  
   Optionally extend with `sourceCompositeKey`, `targetCompositeKey`, or `patch: Partial<T>` so `onSubheadingsItemUpdate` can persist without re-parsing keys.

4. **`flattenGroupedData` / `UPDATE_DATA`**  
   Ensure parent-driven refetches still replace `groupedData` when `isManualOnChangeRef` is not set; nested maps should round-trip the same shape as today’s nested legacy path.

---

## Phase 3 — Container: enable manual + nested UI

File: `subheadings-container.tsx`.

1. **Gate**  
   Replace `manualSortActive = manualSorting && !nested` with something like `manualSortActive = manualSorting && (nestedManualSortAllowed !== false)` or simply `manualSorting === true` once behavior is safe. Keep a **temporary** feature flag if you want staged rollout: e.g. `manualSortingNested?: boolean` on `subheadingsConfig`.

2. **Nested branch UI**  
   Under `primaryGroupsMap` → each secondary block that today lists rows inside `DroppableGroup`:
   - When `manualSortActive`, render the **same** row loop as the flat manual branch: `DroppableRowCell` per slot, append slot, placeholder strip driven by `boardState.virtualPlaceholder`, `DraggableRow` with `manualSorting={true}`.
   - Use `secondaryKey` (composite) as `groupKey` for cell ids and reducer—must match keys in `groupedData`.

3. **Primary wrappers**  
   Keep primary expand/collapse chrome; only the **inner** list becomes slot-based droppables. Optionally disable primary-level `DroppableGroup` drop targets if they conflict with row-level collision detection.

4. **`onDragEnd`**  
   Already delegates to `handleDragEnd` when `manualSortActive`; once gate includes nested, no branch split needed for end handling—verify legacy nested drag is not double-firing (remove or guard old `DroppableGroup`-level drag if it still exists for nested).

5. **`toggleGroup` / listView**  
   Reuse the same `listView` and expansion rules as flat manual; confirm `expandedGroups` keys are composite strings everywhere.

---

## Phase 4 — DnD hook and collision

File: `dnd/hooks/use-subheadings-dnd.ts`.

- Manual path already uses `groupedData`, `parseCellId`, pointer Y; it should work for nested as long as `groupedData` keys match rendered `groupKey` on cells.
- Verify **no** assumption that `groupKey` is a single “enum-like” token (logging, `formatGroupName` only affects display).

---

## Phase 5 — API surface (`filtering-wrapper` + types)

1. Add optional `manualSortingNested?: boolean` (or fold into `manualSorting` once stable).
2. Document in TS JSDoc: when nested + manual, `onSubheadingsItemUpdate` may receive items whose **primary/secondary fields changed** (modes B/C).
3. Ensure `subheadingsDragEnd` remains legacy-only for non-manual or document that it is not called when manual reducer handles the drop.

---

## Phase 6 — Consumers and tests

1. **Demo**  
   Extend demo config with `nestedGrouping` + seeded `manual_sorting` per composite bucket; implement `onSubheadingsItemUpdate` to mutate or mock API.

2. **Automated checks**  
   - Reorder within one composite group → order and `manual_sorting` indices stable after reload (if persisted).
   - If B/C: cross-bucket drop → correct fields on dropped row; empty source bucket allowed.

3. **Smoke** (reuse `manual-sorting.md` Step 11 where applicable)  
   Cancel drag, overlay, half-row pointer, empty leaf group, keyboard if applicable.

---

## Suggested PR sequence

| PR | Scope |
|----|--------|
| 1 | `derivedGroupedData`: sort by `manual_sorting` for nested buckets; docs + types only; feature flag default **off**. |
| 2 | Reducer: nested-safe `DRAG_END` (mode **A** only); extend context type if needed. |
| 3 | `subheadings-container`: nested branch renders manual row UI; flip `manualSortActive` behind flag; integration smoke. |
| 4 | Modes **B/C** + demo + remove flag or default on. |

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Composite key collisions / separator in data | Encode or validate keys; add tests with adversarial strings. |
| `UPDATE_DATA` vs in-flight drag | Keep existing `isManualOnChangeRef` pattern for parent updates during drag. |
| Performance (many droppables) | Nested already multiplies groups; consider virtualized list constraints (register droppables only for visible rows if needed later). |
| Legacy `subheadingsDragEnd` vs `onSubheadingsItemUpdate` | Single writer to parent state; document which fires when. |

---

## Out of scope (unless product asks)

- Dragging **whole secondary sections** to reorder sections (different feature).
- Kanban-parity batch builders in subheadings (optional reuse of shared upsert helpers).
- Multi-select drag.

---

## References (code)

- Gate and derived sort: `subheadings-container.tsx` (`manualSortActive`, `derivedGroupedData`).
- Reducer: `dnd/hooks/use-subheadings-state.ts` (`subheadingsBoardReducer`, `DRAG_END`).
- Manual row UI: same file, branch around `manualSortActive` vs `primaryGroupsMap`.
- Original port checklist: `manual-sorting.md` (this folder).
