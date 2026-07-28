'use client'

import Toast, { DEFAULT_TOAST_STACK_GAP, type ToastProps } from './toast'
import { TOAST_Z } from './layers'

export type ToastItem = ToastProps & {
  id: string
}

interface ToastContainerProps {
  toasts: ToastItem[]
  gap?: number
  onRemove: (id?: string) => void
}

export default function ToastContainer({
  toasts,
  gap = DEFAULT_TOAST_STACK_GAP,
  onRemove,
}: ToastContainerProps) {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: TOAST_Z.container }}>
      {toasts.map((toast, index) => {
        const { group: _group, ...toastProps } = toast
        return (
          <Toast
            gap={gap}
            key={toast.id}
            {...toastProps}
            index={index}
            zIndex={TOAST_Z.container + toasts.length - index}
            onClose={onRemove}
          />
        )
      })}
    </div>
  )
} 