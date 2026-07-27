# Drawer Detail — Fetch By Id

## Recommended architecture

Drawer always fetches by id.

Treat drawer as independent:

```text
DrawerLayer
   ↓
CarDetailSection(id)
   ↓
getRentalCarById(id)
```

Example:

```tsx
<Suspense fallback={<DrawerLoading />}>
  <CarDrawerContent carId={drawer.id} />
</Suspense>
```

### Why this is correct

#### 1. Works for all entry points

A user can open:

```text
/cars?page=1&drawer=car&id=123
```

or directly:

```text
/cars?drawer=car&id=999
```

No issue.

#### 2. Drawer becomes portable

Later:

- Dashboard alerts → open car drawer
- Search results → open car drawer
- Kanban → open car drawer

Same detail loader.

#### 3. Keeps section isolation

Table remains: table concern only.

Drawer remains: detail concern only.

Much cleaner.

---

## But what about duplicate fetch cost?

Same server calls are cached.

React `cache` or Next caching can be used.

Example:

```ts
const getRentalCarById = cache(async (id: string) => {
  ...
})
```

That helps if the same ID is requested multiple times **in one request**.

But:

```text
table list fetch != detail fetch
```

These are different queries.

So table cache will not automatically help unless it is manually reused.

---

## Best UX improvement: prefetch drawer data

When a user hovers or clicks a row, warm the by-id loader before open.

Options:

- `<Link href={...} prefetch />`
- `router.prefetch(...)`
- explicit server action: `getRentalCarByIdAction(id)`
- later in TanStack: `queryClient.prefetchQuery(...)`

That way:

```text
open drawer → data already warm
```

This is better than trying to steal data from the current page.

Hover prefetch vs drawer open sharing one cache is covered in
[6-2-rsc-bottleneck-by-id-prefetch](../bottlenecks/6-2-rsc-bottleneck-by-id-prefetch.md).

---

## Suggested final flow

### Current

```text
Index
 ├── TableAndPaginationSection
 └── DrawerLayer
```

### Drawer

```text
DrawerLayer
  parse URL
  if drawer open:
      render DrawerContent(id)
```

### DrawerContent

```text
DrawerContent
   await getRentalCarById(id)
```

### UX optimization

If row click triggers:

```ts
router.replace(...drawer params...)
```

Also prefetch detail first.

Possible sequence:

```ts
await preloadRentalCar(id)
openDrawer()
```

In this repo the sequence is fire-and-forget prefetch on hover, then URL open on click (no await before open).

---

## Implementation status (this repo)

Legend: **Done** — shipped as described. **Done (variant)** — same intent, different shape than the original bullet. **Todo** — not implemented yet.

### Done

- **Server loader + per-request dedupe:** `entities/cars-rsc/server/get-rental-car-by-id.ts` — `loadRentalCarById` wrapped in React **`cache()`**; reads from `data-source` `rentalCars`; optional delay via `DEMO_RSC_SIMULATE_RENTAL_CAR_BY_ID_MS` in `simulate-server-delay.ts`.
- **Cross-request cache:** `entities/cars-rsc/server/demo-rsc-cached-loaders.ts` — **`getRentalCarByIdCached`** wraps `getRentalCarById` in **`unstable_cache`** keyed by `id` (`revalidate: 60`).
- **Server Action entry (fetch):** `entities/cars-rsc/actions/get-rental-car-by-id-action.ts` — **`getRentalCarByIdAction(id)`** (`'use server'`) delegates to **`getRentalCarByIdCached`**.
- **Async view body:** `views/demo-rsc-page/ui/drawer/modes/view/view-panel.tsx` — default export **`async`**; **`await getRentalCarByIdAction(id)`**; renders **`CarDrawerViewSectionsLayout`** from `sections/sections-layout.tsx`.
- **Suspense + loading UI:** `views/demo-rsc-page/ui/drawer/car-drawer-orchestrator.tsx` — **`mode === 'view'`** wraps **`CarDrawerViewPanel`** in **`<Suspense>`** with **`CarDrawerViewSkeleton`** (header + pulse block).
- **`key={id}` on async child:** `CarDrawerViewPanel` is rendered with **`key={id}`** so row switches remount the detail subtree.
- **Server drawer stack + params (no `useSearchParams` in content):** `demo-rsc-index.tsx` passes **`params`** into **`DemoRscDrawerLayer`** → **`CarDrawerOrchestrator`** uses **`parseDrawerState(params)`** (same contract as URL).
- **Server `DemoRscDrawerLayer`:** `ui/drawer/drawer-layer.tsx` — no `'use client'`; composes **`DrawerWrapper`** + **`CarDrawerOrchestrator`**. Delete confirm UI lives in client island **`actions/delete-modal.tsx`**.
- **`DrawerWrapper`** remains client (`platform/url-kit/url-drawer`); it receives server-rendered drawer body as children.
- **Prefetch on row hover:** `demo-rsc-content.tsx` — **`onRowPointerEnter`** calls **`void getRentalCarByIdAction(row.id)`** so open can hit the warm `unstable_cache` entry.

