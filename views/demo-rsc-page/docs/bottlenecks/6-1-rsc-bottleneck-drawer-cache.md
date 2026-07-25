# ⚡ RSC Bottleneck — Drawer URL Params vs List/Facet Cache

## 🧠 Context

Opening a URL-driven drawer changes `searchParams`:

```text
/demo-rsc-page?status=active&page=2
→ /demo-rsc-page?status=active&page=2&drawer=car&mode=view&id=5
```

Because `searchParams` changed, Next re-runs the RSC page. If list/facet loaders key off the **full** query string, drawer chrome forks a new cache entry and the open feels tied to filter/list work.

This is a classic URL-state + RSC invalidation problem.

---

## ❌ The Bottleneck

### What’s happening

Drawer open adds UI-only params (`drawer`, `mode`, `id`, `action`).

The page RSC re-runs:

```text
page.tsx → DemoRscIndex → FiltersSection / TableAndPaginationSection
```

If fetch identity includes drawer keys:

```text
server refetch filters/list
→ islands wait on “new” work
→ drawer open feels slow
```

### Why this happens

In the App Router, any `searchParams` change means a new RSC render — even when only `?drawer=` / `?id=` changed.

Stripping drawer keys from the DB query alone is not enough if the **cache key** still includes them:

```text
page=1&drawer=car&mode=view&id=car-3   ← treated as a new cache entry
page=1                                 ← should be the same list/facet entry
```

---

## ✅ What Was Applied

Keep the **URL-first drawer** (shareable links, back button, declarative open/close). Do **not** move drawer to Zustand for this fix.

Separate **data params** from **UI params**, and key list/facet loaders on data only.

### 1. Classify URL keys

File: `views/demo-rsc-page/config/contract/url-param-keys.ts`

```ts
DEMO_RSC_LIST_DATA_SEARCH_PARAM_KEYS  // page, limit, sort, filters, q, ...
DEMO_RSC_UI_ONLY_SEARCH_PARAM_KEYS    // drawer, mode, id, action, view
```

### 2. Build a data-only cache key

File: `views/demo-rsc-page/lib/demo-rsc-search-params-cache-key.ts`

```ts
const dataKey = demoRscDataParamsToCacheKey(params)
```

👉 Drawer open/close does not change `dataKey` when filters/pagination are unchanged.

### 3. Sections pass the data key into loaders

```ts
// FiltersSection
await getFilters(demoRscDataParamsToCacheKey(params))

// TableAndPaginationSection
await Promise.all([
  getCars(dataKey),
  getFilters(dataKey),
])
```

### 4. Cache the list loader on that key

File: `entities/cars-rsc/server/demo-rsc-cached-loaders.ts`

```ts
getCars = unstable_cache(
  async (dataParamsKey) => {
    const params = JSON.parse(dataParamsKey)
    const query = buildRentalCarListQuery(params)
    return getRentalCarsData(query)
  },
  ['demo-rsc-cars'],
  { revalidate: 60 }
)
```

👉 Same data URL slice → same cache entry, even when drawer chrome is present.

### 5. Keep transitions for perceived UX

URL writes still go through `wrapNavigation` (see `4-rsc-bottleneck-url-transitions.md`) so the RSC re-render does not feel like a hard lock while cached work resolves.

---

## 🧱 Result

```text
URL still drives drawer (shareable, back-button friendly)
RSC still re-runs on drawer param change
List/facet work does NOT fork a new cache identity for UI-only keys
```

Example:

```text
?page=1&drawer=car&mode=view&id=car-3
→ cache key uses page=1 (and other data keys only)
```

---

## 🔀 Alternatives (not chosen here)

### 1. Client-only drawer (Zustand / local state)

```text
click → local state → drawer opens instantly
```

- ✔ Fastest open
- ❌ No shareable drawer URL / weaker back-button semantics unless synced later

### 2. Client-first + URL sync

```text
Drawer store → open instantly → URL updates afterward
```

- ✔ Instant open + optional deep links
- ❌ Two sources of truth to keep in sync

### 3. Parallel / intercepting routes

```text
/projects
/projects/@drawer/(..)project/5
```

- ✔ Main page can stay intact; drawer loads as its own slot
- ❌ More Next.js routing complexity

### Practical rule

| Concern | Prefer |
|---|---|
| Changes the data (filters, sort, pagination) | URL params → data cache key |
| Changes only UI chrome (drawer, mode, id, action, view) | URL params OK for UX — **exclude from data cache key** |

---

## ⚠️ Important nuance

Excluding UI keys from the fetch/cache key does **not** stop the RSC tree from re-rendering when `searchParams` change.

It stops drawer chrome from being treated as **new list/facet work**. Combined with `unstable_cache` + navigation transitions, that is enough for this dashboard.

---

## Key Learnings

- **Drawer in URL still re-runs RSC** — `searchParams` identity drives the page render.
- **Cache key ≠ full URL** — Exclude UI-only keys (`drawer`, `mode`, `id`, `action`, `view`) from list/facet cache identity.
- **URL-first drawer can stay** — Shareable drawers do not require Zustand if data loaders are keyed correctly.
- **Strip-from-query alone is not enough** — The expensive path must also share a data-only cache key (e.g. `demoRscDataParamsToCacheKey` → `getCars`).
- **Transitions complement caching** — `wrapNavigation` softens the remaining RSC re-render while cached payloads resolve.
