# Plan: Add rental car (TanStack mutation + optimistic UI)

**Purpose:** Step-by-step checklist to implement “Add car” with a POST API, client `handler`, `useMutation` + optimistic cache updates, wired to the existing slider form.

**Context today:** List and filter options load via `useRentalCars` / `useRentalCarFilterOptions` → `tanstack/handler.ts` → `GET` `/api/demo-client-page/page-client` and `/options`. `DemoClientCarSliderForm` validates then calls `onSuccess()` only (no server). Mock rows come from `config/lib/data-source.ts` (`rentalCars`) through `lib/server/get-rental-cars-data.ts`.

**Persistence (no mutable mock store):** Do not append to or clone-mutate `rentalCars` for creates. The **source of truth for “new rows” in the UI is the TanStack cache** during this phase: optimistic insert + `setQueryData` reconciliation. **Full page refresh drops those rows** until list **GET** reads from the same store as writes—that is acceptable by design here.

**Forward prep — commented-out invalidation:** In `useCreateRentalCar` (or equivalent), **after** your active `setQueryData` / temp-id replacement logic, add the **real** `queryClient.invalidateQueries(…)` calls you will want once `GET page-client` and `GET options` are DB-backed—but keep them **commented out** with a one-line note (e.g. `// Uncomment when list/options GET use DB`). When you wire the database, uncomment those lines and (optionally) simplify cache patching if refetch alone is enough.

**Why not enable invalidation now:** Uncommented invalidation refetches mock **GET** data and **removes** client-only rows from the table.

---

## Step 1 — Server module shaped for a future DB (no in-memory append)

**Goal:** One function the POST route calls today that stays stable when you swap the implementation for `INSERT … RETURNING`.

1. **Add** e.g. `lib/server/create-rental-car-server.ts` (name as you prefer) exporting something like `createRentalCarServer(input: CreateRentalCarInput): Promise<RentalCarTableItem>`.
2. **Pre-database behavior:** Validate the body (required fields, types, ranges). Assign **`id`** (and any server-only defaults) on the server. **Return** the canonical `RentalCarTableItem` JSON—**do not** mutate `config/lib/data-source.ts` or any global mock array. *(Alternatively, POST can be a stub that returns minimal JSON; the mutation hook should still reconcile cache—prefer a returned `car` when the route is non-empty so `id` is server-owned.)*
3. **Post-database behavior:** Replace the function body with the real insert + return the persisted row; route + client `handler` + mutation types stay the same.
4. **Barrel:** Export from `lib/server/index.ts` if routes import from there.

**Checkpoint:** POST returns **201** (with `{ car: … }` when you want server-generated `id` for cache merge). A follow-up **GET** `page-client` still returns only seed data until you wire reads to the DB (expected).

---

## Step 2 — POST Route Handler

**Goal:** HTTP entry point matching your existing `page-client` / `options` style. May start as a **placeholder** (validate + delay + empty or minimal body) if you want the network round-trip only; the **active** UX still comes from cache updates in the mutation hook.

1. Add **`POST`** to `app/api/demo-client-page/page-client/route.ts` (same path as list `GET`; client uses method + body for create).
2. **`POST`:** Parse JSON body → `parseCreateRentalCarPayload` / `createRentalCarServer` (align with `DemoClientCarSliderForm` fields).
3. Call `createRentalCarServer` from Step 1 (or inline a stub that resolves after validation).
4. Return **`201`** with `{ car: RentalCarTableItem }` when returning a body; match what `createRentalCar` in `handler.ts` parses.
5. Optional: reuse `delayDemoClientApi()` from `app/api/demo-client-page/demo-api-delay.ts` for parity with list/options latency demos.
6. Use `connection()` from `next/server` if you follow the same pattern as `page-client/route.ts`.

**Checkpoint:** Client mutation completes; list updates via **cache**, not via refetch. **GET** list unchanged until reads use the same persistence as writes.