### Done (variant) / deferred from original plan

- **No separate `CarDrawerDetailSection` file** — view fetch + sections layout live in **`CarDrawerViewPanel`** instead of a standalone `CarDrawerDetailSection` component.
- **No `children` slot from `DemoRscIndex` into `DrawerWrapper`** — detail is not composed as `children` from the index file; **`params`** are threaded so **`CarDrawerOrchestrator`** stays server and owns branching + Suspense.

### Todo

- **Edit mode detail fetch:** `CarDrawerEditContent` is still placeholder-by-id only; no **`getRentalCarByIdAction`** / shared sections layout there yet if parity with view is wanted.

---

## File map (quick reference)

| Piece | Path |
|--------|------|
| By-id loader + `cache()` | `entities/cars-rsc/server/get-rental-car-by-id.ts` |
| Cross-request `unstable_cache` | `entities/cars-rsc/server/demo-rsc-cached-loaders.ts` (`getRentalCarByIdCached`) |
| Server action (fetch + prefetch) | `entities/cars-rsc/actions/get-rental-car-by-id-action.ts` |
| Row hover prefetch | `views/demo-rsc-page/demo-rsc-content.tsx` |
| Params → drawer | `views/demo-rsc-page/demo-rsc-index.tsx` → `DemoRscDrawerLayer` |
| Server drawer shell | `views/demo-rsc-page/ui/drawer/drawer-layer.tsx` |
| Delete modal (client) | `views/demo-rsc-page/ui/drawer/actions/delete-modal.tsx` |
| Branch + Suspense | `views/demo-rsc-page/ui/drawer/car-drawer-orchestrator.tsx` |
| Async view + details UI | `views/demo-rsc-page/ui/drawer/modes/view/view-panel.tsx` |
| Details sections (client) | `views/demo-rsc-page/ui/drawer/modes/view/sections/sections-layout.tsx` |

This matches the architecture above while fitting
`app/(root)/demo-rsc-page/page.tsx` → **`DemoRscIndex`** → table vs drawer layout already in the tree.

---

## Key Learnings

- **Drawer detail is its own fetch** — Load by stable `id`; do not depend on the current table page payload.
- **Portable entry points need by-id** — Deep links, alerts, and other surfaces can open the same drawer with the same loader.
- **List cache ≠ detail cache** — Different queries; reuse only when intentionally shared.
- **Prefetch + cross-request cache makes open feel instant** — Hover calls the same `getRentalCarByIdAction` / `getRentalCarByIdCached` path the drawer uses (see `6-2-rsc-bottleneck-by-id-prefetch`).
- **Suspense keeps the shell usable** — View mode suspends on by-id while the drawer chrome and table stay responsive.
