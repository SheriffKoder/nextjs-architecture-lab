# Architecture lab

This track documents **why** we built each demo and **what tradeoffs** we found — not how to copy-paste config.

Each phase has a runnable demo, a full lab write-up in this folder, and a step-by-step journey under the view.

---

## Phase map

### [Phase 1 — Pure RSC](./phase-1-rsc.md) · Done

**Summary:** Server-first list page — URL-driven filters, Suspense islands, drawer by id, server actions. How far RSC can go before interactivity pushes back.

**What I learned:** RSC excels at cold load and shareable read models. Every filter click is a navigation; drawer URL params can bust list cache unless you split data keys from UI keys; hover → open needs cross-request caching, not just `cache()`. A client layer earns its place when filters, mutations, and detail fetches should not remount the page.

**Read the phase:** [Phase 1 — Pure RSC](./phase-1-rsc.md)

**Journey docs:** [Journey index](../../views/demo-rsc-page/docs/index.md) · [Conclusion](../../views/demo-rsc-page/docs/reflections/9-rsc-conclusion.md)

**Route:** `/demo-rsc-page`

---

### [Phase 2 — Hybrid RSC + TanStack](./phase-2-hybrid.md) · Done (current)

**Summary:** RSC prefetch for first paint, TanStack for everything after. Shallow URL replaces `router.replace` on list writes; same url-kit chrome as Phase 1; optimistic CRUD and infinite scroll on All.

**What I learned:** Shallow transport removed the reason to drop drawer from URL. RSC owns cold load; TanStack owns repeat interaction; URL still owns shareable intent. Hybrid kills most Phase 1 workarounds (navigation dimmer, `unstable_cache` for client open, `revalidatePath` for toggles) but adds a transport seam and two pagination cache shapes with a one-way bridge.

**Read the phase:** [Phase 2 — Hybrid RSC + TanStack](./phase-2-hybrid.md)

**Journey docs:** [Journey index](../../views/demo-hybrid-page/docs/index.md) · [Conclusion](../../views/demo-hybrid-page/docs/reflections/hybrid-conclusion.md) · [RSC → hybrid shifts](../../views/demo-hybrid-page/docs/architecture/rsc-to-hybrid-shifts.md)

**Route:** `/demo-hybrid-page`

---

### [Phase 3 — Client-first](./phase-3-client-first.md) · Planned

**Summary:** Rich local UX — drag/drop, editing drafts, multi-step optimistic flows, layout-scoped QueryProvider so cache survives navigations.

**What I learned:** — *(not started; infinite scroll and hybrid mutations were explored in Phase 2)*

**Read the phase:** [Phase 3 — Client-first](./phase-3-client-first.md)

**Journey docs:** —

**Route:** —

---

### [Phase 4 — Architecture comparison](./comparisons.md) · Planned

**Summary:** Side-by-side matrix — RSC vs hybrid vs client-first on load, latency, mutations, URL coverage, complexity, maintainability.

**What I learned:** — *(depends on Phase 3 demo)*

**Read the phase:** [Phase 4 — Architecture comparison](./comparisons.md)

**Journey docs:** —

**Route:** —

---

## How to read the lab

1. **What I learned** (below) — quick takeaways on each card.
2. **Read the phase** (`docs/lab/phase-*.md`) — the main write-up: what we built, patterns, findings, Q&A.
3. **Journey docs** (`views/<demo>/docs/`) — step-by-step story while building; conclusions and backlog in reflections.

Cross-phase decision index: [`views/demo-hybrid-page/docs/architecture/rsc-to-hybrid-shifts.md`](../../views/demo-hybrid-page/docs/architecture/rsc-to-hybrid-shifts.md).

---

## Stable concepts

- [Architecture philosophy](../architecture/philosophy.md) — when to prefer server vs client, RSC vs hybrid
- [Project layers](../architecture/layers.md) — `app` → `views` → `entities` → `platform`

**Kit path:** need to configure a page? → [`docs/guides/README.md`](../guides/README.md)
