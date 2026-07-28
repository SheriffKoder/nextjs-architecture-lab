# Toast

Imperative toast notifications for client components using React context.  
`ToastProvider` owns toast state once at the app shell, and feature code calls `useToast()` to show/dismiss notifications.

## Setup

`ToastProvider` is mounted in `app/(root)/layout.tsx`.

```tsx
import { ToastProvider } from '@/shared/ui/toast/toast-provider'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider offline={true}>
      {/* app shell */}
      {children}
    </ToastProvider>
  )
}
```

Default stack:

- Position: `ToastPosition.BOTTOM_RIGHT`
- Max toasts: `5`
- Stacking: `ToastStacking.PUSH_DOWN`
- Gap: `DEFAULT_TOAST_STACK_GAP` (`80`)

## Usage

```tsx
'use client'

import { useToast } from '@/shared/ui/toast/use-toast'
import { ToastType } from '@/shared/ui/toast/toast'

export function SaveButton() {
  const { showSuccess, addToast, clearToastsByGroup } = useToast()

  function onSaved() {
    showSuccess('Your changes were saved.', 'Saved', 3000)
  }

  function onValidationError() {
    addToast({
      type: ToastType.ERROR,
      title: 'Could not save',
      message: 'Fix highlighted fields and try again.',
      group: 'save-flow',
      duration: 0,
      action: {
        label: 'Retry',
        onClick: () => {
          clearToastsByGroup('save-flow')
        },
      },
    })
  }

  return <button onClick={onSaved}>Save</button>
}
```

## Convenience helpers

- `showSuccess(message, title?, duration?)`
- `showError(message, title?, duration?)`
- `showWarning(message, title?, duration?)`
- `showInfo(message, title?, duration?)`
- `addToast(payload)`
- `clearToastsByGroup(group)`

## API reference

### `AddToastPayload`

- `type`: `ToastType` (`success | error | warning | info`)
- `message`: `string`
- `title?`: `string`
- `duration?`: `number` (`0` means no auto-dismiss)
- `group?`: `string` (bucket for bulk clear)
- `action?`: `{ label: string; onClick: () => void }`
- `icon?`: `LucideIcon` (optional icon override)

Provider-level options (`ToastProvider` props):

- `position?: ToastPosition`
- `maxToasts?: number`
- `stacking?: ToastStacking`
- `gap?: number`
- `offline?: boolean | UseOfflineToastOptions`

### Connectivity (offline) feature

The toast module can own connectivity detection directly.

- `offline={false}` or omitted: disabled
- `offline={true}`: enabled with defaults
- `offline={{ ...options }}`: enabled with custom options

Example:

```tsx
<ToastProvider
  offline={{
    skipInitial: true,
    notifyOnOffline: true,
    notifyOnOnline: true,
    offlineTitle: 'You are offline',
    offlineMessage: 'Some actions may not work until your connection is restored.',
  }}
>
  {children}
</ToastProvider>
```

Behavior:

- Offline toast is sticky (`duration: 0`) until connection is restored or user dismisses it.
- Connectivity toasts clear the same `connectivity` group before showing the next state.
- Connectivity toasts use icon overrides (`Wifi`, `WifiOff`).

## Behavior notes

- Auto-dismiss uses `duration` (`3000` by default).
- Dismiss waits for exit animation (`TOAST_EXIT_ANIMATION_MS = 300`) before removal.
- Stacking offsets use `index * gap`.
- Severity-based accessibility:
  - `error/warning`: `role="alert"` + `aria-live="assertive"`
  - `success/info`: `role="status"` + `aria-live="polite"`

## Files

- `toast-provider.tsx`: state + imperative API + provider wiring
- `offline/offline-detector.tsx`: optional provider-mounted connectivity detector
- `offline/use-offline-toast.ts`: online/offline listeners + grouped toast dispatch
- `toast-context.tsx`: context contract (`ToastMethods`) + context hook
- `use-toast.ts`: public hook for consumers
- `toast-container.tsx`: presentational stack host
- `toast.tsx`: single toast UI + types + enums
- `layers.ts`: z-index tokens (`TOAST_Z`)

