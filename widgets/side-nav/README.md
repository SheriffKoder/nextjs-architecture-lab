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

Types live in `model/types.ts`.

## Pieces also exported

| Export | Use |
|--------|-----|
| `LogoIconPair` | Dual-logo independent nav buttons |
| `UserAvatar` | Avatar with initials / image fallback |
| `useSidebar` | Open / close / toggle state |
