# Z-Index Layering Guide

This guide defines how we assign layering across the app and where those values live.

## Core rule

- The **policy** lives here.
- The **numbers** live in package-local token files.
- When ordering matters across packages, derive from shared tokens instead of hardcoding magic numbers.

## Layer hierarchy map (bottom -> top)

Use this order as the default contract:

1. `0-9`: local component layering (background/content inside one component)
2. `10-29`: sticky in-flow chrome (table headers, sticky rows)
3. `30-49`: contextual page overlays (row menus, drag affordances)
4. `50-59`: anchored page panels (filter/date/popovers)
5. `70-79`: app chrome flyouts (collapsed side-nav tooltip)
6. `90-99`: app shells (drawer, mobile nav)
7. `100-119`: toasts and non-blocking system overlays
8. `120-199`: modal overlays
9. `200+`: blocking confirm dialogs

### Tooltip placement rule

Side-nav tooltip must be:

- above page-level filters/dropdowns/views
- below drawer, popup, confirm modal, and other shell/system overlays

For this project, `SIDE_NAV_Z.desktopTooltip` uses band `70-79` and is rendered via portal.

## Tailwind vs inline style

- Use **Tailwind z classes** for static local layering inside a component subtree.
- Use **token + `style={{ zIndex }}`** for fixed/portaled overlays or computed layering.
- Avoid dynamic Tailwind class strings for z-index values.

## Token files

Shared cross-project primitives:

- `shared/ui/right-drawer/layers.ts`
- `shared/ui/toast/layers.ts`
- `shared/ui/popup/layers.ts`
- `shared/ui/confirm-modal/layers.ts`

Package-local overlays:

- `widgets/side-nav/config/z-index.ts`
- `widgets/multi-view/config/z-index.ts`
- `platform/url-kit/config/z-index.ts`

## Cross-package ordering

When package `A` must sit above package `B`, import `B` tokens and derive:

- Example: side-nav mobile panel above shared drawer panel.

Do not rely on unrelated hardcoded values (for example `89`, `90`, `19`, `50`) without token references.
