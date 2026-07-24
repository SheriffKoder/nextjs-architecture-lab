# Table cell overlays — z-index and scroll boundaries

**Kind:** Explanation (dev notes)  
**Scope:** Multiline textarea and editable dropdown overlays in `VirtualizedTable`  
**Related:** [portalized-multiline-textarea.md](./portalized-multiline-textarea.md)

## Problem

Editable cell overlays (multiline textarea and dropdown list) were portaled to `document.body` with `position: fixed` and a very high z-index (`z-[9999]` / `z-[10000]`).

That caused two UX bugs:

1. **Sticky header covered incorrectly** — The table header uses `sticky top-0 z-10` inside the scroll container. Body-level `fixed` elements live in a different stacking context, so they painted **above** the header even when their numeric z-index was lowered.
2. **Table jumped to the top on open** — A capture-phase `window` scroll listener repositioned overlays on every scroll event (including scroll side effects from `focus()`). Focus ran without `{ preventScroll: true }`, which could scroll the viewport or table container when the editor opened.

## Goal

Keep overlays visually anchored to the edited cell while:

- Stacking **below** the sticky header (`z-10`) and **above** body sticky columns (`z-5` and down)
- Not resetting scroll position when an overlay opens
- Updating overlay position only when the **table scroll container** scrolls or the window resizes

## Fix (shared overlay utility)

All positioning logic lives in one place:

| File | Role |
|------|------|
| `features/virtualized-table/utils/overlay-portal-utils.ts` | Scroll-root lookup, coordinate math, shared `TABLE_OVERLAY_Z_INDEX` |
| `features/virtualized-table/components/virtualized-table.tsx` | Marks scroll container with `data-table-scroll-container` |
| `features/virtualized-table/components/rows/editable-cell.tsx` | Multiline textarea portal |
| `features/virtualized-table/components/dropdown/dropdown-container.tsx` | Editable dropdown portal |

### 1. Portal into the table scroll container

Overlays render with `createPortal(..., scrollRoot)` instead of `document.body`.

The scroll root is the nearest ancestor matching:

```text
[data-table-scroll-container]  →  .overflow-y-auto  (fallback)
```

The scroll container already has `position: relative`, so `position: absolute` children stack inside the same context as the sticky header.

### 2. Use absolute coordinates inside the scroll root

Position is computed from the anchor cell (or trigger element):

```text
top  = anchorRect.top  - rootRect.top  + scrollRoot.scrollTop
left = anchorRect.left - rootRect.left + scrollRoot.scrollLeft
width = max(anchorRect.width, minWidth)
```

This replaces viewport `fixed` + `getBoundingClientRect()` top/left on `document.body`.

### 3. Z-index

| Layer | z-index | Location |
|-------|---------|----------|
| Sticky table header | `10` | `table-header.tsx` |
| Cell overlays (textarea, dropdown) | `9` | `TABLE_OVERLAY_Z_INDEX` |
| Body sticky columns | `5` and below | `sticky-column-utils.ts` |

Because overlays and header share the scroll container stacking context, `9 < 10` reliably keeps the header on top.

### 4. Scroll listeners

**Before:** `window.addEventListener('scroll', handler, true)` — capture on all scrollable ancestors and the window.

**After:** `scrollRoot.addEventListener('scroll', handler, { passive: true })` plus `window` `resize` only.

Table body scrolling still repositions the overlay; unrelated page scroll no longer triggers updates or focus-related scroll jumps.

### 5. Focus without scroll (textarea)

The multiline editor calls `textareaRef.current?.focus({ preventScroll: true })` in a separate effect that runs **after** `overlayRect` is set (the textarea only mounts once coordinates exist).

## Before vs after

| | Before | After |
|---|--------|-------|
| Portal target | `document.body` | Table scroll container |
| Positioning | `fixed` + viewport rect | `absolute` + scroll-root rect |
| z-index | `9999`–`10000` | `9` |
| Scroll listener | `window`, capture | Table scroll container only |
| Textarea focus | `focus()` | `focus({ preventScroll: true })` |

## Trade-offs

- Overlays inside `overflow-y-auto` can be **clipped** at the container edge if they extend far below the cell. Textarea uses `max-h-[40vh]` and internal `overflow-y-auto` to limit that.
- If a future table layout removes `data-table-scroll-container`, overlays fall back to `.overflow-y-auto`; if neither exists, the overlay does not render (`computeTableOverlayPosition` returns `null`).

## Testing

- [ ] Open a notes textarea mid-table — scroll position unchanged; header stays above the editor when rows scroll under it
- [ ] Open an editable dropdown mid-table — same behavior
- [ ] Scroll the table while overlay is open — overlay tracks the cell
- [ ] Resize the window — overlay repositions
- [ ] Sticky left columns still visible; overlay does not hide under them incorrectly
