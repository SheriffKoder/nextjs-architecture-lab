# Drawer structure

## What we want

* Generic drawer system (reusable across entities)
* Entity-specific logic isolated under each feature (demo client cars live under `features/demo-client-page/` for now)
* URL param handling centralized in `features/ui/drawer/`
* Confirm param helpers in `features/ui/confirm/`; **entity confirm UI** colocated with that feature (e.g. `car-confirm-manager.tsx`), same URL contract
* Cleaner mental model (less branching, composition over giant ternaries)
* Extensible (cars, employees, clients, …)

## Target file layout

* `features/ui/drawer/`
  * `useDrawerParams.ts` — read/write search params (drawer, mode, id, action, …)
  * `drawer.types.ts` — shared types
  * `DrawerRoot.tsx` — registry-based renderer for the slide-over shell
  * `drawer.registry.ts` — maps `drawer` value → entity root component
* `features/ui/confirm/`
  * `useConfirmAction.ts` — helpers to open/close/clear confirm-related params
  * `docs/example-entity-confirm-manager.md` — placeholder pattern for a new entity (users, …)
* `features/demo-client-page/components/` — e.g. `car-drawer-manager.tsx`, `car-confirm-manager.tsx` (drawer + confirm UI for cars)
* `features/ui/drawer/docs/example-entity-drawer-manager.md` — placeholder pattern for a new entity drawer manager

## URL contract

* `drawer` — entity key (e.g. `car`)
* `mode` — `add` | `view` | `edit` (or whatever the entity supports)
* `id` — record id when viewing/editing (and when driving confirm for that record)
* `action` — optional intent for global confirm UI (e.g. `delete`; later `archive`, `duplicate`, …). **Only `delete` is in scope for now.**

Naming is illustrative (`drawer=car`); keep names consistent with one documented param spec.

## Mode and action (composable)

* `mode` and `action` are **composable**: e.g. while `mode=edit` (or `view`), you can set `action=delete` so the confirm modal can open **on top of** the current drawer context without dropping `mode`/`id`.
* Future actions reuse the same pattern; implement **delete** first.

## Drawer manager vs confirm manager (per entity)

* **Drawer manager** — e.g. `CarDrawerManager`: if `drawer === 'car'`, render `RightDrawer` and branch add / view / edit by `mode`.
* **Confirm manager** — e.g. `car-confirm-manager.tsx`: if `action === 'delete'` (and required `id` / `drawer` for cars), render delete confirm (extend per action later).
* Keep confirm **outside** the drawer panel subtree so z-index and “confirm from table without opening the drawer panel” stay predictable.

## Opening confirm from anywhere

* Set params together, e.g. `{ drawer: 'car', id: car.id, action: 'delete' }` (exact helper lives in `useDrawerParams` / `useConfirmAction`).
* Table row, edit header trash, or future entry points all use the same setter.

## After confirm vs cancel (param cleanup)

* **After confirm (delete succeeded):** clear **all** drawer-related params you use for this flow (`drawer`, `mode`, `id`, `action`, …) so URL and UI return to baseline.
* **After cancel:** remove **`action` only**, so the user stays in the same drawer context (`drawer`, `mode`, `id` unchanged).

## Label and TanStack

* **Prefer** display text for the confirm modal from **list query cache** (scan cached list pages for the row by `id`) or **`placeholderData`**, so table-initiated delete does not require an extra GET.
* **Use** the detail query hook (e.g. `useCar` / `useRentalCarDetail`) **only when needed** (cache miss, or you explicitly want fresh detail for copy).

## Mutations

* Delete mutation only needs **`id`**; no detail fetch is required for the DELETE itself.
* Keep TanStack optimistic updates / invalidation in the entity mutation hooks as today.

## Registry and bundle size

* A static registry that imports every entity drawer pulls all branches into the client bundle — fine for a starter app; at scale consider **dynamic imports** per `drawer` type.

## Goals

* Smaller files, clearer separation: URL state, shell rendering, entity business logic
* No monolithic drawer manager; entity modules register with the registry instead of hardcoding in core UI
* Preserve existing behavior while migrating: TanStack usage, toasts, separate form schemas (do not merge schemas)

## Constraints

* Keep existing functionality intact during migration
* Preserve TanStack Query patterns
* Preserve toast behavior
* Do not merge unrelated Zod form schemas



////////////////////////////////////////////////////////////////////////
// future references

Should You Fetch From TanStack Cache?

👉 Yes — but carefully.

✅ Correct Pattern
const { data } = useCar(id, {
  enabled: !!id,
})

TanStack will:

return cached data instantly ✅
fetch if missing ✅
stay consistent ✅
🚀 Optimization (Prefetch)

When opening drawer:

queryClient.prefetchQuery({
  queryKey: carKeys.detail(id),
  queryFn: () => fetchCar(id),
})

👉 So confirm modal is instant.
