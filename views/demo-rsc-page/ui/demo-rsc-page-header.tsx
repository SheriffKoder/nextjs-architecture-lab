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
import PageHeader from '@/shared/ui/page-header/page-header'
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
    <button
      type="button"
      onClick={openSidebar}
      className="rounded-md p-2 transition-colors hover:bg-foreground/5 md:hidden"
      aria-label="Open sidebar"
    >
      <Menu className="h-6 w-6 text-foreground" />
    </button>
  )
}

export default function DemoRscPageHeader({
  subTitle,
  exportForMailchimp,
  showAddCarDrawerButton,
}: DemoRscPageHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-tertiary/10 p-4">
      <PageHeader
        subTitle={subTitle}
        showMenuToggle={false}
        hideSubtitleOnMobile
        className="min-w-0 flex-1"
      />

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
