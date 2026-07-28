'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/components/ui/button'
import { CONFIRM_MODAL_Z } from './layers'

export interface ConfirmModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Called when the modal should close (cancel, overlay click, or after confirm) */
  onClose: () => void
  /** Title text */
  title: string
  /** Body text or description */
  description?: React.ReactNode
  /** Label for the confirm button */
  confirmLabel?: string
  /** Label for the cancel button */
  cancelLabel?: string
  /** Called when the user confirms. Call onClose() after async work if you want to close the modal. */
  onConfirm: () => void | Promise<void>
  /** 'default' or 'destructive' (e.g. for delete actions) */
  variant?: 'default' | 'destructive'
  /** Show a loading state on the confirm button */
  loading?: boolean
  /** Hide the cancel button (e.g. for alert-style "OK" only) */
  hideCancel?: boolean
  /** Optional class for the modal panel */
  className?: string
}

/**
 * Reusable confirmation modal for confirm/cancel flows (e.g. delete, discard changes).
 * Use open/onClose to control visibility; onConfirm for the primary action.
 */
const ConfirmModal = ({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
  loading = false,
  hideCancel = false,
  className,
}: ConfirmModalProps) => {
  const [animate, setAnimate] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (open) {
      setAnimate(true)
    } else {
      setAnimate(false)
    }
  }, [open])

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      await Promise.resolve(onConfirm())
      // Parent is responsible for calling onClose() when appropriate (e.g. after success or to show error state)
    } finally {
      setConfirming(false)
    }
  }

  const isLoading = loading || confirming

  if (!open) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4"
      style={{ zIndex: CONFIRM_MODAL_Z.overlay }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className={cn(
          'relative w-full max-w-md rounded-lg border border-foreground/10 bg-background/95 p-5 shadow-lg',
          'transition-all duration-200',
          animate ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          className
        )}
      >
        <h2 id="confirm-modal-title" className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        {description != null && (
          <div className="mt-2 text-sm text-foreground/80">
            {description}
          </div>
        )}
        <div className="mt-6 flex flex-row justify-end gap-2">
          {!hideCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? '…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
