/**
 * @file views/demo-rsc-page/ui/drawer/modes/edit/edit-content.tsx
 * Edit mode (`mode=edit`) — placeholder shell until edit form is wired.
 *
 * Used in: `car-drawer-orchestrator` when `mode=edit`
 */

import { Pencil } from 'lucide-react'
import { RscCarDrawerEditHeader } from '../../chrome/sticky-header'

interface CarDrawerEditContentProps {
  id: string
}

export default function CarDrawerEditContent({ id }: CarDrawerEditContentProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <RscCarDrawerEditHeader id={id} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground">
          Editable flow (<code className="rounded bg-muted px-1 text-xs">mode=edit</code>). Wire fields to
          a mutation or server action.
        </p>
        <p className="text-sm text-muted-foreground">
          Editing <span className="font-mono text-foreground">{id}</span>
        </p>
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-md bg-muted" />
          <p className="text-xs text-muted-foreground">
            Placeholder inputs — same id as view; URL is still the source of truth.
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Pencil className="size-3.5 shrink-0" aria-hidden />
          View details sets <code className="rounded bg-muted px-1">mode=view</code> without closing the
          drawer.
        </p>
      </div>
    </div>
  )
}
