Recommended architecture (senior choice)
Drawer always fetches by id

Treat drawer as independent:

DrawerLayer
   ↓
CarDetailSection(id)
   ↓
getRentalCarById(id)

Example:

<Suspense fallback={<DrawerLoading />}>
  <CarDrawerContent carId={drawer.id} />
</Suspense>
Why this is correct
1. Works for all entry points

User can open:

/cars?page=1&drawer=car&id=123

or directly:

/cars?drawer=car&id=999

No issue.

2. Drawer becomes portable

Later:

Dashboard alerts → open car drawer
Search results → open car drawer
Kanban → open car drawer

Same detail loader.

3. Keeps section isolation

Table remains:

table concern only

Drawer remains:

detail concern only

Much cleaner.

But what about duplicate fetch cost?

Good question.

You already noticed:

same server calls are cached.

You can use React cache or Next caching.

Example:

const getRentalCarById = cache(async (id: string) => {
  ...
})

That helps if same ID is requested multiple times.

But:

table list fetch != detail fetch

These are different queries.

So table cache won't automatically help unless you manually reuse it.

Best UX improvement: prefetch drawer data

This is the missing piece.

When user hovers or clicks row:

<Link
  href={...}
  prefetch
/>

or explicit prefetch:

router.prefetch(...)

or later in TanStack:

queryClient.prefetchQuery(...)

That way:

open drawer → data already warm

This is better than trying to steal data from current page.

Suggested final flow
Current
Index
 ├── TableAndPaginationSection
 └── DrawerLayer
Drawer
DrawerLayer
  parse URL
  if drawer open:
      render DrawerContent(id)
DrawerContent
DrawerContent
   await getRentalCarById(id)
UX optimization

If row click triggers:

router.replace(...drawer params...)

Also:

prefetch detail first

Possible sequence:

await preloadRentalCar(id)
openDrawer()

---

## Implementation status (this repo)

Legend: **Done** — shipped as described. **Done (variant)** — same intent, different shape than the original bullet. **Todo** — not implemented yet.

### Done

- **Server loader + per-request dedupe:** `features/demo-rsc-page/utils/server/get-rental-car-by-id.ts` — `loadRentalCarById` wrapped in React **`cache()`**; reads from `data-source` `rentalCars`; optional delay via `DEMO_RSC_SIMULATE_RENTAL_CAR_BY_ID_MS` in `simulate-server-delay.ts`.
- **Server Action entry (fetch):** `features/demo-rsc-page/actions/get-rental-car-by-id-action.ts` — **`getRentalCarByIdAction(id)`** (`'use server'`) delegates to **`getRentalCarById`**; re-exported from `features/demo-rsc-page/actions.ts` for convenience.
- **Async view body:** `features/demo-rsc-page/components/drawer-content/rsc-car-drawer-view-content.tsx` — default export **`async`**; **`await getRentalCarByIdAction(id)`**; renders **`DemoClientCarSliderDetailsContainer`** from `details-content/details-container.tsx` (collapsible vehicle + rental sections).
- **Suspense + loading UI:** `features/demo-rsc-page/components/drawer-content/rsc-car-drawer-content.tsx` — **`mode === 'view'`** wraps **`RscCarDrawerViewContent`** in **`<Suspense>`** with **`RscCarDrawerViewSkeleton`** (header + pulse block). *(Original plan suggested placing this boundary in `demo-rsc-index`; functionally the boundary lives in `RscCarDrawerContent` instead.)*
- **Server drawer stack + params (no `useSearchParams` in content):** `demo-rsc-index.tsx` passes **`params`** into **`DemoRscDrawerLayer`** → **`RscCarDrawerContent`** uses **`parseDrawerState(params)`** (same contract as URL).
- **Server `DemoRscDrawerLayer`:** `components/drawer-content/demo-rsc-drawer-layer.tsx` — no `'use client'`; composes **`DrawerWrapper`** + **`RscCarDrawerContent`**. Delete confirm UI lives in client island **`rsc-car-drawer-delete-modal.tsx`**.
- **`DrawerWrapper`** remains client (`features/ui/drawer-2`); it receives server-rendered drawer body as children.

