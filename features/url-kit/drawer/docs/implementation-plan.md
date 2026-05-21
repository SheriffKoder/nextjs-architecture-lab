# Implementation plan

## Scope

Build the generic drawer param system under `features/ui/drawer/` and `features/ui/confirm/`, then create a new clean car drawer manager under `features/demo-client-page/components/` that consumes it. The old `demo-client-create-car-drawer-manager.tsx` will be replaced entirely — not patched.

## Files to create

* `features/ui/drawer/drawer.types.ts`
* `features/ui/drawer/useDrawerParams.ts`
* `features/ui/drawer/index.ts`
* `features/ui/confirm/useConfirmAction.ts`
* `features/ui/confirm/index.ts`
* `features/demo-client-page/components/car-drawer-manager.tsx` — new clean manager (replaces old one)
* `features/demo-client-page/components/car-confirm-manager.tsx` — car-specific confirm modal (sibling of drawer)

## Files to update

* `features/demo-client-page/demo-client-index.tsx` — point at new manager + `car-confirm-manager`
* `features/demo-client-page/components/demo-client-car-view-drawer-container.tsx` — no internal changes, just receives props from new manager
* `features/demo-client-page/components/edit-slider-form.tsx` — no internal changes, `onRequestDelete` stays `(displayLabel: string) => void`

## Files to delete (after migration verified)

* `features/demo-client-page/components/demo-client-create-car-drawer-manager.tsx`

---

## 1 — drawer.types.ts (~25 lines)

* `DrawerMode` = `'add' | 'view' | 'edit'`
* `DrawerAction` = `'delete'` (union, extend later)
* `DrawerParams` = `{ drawer: string | null, mode: DrawerMode | null, id: string | null, action: DrawerAction | null }`
* param key constants: `DRAWER_PARAM`, `MODE_PARAM`, `ID_PARAM`, `ACTION_PARAM`

## 2 — useDrawerParams.ts (~90 lines)

* reads `useSearchParams()` → returns typed `DrawerParams`
* `setParams(patch)` — merges only the keys you pass, preserves the rest of the query string (filters, pagination, etc.)
* `clearAll()` — removes `drawer`, `mode`, `id`, `action`
* `clearAction()` — removes `action` only
* `closeDrawer()` — alias for `clearAll()`
* derived getters: `isOpen` (has `drawer` and either `mode=add` or `mode` + `id`), `drawerType`, `mode`, `id`, `action`
* uses `useRouter` + `usePathname` internally, same `router.replace` pattern as today

## 3 — useConfirmAction.ts (~50 lines)

* thin layer on top of `useDrawerParams`
* `openConfirm(action, drawer, id)` — calls `setParams({ drawer, id, action })`
* `cancelConfirm()` — calls `clearAction()`
* `confirmDone()` — calls `clearAll()`
* `isConfirmOpen` — `Boolean(action && id && drawer)`
* `confirmAction` — current `action` value
* `confirmId` — current `id` value
* `confirmDrawer` — current `drawer` value

## 4 — `car-confirm-manager.tsx` (~110 lines, under demo-client-page)

* reads `useConfirmAction()` from `features/ui/confirm`
* if `!isConfirmOpen` → `null`
* if `action === 'delete'` → renders `<ConfirmModal>` with:
  * label resolved from TanStack list cache (scan `rentalCarKeys.lists()` pages for `id`) or fallback string
  * entity mutation picked by `drawer` value (for now: `drawer === 'car'` → `useDeleteRentalCar`)
  * `onConfirm` → `mutateAsync(id)`, toast success, `confirmDone()`
  * `onClose` → `cancelConfirm()`
* sits as a sibling of the drawer panel in the page tree (not inside `RightDrawer`)
* new entities copy this pattern beside their drawer manager — see `features/ui/confirm/docs/example-entity-confirm-manager.md`

## 5 — car-drawer-manager.tsx (new, ~150 lines)

Why new file instead of patching the old one
* The old manager mixes URL helpers, param constants, three internal body components, delete state, open-trigger hooks, and the confirm modal — 420 lines
* A clean file starts with the right imports and zero legacy; easier to review, easier to delete the old file

What it contains
* imports `useDrawerParams` for all param reads and writes (no local param constants, no `cloneSearchParams`, no `replaceUrlQuery`)
* `CarDrawerManager` component:
  * `useDrawerParams()` → `isOpen`, `mode`, `id`, `closeDrawer`, `setParams`
  * renders `<RightDrawer isOpen onClose>` with three branches by `mode`:
    * `add` → `<AddDrawerBody>` (inline, same as today — create mutation + `CarSliderForm`)
    * `view` → `<ViewDrawerBody>` (inline, same as today — detail query + `DemoClientCarViewDrawerContainer`, `onSwitchToEdit` = `setParams({ mode: 'edit' })`)
    * `edit` → `<EditDrawerBody>` (inline, same as today — detail query + update mutation + `EditSliderForm`, `onRequestDelete` = `setParams({ action: 'delete' })`)
  * fresh-form-key effect for add mode (same logic)
  * no delete state, no confirm modal, no `useDeleteRentalCar` — that lives in `car-confirm-manager.tsx`

Exported open-trigger hooks (thin, use `useDrawerParams` internally)
* `useOpenCarAddDrawer()` → `setParams({ drawer: 'car', mode: 'add' })`
* `useOpenCarViewDrawer()` → `(id) => setParams({ drawer: 'car', mode: 'view', id })`
* `useOpenCarEditDrawer()` → `(id) => setParams({ drawer: 'car', mode: 'edit', id })`

## 6 — Rewire demo-client-index.tsx

* swap import from old manager to new `car-drawer-manager.tsx` (`CarDrawerManager`, `useOpenCarAddDrawer`, `useOpenCarViewDrawer`)
* mount `car-confirm-manager` default export as sibling of `<CarDrawerManager />`
* row click → `openView(car.id)`
* add button → `openAdd()`
* table action delete (future) → `setParams({ drawer: 'car', id: car.id, action: 'delete' })`

## 7 — No changes to child components

* `demo-client-car-view-drawer-container.tsx` — still receives `car` + `onSwitchToEdit`, no param awareness
* `edit-slider-form.tsx` — still receives `onRequestDelete?: (displayLabel: string) => void`, no param awareness
* `car-slider-form.tsx` — unchanged
* detail-slider cards — unchanged

## 8 — Delete old manager

* `demo-client-create-car-drawer-manager.tsx` — delete after `tsc` passes and UI is verified

## 9 — index.ts barrels

* `features/ui/drawer/index.ts` — re-exports `useDrawerParams`, types, param constants
* `features/ui/confirm/index.ts` — re-exports `useConfirmAction` only (`docs/example-entity-confirm-manager.md`)

---

## Order of work

1. `drawer.types.ts` + `useDrawerParams.ts` + barrel (no consumers yet)
2. `useConfirmAction.ts` + barrel
3. `car-drawer-manager.tsx` + `car-confirm-manager.tsx` — managers import generic hooks; confirm stays entity-colocated
4. `demo-client-index.tsx` — swap to new manager + mount `car-confirm-manager`
5. `tsc --noEmit`, verify UI: add / view / edit / delete from edit header
6. delete `demo-client-create-car-drawer-manager.tsx`
7. (next iteration) table action column wired to `setParams({ drawer: 'car', id, action: 'delete' })`
