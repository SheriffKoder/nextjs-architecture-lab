# Hybrid conclusion

Summary of architecture outcomes after Steps 0–5. Companion to [RSC conclusion](../../demo-rsc-page/docs/reflections/9-rsc-conclusion.md) — some early RSC recommendations were revised once shallow transport landed.

---

## Where hybrid clearly outperforms pure RSC

| Interaction loop | Pure RSC pain | Hybrid win |
|------------------|---------------|------------|
| Filter / sort / page change | RSC remount + transition dimmer | Shallow URL + TanStack refetch |
| Drawer open (warm row) | Server cache ≠ client cache | List seed + shared detail key |
| Activity toggle / CRUD | `revalidatePath` + refresh cycle | Optimistic cache + invalidate |
| All mode / load more | Giant fetch or repeated navigations | `useInfiniteQuery` append |
| Back/forward on filters | Soft navigation replay | `popstate` → same query keys |

The pattern: **RSC for cold load and hydration; TanStack for everything that repeats after first paint.**

---

## What stays URL-first (intentionally)

- **List filters, sort, pagination, view mode** — shareable, bookmarkable, server-parseable on cold load.
- **Drawer open/mode/id** — shareable record navigation state. Store/Zustand was considered; URL chosen for production parity with RSC demo.
- **Not URL:** confirm modal ([to-implement](../to-implement/confirmation-modal-off-url.md)), toast state, transition/fetch pending chrome.

---

## Major architectural shifts (vs RSC)

1. **Interactive data owner** — TanStack cache after hydration, not refreshed RSC tree.
2. **URL transport** — shallow commit on hybrid; router fallback on RSC; same chrome.
3. **Detail** — client cache with list seed; server `unstable_cache` not sufficient alone.
4. **Mutations** — route handlers + optimistic updates; no `revalidatePath` for routine feedback.
5. **Pagination products** — separate `list` and `infinite` caches; one-way bridge (`infinite → list`).

Full cross-phase detail: [rsc-to-hybrid-shifts.md](../architecture/rsc-to-hybrid-shifts.md).

---

## Revised vs RSC conclusion

The RSC conclusion suggested moving drawer off URL and using TanStack selectively. Hybrid implementation refined that:

| RSC conclusion | Hybrid outcome |
|----------------|----------------|
| Drawer → client store | Drawer URL stays; body is TanStack |
| TanStack for detail + mutations only | TanStack also owns list/options after hydration |
| Table stays RSC | Table data from TanStack; RSC prefetches only |

The RSC conclusion was right about **where complexity was coming from** (workarounds for missing client fetch layer). Hybrid didn't reject TanStack for list — it extended hydration to cover list/options too.

---

## What remains deferred

See [production-notes.md](./production-notes.md) and [next-steps.md](./next-steps.md):

- Confirm modal off URL
- Cursor/keyset pagination
- nuqs adapter (transport slot reserved)
- Revisit navigation (partial — route loading removed; cache lifecycle open)

---

## Key learnings

- Shareable URL ≠ App Router navigation — shallow transport separates them.
- Instant drawer = shallow URL + warm detail cache, not "no URL."
- Separate list/infinite caches are a UX choice (random access vs sequential append), not a framework requirement.
- One-way cache bridge is practical; reverse bridge is hard because infinite is sequential.
- Workarounds (transition dimming, prefetch navigation, server-only infinite compromises) were signals to add client state — not to abandon URL for list data.

Prior review: [first-review.md](./first-review.md).

Decision index: [rsc-to-hybrid-shifts.md](../architecture/rsc-to-hybrid-shifts.md#decision-index).
