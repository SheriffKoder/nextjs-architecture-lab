'use client'

import { useOfflineToast, type UseOfflineToastOptions } from './use-offline-toast'

export type OfflineDetectorProps = UseOfflineToastOptions

export default function OfflineDetector(props: OfflineDetectorProps) {
  useOfflineToast(props)
  return null
}
