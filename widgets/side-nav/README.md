# Side Nav

Configurable app sidebar: logo, nav links / expandable groups, user area, and collapse state.

## Import

```ts
import SideNav, {
  SidebarProvider,
  useSidebar,
  LogoIconPair,
  UserAvatar,
} from '@/widgets/side-nav'
```

Prefer the barrel. Do not deep-import `ui/`, `providers/`, `model/`, or `config/` from outside this widget.

## Structure

```text
side-nav/
├── index.ts
├── ui/
│   ├── side-nav.tsx           # orchestrator (mobile + desktop shells)
│   ├── nav-tooltip.tsx        # portaled collapsed tooltip (anchor-positioned)
│   ├── shells/
│   │   ├── mobile-drawer.tsx  # slide-over; always full labels; flexible width
│   │   ├── desktop-rail.tsx   # dual nav layers + collapse chevron
│   │   └── nav-items-list.tsx # shared link / group rendering
│   └── …                      # nav pieces (link, logo, user area, …)
├── lib/                       # path / active helpers
├── providers/                 # SidebarProvider / useSidebar
├── model/                     # nav config types
└── config/                    # default nav items + theme colors + z-index tokens
```

`MaskImage` lives in `@/shared/ui/mask-image` — this widget imports it; it does not own a copy.

## Shells

| Shell | Viewport | State | Notes |
|-------|----------|--------|-------|
| **Mobile drawer** | `< md` | `isSidebarOpen` | Fixed slide-over + backdrop; full labels; nav list `w-full min-w-0` |
| **Desktop rail** | `≥ md` | local `isCollapsed` | Dual layers + chevron; ignores drawer open state |

Hamburger should call **`openSidebar()`** (not toggle). Close via X, backdrop, or nav link (`closeSidebar()`).

## Setup

Wrap the app shell with the provider, then render the sidebar:

```tsx
'use client'

import SideNav, { SidebarProvider } from '@/widgets/side-nav'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const user = { id: '1', email: null, name: 'Ada', created_at: '', updated_at: '' }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex flex-row">
        <aside>
          <SideNav user={user} />
        </aside>
        <main className="w-full">{children}</main>
      </div>
    </SidebarProvider>
  )
}
```

## Open from elsewhere (mobile hamburger)

```tsx
import { useSidebar } from '@/widgets/side-nav'

function HeaderMenuButton() {
  const { openSidebar } = useSidebar()
  return (
    <button type="button" onClick={openSidebar} aria-label="Open sidebar">
      Menu
    </button>
  )
}
```

`useSidebar()` also exposes `closeSidebar`, `toggleSidebar`, and `setIsSidebarOpen`.

## Config

Edit `config/config.ts` for:

- Logo settings
- Nav items (links, expandable groups, independent logo-pair buttons)
- Color theme (light / dark)
- `defaultCollapsed` — start in the narrow icon-only rail on **desktop** (`true` / `false`)

Types live in `model/types.ts`.

Note: `SidebarProvider`’s `defaultOpen` controls **mobile drawer** open/close, not desktop collapse width.

### Dual nav layers (desktop)

The desktop rail uses two stacked nav layers:

1. **Collapsed** — icon rail; fades out when opening. Viewport uses `overflow-visible` so tooltips can escape; open panel is hard-hidden (`invisible w-0`).
2. **Opened** — absolute panel at full open width (`300px`); clipped/revealed as the shell widens (`overflow-hidden` on the viewport), fades in when opening.

Labels stay on the open layer only, so they do not wrap mid-transition.

### Layering + tooltip behavior

- Collapsed side-nav tooltips are rendered via portal (`document.body`) from `ui/nav-tooltip.tsx`.
- Tooltip layer is controlled by `config/z-index.ts` (`SIDE_NAV_Z.desktopTooltip`, band `70-79`, currently `75`).
- Intended order: above page dropdowns/filters/views; below drawer/popup/confirm overlays.
- Collapsed child links can show parent-group context in tooltip:
  - muted label (e.g. `Demo pages`)
  - main item name (e.g. `Car Rentals (Server)`)

## Changelog

### Mobile / desktop shells

- Split into `MobileDrawer` + `DesktopRail` orchestrated by `side-nav.tsx`
- Hamburger uses `openSidebar()` so the drawer always opens
- Mobile nav list uses flexible width (`w-full min-w-0`); no collapsed dual-layer on mobile
- Backdrop + X / link click call `closeSidebar()`

### Dual rail + collapse UX

- **`defaultCollapsed`** — `SidebarConfig` / `sidebarConfig` flag so the rail can start in icon-only mode
- **Logo flash on load** — skip GSAP tween on first paint; set logo-text width immediately when starting collapsed
- **Dual nav layers** — collapsed icon rail fades out; open panel is absolute at full width and revealed as the shell widens (no label wrap mid-open)
- **Open labels don’t reflow** — `whitespace-nowrap` on open-mode titles/subtext
- **Collapse toggle visible** — shell does not use `overflow-hidden` (clipping stays on the nav viewport when open) so the `-right-6` chevron isn’t clipped
- **Collapsed tooltips (portal)** — tooltip is portaled and anchor-positioned, so it stacks above page overlays reliably
- **Tooltip content hierarchy** — collapsed child links can show muted parent group label above the item name
- **Group row tooltip removal** — expandable group row no longer shows a collapsed tooltip; context now appears on child tooltips
- **Suspense fallback width** — root layout fallback matched to collapsed `w-24` to avoid a load jump (desktop only)

## Pieces also exported


| Export | Use |
|--------|-----|
| `LogoIconPair` | Dual-logo independent nav buttons |
| `UserAvatar` | Avatar with initials / image fallback |
| `useSidebar` | Open / close / toggle state |
