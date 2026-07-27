# Demo Hybrid Page — docs

| Doc | Description |
|-----|-------------|
| [rsc-to-hybrid-shifts.md](./architecture/rsc-to-hybrid-shifts.md) | Major RSC→hybrid shifts + decisions (cross-phase) |
| [Phase 0 scaffold](../../../app/development/hybrid-migration/phase-0-scaffold.md) | Migration plan for Phase 0 |
| [0-hybrid-scaffold.md](./architecture/0-hybrid-scaffold.md) | What was built in Phase 0 |
| [Phase 1 detail prefetch](../../../app/development/hybrid-migration/phase-1-detail-prefetch.md) | Migration plan for Phase 1 |
| [1-detail-prefetch.md](./ui/1-detail-prefetch.md) | List→detail seed; fetch by id on miss |
| [Phase 2 list + filters](../../../app/development/hybrid-migration/phase-2-list-and-filters.md) | Migration plan for Phase 2 |
| [2-shallow-url-and-queries.md](./architecture/2-shallow-url-and-queries.md) | Shallow URL + TanStack list/facets |
| [Phase 2.5 url-kit transport](../../../app/development/hybrid-migration/phase-2.5-url-kit-transport.md) | Unified transport layer + RSC-mirror sections (planned) |
| [url-kit transport decision](../../../app/development/hybrid-migration/decisions/url-kit-transport.md) | `url-params/` adapters; nuqs slot |
| [2.5-url-kit-transport-and-sections.md](./architecture/2.5-url-kit-transport-and-sections.md) | Transport layer + RSC-mirror sections |
| [Phase 2.6 chrome transport](../../../app/development/hybrid-migration/phase-2.6-url-kit-chrome-transport.md) | Migrate remaining url-kit chrome to `url-params` |
| [2.6-url-kit-chrome-transport.md](./architecture/2.6-url-kit-chrome-transport.md) | Chrome transport migration |
| [Phase 3 URL drawer](../../../app/development/hybrid-migration/phase-3-url-drawer-client-content.md) | URL drawer via `url-params` + client detail body |
| [Drawer URL decision](../../../app/development/hybrid-migration/decisions/drawer-url-state.md) | Keep drawer URL params; client content only |
| [3-url-drawer-client-content.md](./drawers/3-url-drawer-client-content.md) | URL drawer + TanStack detail body |
| [Phase 4 mutations](../../../app/development/hybrid-migration/phase-4-mutations.md) | CRUD + optimistic activity toggle |
| [4-optimistic-mutations.md](./ui/4-optimistic-mutations.md) | TanStack mutations; no `revalidatePath` |
| [Pagination decision](../../../app/development/hybrid-migration/decisions/pagination.md) | Offset + infinite v1; list vs infinite cache findings |
| [Phase 5 infinite scroll](../../../app/development/hybrid-migration/phase-5-infinite-scroll.md) | Infinite on All mode; table/list paginated by default |
| [5-infinite-scroll.md](./ui/5-infinite-scroll.md) | `all=1` → infinite; seed key fix; All-entry no skeleton |
