# To implement — revisit route loading

**Goal:** Sidebar navigation to `/demo-hybrid-page` (including return visits) should not feel like a cold load when client data could already be warm.

**Status:** Partially addressed — route `loading.tsx` removed (renamed `_loading.tsx`); server prefetch + cache lifecycle still open.

---

## Symptom (original)

Sidebar navigation between demo pages showed route `loading.tsx` skeleton on every visit, even when the user had been on hybrid before.

## Partial fix applied

- Removed active `app/(root)/demo-hybrid-page/loading.tsx` (kept as `_loading.tsx` for reference).
- **Good:** no full-page skeleton flash on revisit; smoother SPA feel when prefetch is fast.
- **Trade-off:** cold/slow loads show generic `MainAreaFallback` from root layout instead of page-shaped skeleton.

See discussion in [first-review.md](../reflections/first-review.md).

---

## Root cause (still true)

| Factor | Effect |
|--------|--------|
| Sidebar `<Link>` soft nav | Swaps page segment; server runs `page.tsx` again |
| `page.tsx` awaits `prefetchRentalCarPage` | Blocks RSC segment until server prefetch completes |
| `QueryProvider` inside page tree | New `QueryClient` on each mount — **browser cache lost** on navigate away |
| Next 16 + `cacheComponents: true` | Stricter segment freshness; dynamic router cache ≈ no reuse by default |

Removing `loading.tsx` changed **what users see while waiting**, not **whether server work runs**.

---

## Remaining options

### Option A — Keep no route `loading.tsx` (current)

- **Good:** no revisit skeleton flash.
- **Bad:** weak cold-load affordance; server prefetch still runs every visit.

### Option B — Raise client router cache

Configure `staleTimes` in `next.config.ts` so revisited dynamic routes briefly reuse last RSC tree.

- **Good:** may skip server re-run on quick revisit.
- **Bad:** stale RSC payload vs fresh URL params; needs careful tuning with `cacheComponents`.

### Option C — Layout-level `QueryProvider` + thin `page.tsx`

**Plan:** [layout-query-provider.md](./layout-query-provider.md)

- Move `QueryProvider` to `(root)/layout.tsx` or a hybrid layout wrapper.
- On revisit: TanStack serves cached list/options; skip or shorten server prefetch.
- **Good:** fixes actual redundant fetch, not just skeleton.
- **Bad:** layout scope — ensure demo pages don't share wrong cache keys.

### Option D — Section-level Suspense only

Reintroduce narrow skeletons inside view sections (filters/table), not route-level full page.

- **Good:** layout-accurate loading on cold load without route flash on fast revisit (if combined with B or C).
- **Bad:** more composition work in `demo-hybrid-page-client.tsx`.

---

## Related files

- `app/(root)/demo-hybrid-page/_loading.tsx` (inactive)
- `app/(root)/demo-hybrid-page/page.tsx`
- `app/(root)/layout.tsx` — `MainAreaFallback`
- `entities/demo-hybrid-cars/providers/query-provider.tsx`
- `widgets/side-nav/ui/nav-link.tsx`
- `next.config.ts` (`cacheComponents: true`)

---

## Checklist

- [x] Remove route `loading.tsx` flash (partial — UX symptom)
- [ ] Decide: layout `QueryProvider` vs `staleTimes` vs thin prefetch
- [ ] Implement chosen revisit strategy
- [ ] Update story doc or add `architecture/6-revisit-navigation.md` when done
- [ ] Remove or archive `_loading.tsx` once strategy is final

---

## Recommended path

1. **Short term:** keep no route loading (current).
2. **Next:** implement [layout-query-provider.md](./layout-query-provider.md) — highest leverage for true revisit performance.
3. **Optional:** section skeletons for cold load if generic layout fallback feels too bare.
