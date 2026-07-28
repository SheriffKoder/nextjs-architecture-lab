# To implement — nuqs transport adapter

**Prerequisite:** [2.5-url-kit-transport-and-sections.md](../architecture/2.5-url-kit-transport-and-sections.md)

**Goal:** Optional third transport adapter — replace hand-rolled shallow snapshot with nuqs typed parsers, without forking url-kit chrome.

**Status:** Deferred — shallow adapter sufficient for v1

**Placeholder:** `platform/url-kit/url-params/adapters/nuqs.ts.placeholder.md`

**Related RSC analysis:** [demo-rsc nuqs](../../demo-rsc-page/docs/to-implement/nuqs.md)

---

## Why consider it later

Today hybrid uses:

- `ShallowUrlProvider` + `useUrlParamsTransport()` for read/write
- `parseListQueryFromSearchParams` shared by RSC prefetch and client

nuqs would replace **parse/serialize boilerplate** and give per-key `shallow: true` declarations — overlap with what transport already achieves for hybrid.

**Not urgent** because:

- Shallow transport already avoids `router.replace` on filter/sort/page.
- Chrome hooks already batch via `buildParams` + `commit`.
- Migration cost is large (many url-kit consumers).

---

## When to migrate

- Adding several new list pages → shared typed URL schema
- Repeated client/server param mismatch bugs
- Want throttled `q` search and batched multi-param updates without growing custom hooks
- Team prefers maintained parsers over `parseListQueryFromSearchParams` + codec files

---

## Step N.1 — Adapter implementation

### Reference files

| File | Why |
|------|-----|
| `platform/url-kit/url-params/adapters/shallow.ts` | Current shallow adapter |
| `platform/url-kit/url-params/adapters/router.ts` | Router fallback |
| `platform/url-kit/url-params/context/url-params-provider.tsx` | Provider swap point |

### Actions

- Implement `NuqsUrlTransport` implementing same interface as shallow/router.
- Map `effectiveParams`, `committedSnapshot`, `buildParams`, `commit` to nuqs hooks.
- Hybrid page: `<NuqsUrlProvider>` instead of `<ShallowUrlProvider>` — chrome imports unchanged.

### Expected outcome

- Same UX; parsers centralized in nuqs schema.

### Solves

- Duplicated parse logic between client transport and entity `transform/`.

---

## Step N.2 — Shared parsers with RSC cold load

### Actions

- `createSearchParamsCache` (nuqs server) aligned with `parseListQueryFromSearchParams`.
- RSC `page.tsx` reads same schema as client.

### Expected outcome

- No client/server drift on new params.

---

## Checklist

- [ ] nuqs adapter implements transport interface
- [ ] Hybrid page can swap provider only
- [ ] RSC demo can stay on router fallback until migrated
- [ ] Remove placeholder md when done
- [ ] Update [2.5-url-kit-transport-and-sections.md](../architecture/2.5-url-kit-transport-and-sections.md) findings section

---

## What nuqs does *not* fix

| Concern | nuqs helps? |
|---------|-------------|
| Revisit server prefetch | No — layout provider / thin page |
| TanStack cache persistence | No |
| Drawer URL vs store | No — architectural choice already made |
| Dropdown pending selections while open | No — local UI state |
