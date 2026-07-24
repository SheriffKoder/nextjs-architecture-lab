# NL AI filter (`features/ui/ai-filter`)

Natural language → structured patches → merge into `URLSearchParams`. **No page-specific config is imported here**; the host passes `NlFilterAssistantRuntimeConfig` (excluded URL keys, allowed sort keys, optional domain copy for the prompt).

## File flow

```
[ Host page e.g. filters-section.tsx ]
  Builds catalog via serializeFiltersForNlCatalog · passes assistantConfig + apiPath
        ↓
[ components/nl-filter-assistant.tsx ]
  Reads URL · builds request · applies patches · router.replace (wrapNavigation)
        ↓
[ lib/build-nl-current-params-reference.ts ]
  Human-readable summary of current query for the model
        ↓
[ Host POST route e.g. app/api/nl-filters/cars/route.ts ]
  Validates body · clear-all shortcut · OpenAI · sanitize · JSON response
        ↓
[ lib/nl-filter-clear-helpers.ts ]
  Clear-all phrase detection · full-clear patches · strip keys · pagination reset (called from assistant + route shortcut)
        ↓
[ config/nl-filter-openai-messages.ts ]
  System + user prompt text from assistantConfig + catalog JSON
        ↓
[ lib/nl-filter-response-schema.ts ]
  Zod schema for OpenAI structured output (feedback, filterPatchesJson, sorts)
        ↓
[ lib/sanitize-nl-filter-response.ts ]
  Parse filterPatchesJson · drop unknown/excluded keys · validate vs catalog · allowed sorts
        ↓
[ components/nl-filter-assistant.tsx ] (response path)
  merge → lib/apply-nl-filter-patch-to-search-params.ts · reset page · optional strip keys on full clear
        ↓
[ lib/apply-nl-filter-patch-to-search-params.ts ]
  Encodes facet types into URL (multi-select via encodeUrlParamList) · sort param · preserves unrelated keys
```

Supporting pieces:

- `types/nl-filter-assistant.ts` — catalog entry, sort spec, runtime config type  
- `lib/serialize-filter-catalog-for-nl.ts` — `FilterConfig[]` → catalog JSON for model + validation  
- `components/nl-filter-feedback.tsx` — tertiary inline feedback line  

## Features

- **Host-owned policy** — exclusions, allowed sort keys, domain hint, optional `keysToClearOnFullReset` / `paginationPageParamKey`; nothing demo-specific imported inside this package  
- **Structured LLM output** — Zod-bound OpenAI parse (`nlFilterResponseSchema`); patches carried as a JSON **string** (`filterPatchesJson`) for schema compatibility  
- **Server-side sanitization** — unknown keys dropped; values checked against catalog options; excluded URL keys never applied  
- **Clear-all shortcuts** — matching phrases return full clears without calling the model (route + client)  
- **Merge semantics** — prompts steer replace-vs-additive behavior; unrelated query params (drawer, etc.) stay unless excluded list says otherwise  
- **Safe multi-select encoding** — patch apply uses per-value encoding so commas inside option values do not split selections  
- **Pagination** — `page` param removed after every successful apply so the list defaults to page 1  
- **Full-reset extras** — optional extra keys (e.g. `q`) stripped when every catalog facet is cleared  
- **UI** — textarea + submit + `NlFilterFeedback` (no heavy result card)  

## How it works

- The host serializes current filter definitions (with options) into a **catalog** and passes **assistantConfig** + **apiPath** into `NlFilterAssistant`  
- On submit, the client sends `userText`, `catalog`, `assistantConfig`, flattened `currentParams`, and `currentParamsReference` to the POST route  
- If the text matches a **clear-all** intent, the route (and client fast-path) respond with patches that clear every catalog facet and `sorts: []`  
- Otherwise the route builds prompts from **assistantConfig**, calls OpenAI with the response schema, then **sanitizes** the parsed payload against the same catalog  
- The API returns `{ feedback, filterPatches, sorts? }`  
- The client runs **applyNlFilterPatchToSearchParams** on a copy of the current search string, then **removes the page param**, then optionally strips **keysToClearOnFullReset** when the patches represent a full catalog clear  
- Navigation uses **`router.replace`** with an href without a trailing `?` when the query is empty, inside **`wrapNavigation`** when a provider exists  
- **`NlFilterFeedback`** shows the server `feedback` string after each run  

## Wire-up

1. Build catalog: `serializeFiltersForNlCatalog(filters)` from your `FilterConfig[]` (with populated `options`).
2. Keep exclusions / allowed sort keys next to your page or API route (e.g. `features/demo-rsc-page/config/nl-filter-assistant-config.ts`).
3. Render:

   ```tsx
   <NlFilterAssistant
     catalog={nlCatalog}
     assistantConfig={{
       excludedUrlKeys: [...],
       allowedSortKeys: [...],
       domainDescription: 'optional context for the model',
       keysToClearOnFullReset: ['q'], // optional: extra keys stripped only on full clear
       // pagination: `page` is removed after every apply → page 1 (override with paginationPageParamKey)
     }}
     apiPath="/api/your-nl-filters"
   />
   ```

4. **`POST` handler** must accept the same JSON body as the client (`assistantConfig` included), run `buildNlFilterSystemPrompt(assistantConfig)`, OpenAI parse with `nlFilterResponseSchema`, then `sanitizeNlFilterResponse(parsed, catalog, assistantConfig)`.

**Demo:** `features/demo-rsc-page/components/layout-sections/filters-section.tsx` and `app/api/nl-filters/cars/route.ts`.
