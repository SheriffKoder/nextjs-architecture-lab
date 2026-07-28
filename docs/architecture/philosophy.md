# Architecture philosophy

When to prefer server vs client, how to pick RSC vs hybrid, and what stays in the URL.

---

## Prefer server rendering when

- Data is mostly read-only
- URL should be the source of truth
- SEO and shareability matter
- Security and validation on the server are priorities

**Demo:** [Phase 1 — Pure RSC](../lab/phase-1-rsc.md) · `/demo-rsc-page`

---

## Introduce client systems when

- UI interactions become highly local (dense filter clicks, inline edits)
- Optimistic updates materially improve UX
- Infinite scroll, drag/drop, or drafts need client cache
- Avoiding unnecessary server navigations matters

**Demo:** [Phase 2 — Hybrid](../lab/phase-2-hybrid.md) · `/demo-hybrid-page`

---

## RSC vs hybrid (decision checklist)

**Start with RSC when:**

- Page is mostly read-only after load
- Mutations are infrequent (create drawer, occasional toggle)
- Maximum server simplicity is the goal
- Soft-navigation latency on filter change is acceptable with Suspense + dimmer

**Bootstrap:** [`views/demo-rsc-page/implementation-plan.md`](../../views/demo-rsc-page/implementation-plan.md)

**Move to hybrid when:**

- Filter/sort/pagination clicks should feel instant (no RSC remount)
- Optimistic CRUD without `router.refresh()` matters
- Detail drawer should open from warm list cache
- Infinite “All” mode is a product requirement

**Bootstrap:** [`views/demo-hybrid-page/implementation-plan.md`](../../views/demo-hybrid-page/implementation-plan.md)

---

## What stays the same

Both demos share:

- URL params for list intent and drawer navigation
- Same `platform/url-kit` chrome (transport adapter differs)
- Same multi-view widget and config shape
- Same list query contract (`params` → query builder → data)

## What changes

| Concern | RSC | Hybrid |
|---------|-----|--------|
| First paint | Server render + Suspense | Server prefetch + hydrate |
| List fetch after interaction | Server navigation | TanStack query |
| URL writes | `router.replace` | `history.replaceState` |
| Mutations | Server actions | API routes + cache |
| Pending UX | Navigation dimmer | Fetch dimmer |

---

## URL vs client state (hybrid default)

| URL (shareable intent) | Client (ephemeral) |
|------------------------|-------------------|
| Filters, sort, pagination, view, `groupBy` | TanStack cache after hydration |
| Drawer `mode`, `id` | Confirm modal open, toast, form dirty state |
| `all=1`, `page`, `limit` | Hover prefetch warm-up |

Detail: [Phase 2 Q&A](../lab/phase-2-hybrid.md#questions--answered)

---

## Conclusions from the lab

- [Phase 1 conclusion](../lab/phase-1-rsc.md#conclusion)
- [Phase 2 conclusion](../lab/phase-2-hybrid.md#conclusion)
- [RSC → hybrid shifts](../../views/demo-hybrid-page/docs/architecture/rsc-to-hybrid-shifts.md)

Future: [Phase 4 comparison](../lab/comparisons.md) (planned)

---

## Goal of this repo

Not a finished product — a **lab** for understanding tradeoffs, plus a **kit** you can copy to configure real list pages.

**Kit entry:** [`docs/guides/README.md`](../guides/README.md)
