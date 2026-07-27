# Drawer expanded view (full-width + journey layout)

This note describes how the **demo RSC car drawer** gained an “expanded” mode: the shell can go **full viewport width**, and **client body components** can react without prop-drilling from the URL layer.

The filename uses **“expaned”** as a historical typo; the behavior is **expanded** (journey panel open).

---

## Problem

1. **`RightDrawer`** (`components/design/right-drawer.tsx`) exposes **`expandToFullScreen`** so the panel can use the full width (e.g. for a two-column details + timeline layout).
2. The toggle for that mode lives **inside** drawer content (e.g. `TimelineJourney` → “Expand view”), while the flag must be applied on **`RightDrawer`**, which is **above** those children in the tree.
3. **`DrawerWrapper`** (`platform/url-kit/url-drawer/components/drawer-wrapper.tsx`) only receives **`children`** from the server/RSC shell; it cannot know about journey UI unless we add cross-layer wiring.

---

## Approach: drawer “chrome” context

We introduced a small **React context** scoped to the open drawer session:

| Piece | Location | Role |
|--------|-----------|------|
| **Context + hooks** | `platform/url-kit/url-drawer/providers/drawer-chrome-context.tsx` | Holds `isJourneyPanelOpen`, `setIsJourneyPanelOpen`, `toggleJourneyPanel`. |
| **Owner + provider** | `platform/url-kit/url-drawer/components/drawer-wrapper.tsx` | Owns `useState`, passes **`expandToFullScreen={isJourneyPanelOpen}`** to `RightDrawer`, wraps **`children`** with **`DrawerChromeProvider`** only when the drawer URL says open. |
| **Consumers** | Any **client** component rendered as `children` (e.g. `details-container.tsx`) | Calls **`useDrawerChrome()`** from `@/platform/url-kit/url-drawer`. |

Public re-exports live in **`platform/url-kit/url-drawer/index.ts`** (`useDrawerChrome`, `useDrawerChromeOptional`, `DrawerChromeProvider`, `DrawerChromeContextValue`).

---

## Lifecycle rules

1. **While open:** descendants can set `isJourneyPanelOpen` to `true` → drawer grows to full width (see `RightDrawer` implementation).
2. **When the drawer closes** (URL no longer open): a **`useEffect`** in `DrawerWrapper` resets **`isJourneyPanelOpen`** to `false` so the next open does not start full-width.
3. **`handleClose`:** resets journey state, then calls **`useDrawerActions().close()`** so chrome and URL stay aligned.

In `drawer-wrapper.tsx`, context-related blocks are grouped under **`/////////`**-style section headers for quick scanning.

---

## Demo RSC usage

- **Shell:** `DemoRscDrawerLayer` → `DrawerWrapper` → `CarDrawerOrchestrator` (server) → view branch → `RscCarDrawerViewHeader` + **`CarDrawerViewSectionsLayout`** (client).
- **Consumer:** `ui/drawer/modes/view/sections/sections-layout.tsx` uses **`useDrawerChrome()`** and passes **`isJourneyPanelOpen` / `setIsJourneyPanelOpen`** into **`TimelineJourney`**.
- **Layout:** When expanded, the same file can switch to a **row layout** (details column + timeline `flex-1`), with a **scrollable** details column and height delegated from **`rsc-car-drawer-view-content.tsx`** (`min-h-0` / `flex-1` / `overflow-hidden` chain).

---

## Optional hook

**`useDrawerChromeOptional()`** returns `null` outside a provider — useful for components that are sometimes mounted outside `DrawerWrapper` (tests, stories) without throwing.

---

## Related files

- `components/design/right-drawer.tsx` — `expandToFullScreen` width behavior
- `platform/url-kit/url-drawer/providers/drawer-chrome-context.tsx` — context API
- `platform/url-kit/url-drawer/components/drawer-wrapper.tsx` — state, reset, provider, `RightDrawer` wiring
- `ui/drawer/modes/view/sections/sections-layout.tsx` — consumer + layout
- `ui/drawer/modes/view/sections/timeline-journey.tsx` — toggles expand via props from parent
