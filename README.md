# Next.js Architecture Lab

A practical exploration of modern Next.js App router architecture:
RSC, Client boundaries, URL state, Suspense streaming,
server actions, TanStack integration, and feature-based design.

This repository documents practical architectural decisions around:

- Server Components (RSC)
- Suspense streaming
- URL-driven state
- Server Actions
- Drawer systems
- Server-side filtering & pagination
- TanStack Query hydration
- Client-side optimistic mutations
- Feature-based folder design

The goal is not to showcase a finished product.

The goal is to understand tradeoffs.


## Architectural Philosophy

Prefer server rendering when:

- data is mostly read-only
- URL should be source of truth
- SEO/shareability matters
- security is important

Introduce client systems when:

- UI interactions become highly local
- optimistic updates improve UX
- infinite scroll or drag/drop are needed
- avoiding unnecessary server navigations

## Project Layers

### app/

Route entrypoints only.

Responsible for:

- route definition
- layouts
- route-level loading/error boundaries

---

### screens/

Page orchestration.

Responsible for:

- page shell
- Suspense boundaries
- composition of sections
- page-specific configuration

---

### features/

Reusable business/domain systems.

Responsible for:

- data access
- server actions
- validation
- URL systems
- reusable UI behaviors

---

### components/

Global UI building blocks.

---

### lib/

Cross-cutting helpers.


# Evolution Roadmap

This repository evolves through architectural phases,
each introducing new tradeoffs and patterns.

---

## Phase 1 — Pure RSC (current)

Goal:
Understand how far server-first architecture can go.

Patterns explored:

- URL-driven filters
- Server pagination
- Suspense streaming
- Route-level loading/error boundaries
- URL-driven drawers
- Server Actions
- Optimistic server updates
- Hover prefetching

Learnings:

- Excellent for read-heavy pages
- Clear architecture
- Secure by default
- UI interactions can become constrained

---

## Phase 2 — Hybrid RSC + TanStack (planned)

Goal:
Keep server-first rendering while improving interactivity.

Patterns to explore:

- initialData hydration
- drawer detail queries
- client-side optimistic mutations
- client drawer state
- selective cache invalidation

Questions:

- Which state should remain in URL?
- Which state should move to client?
- Can hybrid reduce complexity?

---

## Phase 3 — Client-first interactive systems

Goal:
Support richer UX patterns.

Patterns:

- infinite queries
- drag & drop persistence
- local editing drafts
- complex optimistic updates

Tradeoff:

- more client complexity
- less server simplicity

---

## Phase 4 — Architecture comparison

Compare:

- Pure RSC
- Hybrid
- Client-first

Across:

- performance
- complexity
- UX
- maintainability