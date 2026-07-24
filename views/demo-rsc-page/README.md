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

Page orchestration belongs in screens/.

Business logic belongs in features/.