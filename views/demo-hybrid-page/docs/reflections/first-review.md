# First review — hybrid build mid-course

Observations while implementing Steps 0–5. Written in the same spirit as [RSC first-review](../../demo-rsc-page/docs/reflections/first-review.md).

---

## What's working

**Self-contained entity from Step 0.** Copying reference shapes then evolving independently meant each phase added layers without retrofitting RSC imports. The `repository → server → client/queries/mutations` split paid off by Step 4.

**Transport seam (Step 2.5) is the right abstraction.** One `@/platform/url-kit/*` import surface for RSC and hybrid. Provider picks router vs shallow; chrome doesn't fork. This is cleaner than the page-local shallow hook prototype from Step 2.

**Shallow URL + TanStack keys (Step 2).** The biggest perceived win over pure RSC. Filter/sort/page changes no longer remount the server tree. `FetchPendingDimmer` on client fetch is simpler to reason about than `NavigationPendingDimmer` on navigation pending.

**Detail cache coupling (Step 1 + 3).** Seed from list first, prefetch on hover, fetch on miss — three triggers, one key. Drawer open feels instant without dropping URL state.

---

## Where we revised early assumptions

**Drawer off URL (RSC conclusion) → drawer stays on URL (hybrid).** The RSC conclusion recommended `useDrawerStore()` for drawer open/close. We considered that valid — and it would have been simpler locally. Production-level requirements (deep links, shareability, RSC parity) kept URL contract. Performance came from shallow writes, not from removing params.

**Page-local shallow hook → platform transport.** Step 2 proved shallow URL works; Step 2.5 proved it must live in url-kit to avoid chrome forks. Step 2.6 was necessary plumbing but not an architecture chapter.

**Infinite as default → infinite on All only.** Initial Phase 5 draft enabled infinite for list view by default. We kept paginated default for table/list/cards; infinite activates only on `all=1`. Board views still use `showAll`.

---

## Bug-shaped things we hit

**Cache key shape mismatch (Step 5).** Seeding `list` from infinite pages failed when keys didn't match exactly (`limit` present, `showAll` absent). Symptom: dim on page 2 after leaving All mode. Fix was key alignment, not UX polish.

**All-entry skeleton flash.** Cold-starting infinite with empty data while disabling paginated query caused full table skeleton. Fixed with page-1 `initialData` bootstrap from cached list.

**QueryClientProvider missing (Step 2).** Early wiring forgot provider in layout — classic integration miss, caught immediately.

**View orchestrator loading on pagination.** Placeholder data was correct but view layer still showed loading state — fixed by passing `isPlaceholderData` semantics through content sections.

---

## What to watch as the page grows

- Invalidate both `lists()` and `infinites()` on every mutation — easy to forget when adding new mutation hooks.
- UI-only URL keys must stay out of `RentalCarListQuery` — drawer/confirm drift caused list refetches on RSC; same rule applies on hybrid.
- Route-level loading removed for hybrid — deferred full revisit fix to [layout-query-provider.md](../to-implement/layout-query-provider.md).

Next: [hybrid-conclusion.md](./hybrid-conclusion.md).
