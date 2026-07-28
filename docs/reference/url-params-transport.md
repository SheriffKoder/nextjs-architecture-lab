# url-params transport

Pluggable URL read/write boundary for **url-kit** chrome. Same filter, sort, pagination, and view components on RSC and hybrid pages.

---

## Modes

| Mode | When | Provider |
|------|------|----------|
| **Router** | RSC demo (default) | None — falls back to `router.replace` |
| **Shallow** | Hybrid demo | `<ShallowUrlProvider>` at page client root |

Import from `@/platform/url-kit/url-params`.

---

## What uses transport

Filters, sorting, pagination, grouping, view resolution, AI filter, url-drawer actions — see the full table in [`platform/url-kit/README.md`](../../platform/url-kit/README.md).

---

## Adding a third adapter (nuqs)

Optional future adapter when parse/serialize maintenance grows. Plan: [`views/demo-hybrid-page/docs/to-implement/nuqs-adapter.md`](../../views/demo-hybrid-page/docs/to-implement/nuqs-adapter.md)

**Deep dive:** [`platform/url-kit/url-params/README.md`](../../platform/url-kit/url-params/README.md)
