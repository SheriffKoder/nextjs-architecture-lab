
getting good UX out of pure searchParams-driven RSC requires startTransition + useOptimistic band-aids
the emerging consensus for anything genuinely interactive (filters, tables, infinite lists) is a hybrid model

RSC still owns the first paint and SEO-relevant data, but interactive re-fetching moves to a client cache (TanStack Query), with the server-rendered payload used only as initialData/hydration. That's not "giving up on RSC," it's using each for what it's actually good at.

# 1. URL transitions feel blocking → move filter/sort/page state off the RSC round-trip

This is the clearest case. Right now every filter change re-runs the whole RSC tree because state lives in searchParams. The fix isn't "more transition polish," it's changing what changes:

Keep the URL as the source of truth for shareability (you want ?status=reserved&page=2 to be a real link), but stop making the URL change be the thing that triggers the fetch.
Move getCars/getFilters calls to a client-side useQuery keyed on the same demoRscDataParamsToCacheKey shape you already built — that key becomes your query key, basically for free.
Sync URL ↔ client state with nuqs (shallow: true for these fields), so changing the URL is a client-side transition, not a server navigation. router.replace never fires for filter/sort/page; only history.replaceState.
Server actions or getCars become the queryFn, called from the client. The RSC page still does the first server-rendered fetch for the initial load (good TTFB, no client waterfall on cold load), and you feed that result into useQuery's initialData.

This directly kills the dimmer/wrapNavigation workaround for this specific interaction, because there's no navigation to transition through — it's a normal React state update with isFetching/isPlaceholderData from the query, which is a much better signal than a coarse route-level pending state anyway (you get per-row/per-section granularity for free — keepPreviousData alone solves the "table flashes empty while typing" problem your dimmer is currently patching over).

Your NavigationTransitionRoot doesn't disappear — it's still exactly right for actual navigations (drawer open via distinct route, page-to-page nav). It's just no longer doing double duty for interactive-filtering-that-happens-to-be-encoded-in-the-URL.


# 2. Drawer busts list/facet cache → this is a symptom of #1, not a separate problem

Once list/facet data isn't derived from a server re-render of the whole page, opening the drawer stops being able to touch it at all — there's no RSC re-run to bust anything. The drawer's own getRentalCarByIdAction becomes its own independent useQuery, decoupled from the list query. Your demoRscDataParamsToCacheKey split (data vs. UI chrome) was the right diagnosis under the old model; under the new model the problem it was solving stops existing, so you can likely simplify that function back down once the migration lands — worth flagging so you don't carry dead complexity forward.

Whether the drawer body itself (RscCarDrawerContent) stays server-rendered is a separate, smaller decision — I'd actually lean toward keeping it server for the "view" mode (read-only detail, no interactivity, RSC is genuinely fine there) and only going client for edit mode where you want optimistic mutation + TanStack Query cache invalidation to sync with the list. Don't blanket-convert the whole drawer just because you're touching this area.

# 3. Hover prefetch ≠ warm open → this one is a textbook useQuery win, not a caching-layer patch

unstable_cache by id was a reasonable stopgap but you already identified the right end state yourself. queryClient.prefetchQuery on hover, same query key as the open action, and TanStack's own in-memory cache (not unstable_cache, which is server-side and doesn't help the client skip a network round-trip) means hover-then-open is a cache hit with zero additional request. This is the single highest-leverage, lowest-risk migration of the three — small blast radius (one component), and it removes a whole layer (unstable_cache + shared action plumbing) rather than adding one.

# Bonus: Infinite scroll / virtualized "get all" views

Given #1 lands, infinite scroll is almost free: useInfiniteQuery with your existing getCars as queryFn, getNextPageParam off whatever cursor/offset your pagination already returns. The thing to decide now, before you build it, is cursor vs. offset pagination for the "get all" views specifically — offset-based breaks under concurrent writes (rows shift while scrolling, you get dupes/skips), which matters here since you have optimistic status toggles mutating the same list live. If your backend can give you a stable cursor (id + sort key), infinite scroll + optimistic toggle will compose correctly; if it's offset-only, the toggle mutation and the infinite list will fight each other and you'll see rows jump or duplicate on scroll after a toggle. Worth checking getCars's current pagination contract before wiring this up rather than discovering it in QA.

# Net shape after this migration

Server stays authoritative for: first paint, the drawer's read-only view, server actions as mutation entry points, SEO-relevant static content. Client (TanStack Query) takes over: filters, sort, pagination, infinite scroll, drawer prefetch/hover, and any mutation that needs optimistic + cache invalidation. That's a genuinely defensible line to draw in a writeup — "server owns first-render and read-heavy static views, client owns anything with sub-100ms interaction expectations or shared cache across triggers (hover+open)."


# Notes

## On nuqs — yes, and here's the specific reason it fits your case rather than a generic "it's popular":

You already have extractDemoRscListDataParams + demoRscDataParamsToCacheKey doing manual parse/serialize/normalize by hand. That's exactly the code nuqs replaces, but the bigger win for you specifically is per-key control over two things you're currently hand-rolling with NavigationTransitionRoot:

shallow per key. Once list state (view, groupBy, make, limit, sort, page) moves to client-driven fetching (per my last answer), those keys become shallow: true — URL updates, zero RSC re-render, no router.replace, no transition needed at all for that class of interaction. Keys that should still trigger a real server round-trip (if any remain) stay shallow: false. Right now you're applying one blunt transition strategy to every param; nuqs lets the param declare its own behavior.
Typed parsers matching your actual shapes. make is a multi-select → parseAsArrayOf(parseAsString) instead of hand-splitting %2C. sort supporting multiple levels → a custom parser for field:dir tuples, array-of-tuples for multi-sort, instead of a bespoke string format you parse/stringify by hand. page/limit → parseAsInteger with defaults, so "no page param" and "page=1" collapse to the same state instead of being two representations of one thing (a real bug class in hand-rolled parsing).
useQueryStates batching. When you need to change page and sort together (e.g. sorting resets you to page 1), that's one history entry via nuqs, not two sequential router.replace calls that can race or produce a double entry in back-button history — which is a plausible contributor to the "feels stuck" perception you mentioned, if any of your current multi-param updates are sequential rather than batched.

Net: nuqs doesn't change your architecture, it removes hand-written parsing/serialization surface and gives you a lever (shallow) you're currently missing entirely.


## action=delete/archive doesn't discriminate data, it represents "a confirmation dialog is currently open." Having more possible values (delete, archive, whatever else) doesn't move it into the same category — it's still transient interaction state, just with more variants.

The concrete problem, regardless of how many actions exist: refresh and share semantics for a confirmation modal are actively bad, not just unnecessary.