# ⚡ RSC Bottleneck — Hover Prefetch vs Drawer By-Id Fetch

## 🧠 Context

Row hover prefetches drawer detail via a server action. Opening the drawer loads the same row by `id` again.

```text
hover  → getRentalCarByIdAction(id)   // client server action POST
open   → getRentalCarByIdAction(id)   // drawer RSC / same action path
```

Without a shared cross-request cache, both paths pay the full by-id cost (including simulated delay).

---

## ❌ The Bottleneck

### What’s happening

1. `demo-rsc-content` prefetches on row pointer enter:

```ts
const handleRowPointerEnter = (row) => {
  void getRentalCarByIdAction(row.id)
}
```

2. Drawer view content loads the same id on open:

```ts
// rsc-car-drawer-view-content.tsx
const car = await getRentalCarByIdAction(id)
```

3. Both go through:

```text
getRentalCarByIdAction
  → getRentalCarByIdCached
    → getRentalCarById   // mock lookup + DEMO_RSC_SIMULATE_RENTAL_CAR_BY_ID_MS
```

### Why it felt like a double fetch

| Layer | Scope | Helps hover → open? |
|---|---|---|
| React `cache()` in `getRentalCarById` | **Per request only** | ❌ Hover POST and drawer open are different requests |
| No cross-request cache on by-id | Each call runs the full loader | ❌ Prefetch work is thrown away |

So prefetch did not warm the open path — it duplicated work:

```text
hover: wait ~delay, get row
open:  wait ~delay again, get same row
```

Server actions also POST to the current page URL, so the network tab shows repeated `POST /demo-rsc-page?...` on hover.

---

## ✅ What Was Applied

Keep one by-id entry point for prefetch and drawer. Cache it across requests by stable `id`.

### 1. Shared server action

File: `entities/cars-rsc/actions/get-rental-car-by-id-action.ts`

```ts
export async function getRentalCarByIdAction(id: string) {
  return getRentalCarByIdCached(id)
}
```

👉 Prefetch and drawer view call the same action — one contract.

### 2. Cross-request cache by id

File: `entities/cars-rsc/server/demo-rsc-cached-loaders.ts`

```ts
export const getRentalCarByIdCached = unstable_cache(
  async (id: string) => getRentalCarById(id),
  ['demo-rsc-rental-car-by-id'],
  { revalidate: 60 }
)
```

👉 Hover and open within `revalidate` share the same cached payload for that `id`.

### 3. Per-request dedupe still in the loader

File: `entities/cars-rsc/server/get-rental-car-by-id.ts`

```ts
const loadRentalCarById = cache(async (id) => {
  await simulateServerDelay(DEMO_RSC_SIMULATE_RENTAL_CAR_BY_ID_MS)
  return rentalCars.find((c) => c.id === id) ?? null
})
```

👉 Same id twice in **one** request still collapses via React `cache()`.

### 4. Prefetch stays fire-and-forget

```ts
void getRentalCarByIdAction(row.id)
```

👉 Does not block the row UI; warms `unstable_cache` before click when possible.

---

## 🧱 Result

```text
hover  → fill unstable_cache[id]
open   → hit unstable_cache[id]  (no second full delay when warm)
```

Independent of the list fetch — by-id is its own loader keyed only by `id` (see also `6-row-fetch`).

---

## ⚠️ Nuances

- Prefetch still issues a server-action POST; caching removes **duplicate work**, not the first request.
- Cold open (no prior hover, or cache expired) still pays the by-id delay once.
- List/facet cache keys (`demoRscDataParamsToCacheKey`) are a different bottleneck — see `6-1-rsc-bottleneck-drawer-cache.md`.

---

## Key Learnings

- **Prefetch and open must share one loader path** — Same `getRentalCarByIdAction` / `getRentalCarByIdCached` for both.
- **React `cache()` is not enough across hover → open** — Those are separate requests; need `unstable_cache` (or equivalent) keyed by `id`.
- **Prefetch without cross-request cache doubles cost** — Hover becomes wasted work plus a slow open.
- **By-id is independent of the list** — Cache by stable `id`, not by full page `searchParams`.
