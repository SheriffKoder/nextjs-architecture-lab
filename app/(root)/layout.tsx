'use client'

import SideNav, { SidebarProvider, useSidebar } from '@/widgets/side-nav'
import React, { Suspense, useEffect } from 'react'
import '@/views/login/styles/main-background.css'

/** Temporary stub until auth is re-implemented. */
interface User {
  id: string
  email: string | null
  name: string | null
  phone?: string | null
  created_at: string
  updated_at: string
}

function SidebarHeaderFallback() {
  // Match defaultCollapsed rail width to avoid load layout jump (see sidebarConfig.defaultCollapsed)
  return (
    <div
      className="h-full min-h-[700px] w-24 shrink-0 rounded-lg border border-tertiary/10 bg-background/20 backdrop-blur-lg animate-pulse"
      aria-hidden
    />
  )
}

function MainAreaFallback() {
  return <div className="flex h-full min-h-0 w-full flex-1 animate-pulse bg-muted/15" aria-hidden />
}

// Inner component that can use the sidebar hook
function LayoutContent({ children, user }: { children: React.ReactNode; user: User }) {
  const { setIsSidebarOpen } = useSidebar()
  
  useEffect(() => {
    // Set sidebar state based on window size after hydration
    const setInitialState = () => {
      setIsSidebarOpen(window.innerWidth > 768)
    }
    setInitialState()
    
    // Optional: handle window resize
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setIsSidebarOpen])

  return (
    <div className='flex flex-row w-full min-w-0 h-screen overflow-hidden'>

        {/* <div className='absolute inset-0 login-background-light dark:hidden z-0 left-[30%] blur-3xl opacity-40 lg:opacity-70'></div> */}
        <div className='absolute inset-0 main-background opacity-25 dark:opacity-15 block z-0 pointer-events-none'></div>
        
        {/* Affects right side width on expand/collapse */}
        {/* SidebarHeader uses usePathname — must be under Suspense for Cache Components prerender */}
          <aside className='h-full flex-shrink-0'>
            <Suspense fallback={<SidebarHeaderFallback />}>
              <SideNav user={user} />
            </Suspense>
        </aside>

      {/* Main: pages often use usePathname / useSearchParams (e.g. PageHeader, FilteringWrapper) */}
      <main className='flex-1 min-w-0 overflow-hidden'>
        <Suspense fallback={<MainAreaFallback />}>{children}</Suspense>
      </main>
    </div>
  )
}

const fallbackUser: User = {
  id: '',
  email: null,
  name: null,
  created_at: '1970-01-01T00:00:00.000Z',
  updated_at: '1970-01-01T00:00:00.000Z',
}

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <LayoutContent user={fallbackUser}>
        {children}
      </LayoutContent>
    </SidebarProvider>
  )
}
