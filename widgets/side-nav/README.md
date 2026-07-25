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
├── ui/                 # SideNav shell + nav pieces
├── providers/          # SidebarProvider / useSidebar
├── model/              # nav config types
└── config/             # default nav items + theme colors
```

`MaskImage` lives in `@/shared/ui/mask-image` — this widget imports it; it does not own a copy.

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

## Toggle from elsewhere

```tsx
import { useSidebar } from '@/widgets/side-nav'

function HeaderMenuButton() {
  const { toggleSidebar } = useSidebar()
  return <button type="button" onClick={toggleSidebar}>Menu</button>
}
```

## Config

Edit `config/config.ts` for:

- Logo settings
- Nav items (links, expandable groups, independent logo-pair buttons)
- Color theme (light / dark)
- `defaultCollapsed` — start in the narrow icon-only rail (`true` / `false`)

Types live in `model/types.ts`.

Note: `SidebarProvider`’s `defaultOpen` controls mobile drawer open/close, not desktop collapse width.

### Dual nav layers

The desktop rail uses two stacked nav layers:

1. **Collapsed** — icon rail; fades out when opening. Viewport uses `overflow-visible` so tooltips can escape; open panel is hard-hidden (`invisible w-0`).
2. **Opened** — absolute panel at full open width (`300px`); clipped/revealed as the shell widens (`overflow-hidden` on the viewport), fades in when opening.

Labels stay on the open layer only, so they do not wrap mid-transition.

## Changelog

### Dual rail + collapse UX

- **`defaultCollapsed`** — `SidebarConfig` / `sidebarConfig` flag so the rail can start in icon-only mode
- **Logo flash on load** — skip GSAP tween on first paint; set logo-text width immediately when starting collapsed
- **Dual nav layers** — collapsed icon rail fades out; open panel is absolute at full width and revealed as the shell widens (no label wrap mid-open)
- **Open labels don’t reflow** — `whitespace-nowrap` on open-mode titles/subtext
- **Collapse toggle visible** — shell does not use `overflow-hidden` (clipping stays on the nav viewport when open) so the `-right-6` chevron isn’t clipped
- **Collapsed tooltips** — `overflow-visible` while collapsed; open panel hard-hidden (`invisible w-0`) so it doesn’t spill; `group` on expandable triggers for hover tooltips
- **Suspense fallback width** — root layout fallback matched to collapsed `w-24` to avoid a load jump

## Pieces also exported


| Export | Use |
|--------|-----|
| `LogoIconPair` | Dual-logo independent nav buttons |
| `UserAvatar` | Avatar with initials / image fallback |
| `useSidebar` | Open / close / toggle state |
