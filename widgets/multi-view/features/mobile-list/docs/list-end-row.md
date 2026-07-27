# Cards end slot (`listEndRow`)

Feature: `widgets/multi-view/features/mobile-list/`  
Host: `components/list/mobile-list-wrapper.tsx`  
URL view: `cards`

## Purpose

Same orchestrator contract as list/table: optional trailing virtualized slot for infinite load-more (or similar chrome), inside the TanStack Virtual scroll content.

## Mechanism

1. Build normal rows via `buildVirtualRows` (`group-header` | `card`).
2. When `listEndRow` is set, append `{ kind: 'end-slot', id: '__mobile-list-end-row__' }`.
3. `estimateSize` for `end-slot` uses `listEndRowHeight` (default **40**).
4. Render path mounts `listEndRow` in a fixed-height wrapper (fills the slot for `h-full` children).
5. Not domain data — never passed to `MobileCardItem` / row click / cell edits.

## API

| Prop | Default | Notes |
|------|---------|--------|
| `listEndRow` | — | Omit when idle (no blank slot). |
| `listEndRowHeight` | `40` | Compact load-more; override to match card chrome if needed. |

Wired from `ViewOrchestrator` → `MobileListWrapper`.

See also: `features/virtualized-list/docs/list-end-row.md`, `views/demo-hybrid-page/docs/ui/5-infinite-scroll.md`.
