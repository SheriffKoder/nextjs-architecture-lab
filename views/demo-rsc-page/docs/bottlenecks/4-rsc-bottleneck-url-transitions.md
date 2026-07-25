# ⚡ RSC Bottleneck — Navigation UX + Streaming Islands

## 🧠 Context

URL updates from filters, pagination, and drawers trigger RSC re-renders. Without a client transition layer, those navigations feel blocking. Without Suspense islands, one slow section can dominate the whole page.

The hybrid model:

- Client handles **how** the URL transitions (smooth, non-blocking)
- Server still owns **loading real data** for the new URL
- Suspense defines loading boundaries so slow islands show skeletons instead of blocking the shell

---

## ❌ The Bottleneck

### Blocking URL updates

Client code called `router.replace` directly. React treated the navigation as urgent, so the UI could feel stuck while RSC work ran.

### Coarse loading UX

A full-page fallback (or one big wait) hid partial UI. Filters and header could not stay stable while the table island refreshed.

### Sequential server work in the list island

Table content needed both list + facet payloads. Sequential awaits added unnecessary wait before the island could render.

### No pending signal on the slow island

Even with Suspense, there was little immediate feedback on the table region during in-place URL transitions.

---

## ✅ What Was Applied

### 1. `useTransition` via `wrapNavigation` (client)

Files:

- `platform/url-kit/filters/navigation-transition-context.tsx`
- `platform/url-kit/url-drawer/hooks/use-drawer-actions.ts`
- `platform/url-kit/filters/feature-filtering/hooks/useUrlFilters.ts`
- `platform/url-kit/filters/feature-pagination/hooks/useUrlPagination.ts`
- (also sorting / NL filter hooks)

Pattern:

```ts
const { wrapNavigation } = useNavigationTransitionOptional()

wrapNavigation(() => {
  router.replace(...)
})
```

What React does:

- keep current UI interactive
- mark the update as “pending”
- render new state in the background

`useTransition` is the bridge between:

```text
User interaction → Slow system (RSC or TanStack)
```

No-op skip (avoids false pending flashes):

```ts
if (params.toString() === searchParams.toString()) return
wrapNavigation(() => {
  router.replace(`${pathname}?${params.toString()}`, { scroll: false })
})
```

👉 Skips replace when the serialized query is unchanged so mount-time clears do not start a transition.

### 2. Suspense islands (layout)

File: `views/demo-rsc-page/demo-rsc-index.tsx`

```tsx
<Suspense fallback={<FiltersSkeleton />}>
  <FiltersSection params={params} />
</Suspense>

<TablePaginationErrorBoundary>
  <Suspense fallback={<TableSkeleton />}>
    <TableAndPaginationSection params={params} />
  </Suspense>
</TablePaginationErrorBoundary>
```

Why:

- Filters can stream independently of the table island
- Table + pagination share one boundary (same list payload) — no separate `PaginationSkeleton` flash for the real bottleneck
- Users see partial UI instead of one big full-page loader

Route shell:

- `app/(root)/demo-rsc-page/page.tsx` has **no** outer Suspense
- Segment `loading.tsx` covers initial route load
- Index keeps Suspense for section islands after the shell paints

### 3. Keep RSC for data

`FiltersSection` and `TableAndPaginationSection` stay async server loaders.

### 4. Parallel loaders in the list island

File: `views/demo-rsc-page/ui/layout-sections/table-and-pagination-section.tsx`

```ts
;[cars, filters] = await Promise.all([
  getCars(dataKey),
  getFilters(dataKey),
])
```

👉 Still RSC — just less unnecessary waiting when both payloads are required.

### 5. Pending UI on the slow island

```tsx
<NavigationTransitionRoot>
  ...
  <NavigationPendingDimmer>
    <DemoRscContent ... />
    <PaginationFooter ... />
  </NavigationPendingDimmer>
</NavigationTransitionRoot>
```

- `NavigationTransitionRoot` in the index exposes shared `isNavigationPending`
- `NavigationPendingDimmer` dims the table/pagination island after a short delay (avoids opacity flash on fast/cached updates)
- Suspense still shows `TableSkeleton` when the island suspends

---

## 🧱 Applied Fix Summary

- `Promise.all([getCars, getFilters])` in `TableAndPaginationSection`
- `wrapNavigation` on URL replacers in filter / pagination / sorting / NL hooks (and drawer `openView`)
- No Suspense on `page.tsx`; `NavigationTransitionRoot` on the index; dimmer around the table island
- Suspense kept in the index for section islands / initial section loads
- Skip no-op `replace` when query string is unchanged

---

## 🚀 Evolving into TanStack

RSC gives:

- ✔ great initial load
- ✔ clean architecture
- ✔ server truth

But struggles with:

- ❌ interactive filtering UX
- ❌ perceived latency
- ❌ multi-stream responsiveness

Add a client layer for:

- filter changes
- loading transitions
- pagination updates

👉 This is where TanStack improves interactive UX while keeping the same list contract (`RentalCarListQuery` / `getRentalCarsData`).

👉 Evolve this RSC page into a hybrid streaming + TanStack incremental hydration model without rewriting everything.

---

## Key Learnings

- **Hybrid navigation** — Client owns URL transition smoothness (`wrapNavigation` / `useTransition`); RSC still owns data for the new URL.
- **Suspense islands beat full-page loaders** — Skeleton the slow island (table + pagination); let filters/header stay or stream separately.
- **Parallelize what the island needs** — `Promise.all([getCars, getFilters])` when both are required for one boundary.
- **Pending UI next to the bottleneck** — Dimmer / `isNavigationPending` on the table island gives feedback during in-place URL updates.
- **Skip no-op replaces** — Unchanged query strings should not start transitions or flash pending UI.
- **RSC has an interactive ceiling** — Transitions + Suspense help perceived latency; TanStack is the next step for filter/pagination interactivity without abandoning the query contract.
