# Demo RSC Page

Pure server-rendered rental cars page.

## Goals

Demonstrate:

- URL-driven filtering
- server-side sorting
- pagination
- Suspense streaming
- RSC drawer interactions
- optimistic server mutations

## Docs

- **Kit:** [Starter kit](../../docs/guides/README.md)
- **Bootstrap plan:** [implementation-plan.md](./implementation-plan.md)
- **Lab / journey:** [docs/index.md](./docs/index.md)

## Rendering strategy

Server-first.

Route:
page.tsx

Main shell:
demo-rsc-index.tsx

Streaming sections:

- FiltersSection
- TableSection
- PaginationSection
- DrawerLayer

## Why this structure

Page orchestration belongs in views/.

Business logic belongs in entities/.