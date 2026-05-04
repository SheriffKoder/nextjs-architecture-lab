# Example: entity drawer manager (e.g. users)

This folder (`features/ui/drawer`) only provides **URL param plumbing** — it does not know about cars, users, or any domain.

When you add a new entity (e.g. **users**), put a **dedicated manager** next to that feature’s UI, same idea as `features/demo-client-page/components/car-drawer-manager.tsx`.

## What stays generic (import from here)

* `useDrawerParams` — read `drawer`, `mode`, `id`, `action`; call `setParams`, `clearAll`, `clearAction`
* Types and param keys from `drawer.types` / barrel

## What you implement in the feature (example: `features/users-page/components/user-drawer-manager.tsx`)

* **Pick a `drawer` value** that is unique on that page, e.g. `drawer=user` (must match what your confirm manager and table actions set).
* **Map `mode` to UI** — e.g. `add` | `view` | `edit` or whatever the entity needs.
* **Render `RightDrawer`** (or your shell) with `isOpen` / `onClose` from `useDrawerParams()`:
  * `onClose` → `closeDrawer()` (clears all four keys).
* **Branch bodies** — small inner components or separate files: `UserAddBody`, `UserViewBody`, `UserEditBody`, each owning its own TanStack hooks and toasts.
* **Open helpers** — thin hooks that only call `setParams`, e.g.:
  * `useOpenUserAddDrawer` → `setParams({ drawer: 'user', mode: 'add' })`
  * `useOpenUserViewDrawer(id)` → `setParams({ drawer: 'user', mode: 'view', id })`
* **Cross-mode actions** — e.g. view → edit: `setParams({ mode: 'edit' })` while keeping `drawer` + `id`.
* **Do not** put delete confirm modals here — use a sibling **confirm manager** in the same feature (see `features/ui/confirm/docs/example-entity-confirm-manager.md`).

## Page wiring (example)

* Import `UserDrawerManager` and your `UserConfirmManager` (or whatever you name them).
* Render both as **siblings** under the page (or layout), below filters/table.
* Pass **list query** or other props the add form needs, same as cars.

## Checklist for a new entity

* [ ] Chosen `drawer` string documented and used consistently (table, drawer, confirm).
* [ ] `isOpen` rules match your modes (see `useDrawerParams` — add without id, view/edit with id).
* [ ] `setParams({ mode: 'add' })` clears stale `id` / `action` (handled by generic hook).
* [ ] Confirm flows set `action` only; cancel clears `action` via `useConfirmAction`.
