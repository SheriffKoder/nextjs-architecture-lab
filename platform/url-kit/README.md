# url-kit (public)

Shipped URL-driven primitives for the public hybrid/RSC demos:

- **`filter-toolbar/`** — primary filter/search/view/group chrome
- **`minimal-controls/`** — URL hooks (`useViewResolution`, `useUrlGrouping`, …)
- **`filters/`** — filter engines, pagination footer, sorting types/utils
- **`url-params/`** — shallow vs router transport
- **`url-drawer/`** — URL-driven drawer orchestration

Full kit (NL filter, query builder, view-switchers, employee filter demos) lives in **`platform/url-kit-2/`** (local lab, gitignored).

## Philosophy

URL should represent meaningful application state — filters, pagination, sorting, view mode — not transient UI (drawer open state on hybrid pages, confirm modals, etc.).

Import transport from `@/platform/url-kit/url-params`. See [`url-params/README.md`](./url-params/README.md).
