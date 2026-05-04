/**
 * Sidebar Context
 * 
 * Purpose: Provides global state management for sidebar open/close state
 * Used in: Root layout and SidebarHeader component
 * Why: Allows sidebar state to be controlled from anywhere in the app
 *
 * Note: With `cacheComponents`, `(root)/layout` wraps the sidebar and main `{children}` in `<Suspense>` so `usePathname` / `useSearchParams` in the shell or pages do not block prerender.
 * 
 * Implementation Steps:
 * 1. Create context with isSidebarOpen state and setter
 * 2. Create provider component
 * 3. Export custom hook for consuming the context
 */

'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

interface SidebarProviderProps {
  children: ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(defaultOpen)

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