---

## Step 3 — Client fetch helper (`handler.ts`)

**Goal:** Thin `mutationFn` target, same file family as `fetchRentalCars`.

1. Reuse the list base URL for creates: `POST` to `/api/demo-client-page/page-client` (same as `PAGE_CLIENT_PATH` / `fetchRentalCars`, with JSON body).
2. Define input type: e.g. `CreateRentalCarInput` = `Omit<RentalCarTableItem, 'id'>` or a dedicated DTO; align with form output shape.
3. Implement `createRentalCar(body: CreateRentalCarInput): Promise<RentalCarTableItem>` (or `Promise<{ car: ... }>`) using `fetch` POST + `JSON.stringify`.
4. Throw on `!response.ok` with a clear message (same style as `fetchRentalCars`).

---

## Step 4 — Query keys (optional but useful)

**Goal:** Invalidation and devtools clarity.

1. In `tanstack/key-factory.ts`, optionally add `rentalCarKeys.lists()` → prefix `['rentalCars', 'list']` for `invalidateQueries({ queryKey: rentalCarKeys.lists() })` if you add a small helper (tuple prefix invalidation works with TanStack Query v5).
2. No new **query** key is required for mutations unless you add a dependent query later.

---

## Step 5 — `useCreateRentalCar` mutation hook

**Goal:** Optimistic list update + rollback + server reconciliation.

**File:** e.g. `tanstack/use-create-rental-car.ts`.

1. `useMutation` with `mutationFn: createRentalCar`.
2. **`onMutate`** (optimistic):
   - `await queryClient.cancelQueries({ queryKey: rentalCarKeys.list(listQuery) })` — pass **`listQuery` from the caller** (see Step 6): the hook should accept `listQuery: RentalCarListQuery | undefined` as an argument or from a closure passed into `useMutation` options factory. For multiple cached pages, consider `cancelQueries({ predicate: ... })` or cancel all `['rentalCars','list']`.
   - Snapshot: `previous = queryClient.getQueryData(rentalCarKeys.list(listQuery))`.
   - Build a **temporary** row: copy form fields + `id: 'temp-' + crypto.randomUUID()` (or similar).
   - `setQueryData(rentalCarKeys.list(listQuery), (old) => { ... })`: merge the temp car into `old.cars`, bump `pagination.totalItems` if you want the footer to match immediately.
   - Return context: `{ previous, tempId }`.
3. **`onError`:** If `context?.previous`, `setQueryData(rentalCarKeys.list(listQuery), context.previous)`.
4. **`onSuccess` (data from server):**
   - **Active (pre-DB):** Replace the optimistic row in `rentalCarKeys.list(listQuery)` with the **`car` from the POST response** when you have one (match by `tempId`). If POST is a stub with no body, document how you promote the temp row (e.g. client-generated final `id`) in `setQueryData` only. Optionally bump `pagination.totalItems` for the current cached page.
   - **Forward prep — commented out:** Immediately below, add (commented) the invalidation you will enable after DB migration, for example:
     - `// queryClient.invalidateQueries({ queryKey: ['rentalCars', 'list'] })`
     - `// queryClient.invalidateQueries({ queryKey: ['rentalCars', 'options'] })`
     - Or use `rentalCarKeys` prefix helpers if you add them. Include a short comment: uncomment when `getRentalCarsData` / filter options read from DB.
   - **After DB migration:** Uncomment those lines (and optionally remove or narrow manual `setQueryData` if refetch-only is enough).
5. **`onSettled`:** Pre-DB, usually unnecessary beyond `onSuccess` cache patch. Post-DB, optional extra invalidation here if you split concerns.

**Pagination / filters:** While GET is mock-only, document whether new cars always appear in the “current” cached page (e.g. prepend). After DB, uncommented invalidation refetch handles truth.

**Refresh expectation:** Hard reload clears client-only rows until GET is DB-backed—that is OK for this phase.

