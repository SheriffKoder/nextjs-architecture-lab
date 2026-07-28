/**
 * Demo RSC Page Header
 *
 * Purpose: Page title + header actions with mobile-first layout
 * Used in: `demo-rsc-index.tsx`
 *
 * Mobile:  [title] ——— justify-between ——— [+] [hamburger]
 * Desktop: [title + subtitle] ——— [Add Car …]
 */

'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/widgets/side-nav'
import ActionButtons from './action-buttons'

interface DemoRscPageHeaderProps {
  subTitle?: string
  exportForMailchimp: () => void | Promise<void>
  showAddCarDrawerButton?: boolean
}

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

export default function DemoRscPageHeader({
  subTitle,
  exportForMailchimp,
  showAddCarDrawerButton,
}: DemoRscPageHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-tertiary/10 p-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-semibold tracking-tight">
          Car Rentals (RSC)
        </h1>
        <p className="hidden text-sm text-muted-foreground md:block">
          {subTitle}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 md:gap-2">
      <ActionButtons
          exportForMailchimp={exportForMailchimp}
          showAddCarDrawerButton={showAddCarDrawerButton}
        />
        <MobileSidebarToggle />
      </div>
    </header>

  )
}
