# Scroll to Top Fix for URL Filter Updates

## Problem

When applying filters in both RSC and client pages, the page automatically scrolls to the top. This creates a poor user experience, especially when users are filtering data that's lower on the page.

## Root Cause

The issue occurs in the `useUrlFilters` hook when updating URL parameters. The `router.replace()` method in Next.js App Router, by default, scrolls to the top of the page when the URL changes. This is the default behavior for navigation in Next.js.

## Solution

Add the `{ scroll: false }` option to `router.replace()` calls to prevent automatic scrolling when URL parameters are updated.

### Implementation

Update the `updateUrl` function in `app/development/filters/hooks/useUrlFilters.ts`:

```typescript
const updateUrl = (params: URLSearchParams) => {
  router.replace(`${pathname}?${params.toString()}`, { scroll: false })
}
```

Also update the `clearAll` function:

```typescript
const clearAll = () => {
  router.replace(pathname, { scroll: false }) // Navigate to pathname only, removing all query params
}
```

## Why This Works

The `{ scroll: false }` option tells Next.js not to scroll to the top when the URL changes. This is particularly useful for:
- Filter components that update URL parameters frequently
- Maintaining user's scroll position when filters are applied
- Better UX when filtering large datasets

## Reference

This pattern is already used in other parts of the codebase, such as `hooks/useViewMode.ts`:

```typescript
router.push(`${pathname}?${params.toString()}`, { scroll: false })
```

## Impact

- ✅ Prevents automatic scroll to top when filters are applied
- ✅ Maintains user's scroll position
- ✅ Better user experience when filtering data
- ✅ No breaking changes - only improves UX
