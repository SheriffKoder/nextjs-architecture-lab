# Starter kit

How to **configure and compose** dashboard pages using this repo.

For tradeoffs and phase narratives → [`docs/lab/`](../lab/README.md).

---

## Config-driven pages (core model)

List pages in this kit are **assembled from configuration**, not rebuilt feature-by-feature.

You add view-local config under `views/<route>/config/` — filters, columns, per-view display (**list**, **cards**), toolbar layout — and wire **data + handlers** once in the view shell. Platform systems read the configs:

- **`platform/url-kit`** — filters, sort, pagination, toolbar, drawer URL
- **`widgets/multi-view`** — `ViewOrchestrator` + display configs per view mode

The same config shape works for RSC and hybrid; only the fetch/mutation boundary changes.

**Read:** [Config-driven pages](../architecture/config-driven-pages.md) · config type reference in [RSC implementation plan § Configuration](../../views/demo-rsc-page/implementation-plan.md#configuration-options-reference)

---

## When to choose what

| Strategy | Choose when | Demo | Bootstrap plan |
|----------|-------------|------|----------------|
| **RSC (server-first)** | Read-heavy page; URL as source of truth; infrequent mutations; server simplicity wins | `/demo-rsc-page` | [`views/demo-rsc-page/implementation-plan.md`](../../views/demo-rsc-page/implementation-plan.md) |
| **Hybrid (RSC + TanStack)** | Filter/sort/page should feel instant; optimistic CRUD; warm drawer from list; infinite on All | `/demo-hybrid-page` | [`views/demo-hybrid-page/implementation-plan.md`](../../views/demo-hybrid-page/implementation-plan.md) |

**Prefer RSC when:** data is mostly read-only after load; soft-navigation latency on filter change is OK with Suspense + dimmer; Server Actions are enough for mutations.

**Prefer hybrid when:** every filter click should not remount the server tree; mutations should patch client cache instead of `router.refresh()`; detail drawer should open from a warm list row.

Both share the same url-kit chrome, multi-view config shape, and list query contract — only the fetch/mutation boundary changes. Detail → [`docs/architecture/philosophy.md`](../architecture/philosophy.md).

---

## Reusable kits & components

What you compose when building a list page. Deep docs stay co-located — follow links to each unit's README.

### `platform/`

Cross-cutting URL and list-page systems.

```text
platform/
└── url-kit/                          → README
    ├── url-params/                   transport (router vs shallow)
    ├── filters/
    │   ├── feature-filtering/        dropdown, pill, search-bar filters
    │   ├── feature-sorting/          URL sort hooks + controls
    │   ├── feature-pagination/       page/limit/all footer
    │   └── feature-query-builder-filter/
    ├── filter-toolbar/               desktop + mobile toolbar shell
    ├── minimal-controls/             grouping, view resolution
    ├── view-switchers/               list / cards toggle (+ optional data-viz views)
    ├── url-drawer/                   URL-driven drawer shell
    ├── ai-filter/                    NL filter assistant
    └── confirm/                      URL confirm-action (moving to local modal)
```

Entry: [`platform/url-kit/README.md`](../../platform/url-kit/README.md)

### `widgets/`

Composed page sections — import from each widget barrel (`@/widgets/...`).

| Widget | Role | README |
|--------|------|--------|
| **`multi-view/`** | View orchestrator — **list**, **cards**; optional data-driven / data-visualization modes (kanban, calendar, maps, timeline, …) | [`README`](../../widgets/multi-view/README.md) |
| **`side-nav/`** | App sidebar — rail, mobile drawer, nav groups | [`README`](../../widgets/side-nav/README.md) |
| **`maps-view/`** | Google Maps markers + autocomplete | [`README`](../../widgets/maps-view/README.md) |
| **`score-cards/`** | Metric / health card row | — |

### `shared/`

Domain-agnostic UI primitives and helpers — no business rules.

```text
shared/
├── ui/
│   ├── right-drawer/         drawer panel shell (used by url-drawer)
│   ├── confirm-modal/        blocking confirm overlay
│   ├── popup/                anchored popover panel
│   ├── toast/                toast stack + provider
│   ├── loading-skeletons/    page / section skeletons
│   ├── offline/              offline detector + toast hook
│   ├── badges/               status / label badges
│   ├── multi-select/         dropdown multi-select input
│   ├── collapsible-card/     expandable card chrome
│   ├── buttons/              view toggle, icon buttons
│   ├── inputs/               grouped-number-input, …
│   ├── simple-table/         non-virtualized table helper
│   ├── page-label/           section headings
│   └── mask-image/           masked icon/image (side-nav)
└── lib/
    └── formatters/           date, number, string formatters
```

Units with READMEs: [`toast`](../../shared/ui/toast/README.md) · [`badges`](../../shared/ui/badges/README.md) · [`multi-select`](../../shared/ui/multi-select/README.md) · [`collapsible-card`](../../shared/ui/collapsible-card/README.md) · [`formatters`](../../shared/lib/formatters/README.md)

---

Cross-cutting contracts → [`docs/reference/`](../reference/)
