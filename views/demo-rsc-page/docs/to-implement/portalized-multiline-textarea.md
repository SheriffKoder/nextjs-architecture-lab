# Portalized multiline textarea for editable cells

**Kind:** Explanation (dev notes)  
**Scope:** Inline editing of long text in a fixed-height virtualized table  
**Related:** [table-cell-overlay-z-index-scroll.md](./table-cell-overlay-z-index-scroll.md)

## Problem

Reports use `VirtualizedTable` with `dynamicRowHeight={false}` and `FixedSizeList` (~40px rows). An in-cell `<textarea>` would:

- Expand row height and break virtualization
- Clip inside truncated cells (`truncate overflow-hidden` on many columns)
- Fight layout when notes span multiple lines

## Goal

Allow multi-line editing for notes-style columns without changing row height or pagination math.

## Approach

When `multiline` is true, `EditableCell` keeps the row as read-only text. On edit, a **portaled textarea** opens over the cell at a fixed overlay size. Row height in the virtualized list stays unchanged.

Overlay positioning and z-index are described in [table-cell-overlay-z-index-scroll.md](./table-cell-overlay-z-index-scroll.md).

## Which columns use it

Multiline is enabled in `table-row.tsx` when:

```text
column.multiline ?? (/notes/i.test(column.key) && !date && !number && !dropdown)
```

Set `multiline: true` explicitly on `TableColumn` to opt in a non-notes column. No report config sets `multiline: true` today; matching is automatic via the column key.

Examples: `notes`, `notes_issues`, `phase1_notes`, `notes_reason1`, etc. See editable column configs under `features/reports/config/*/editable*.ts`.

## Implementation

### Files

| File | Role |
|------|------|
| `features/virtualized-table/types/table-column.ts` | Optional `multiline?: boolean` on `TableColumn` |
| `features/virtualized-table/components/rows/table-row.tsx` | Passes `multiline` into `EditableCell`; default rule for `*notes*` keys |
| `features/virtualized-table/components/rows/editable-cell.tsx` | Portal textarea, edit lifecycle, keyboard shortcuts |
| `features/virtualized-table/utils/overlay-portal-utils.ts` | Shared portal target and coordinates |

### Edit flow

1. User double-clicks or focuses the cell → `beginEdit()` → `isEditing = true`.
2. For `multiline`, the inline `<input>` path is skipped.
3. An effect computes overlay position via `computeTableOverlayPosition(cellRef, 280)` and stores `overlayRect` (includes `portalRoot`).
4. When `overlayRect` is set, `createPortal(<textarea />, overlayRect.portalRoot)` renders an **absolute** textarea aligned to the cell.
5. A follow-up effect focuses the textarea with `{ preventScroll: true }` and places the caret at end of text.
6. On save/cancel, `overlayRect` is cleared and the cell returns to display mode.

### Textarea behavior

| Action | Result |
|--------|--------|
| **Enter** | New line (default textarea behavior) |
| **Ctrl/Cmd + Enter** | Save and close |
| **Escape** | Cancel and close |
| **Blur / click outside / focus elsewhere** | Save and close |
| **Tab** at row edge | Save, then move focus to adjacent table cell |

`suppressBeginEditRef` blocks the parent cell’s `onFocus` from immediately reopening the editor after an outside close.

### Display mode

- Cell shows truncated plain text (`line-clamp` / title tooltip when multiline and text exists).
- Border highlights blue while editing (overlay visible).

### Why portal instead of in-cell textarea

```text
Virtualized row (fixed 40px)
  └── cell div (truncate)
        └── EditableCell display OR inline input   ← multiline skipped here
              
Portal (absolute, scroll container)
  └── textarea (min-h 96px, max-h 40vh, resize-y)
```

The textarea is not a child of the 40px row box, so it does not affect `FixedSizeList` item size.

## Adding multiline to a new column

1. Ensure the column is editable in the report’s `editableColumns` config.
2. Either name the key with `notes` (auto) or set `multiline: true` on the column in that report’s `columns.ts`.
3. Confirm the column is plain text (`isDateField`, `isNumberField`, `isDropdown` must be false for the auto rule).

## Testing

- [ ] Double-click a notes cell — textarea opens over the cell; row height unchanged
- [ ] Type multiple lines — row height still unchanged; textarea scrolls internally when content exceeds `max-h-[40vh]`
- [ ] Ctrl/Cmd+Enter saves; Escape cancels
- [ ] Click outside saves and does not reopen immediately
- [ ] Scroll table with editor open — overlay follows cell; header stays on top (see z-index doc)
- [ ] Tab from last/first cell in row saves and moves focus correctly
