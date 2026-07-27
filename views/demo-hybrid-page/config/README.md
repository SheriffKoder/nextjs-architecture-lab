# `views/demo-rsc-page/config`

View-local configuration for the demo RSC page. Split so **presentation** and **query/cache behavior** stay independent, with a thin shared **contract** for keys both sides need. Stand-in datasets live in **`mocks/`** until real APIs are wired.

## Folders

| Folder | Owns | May import |
|--------|------|------------|
| [`contract/`](./contract/) | Shared URL/field keys and maps (no React, no fetch policy) | Entity types only |
| [`data/`](./data/) | What the server fetches, caches, paginates, validates | `contract/` |
| [`ui/`](./ui/) | How the page looks and wires FilteringWrapper chrome | `contract/`; may use `mocks/` until replaced |
| [`mocks/`](./mocks/) | Temporary stand-in option lists / journey data | Types only — see wiring table in `mocks/responsibilities.md` |

```text
ui   → contract
data → contract
ui   ✗ data
data ✗ ui
ui   → mocks   (temporary)
data ✗ mocks
```

View composition (`demo-rsc-content.tsx`, layout sections) is allowed to import from both `ui/` and `data/` and pass props down.

## Rule of thumb

- Changing it alters **fetch / cache / validation** → `data/` (or keys in `contract/`).
- Changing it alters **layout, cells, icons, labels chrome** → `ui/`.
- Both need the **same key strings** → put the keys in `contract/`, not inside a UI or data file.
- Static fake lists waiting on an API → `mocks/` (document the swap site in `mocks/responsibilities.md`).

## Responsibility maps

Each subfolder has a `responsibilities.md` listing every file.

## Former monoliths

- `header-filters-config.ts` → split across `contract/`, `data/`, and `ui/`.
- `car-slider-dropdown-mocks.ts` → `mocks/form-option-mocks.ts` + `mocks/timeline-journey-mocks.ts`.
- `demo-rsc-url-data-params.ts` → `contract/url-param-keys.ts`.
