'use client'

/**
 * OfflineDetector
 *
 * Purpose: Subscribes to browser connectivity and shows grouped toasts. Renders nothing.
 * Used in: Page shells that mount `ToastContainer` (e.g. `demo-rsc-index.tsx`)
 */

import { useOfflineToast, type UseOfflineToastOptions } from './use-offline-toast'

export type OfflineDetectorProps = UseOfflineToastOptions

export default function OfflineDetector(props: OfflineDetectorProps) {
  useOfflineToast(props)
  return null
}
