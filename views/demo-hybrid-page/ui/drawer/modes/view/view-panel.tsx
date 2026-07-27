/**
 * @file views/demo-hybrid-page/ui/drawer/modes/view/view-panel.tsx
 * View-mode panel — loads `useRentalCarDetail`, sticky header, loading/error, then sections.
 *
 * Used in: `car-drawer-orchestrator` when `mode=view`
 */

'use client'

import { Eye } from 'lucide-react'
import { useRentalCarDetail } from '@/entities/demo-hybrid-cars/queries'
import { CarDrawerViewHeader } from '../../chrome/sticky-header'
import CarDrawerViewSectionsLayout from './sections/sections-layout'

interface CarDrawerViewPanelProps {
  id: string
}

function CarDrawerViewPanelSkeleton({ id }: { id: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <CarDrawerViewHeader id={id} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="h-48 animate-pulse rounded-lg border border-border bg-muted/30" aria-hidden />
        <p className="text-xs text-muted-foreground">Loading car details…</p>
      </div>
    </div>
  )
}

export default function CarDrawerViewPanel({ id }: CarDrawerViewPanelProps) {
  const { data: car, isLoading, isError, isFetching } = useRentalCarDetail(id)

  if (isLoading && !car) {
    return <CarDrawerViewPanelSkeleton id={id} />
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto pb-4">
      <CarDrawerViewHeader id={id} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        {isError ? (
          <p className="text-sm text-destructive">
            Failed to load car{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs text-foreground">{id}</code>.
          </p>
        ) : !car ? (
          <p className="text-sm text-destructive">
            No car found for id{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs text-foreground">{id}</code>.
          </p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <CarDrawerViewSectionsLayout selectedCar={car} />
          </div>
        )}
        <p className="mt-3 flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="size-3.5 shrink-0" aria-hidden />
          {isFetching && car ? 'Refreshing… · ' : null}
          Edit updates the URL to <code className="rounded bg-muted px-1">mode=edit</code>.
        </p>
      </div>
    </div>
  )
}
