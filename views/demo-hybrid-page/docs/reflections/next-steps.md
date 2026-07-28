# Next steps — hybrid demo

Prioritized follow-up after Steps 0–5. Narrative companion to [production-notes.md](./production-notes.md) and the [to-implement](../to-implement/) plans.

The hybrid page is feature-complete for the core architecture story. Remaining work is **production polish** and **platform parity**, not re-proving the RSC → hybrid model.

---

## Priority order

### 1. Confirmation modal off URL (highest value, smallest blast radius)

`?action=delete` is transient UI state, not shareable data intent. Refresh or paste a link must not reopen a confirm dialog.

**Plan:** [confirmation-modal-off-url.md](../to-implement/confirmation-modal-off-url.md)

Drawer open/mode/id **stay in URL** — only confirm moves to local client state (context or tiny store). Pattern exists in `entities/demo-client-page/components/drawer/car-confirm-manager.tsx`.

---

### 2. Revisit navigation — finish what removing `loading.tsx` started

Route-level `loading.tsx` was removed (`_loading.tsx` kept for reference). That fixed the skeleton flash on sidebar revisit, but:

- `page.tsx` still **awaits** full server prefetch on every visit.
- `QueryProvider` mounts per page → browser TanStack cache is **lost** on navigate away.

**Plans:**

- [revisit-route-loading.md](../to-implement/revisit-route-loading.md) — symptom, partial fix, remaining options
- [layout-query-provider.md](../to-implement/layout-query-provider.md) — persistent client cache + optional thin `page.tsx`

---

### 3. nuqs adapter (when URL parsing becomes maintenance burden)

Shallow transport works without nuqs today. The adapter slot is reserved at `platform/url-kit/url-params/adapters/`.

**Plan:** [nuqs-adapter.md](../to-implement/nuqs-adapter.md)

Migrate only when adding more list pages or hitting client/server param drift — not urgent for this demo.

---

### 4. Cursor pagination (before real DB scale)

Offset pagination + optimistic toggles + infinite scroll can produce dupes/skips under concurrent writes. Cursor/keyset is the production upgrade path.

**Plan:** [cursor-pagination.md](../to-implement/cursor-pagination.md)

Offset v1 is acceptable for the mock demo.

---

## Shared with RSC demo (platform chrome)

These RSC `to-implement` items apply to hybrid too — same url-kit chrome, same transport:

| RSC plan | Applies to hybrid |
|----------|-------------------|
| [dropdown-placeholders](../../demo-rsc-page/docs/to-implement/dropdown-placeholders.md) | Yes — wire `filterOptionsLoading` on hybrid filter-options query |
| [filter-labels-url-ids](../../demo-rsc-page/docs/to-implement/filter-labels-url-ids.md) | Yes — URL keeps IDs; UI shows labels |
| [table-cell-overlay-z-index-scroll](../../demo-rsc-page/docs/to-implement/table-cell-overlay-z-index-scroll.md) | Yes — multi-view table cells |

Implement once in platform; both demos benefit.

---

## Explicitly out of scope (demo)

- Reverse list → infinite cache bridge (sequential vs random-access mismatch — see [5-infinite-scroll.md](../ui/5-infinite-scroll.md))
- Real DB / auth (repository layer is swappable; mock store is intentional)
- Moving drawer open state off URL (rejected for production parity — see [3-url-drawer-client-content.md](../drawers/3-url-drawer-client-content.md))

---

## Net shape after remaining steps

```text
RSC page.tsx          → cold load + optional light prefetch (or skip on revisit)
Layout QueryProvider  → TanStack cache survives sidebar navigation
Shallow url-params    → shareable list URL, no RSC remount
URL drawer            → shareable record navigation
Local confirm modal   → ephemeral UI only
Route handlers        → mutations + optimistic cache
```

That line — **URL for shareable intent, client cache for interaction, local state for transient UI** — is the production-ready hybrid contract.
