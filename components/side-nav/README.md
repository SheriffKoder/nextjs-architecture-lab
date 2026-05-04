# Sidebar Integration Guide

A brief guide on how to integrate the sidebar navigation component into your Next.js project.

## Quick Start

### 1. Wrap Your Layout with SidebarProvider

Wrap your root layout (or the layout where you want the sidebar) with the `SidebarProvider`:

```tsx
'use client'

import { SidebarProvider } from '@/components/side-nav/contexts/sidebar-context'
import SidebarHeader from '@/components/side-nav/components/side-nav'
import { User } from '@/lib/types'

export default function Layout({ children }: { children: React.ReactNode }) {
  const user: User = {
    // Your user object
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className='flex flex-row'>
        <aside className='h-full'>
          <SidebarHeader user={user} />
        </aside>
        <main className='w-full'>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
```

### 2. Configure Navigation Items

Edit `components/side-nav/config.ts` to customize your navigation items:

- **Regular Links**: Simple navigation items with icon and text
- **Expandable Groups**: Items with children that expand/collapse
- **Independent Links**: Special items with custom icon pairs (e.g., external services)

### 3. Control Sidebar State (Optional)

Use the `useSidebar` hook anywhere in your app to control the sidebar:

```tsx
import { useSidebar } from '@/components/side-nav/contexts/sidebar-context'

function MyComponent() {
  const { isSidebarOpen, toggleSidebar, setIsSidebarOpen } = useSidebar()
  
  return (
    <button onClick={toggleSidebar}>
      Toggle Sidebar
    </button>
  )
}
```

## Features

- ✅ Responsive (collapses on mobile)
- ✅ Expandable navigation groups
- ✅ Custom icon support
- ✅ Independent button items with logo pairs
- ✅ Context-based state management
- ✅ Dark/Light theme support

## File Structure

```
components/side-nav/
├── components/          # Sidebar sub-components
├── contexts/           # Sidebar context provider
├── config.ts          # Navigation configuration
└── types.ts           # TypeScript types
```

## Configuration

The sidebar configuration is defined in `config.ts` with:
- Logo settings
- Navigation items array
- Color theme (light/dark)
- Independent button configurations
