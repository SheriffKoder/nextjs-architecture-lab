/**
 * @file views/demo-hybrid-page/ui/demo-hybrid-page-header.tsx
 * Page title + header actions — mirrors RSC header layout.
 *
 * Mobile:  [title] ——— [+] [hamburger]
 * Desktop: [title + subtitle] ——— [Add car]
 */

'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/widgets/side-nav'
import AddCarButton from './add-car-button'

function MobileSidebarToggle() {
  const { openSidebar } = useSidebar()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={openSidebar}
      className="md:hidden"
      aria-label="Open sidebar"
    >
      <Menu className="h-6 w-6 text-foreground" />
    </Button>
  )
}

export default function DemoHybridPageHeader() {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-tertiary/10 p-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-semibold tracking-tight">
          Car Rentals (Hybrid)
        </h1>
        <p className="hidden text-sm text-muted-foreground md:block">
          Shallow URL · TanStack list + facets (no RSC remount on filter)
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 md:gap-2">
        <AddCarButton />
        <MobileSidebarToggle />
      </div>
    </header>
  )
}
