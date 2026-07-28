# Phase 3 — Client-first interactive systems (planned)

**Status:** Not started

---

## Goal

Support richer UX patterns that are awkward even in the hybrid model — mostly **local, multi-step client state** that should not round-trip through URL or RSC on every keystroke.

## Patterns to explore

- Drag & drop persistence
- Local editing drafts (unsaved form state across drawer open/close)
- Complex multi-step optimistic flows
- Layout-scoped `QueryProvider` so TanStack cache survives route changes

Note: infinite queries and hybrid optimistic mutations were explored in [Phase 2](./phase-2-hybrid.md).

## Tradeoffs

- More client complexity
- Less server simplicity
- Shareable URL may cover less of the interaction surface

## When to start

After Phase 2 backlog items that affect all architectures are stable — see [`views/demo-hybrid-page/docs/reflections/next-steps.md`](../../views/demo-hybrid-page/docs/reflections/next-steps.md).

**Previous:** [Phase 2 — Hybrid](./phase-2-hybrid.md) · **Next:** [Phase 4 — Comparison](./comparisons.md)
