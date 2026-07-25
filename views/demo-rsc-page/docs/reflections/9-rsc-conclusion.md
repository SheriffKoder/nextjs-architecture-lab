# Keep RSC for

## URL-based data loading

- filters
- sorting
- pagination
- initial page data

Because:

- shareable URLs
- SEO (if relevant)
- secure
- simple

---

# Move UI state to client

## At this point

More pure-RSC cleverness = more complexity

Whereas:

Selective client systems = simpler code

That’s the signal to evolve.

## Drawer state

Instead of:

```text
?drawer=car&id=123
```

Do:

```ts
useDrawerStore()
```

or local reducer/context.

## Use TanStack selectively

Not everywhere.

Use it for:

### Detail queries

```text
open drawer → useQuery(['car', id])
```

Perfect fit.

### Mutations

```text
useCreateCar
useUpdateCar
useDeleteCar
```

with optimistic updates.

## Infinite scroll / “all” mode

Absolutely TanStack.

---

# Ideal hybrid flow

```text
RSC Page
  fetch initial cars (filters/sort/page)
      ↓
Client Shell
  receives initialData
      ↓
TanStack hydration
      ↓
Table / Drawer / Mutations
```

Like:

```tsx
<RentalCarsClient
  initialCars={cars}
  initialFilters={filters}
/>
```

Then:

```ts
useQuery({
  queryKey: ['cars', query],
  initialData,
})
```

That gives:

- initial page = server fast
- later interactions = client fast

Best of both.

## this avoids complexity

Right now the stack is trying to manage many RSC workarounds:

- prefetch navigation
- transition dimming
- URL drawer state
- server-only infinite scroll compromises

These are all signs of compensating for missing client state.

Adding some TanStack actually reduces complexity.

---

# the plan

## Step 1 (highest value) - Move drawer off URL.

```ts
useDrawerStore()
```

Keep filters in URL.

Huge improvement.

## Step 2 - Use TanStack for detail fetches + mutations.

- table still RSC
- drawer becomes client-powered

Excellent balance.

## Step 3 Hydrate list query.

```ts
useQuery(initialData)
```

Now table updates can be optimistic too.

---

# choose

## RSC for

- filters
- sort
- pagination
- initial page fetch

## TanStack for

- drawer details
- mutations
- optimistic updates
- infinite scroll

## Client state for

- drawer open/close
- temporary UI state

---

## Key Learnings

- **Keep RSC for URL-driven list data** — Filters, sorting, pagination, and initial page fetch stay server-first for shareable URLs and simplicity.
- **Move ephemeral UI off the URL** — Drawer open/close and temporary chrome fit client store / context better than more RSC workarounds.
- **Use TanStack selectively** — Detail queries, mutations with optimism, and infinite scroll — not everywhere.
- **Hybrid flow** — RSC loads initial data; client shell hydrates TanStack; later interactions stay client-fast.
- **Workarounds are a signal** — Prefetch, transition dimming, URL drawer state, and infinite-scroll compromises often mean missing client state.
- **Evolve in steps** — Drawer off URL → TanStack details/mutations → hydrate list query for optimistic table updates.
