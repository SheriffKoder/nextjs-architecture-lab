# Phase 3 — URL drawer + client detail content

## Decision

Drawer open/mode/id stay in the URL (same contract as RSC). See
[drawer-url-state.md](../../../../app/development/hybrid-migration/decisions/drawer-url-state.md).

Confirm (`action=delete`) still uses URL for now; Phase 6 moves it to local modal state.

## What changed

### Platform (`url-drawer`)

- `useDrawerActions` reads/writes via `useUrlParamsTransport()` (`buildParams` + `commit`).
- `DrawerWrapper` / `DeleteActionModal` read via `useEffectiveSearchParams()`.
- RSC pages: router fallback (unchanged behavior).
- Hybrid: shallow commit under `ShallowUrlProvider` — no document flight.

### Hybrid view

- `ui/drawer/drawer-layer.tsx` mounts `DrawerWrapper` + orchestrator + delete modal.
- View mode: `modes/view/view-panel.tsx` (`useRentalCarDetail`) + `sections/` layout.
- Create / edit: `modes/create|edit/` shells with stub submit (Phase 4).
- `car-drawer-key.ts` — URL `drawer=` value (`car`).
- Row click / kebab View·Edit / delete column → `openView` / `openEdit` / `openRowDeleteConfirm`.
- Header **Add car** → `openCreate('car')`.
- Phase 1 `selectedId` status line removed.

## URL contract (unchanged)

```text
?drawer=car&mode=view|edit|create&id=car-15[&action=delete]
```

Deep link example:

```text
/demo-hybrid-page?view=list&page=2&drawer=car&mode=view&id=car-15
```

## Verify in DevTools

1. **Hover / click a visible row** — no `GET …/cars/:id` (detail seeded from list).
2. **Open drawer** — view panel shows data immediately from `detail(id)` / list `initialData`.
3. **Deep link** to an id not on the current list page — one by-id GET, then cached.
4. **Open/close drawer** — address bar updates; list/options queries do **not** refetch (UI-only keys).
5. **Paste deep link** with drawer + filters — both apply; list key ignores `drawer`/`mode`/`id`/`action`.

See also [1-detail-prefetch.md](../ui/1-detail-prefetch.md) (list seed vs fetch on miss).

## Why list stays stable

- Shallow URL write (no RSC remount).
- `buildRentalCarListQuery` only reads list/filter keys.
- `DEMO_RSC_UI_ONLY_SEARCH_PARAM_KEYS` keeps drawer keys out of data cache identity docs / NL exclusions.

## Key learnings

- Instant drawer on hybrid = **shallow URL**, not “no URL.”
- Detail freshness = TanStack cache; open state = URL.
- Confirm dialogs are ephemeral UI (Phase 6); record drawers are shareable navigation state.
