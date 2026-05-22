'use client'

import SidebarHeader from '@/components/side-nav/components/side-nav'
import { SidebarProvider, useSidebar } from '@/components/side-nav/contexts/sidebar-context'
import { User } from '@/features/auth'
import React, { Suspense, useEffect, useState } from 'react'
import { useAppSelector } from '@/features/auth/store/hooks'
import '@/screens/login/styles/main-background.css'

function SidebarHeaderFallback() {
  return (
    <div
      className="h-full min-h-[700px] w-[calc(100vw-16px)] max-w-[300px] shrink-0 rounded-lg border border-tertiary/10 bg-background/20 backdrop-blur-lg animate-pulse md:w-[300px]"
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
              <SidebarHeader user={user} />
            </Suspense>
        </aside>

      {/* Main: pages often use usePathname / useSearchParams (e.g. PageHeader, FilteringWrapper) */}
      <main className='flex-1 min-w-0 overflow-hidden'>
        <Suspense fallback={<MainAreaFallback />}>{children}</Suspense>
      </main>
    </div>
  )
}

export default function layout({ children }: { children: React.ReactNode }) {
    // Get user from Redux store
    const user = useAppSelector((state) => state.user.user)
      // Get default sidebar open state safely
    const [defaultOpen, setDefaultOpen] = useState(true)

    useEffect(() => {
      // Set default open state on client side
      setDefaultOpen(window.innerWidth > 768)
    }, [])
    
    // Fallback user if not authenticated (should not happen in protected routes)
    // Using static date to avoid SSR issues with new Date()
    const fallbackUser: User = {
        id: '',
        email: null,
        name: null,
        created_at: '1970-01-01T00:00:00.000Z',
        updated_at: '1970-01-01T00:00:00.000Z',
    }
    
    const displayUser: User = user || fallbackUser

  return (
    <SidebarProvider defaultOpen={false}>
      <LayoutContent user={displayUser}>
        {children}
      </LayoutContent>
    </SidebarProvider>
  )
}