# Optimistic mutations (TanStack)

Mirror: `views/demo-rsc-page/docs/ui/8-cell-optimistic-server-action.md`

**Goal:** Create / update / delete / activity toggle update the **client cache**, not the RSC tree via `revalidatePath` + `router.refresh()`.

---

## Transport choice

Mutations use **Route Handlers** under `/api/demo-hybrid-page/cars`:

| Method | Path | Body |
|--------|------|------|
| POST | `/cars` | Full create payload (Zod `rentalCarFormSchema`) |
| PATCH | `/cars/:id` | Edit fields **or** `{ status }` only (activity toggle) |
| DELETE | `/cars/:id` | — → 204 |

Persists to the shared in-memory mock store (`repository/`), so list GETs after `invalidateQueries` include creates/updates/deletes.

Documented in `entities/demo-hybrid-cars/README.md`.

---

## Hooks (`entities/demo-hybrid-cars/mutations/`)

| Hook | Cache strategy |
|------|----------------|
| `useCreateRentalCar` | Optimistic prepend (temp id) → replace on success → invalidate lists + options |
| `useUpdateRentalCar` | Patch detail + matching list rows → invalidate lists + options |
| `useDeleteRentalCar` | Optimistic remove from lists + drop detail → invalidate |
| `useToggleRentalCarActivity` | Optimistic status on lists + detail → rollback on error (~50% demo failure + 1.5s delay) |

Shared helper: `cache/invalidate-rental-car-caches.ts` (lists + infinites for Phase 5 prep).

---

## Activity column

1. Cell UI: `config/ui/cells/rental-car-set-activity-cell.tsx` (unchanged).
2. `columnActions.setActivity` in `demo-hybrid-content.tsx` → `useToggleRentalCarActivity`.
3. No `useOptimistic` / `router.refresh()` — checkbox flips from TanStack `setQueryData`.

---

## Drawer forms

- Create: `ui/drawer/modes/create` + `forms/create-form.tsx` → `useCreateRentalCar` → close drawer.
- Edit: `ui/drawer/modes/edit` + `forms/edit-form.tsx` → `useUpdateRentalCar`.
- Delete confirm: `ui/drawer/actions/delete-modal.tsx` → `useDeleteRentalCar` → close.

Chrome (`CarDrawerCreateHeader` / `CarDrawerEditHeader`) owns Reset/Save via `form={formId}`.

---

## Verify

1. Toggle activity — UI updates immediately; ~half the time toast error + revert after ~1.5s.
2. Create car — row appears in list; drawer closes; no full page remount.
3. Edit + save — list + open detail stay in sync.
4. Delete confirm — row disappears; cache rolls back if DELETE fails.
5. Network tab — `POST`/`PATCH`/`DELETE` to `/api/demo-hybrid-page/cars…` only (no RSC refresh POST for list).

---

## Key learnings

- Mutations target TanStack cache; RSC prefetch is cold-load only.
- Invalidate both `lists()` and `infinites()` (prep for infinite scroll).
- Optimistic updates live in mutation hooks, not React `useOptimistic` on URL-driven trees.
- Status-only PATCH shares the same `[id]` route as edit; body shape selects the path.
