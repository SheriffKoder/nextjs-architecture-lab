# Scrollable tables (dashboard-2)

## Goal

On the dashboard, only the **project table** area should scroll vertically. Score cards, the filters header row, and pagination should stay visible; they should not move with a single page-level scrollbar.

## What was wrong before

The main column under the page header used **`overflow-y-auto`**, so the entire stack (scores → filters → table → pagination) lived in one scrollable region and grew with content. The table never received a **bounded height**, so flex children expanded and scrolling stayed at the page level instead of inside the table.

## What we changed

### 1. `features/dashboard-2/dashboard-2-client.tsx`

- Replaced the content column’s **`overflow-y-auto`** with **`overflow-hidden`** and a **flex column** layout.
- Wrapped **ScoreCards** and **FiltersHeader** in **`shrink-0`** so they don’t shrink.
- Wrapped **Dashboard2Content** in a container with **`flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden`** so it takes all remaining viewport height below scores + filters and passes a real height limit down to the table.
- Kept **PaginationFooter** in **`shrink-0`** so it stays at the bottom of the column without scrolling away with the table.

### 2. `features/dashboard-2/dashboard-2-content.tsx`

- Added **`overflow-hidden`** on the outer wrappers around **FilteringWrapper** so height is contained and doesn’t force the parent column to scroll again.

### 3. `features/filtering-wrapper-multi-display-clean/filtering-wrapper.tsx`

- Root: **`min-h-0`** on the flex column (with existing **`h-full`**) so the flex child that scrolls can shrink below its content size.
- The scroll region around the view (table, etc.): **`min-h-0 flex-1 overflow-y-auto overflow-x-hidden`** so overflow scrolls inside the wrapper when the parent chain supplies a bounded height.

### 4. `features/filtering-wrapper-multi-display-clean/features/virtualized-table/virtualized-table-container.tsx`

- Root: **`min-h-0`** with the flex column.
- Inner scroll stack: **`min-h-0`** on the **`flex-1 overflow-auto`** column and on the **`flex-1`** body wrapper so nested flex scrolling behaves correctly (sticky table header + body scroll stay inside this tree).

## Pattern to reuse elsewhere

For “fixed chrome + scrollable table only”:

1. **Ancestors:** `flex flex-col`, bounded height (`h-full` / `h-screen` chain from layout), **`min-h-0`** on flex items that must shrink.
2. **Do not** put **`overflow-y-auto`** on the same column that contains both fixed sections and the table unless you want the whole column to scroll.
3. **Table slot:** `flex-1 min-h-0 overflow-hidden` (or `min-h-0` + inner scroll) so the table subtree gets a definite max height.
4. **Why `min-h-0`:** In CSS flexbox, flex items default to **`min-height: auto`**, which blocks them from shrinking smaller than their content; that prevents inner **`overflow-auto`** from ever activating. **`min-h-0`** (or `min-height: 0`) fixes that.

## Related layout

Root app shell: `app/(root)/layout.tsx` uses **`h-screen overflow-hidden`** on the outer row and **`overflow-hidden`** on **`<main>`**, so the dashboard client can rely on a full-height main area when **`h-full`** is set on the page tree.
