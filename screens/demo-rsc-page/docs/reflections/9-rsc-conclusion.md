
<!-- //////////////////////////////////////////////////////////////////////// -->
# Keep RSC for:

## URL-based data loading
filters
sorting
pagination
initial page data

Because:

shareable URLs
SEO (if relevant)
secure
simple

<!-- //////////////////////////////////////////////////////////////////////// -->
# Move UI state to client

## At this point:

More pure-RSC cleverness = more complexity
Whereas:
Selective client systems = simpler code

That’s the signal to evolve.

# Drawer state

Instead of:
?drawer=car&id=123

Do:
useDrawerStore()
or local reducer/context.


## Use TanStack selectively

Not everywhere.

Use it for:
Detail queries
open drawer → useQuery(['car', id])

Perfect fit.

Mutations
useCreateCar
useUpdateCar
useDeleteCar

with optimistic updates.

## Infinite scroll / “all” mode

Absolutely TanStack.

<!-- //////////////////////////////////////////////////////////////////////// -->
# Ideal hybrid flow
RSC Page
  fetch initial cars (filters/sort/page)
      ↓
Client Shell
  receives initialData
      ↓
TanStack hydration
      ↓
Table / Drawer / Mutations


>> Like:
<RentalCarsClient
  initialCars={cars}
  initialFilters={filters}
/>

Then:
useQuery({
  queryKey: ['cars', query],
  initialData,
})

>> That gives you:

initial page = server fast
later interactions = client fast

Best of both.


## this avoids complexity

Right now we're trying to manage many RSC workarounds:

prefetch navigation
transition dimming
URL drawer state
server-only infinite scroll compromises

These are all signs you’re compensating for missing client state.

Adding some TanStack actually reduces complexity.


<!-- //////////////////////////////////////////////////////////////////////// -->
# the plan


## Step 1 (highest value) - Move drawer off URL.

useDrawerStore()
Keep filters in URL.
Huge improvement.

## Step 2 - Use TanStack for detail fetches + mutations.

table still RSC
drawer becomes client-powered

Excellent balance.

## Step 3 Hydrate list query.

useQuery(initialData)

Now table updates can be optimistic too.

<!-- //////////////////////////////////////////////////////////////////////// -->
# choose:
RSC for:
- filters
- sort
- pagination
- initial page fetch

TanStack for:
- drawer details
- mutations
- optimistic updates
- infinite scroll

Client state for:
- drawer open/close
- temporary UI state