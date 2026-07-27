# List end row (`listEndRow`)

Feature: `widgets/multi-view/features/virtualized-list/`  
Component: `virtualized-list-container.tsx` (`VirtualizedTableComponent`, used as list view)

Same orchestrator prop is also honored by:

- `features/virtualized-table/` — table view
- `features/mobile-list/` — cards view (`end-slot` virtual row)

## Purpose

Append an optional **trailing virtualized slot** after all data (and grouped) rows — typically an infinite load-more control or footer chrome.

The slot is part of the same virtualized scroll content as the rows, so it scrolls with content and only mounts when near the viewport (same virtualization rules as data rows).

## Why not render below the list?

The list body scrolls inside `FixedSizeList` / `VariableSizeList` (or TanStack Virtual for cards). A sibling below the surface sits outside that scroll content, so IntersectionObserver / “scroll to end” behavior does not track the row stream. An end row lives in the same scroll content as the data.

## API

| Prop | Type | Behavior |
|------|------|----------|
| `listEndRow` | `ReactNode` | When set, `itemCount = dataItemCount + 1`. Last index renders this node. |
| `listEndRowHeight` | `number?` | Override height for the end index. **Default (list/table):** `calculatedRowHeight`. **Default (cards):** `40`. |

Passed through `ViewOrchestrator` as `listEndRow` / `listEndRowHeight` to **table**, **list**, and **cards**. Board views ignore it.

## How the list implements it

```text
displayData.length  →  dataItemCount
itemCount           →  dataItemCount + (listEndRow ? 1 : 0)
```

1. **`calculateRowHeight(index)`** — if `index === dataItemCount`, return `listEndRowHeight ?? calculatedRowHeight`.
2. **`rowRenderer`** — same index branch renders `listEndRow` inside the react-window `style` slot (absolute positioning from the list). Handled **before** flattened / data-row logic.
3. **VariableSizeList** — forced when `listEndRow` is set (even if `dynamicRowHeight` is false) so the end slot can share the measured row height.
4. **Not data** — end index is never passed to `onRowClick`, selection, `TableRowMeasurer`, or treated as `T`.
5. **`isLastRow` on data** — still `index === dataItemCount - 1` (last real row), not `itemCount - 1`.

Grouped mode uses the same `+1` after `flattenedRows`; the end slot is not a `FlattenedRow` type.

## Table / cards (same prop)

| View | Host | Mechanism |
|------|------|-----------|
| `list` | `virtualized-list-container` | react-window last index |
| `table` | `virtualized-table-container` | same pattern as list |
| `cards` | `MobileListWrapper` | append `{ kind: 'end-slot' }` to virtual rows |

## Consumer pattern (hybrid demo)

```tsx
<ViewOrchestrator
  listEndRow={
    showLoadMore ? (
      <InfiniteLoadMore
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        loadTrigger={loadTrigger}
      />
    ) : undefined
  }
/>
```

Omit `listEndRow` (or pass `undefined`) when there is nothing to load — avoids an empty trailing slot after the last page.

Page wiring: `views/demo-hybrid-page` — `all=1` on table / list / cards embeds load-more via `listEndRow`.

See also: `views/demo-hybrid-page/docs/ui/5-infinite-scroll.md`.

## Styling notes (list POV)

- The end slot wrapper is a full-size flex container (`h-full w-full`) matching the react-window row box.
- Row **height** follows the list (`calculatedRowHeight`); chrome inside `listEndRow` should fill that box if it should look like a row.
- Visual tokens (background, border, hover) belong to the consumer node (e.g. `InfiniteLoadMore`), not the list container — the list stays view-agnostic.

## Do / don’t

| Do | Don’t |
|----|--------|
| Pass a presentational node only | Put real domain items in `listEndRow` |
| Gate with `undefined` when idle | Leave a permanent empty `+1` row |
| Rely on default height for parity with rows | Assume FixedSizeList alone if end height differs |
| Use for IO sentinel or “Load more” button | Expect board views (kanban, …) to honor this prop |
