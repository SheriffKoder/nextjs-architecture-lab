# Step 3 — URL drawer + client content

## What this step introduced

- Drawer open/mode/id stay in the **URL** (same contract as RSC): `?drawer=car&mode=view|edit|create&id=car-15`.
- Drawer **body** is TanStack client-side: `useRentalCarDetail(id)` + list seed / fetch on miss.
- `url-drawer` platform kit reads/writes via `useUrlParamsTransport()` — shallow on hybrid, router fallback on RSC.
- Hybrid view: `drawer-layer.tsx`, view/create/edit modes, row actions → `openView` / `openEdit` / `openCreate`.

## What bottleneck it fixed

- **Tension between shareable deep links and interactive drawer performance.** Early hybrid drafts considered moving drawer state off the URL entirely to avoid navigation cost — but that cost was already gone once shallow transport landed (Step 2.5).
- **RSC drawer cache invalidation** when drawer params forked list/facet cache identity (RSC bottleneck 6-1).

## Findings during implementation

### Store vs URL — why we kept URL

**Zustand or a local store is a valid assumption** for drawer open/mode/id — simpler API, no URL parsing, matches the RSC conclusion's initial "move drawer off URL" recommendation.

We chose **URL-driven drawer state for production-level experience**:

- Deep links and shareable record views (`?drawer=car&mode=view&id=car-15`).
- Back/forward and bookmark parity with the RSC demo.
- Same URL contract across RSC and hybrid — one mental model for the team.

**Performance did not require dropping URL state.** Instant drawer on hybrid = **shallow URL write** + **warm detail cache** (Step 1 seed/prefetch), not "no URL."

- Detail freshness → TanStack cache.
- Open state → URL.
- Confirm dialogs are ephemeral UI (Phase 6 off URL); record drawers are shareable navigation state.

## Fixes applied during the step

- List row used as `initialData` for detail — no by-id GET when row is visible.
- `DEMO_RSC_UI_ONLY_SEARCH_PARAM_KEYS` keeps drawer keys out of list/options query identity.
- Phase 1 `selectedId` status line removed — drawer is the detail surface.

## Trade-offs and remaining edges

- Confirm (`action=delete`) still uses URL for now — [confirmation-modal-off-url.md](../to-implement/confirmation-modal-off-url.md).
- Deep link to id not on current list page → one by-id GET (acceptable).

### Verify in DevTools

1. **Hover / click a visible row** — no `GET …/cars/:id` (detail seeded from list).
2. **Open drawer** — view panel shows data immediately.
3. **Deep link** to id not on list page — one by-id GET, then cached.
4. **Open/close drawer** — address bar updates; list/options do **not** refetch.

Related: [1-detail-prefetch.md](../ui/1-detail-prefetch.md).
