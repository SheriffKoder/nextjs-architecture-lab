# To implement — confirmation modal off URL

**Prerequisite:** [4-optimistic-mutations.md](../ui/4-optimistic-mutations.md), [3-url-drawer-client-content.md](../drawers/3-url-drawer-client-content.md)

**Goal:** Delete (and future archive) confirmation is **local UI state** — not `?action=delete` in the URL. Refresh and share links must not reopen a confirm dialog.

**Status:** Not started

**Doc to add when done:** `views/demo-hybrid-page/docs/drawers/6-confirmation-modal.md`

**Resolves:** [RSC next-steps — action param note](../../demo-rsc-page/docs/reflections/next-steps.md)

---

## Why

`action=delete|archive` describes **UI phase** (a dialog is open), not data. More action variants do not change that — refresh/share semantics for a confirmation modal are actively bad.

Drawer open/mode/id **stay URL-driven** ([3-url-drawer-client-content.md](../drawers/3-url-drawer-client-content.md)). Only confirm moves off URL.

---

## Step 6.1 — Replace URL delete confirm with modal state

### Reference files

| File | Why |
|------|-----|
| `views/demo-hybrid-page/ui/drawer/actions/delete-modal.tsx` | Today URL-driven; becomes store-driven |
| `platform/url-kit/url-drawer/components/delete-action-modal.tsx` | `action=delete` read pattern |
| `platform/url-kit/url-drawer/hooks/use-drawer-actions.ts` | `openRowDeleteConfirm`, `triggerDelete` |
| `entities/demo-client-page/components/drawer/car-confirm-manager.tsx` | **Target pattern** — confirm-only store + list cache label lookup |

### Actions

- Add `views/demo-hybrid-page/model/confirm-modal-store.ts` (or React context — no Zustand required for one modal):

```ts
{ type: 'delete' | 'archive' | null; carId: string | null; openDelete(id); close() }
```

- Row delete → `openDelete(id)` — **no URL change**.
- Modal reads `carId`; resolve label from TanStack list cache (`rentalCarKeys.lists()` scan) — no extra fetch.
- Remove `action` from hybrid URL contract docs and parsers where hybrid-specific.

### Expected outcome

- Delete confirm opens/closes without URL params.
- Refresh page → modal not open.
- Deep link with `drawer=car&mode=view&id=…` still works; no `action=delete`.

### Solves

- Bad share/refresh semantics for transient confirm UI.
- URL parser special case for `action=delete` eliminated on hybrid.

---

## Step 6.2 — Wire delete mutation

### Reference files

| File | Why |
|------|-----|
| `entities/demo-hybrid-cars/mutations/use-delete-rental-car.ts` | Existing DELETE mutation |
| `views/demo-hybrid-page/ui/drawer/actions/delete-modal.tsx` | Confirm UI |
| `views/demo-hybrid-page/ui/drawer/drawer-layer.tsx` | Mount point |

### Actions

- Confirm button → `useDeleteRentalCar().mutate(id)`.
- On success: close modal, close drawer if open (`useDrawerActions().close()`), invalidate lists + infinites + detail.

### Expected outcome

- End-to-end delete without URL action param.
- List row disappears via existing optimistic/invalidate path.

### Solves

- Completes CRUD loop without RSC-style URL action param.

---

## Step 6.3 — Row delete without opening drawer

### Reference files

| File | Why |
|------|-----|
| `views/demo-hybrid-page/ui/demo-hybrid-content.tsx` | `openRowDeleteConfirm` on kebab delete |
| `views/demo-rsc-page/docs/to-implement/done/row-actions.md` | Row kebab delete behavior |

### Actions

- Kebab delete → open confirm modal directly (drawer may stay closed).
- Drop `openRowDeleteConfirm` URL trick (`drawer` + `id` + `action=delete` sans `mode`).

### Expected outcome

- Delete from row menu works with modal only.
- View drawer unaffected when deleting from another row's kebab.

### Solves

- Cleaner row action API — one imperative `openDelete(id)`.

---

## Step 6.4 — Document the lesson

### Actions

Add `drawers/6-confirmation-modal.md` using the five-section story template:

1. What this step introduced
2. What bottleneck it fixed (URL modals on refresh/share)
3. Findings during implementation
4. Fixes applied
5. Trade-offs (drawer URL unchanged; archive variant ready in store type)

### Expected outcome

- Future features don't reintroduce URL modals.

---

## Checklist

- [ ] Confirm modal on client store/context
- [ ] Label from list cache (no extra GET)
- [ ] Delete mutation wired
- [ ] Row kebab delete without URL action param
- [ ] No `action` in hybrid URL contract
- [ ] Story doc: `drawers/6-confirmation-modal.md`

---

## Key learnings (for doc)

- URL is for **shareable data intent** (list filters, open record drawer), not **transient UI phase** (confirm dialogs).
- Drawer URL + local confirm is the production split — not drawer-off-URL entirely.
