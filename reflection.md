# Reflection

## What worked well

- URL-driven filters feel natural and predictable.
- Suspense islands improved perceived responsiveness.
- useTransition dimming created better UX than blocking spinners.
- Server Actions are excellent for secure mutations.

## What became painful

- Drawer state in URL caused unnecessary route invalidation.
- Highly interactive UI feels constrained in pure RSC.
- Infinite scrolling does not fit naturally with server pagination.
- Optimistic updates are harder without client cache.

## Key realization

Pure RSC is ideal for read-heavy interfaces.

As interactivity grows, hybrid architecture becomes simpler.