# To implement — layout QueryProvider + thin revisit prefetch

**Prerequisite:** [revisit-route-loading.md](./revisit-route-loading.md)

**Goal:** TanStack cache survives sidebar navigation; revisiting `/demo-hybrid-page` does not cold-start queries or block on full server prefetch when cache is still fresh.

**Status:** Not started

**Doc to add when done:** `views/demo-hybrid-page/docs/architecture/6-revisit-navigation.md`

---

## Problem

Today:

```text
Navigate away  → QueryProvider unmounts → QueryClient destroyed
Navigate back  → new QueryClient → page.tsx awaits prefetchRentalCarPage → full server round-trip
```

Removing route `loading.tsx` hid the skeleton; it did not fix redundant work.

---

## Step 6.A — Move QueryProvider up

### Reference files

| File | Why |
|------|-----|
| `entities/demo-hybrid-cars/providers/query-provider.tsx` | Current per-page provider |
| `views/demo-hybrid-page/ui/demo-hybrid-page.tsx` | Mounts provider today |
| `app/(root)/layout.tsx` | Candidate mount point |
| `app/(root)/demo-client-page/page.tsx` | Client demo also uses page-level provider |

### Actions

- Option 1: `(root)/layout.tsx` wraps `QueryProvider` for all authenticated shell routes.
- Option 2: `app/(root)/demo-hybrid-page/layout.tsx` — hybrid-only scope (safer for demo isolation).

Prefer **Option 2** for demo — avoids sharing cache with unrelated routes.

- Remove `QueryProvider` from `demo-hybrid-page.tsx`; keep `ShallowUrlProvider` + `HydrationBoundary` per navigation (snapshot may still change per URL).

### Expected outcome

- List/detail/infinite cache entries persist when navigating Demo RSC → Hybrid → back.
- Filter changes after revisit hit cache within `staleTime` (5m default).

### Solves

- "TanStack may already hold list data" on revisit — actually true, not just theoretical.

---

## Step 6.B — Thin `page.tsx` on revisit

### Reference files

| File | Why |
|------|-----|
| `app/(root)/demo-hybrid-page/page.tsx` | Blocks on `await prefetchRentalCarPage` |
| `entities/demo-hybrid-cars/hydration/prefetch-rental-car-page.ts` | Server prefetch |

### Actions

- **Cold load / hard refresh:** keep full prefetch + dehydrate (SEO, no client waterfall).
- **Client revisit with warm cache:** optional fast path — render client shell without awaiting prefetch, or prefetch only if dehydrated keys missing.

Implementation sketch (pick one):

1. Split route: thin sync shell + client decides whether to refetch.
2. Client hook checks `queryClient.getQueryData(rentalCarKeys.list(query))` — skip server prefetch when hit + fresh.
3. Use Next `loading` only for cold document loads (different from soft nav) — harder to detect reliably.

Simplest v1: layout provider alone — client hooks use cached data immediately; server prefetch still runs but UI paints from cache first if provider persisted.

### Expected outcome

- Revisit feels instant when cache warm, even if RSC payload still streams in background.

### Solves

- Double work on every sidebar click.

---

## Step 6.C — HydrationBoundary strategy

### Actions

- When cache warm: `HydrationBoundary` may receive empty or partial `dehydratedState` — client keeps existing cache (don't overwrite with empty).
- Document `HydrationBoundary` + persisted provider interaction in story doc.

### Expected outcome

- No cache clobber on revisit.

---

## Checklist

- [ ] `QueryProvider` in hybrid layout (or root layout with namespace guard)
- [ ] Remove duplicate provider from `demo-hybrid-page.tsx`
- [ ] Verify mutations + infinite still invalidate correctly across navigations
- [ ] Optional: skip server prefetch when client cache hit
- [ ] Story doc: `architecture/6-revisit-navigation.md`

---

## Trade-offs

- Layout-scoped provider couples hybrid route to TanStack lifecycle — acceptable for demo; production may use app-level provider with auth boundary.
- Must not leak hybrid entity keys into unrelated routes if using root layout.
