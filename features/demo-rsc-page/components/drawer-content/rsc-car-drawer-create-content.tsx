import { RscCarDrawerCreateHeader } from './rsc-car-drawer-sticky-header'

export default function RscCarDrawerCreateContent() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <RscCarDrawerCreateHeader />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground">
          Demo RSC flow: URL is the source of truth (
          <code className="rounded bg-muted px-1 text-xs">drawer=car</code>,{' '}
          <code className="rounded bg-muted px-1 text-xs">mode=create</code>). Wire a real form or server
          action here when you replace the mock list.
        </p>
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-md bg-muted" />
          <p className="text-xs text-muted-foreground">
            Placeholder fields — connect to your create mutation or transition to the TanStack demo page for
            a full client create flow.
          </p>
        </div>
      </div>
    </div>
  )
}