### Done (variant) / deferred from original plan

- **No separate `CarDrawerDetailSection` file** — view fetch + `DetailsContainer` live in **`RscCarDrawerViewContent`** instead of a standalone `CarDrawerDetailSection` component.
- **No `children` slot from `DemoRscIndex` into `DrawerWrapper`** — detail is not composed as `children` from the index file; **`params`** are threaded so **`RscCarDrawerContent`** stays server and owns branching + Suspense.

### Todo

- **`key={id}` on `Suspense` (or async child)** in `rsc-car-drawer-content.tsx` when switching rows via client navigation — reduces risk of stale UI if React ever reuses the boundary incorrectly. *(Verify first whether param-only `router.replace` already remounts the RSC subtree in your Next version.)*
- **Prefetch** (row hover / before open): call **`getRentalCarByIdAction(id)`**, `router.prefetch`, or TanStack `prefetchQuery` — not wired.
- **Edit mode detail fetch:** `RscCarDrawerEditContent` still placeholder-by-id only; no **`getRentalCarByIdAction`** / shared **`DetailsContainer`** there yet if you want parity with view.
- **Cross-request cache** (optional): today only React **`cache()`** (per request); no `unstable_cache` / HTTP `fetch` cache for by-id reads.

---

## Implementation plan (original checklist — annotated)

Target: `demo-rsc-page` — drawer detail loads by **`id`** via loader + **server action**, **`Suspense`** for view loading, table payload not required for drawer.

### 1. Server loader — **Done**

- **`getRentalCarById(id)`** in `utils/server/get-rental-car-by-id.ts`, mock `rentalCars` + **`cache()`**.

### 2. Async detail UI (Server Component) — **Done (variant)**

- Async **`RscCarDrawerViewContent`** + **`getRentalCarByIdAction`** + **`DetailsContainer`**; no separate **`CarDrawerDetailSection`** file.

### 3. `Suspense` boundary — **Done (variant)**

- Boundary is in **`rsc-car-drawer-content.tsx`**, not a separate slot under **`demo-rsc-index.tsx`**.

### 4. Compose with the client drawer shell — **Done (variant)**

- **`DemoRscDrawerLayer`** is server and passes **`params`**; delete modal is a **client** sibling file. Original “`children` only from index” pattern not used.

### 5. Trim / split `RscCarDrawerContent` — **Done (partial)**

- **`RscCarDrawerContent`** is **server**; **`create`** still uses client **`RscCarDrawerCreateContent`**. View uses server async child; edit unchanged (still thin placeholder).

### 6. Navigation and remounting — **Todo**

add a stable remount strategy when id changes, and confirm URL-only updates refresh server drawer data.”
Putting key={id} on the Suspense boundary (or on RscCarDrawerViewContent) tells React: when id changes, treat this as a new subtree

- Explicit **`key={id}`** + verify RSC refresh on search-param-only navigations as needed.

### 7. Prefetch (optional UX) — **Todo**

- Not implemented.

### 8. Order of work — **superseded by status above**

Historical order replaced by **Implementation status** at top of this section.

---

## File map (quick reference)

| Piece | Path |
|--------|------|
| By-id loader + `cache()` | `utils/server/get-rental-car-by-id.ts` |
| Server action (fetch) | `actions/get-rental-car-by-id-action.ts`, export in `actions.ts` |
| Params → drawer | `demo-rsc-index.tsx` → `DemoRscDrawerLayer` |
| Server drawer shell | `components/drawer-content/demo-rsc-drawer-layer.tsx` |
| Delete modal (client) | `components/drawer-content/rsc-car-drawer-delete-modal.tsx` |
| Branch + Suspense | `components/drawer-content/rsc-car-drawer-content.tsx` |
| Async view + details UI | `components/drawer-content/rsc-car-drawer-view-content.tsx` |
| Details sections (client) | `components/drawer-content/details-content/details-container.tsx` (+ vehicle / rental children) |

This matches the architecture above while fitting **`app/(root)/demo-rsc-page/page.tsx`** → **`DemoRscIndex`** → table vs drawer layout already in the tree.