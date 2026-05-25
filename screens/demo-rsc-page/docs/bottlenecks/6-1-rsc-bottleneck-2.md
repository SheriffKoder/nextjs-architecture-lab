the drawer now as it replaces in the params, causes the filter data to rerender. causing delay in opening the drawer. 

This is a classic URL-state + RSC invalidation problem.

What’s happening:

/projects?status=active&page=2

You open drawer:

/projects?status=active&page=2&drawer=edit&id=5

Because searchParams changed, Next re-runs:

page.tsx (RSC)

So:

server refetch filters/data
→ container rerenders
→ drawer waits
→ feels slow

That’s exactly the downside of putting all params in the same route-level searchParams.

Why this happens

In App Router:

export default async function Page({ searchParams }) {
  const data = await getCars(searchParams)
}

Any param change means:

new request
new RSC render

Even if only:

?drawer=edit

changed.

The fix: separate data params from UI params

Your filters/pagination should affect server fetch.

Your drawer state should NOT.

Option 1 (recommended): Keep drawer purely client-side

Instead of:

?drawer=edit&id=5

use:

const [drawer, setDrawer] = useState(...)

or global UI store (Zustand works well).

Why this is best

Opening drawer becomes:

click
→ local state updates
→ drawer opens instantly

No server rerender.

Architecture
RSC page
  → fetch filtered data

Client container
  → filters (update URL)
  → pagination (update URL)
  → drawer manager (local state)
Option 2: Parallel routes (advanced Next.js solution)

Next supports intercepting/parallel routes for modals/drawers.

Example:

/projects
/projects/@drawer/(..)project/5

This allows:

main page stays intact
drawer route loads separately

Very elegant, but more complex.

Great for:

shareable drawer URLs
back button support
deep linking
Option 3: Keep params, but don’t let drawer affect fetch key

Sometimes possible.

Example:

const { drawer, ...dataParams } = searchParams
const data = await getCars(dataParams)

This avoids passing drawer to DB query…

BUT:

⚠️ RSC still reruns because searchParams changed.

So it may still delay.

Not enough.

What I’d recommend for your app

Given your architecture (tables + slideovers + params + server-first):

Use URL params only for shareable data state

Good:

?page=2
?status=active
?view=kanban
Use client state for ephemeral UI

Good:

selectedCarId
drawerMode
drawerOpen
Example
"use client"

const { openDrawer } = useDrawerStore()

<Table
  onRowClick={(car) =>
    openDrawer({
      mode: "view",
      carId: car.id,
    })
  }
/>

Instant.

But what about shareable drawer links?

If you want:

/projects?drawer=edit&id=5

for deep linking…

Then consider parallel routes.

That’s the “Next.js-native” solution.

Practical rule
URL params for:
state that changes the data

Examples:

filters
sorting
pagination
view mode
Client state for:
state that changes only UI

Examples:

drawer open
selected row
hover card
temporary selection
Your issue in one sentence

Your drawer param is invalidating the whole RSC tree because it lives in the same searchParams as your server data filters.

That’s why it feels slow.

My recommendation for you

For your current dashboard architecture:

RSC page:
  searchParams → filters/pagination only

Client:
  drawer manager → Zustand/local state

That will make the drawer feel instant while keeping server-driven filtering.


////////////////////////////////////////////////////////////////

# Solution

So you have 3 patterns
1. URL-first (your current)
URL → drawer

Pros:

simple
fully declarative

Cons:

slow (RSC rerenders)
2. Client-first + URL sync (recommended)
Drawer store → open instantly
URL updates afterward

Best balance.

3. Client-only
Drawer store only

Fastest, but:

no shareable links
no back-button semantics