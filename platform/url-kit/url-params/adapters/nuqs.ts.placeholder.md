# nuqs adapter (future)

**Not implemented in Phase 2.5.** Reserved slot for typed URL state via [nuqs](https://nuqs.47ng.com/).

## Planned shape

```typescript
// adapters/nuqs.ts — implements UrlParamsAdapter
// - getEffectiveParams from useQueryStates parsers
// - commit via batched setQueryStates({ shallow: true })
// - subscribe via nuqs internal sync + popstate
```

## What nuqs replaces

- `use-shallow-url-transport.ts` hand-rolled `replaceState` logic only

## What stays custom

- Multi-sort string (`status:asc,price:desc`)
- Underscore ranges (`min_max`)
- Query-builder blob
- NL filter bulk patch merge → call adapter `commit(nextSnapshot)`

## When to add

- 2+ client list pages sharing param shapes
- Parser drift between URL and API routes
- Throttled `q` with library support

Do **not** add the npm dependency until one of the above triggers.
