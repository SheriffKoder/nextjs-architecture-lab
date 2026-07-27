/**
 * @file views/demo-rsc-page/ui/drawer/modes/view/view-panel.tsx
 * View-mode panel — async server fetch via `getRentalCarByIdAction`, then sections.
 *
 * Used in: `car-drawer-orchestrator` when `mode=view` (inside Suspense)
 */

import { Eye } from 'lucide-react'
import { RscCarDrawerViewHeader } from '../../chrome/sticky-header'
import CarDrawerViewSectionsLayout from './sections/sections-layout'
import { getRentalCarByIdAction } from '@/entities/cars-rsc/actions/get-rental-car-by-id-action'

interface CarDrawerViewPanelProps {
  id: string
}

export default async function CarDrawerViewPanel({ id }: CarDrawerViewPanelProps) {
  const car = await getRentalCarByIdAction(id)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto pb-4">
      <RscCarDrawerViewHeader id={id} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        {!car ? (
          <p className="text-sm text-destructive">
            No car found for id{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs text-foreground">{id}</code>.
          </p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-">
            <CarDrawerViewSectionsLayout selectedCar={car} />
          </div>
        )}
        <p className="mt-3 flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="size-3.5 shrink-0" aria-hidden />
          Edit updates the URL to <code className="rounded bg-muted px-1">mode=edit</code>.
        </p>
      </div>
    </div>
  )
}