6. Export from `tanstack/index.ts`.

---

## Step 6 — Wire `demo-client-index.tsx`

**Goal:** Single place that has `listQuery` + slider.

1. Instantiate `useCreateRentalCar(listQuery)` (or pass `listQuery` into `mutate` meta — either pattern works; keep deps stable with `useCallback` where needed).
2. Pass to `DemoClientCarSliderForm`:
   - `onSubmit` / `createMutation` props, **or**
   - Wrap: on form success callback, call `mutate(payload, { onSuccess: () => closeSlider() })` from the index (keeps form mostly presentational).
3. Map `mutation.isPending` to form `isSubmitting` if you extend the form ref API.
4. On mutation error: surface with existing `useToast().showError` or inline alert (optional).

---

## Step 7 — `DemoClientCarSliderForm`

**Goal:** Submit triggers mutation, not immediate `onSuccess()`.

1. Extend props: e.g. `onSubmitCar: (values: RentalCarTableItem) => void` or `mutate` + `isSubmitting` from parent.
2. In `submit` (after validation): build the `RentalCarTableItem` shape the API expects (same as today’s local state).
3. Call parent/mutation; call **`onSuccess` only inside mutation `onSuccess`** (parent passes `() => closeSlider()` there).
4. Update `useImperativeHandle` / `isSubmitting` to reflect `mutation.isPending` when wired.

---

## Step 8 — Filter options cache

**Goal:** Header facets stay accurate after add.

- **Pre-DB:** Prefer **no active options invalidation** (same reasons as list: mock GET). Optionally **patch** options in cache if you need counts to match the list cache; otherwise accept mismatch until DB.
- **Forward prep:** In the mutation hook, keep **commented-out** `invalidateQueries` for options next to the list invalidation block (Step 5).
- **After GET/options read from the DB:** Uncomment invalidation so counts refetch from the server.

---

## Step 9 — QA checklist

**Pre-DB (cache is truth; invalidation lines exist but commented):**

- [ ] Optimistic row appears, then **reconciles** in cache (POST `car` body or documented client-only promotion).
- [ ] **No** active `invalidateQueries` on list/options (commented placeholders present in hook).
- [ ] Hard refresh: new row **gone** (acceptable).
- [ ] Network error: rollback restores prior cache snapshot; user sees error.

**Post-DB (uncomment invalidation):**

- [ ] Uncomment `invalidateQueries` for list + options; verify row survives refresh and matches filters/pagination.
- [ ] Options / facet counts match list.

**Always:**

- [ ] Optional API delay: loading / optimistic behavior acceptable.
- [ ] `filter` query param from URL still forwarded when you do refetch list (`handler.ts` already appends `filter` from `window` for parity).

---

## File touch summary (expected)

| Area | Files |
|------|--------|
| Server (DB-ready, no mock mutation) | `lib/server/create-rental-car-server.ts`, `lib/server/index.ts` — **not** `data-source.ts` for writes |
| API | `app/api/demo-client-page/page-client/route.ts` (`POST` alongside `GET`) |
| Client data | `tanstack/handler.ts`, `tanstack/use-create-rental-car.ts`, `tanstack/index.ts`, optional `tanstack/key-factory.ts` |
| UI | `demo-client-index.tsx`, `components/demo-client-car-slider-form.tsx` |
| Later migration | Wire `get-rental-cars-data.ts`, `get-filter-options-server.ts`, and list/options routes to DB; **uncomment** `invalidateQueries` in `use-create-rental-car.ts` (and trim manual cache surgery if refetch-only suffices) |

---

## References in repo

- List API: `app/api/demo-client-page/page-client/route.ts`
- Query hooks: `tanstack/use-rental-cars.ts`, `use-rental-car-filter-options.ts`
- Keys: `tanstack/key-factory.ts`
- Project TanStack patterns: `app/development/tanstack-implementation.md`
