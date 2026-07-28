# Project layers

Responsibility-first layout for dashboard pages in this repo.

Automated agent rule: [`.cursor/rules/project-structure.mdc`](../../.cursor/rules/project-structure.mdc)

```text
app/ → views/ → entities/ → shared/
                 ↘ widgets/
platform/   # cross-cutting systems (URL kit, filters chrome)
components/ # design-system / shadcn primitives
```

---

## Layer roles

| Layer | Role |
|-------|------|
| **`app/`** | Next.js routing only — `page`, `layout`, `loading`, `error`. Thin shells that await/normalize `searchParams` and render a view. |
| **`views/`** | Route composition — page shell, Suspense islands, view-local config/UI/hooks. Assembles entities + widgets; no domain persistence. |
| **`entities/`** | Domain units — types, loaders, server actions, client queries/mutations. Reusable across views. |
| **`widgets/`** | Composed reusable UI sections (multi-view table, side-nav, maps, score cards). |
| **`shared/`** | Cross-domain primitives — UI kit pieces, formatters, skeletons. No business rules. |
| **`platform/`** | Product-agnostic systems — e.g. `url-kit` (URL filters, pagination, url-drawer). Not a business feature. |
| **`components/`** | Low-level design-system / shadcn primitives used by `shared` and demos. |

---

## Principles

1. **Organize by responsibility** — folder names reflect what code owns.
2. **`app/` vs `views/`** — routing shells in `app/`; composition in `views/<route>/`.
3. **Dependency direction** — `views → entities → shared`; never upward.
4. **One file, one job** — split loaders, actions, and UI by concern.

```text
views → entities → shared
views → widgets → shared
views → platform → shared
```

---

## Rules of thumb

- Views compose; entities own data; platform owns URL/state systems; shared stays dumb.
- Bootstrap shape for list pages:
  - RSC: [`views/demo-rsc-page/implementation-plan.md`](../../views/demo-rsc-page/implementation-plan.md)
  - Hybrid: [`views/demo-hybrid-page/implementation-plan.md`](../../views/demo-hybrid-page/implementation-plan.md)
