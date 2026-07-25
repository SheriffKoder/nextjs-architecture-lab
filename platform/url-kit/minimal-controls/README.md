# Minimal Controls (url-kit)

URL-driven composed bar: **group · advanced filter · sort · view · search**.

The bar **writes** URL state. The view orchestrator (`FilteringWrapper`) **reads** the same params and renders the matching view / grouping.

## Usage

```tsx
import { MinimalControls } from '@/platform/url-kit/minimal-controls'

<MinimalControls
  availableViews={['table', 'kanban', 'list']}
  defaultView="table"
  useAllItems={['kanban']}
  groupableFields={[
    { key: 'status', label: 'Status' },
    { key: 'make', label: 'Make' },
  ]}
  sortConfig={sortConfig}
  queryBuilderFields={fields}
  searchConfig={searchConfig}
/>
```

Orchestrator:

```tsx
import { useUrlGrouping, useViewResolution } from '@/platform/url-kit/minimal-controls'

const { groupBy, subGroupBy } = useUrlGrouping({ allowedKeys: [...] })
const { currentView, resolution } = useViewResolution({ availableViews, ... })
```

## Chrome

Shared classes in `config/defaults.ts`:

- `MINIMAL_CONTROLS_SURFACE_BG` — `bg-white dark:bg-black` (opaque fill)
- `MINIMAL_CONTROLS_TRIGGER_CLASS` — surface + no focus ring + `hover:text-tertiary`

Search uses only the surface class on an absolute layer when expanded.
