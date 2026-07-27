# url-params — transport layer

Pluggable URL read/write for list chrome. Feature folders stay in place; **consumers** call `useUrlParamsTransport()` or `useEffectiveSearchParams()` instead of wiring `useRouter` / `useSearchParams` directly.

## Layout

```text
url-params/
  model/types.ts              # UrlParamsAdapter contract
  hooks/
    use-router-url-transport.ts   # RSC default (router.replace + optimistic)
    use-shallow-url-transport.ts  # hybrid (replaceState + popstate)
  providers/
    url-params-context.tsx        # context + useUrlParamsTransport + fallback
    shallow-url-provider.tsx      # ShallowUrlProvider for client list pages
  adapters/
    nuqs.ts.placeholder.md        # future nuqs slot
  index.ts                    # public barrel
```

## Modes

| Mode | Mount | Write path |
|------|-------|------------|
| Router (RSC) | none — hooks fall back | `router.replace` |
| Shallow (hybrid) | `<ShallowUrlProvider initialSnapshot={…}>` | `history.replaceState` |

## Public API

- `useUrlParamsTransport()` — hooks that mutate URL (filters, sort, pagination, grouping, view)
- `useEffectiveSearchParams()` — presentational readers (search bar sync, pagination hide rules)
- `ShallowUrlProvider` — page-root provider for hybrid / TanStack list pages

Decision background: `app/development/hybrid-migration/decisions/url-kit-transport.md`.

## Chrome transport status (Phase 2.6)

| Chrome area | Read | Write |
|-------------|------|-------|
| Core hooks (`useUrlFilters`, `useUrlSorting`, `useUrlPagination`) | `effectiveParams` | `commit` |
| Search bars (pill, expandable, dropdown) | `useEffectiveSearchParams` | via `useUrlFilters` |
| `dropdown-filter.tsx` orchestrator | `useEffectiveSearchParams` + snapshot deps | via `useUrlFilters` |
| Sort builder control | via canonical `useUrlSorting` | via `useUrlSorting` |
| Initial sorts / grouping | via `useUrlSorting` / `useUrlGrouping` | `commit` |
| Query builder (`filter=` blob) | `effectiveParams` | `commit` |
| NL filter assistant | `effectiveParams` | `commit` |
| Drawer / confirm | not migrated | not migrated |
