/**
 * @file views/demo-hybrid-page/ui/drawer/modes/create/create-content.tsx
 * Create mode (`mode=create`) — form stub until Phase 4 mutations.
 */

'use client'

import { CarDrawerCreateHeader } from '../../chrome/sticky-header'

const HYBRID_CAR_CREATE_FORM_ID = 'hybrid-car-create-form'

export default function CarDrawerCreateContent() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <CarDrawerCreateHeader formId={HYBRID_CAR_CREATE_FORM_ID} isSubmitting={false} />
      <form
        id={HYBRID_CAR_CREATE_FORM_ID}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
        onSubmit={(e) => {
          e.preventDefault()
          // Phase 4: mutation + close drawer
        }}
      >
        <p className="text-sm text-muted-foreground">
          Create flow (<code className="rounded bg-muted px-1 text-xs">mode=create</code>). Form
          fields + mutation in Phase 4.
        </p>
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-md bg-muted" />
          <p className="text-xs text-muted-foreground">Placeholder inputs — submit is a no-op for now.</p>
        </div>
      </form>
    </div>
  )
}
