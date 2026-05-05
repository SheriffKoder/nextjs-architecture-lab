import { Eye } from 'lucide-react'
import { RscCarDrawerViewHeader } from './rsc-car-drawer-sticky-header'

interface RscCarDrawerViewContentProps {
  id: string
}

export default function RscCarDrawerViewContent({ id }: RscCarDrawerViewContentProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <RscCarDrawerViewHeader id={id} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground">
          Read-only view (<code className="rounded bg-muted px-1 text-xs">mode=view</code>). Load the row
          by id (server component, route handler, or client query).
        </p>
        <dl className="space-y-3 rounded-lg border border-border bg-muted/20 p-4 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Car id</dt>
            <dd className="mt-0.5 font-mono text-foreground">{id}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Preview</dt>
            <dd className="mt-0.5 text-muted-foreground">
              Placeholder copy — replace with fields from your data source.
            </dd>
          </div>
        </dl>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="size-3.5 shrink-0" aria-hidden />
          Edit updates the URL to <code className="rounded bg-muted px-1">mode=edit</code>.
        </p>
      </div>
    </div>
  )
}
