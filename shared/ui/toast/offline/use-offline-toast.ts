'use client'

import { useEffect, useRef } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { ToastType } from '../toast'
import { useToast } from '../use-toast'

/** Toast group — cleared before each connectivity toast so stacks do not pile up. */
export const OFFLINE_TOAST_GROUP = 'connectivity'

export type UseOfflineToastOptions = {
  notifyOnOffline?: boolean
  notifyOnOnline?: boolean
  /**
   * When true (default), the first `online` / `offline` event after mount does not toast.
   * Avoids nagging users who opened the app already offline or spurious events during hydration.
   * Set false to show “you are offline” immediately when `navigator.onLine === false` on first paint.
   */
  skipInitial?: boolean
  offlineTitle?: string
  offlineMessage?: string
  onlineTitle?: string
  onlineMessage?: string
}

export function useOfflineToast(options: UseOfflineToastOptions = {}) {
  const {
    notifyOnOffline = true,
    notifyOnOnline = true,
    skipInitial = true,
    offlineTitle = 'You are offline',
    offlineMessage = 'Some actions may not work until your connection is restored.',
    onlineTitle = 'Back online',
    onlineMessage = 'Your connection has been restored.',
  } = options

  const { addToast, clearToastsByGroup } = useToast()
  const isFirstRun = useRef(true)
  const lastNotifiedOnline = useRef<boolean | null>(null)

  useEffect(() => {
    const shouldSkip = () => skipInitial && isFirstRun.current

    const notify = (online: boolean) => {
      if (shouldSkip()) return
      if (lastNotifiedOnline.current === online) return
      lastNotifiedOnline.current = online

      clearToastsByGroup(OFFLINE_TOAST_GROUP)

      if (online && notifyOnOnline) {
        addToast({
          type: ToastType.SUCCESS,
          title: onlineTitle,
          message: onlineMessage,
          group: OFFLINE_TOAST_GROUP,
          icon: Wifi,
        })
      } else if (!online && notifyOnOffline) {
        addToast({
          type: ToastType.WARNING,
          title: offlineTitle,
          message: offlineMessage,
          group: OFFLINE_TOAST_GROUP,
          duration: 0,
          icon: WifiOff,
        })
      }
    }

    const handleOffline = () => notify(false)
    const handleOnline = () => notify(true)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    if (!skipInitial && typeof navigator !== 'undefined' && !navigator.onLine) {
      notify(false)
    }

    isFirstRun.current = false

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [
    notifyOnOffline,
    notifyOnOnline,
    skipInitial,
    offlineTitle,
    offlineMessage,
    onlineTitle,
    onlineMessage,
    addToast,
    clearToastsByGroup,
  ])
}
