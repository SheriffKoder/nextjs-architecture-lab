/**
 * Toast Notification Component
 * 
 * Purpose: Reusable toast notification component for showing success, error, warning, and info messages
 * Used in: User settings page and other components that need temporary notifications
 * Why: Provides consistent, configurable notification system across the app
 * 
 * Features:
 * - Auto-dismiss with configurable duration (0 = no auto-dismiss)
 * - Manual dismiss with close button
 * - Multiple positions (top-left, top-right, top-center, bottom-left, bottom-right, bottom-center)
 * - Different types with appropriate colors and icons (success, error, warning, info)
 * - Smooth animations
 * - Dark mode support
 * - Responsive design
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Multiple toasts support with configurable limit
 * 
 * Implementation Steps:
 * 1. Create toast container with different types (success, error, warning, info)
 * 2. Support auto-dismiss with configurable duration
 * 3. Support manual dismiss with close button
 * 4. Support custom positioning
 * 5. Support custom styling and icons
 */

'use client'

import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, type LucideIcon } from 'lucide-react'
import { TOAST_Z } from './layers'
import { Button } from '@/components/ui/button'

/**
 * Toast type enum
 * @enum ToastType
 */
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Toast position enum
 * @enum ToastPosition
 */
export enum ToastPosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  TOP_CENTER = 'top-center',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_CENTER = 'bottom-center'
}

/**
 * Toast stacking behavior enum
 * @enum ToastStacking
 */
export enum ToastStacking {
  NONE = 'none',           // No stacking, toasts overlap
  PUSH_UP = 'push-up',     // New toasts push existing ones up
  PUSH_DOWN = 'push-down'  // New toasts push existing ones down
}

export const DEFAULT_TOAST_STACK_GAP = 80
export const TOAST_EXIT_ANIMATION_MS = 300

/** Optional action button (e.g. Retry) shown in the right control rail */
export type ToastAction = {
  label: string
  onClick: () => void
}

/**
 * Toast props interface
 * @interface ToastProps
 */
export interface ToastProps {
  id?: string
  type: ToastType
  title?: string
  message: string
  duration?: number // in milliseconds, 0 = no auto-dismiss
  /** Optional bucket for bulk dismiss (e.g. `connectivity`) via `clearToastsByGroup` */
  group?: string
  /** Optional action button in the toast control rail */
  action?: ToastAction
  position?: ToastPosition
  stacking?: ToastStacking
  onClose?: (id?: string) => void
  showCloseButton?: boolean
  className?: string
  index?: number // Internal use for stacking
  zIndex?: number // Custom z-index
  gap?: number
  /** Optional icon override (e.g. connectivity toasts). */
  icon?: LucideIcon
}

/** Payload for `addToast` / `useToast().addToast` */
export type AddToastPayload = Pick<
  ToastProps,
  'type' | 'title' | 'message' | 'duration' | 'group' | 'action' | 'icon'
>

/**
 * Toast icon mapping
 */
const toastIcons = {
  [ToastType.SUCCESS]: CheckCircle,
  [ToastType.ERROR]: AlertCircle,
  [ToastType.WARNING]: AlertTriangle,
  [ToastType.INFO]: Info
}

/**
 * Toast color mapping
 */
const toastColors = {
  [ToastType.SUCCESS]: {
    bg: 'bg-green-50 dark:bg-[#14201D]',
    border: 'border-green-200 dark:border-green-800/30',
    text: 'text-green-800 dark:text-green-200',
    icon: 'text-green-600 dark:text-green-400'
  },
  [ToastType.ERROR]: {
    bg: 'bg-red-50 dark:bg-[#251D22]',
    border: 'border-red-200 dark:border-red-800/30',
    text: 'text-red-800 dark:text-red-200',
    icon: 'text-red-600 dark:text-red-400'
  },
  [ToastType.WARNING]: {
    bg: 'bg-yellow-50 dark:bg-[#261F1C]',
    border: 'border-yellow-200 dark:border-yellow-800/30',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: 'text-yellow-600 dark:text-yellow-400'
  },
  [ToastType.INFO]: {
    bg: 'bg-blue-50 dark:bg-[#1B2133]',
    border: 'border-blue-200 dark:border-blue-800/30',
    text: 'text-blue-800 dark:text-blue-200',
    icon: 'text-blue-600 dark:text-blue-400'
  }
}

/**
 * Toast position classes
 */
const positionClasses = {
  [ToastPosition.TOP_LEFT]: 'top-4 left-4',
  [ToastPosition.TOP_RIGHT]: 'top-4 right-4',
  /* Horizontal centering uses inline left + transform so stacking translateY does not override -translate-x-1/2 */
  [ToastPosition.TOP_CENTER]: 'top-4',
  [ToastPosition.BOTTOM_LEFT]: 'bottom-4 left-4',
  [ToastPosition.BOTTOM_RIGHT]: 'bottom-4 right-4',
  [ToastPosition.BOTTOM_CENTER]: 'bottom-4'
}

function getToastA11yProps(type: ToastType): {
  role: 'alert' | 'status'
  'aria-live': 'assertive' | 'polite'
} {
  if (type === ToastType.ERROR || type === ToastType.WARNING) {
    return { role: 'alert', 'aria-live': 'assertive' }
  }
  return { role: 'status', 'aria-live': 'polite' }
}

/**
 * Toast notification component
 * @param {ToastProps} props - Component props
 * @returns {JSX.Element | null} Toast notification component
 */
export default function Toast({
  id,
  type,
  title,
  message,
  duration = 3000,
  action,
  position = ToastPosition.TOP_RIGHT,
  stacking = ToastStacking.NONE,
  onClose,
  showCloseButton = true,
  className = '',
  index,
  gap = DEFAULT_TOAST_STACK_GAP,
  zIndex,
  icon,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const colors = toastColors[type]
  const IconComponent = icon ?? toastIcons[type]
  const basePositionClass = positionClasses[position]
  const a11yProps = getToastA11yProps(type)

  const isHorizontallyCentered =
    position === ToastPosition.TOP_CENTER || position === ToastPosition.BOTTOM_CENTER

  ///////////////////////
  // Stacking translateY only (must merge with translateX(-50%) for center positions)
  const getStackingTranslateY = (): string | null => {
    if (stacking === ToastStacking.NONE || index === undefined) {
      return null
    }

    const offset = index * gap

    if (stacking === ToastStacking.PUSH_UP) {
      if (position.includes('top')) {
        return `translateY(-${offset}px)`
      }
      return `translateY(${offset}px)`
    }
    if (stacking === ToastStacking.PUSH_DOWN) {
      if (position.includes('top')) {
        return `translateY(${offset}px)`
      }
      return `translateY(-${offset}px)`
    }

    return null
  }

  const stackingY = getStackingTranslateY()

  /** Single transform so centering is not lost when inline style overrides Tailwind */
  const outerTransform =
    isHorizontallyCentered
      ? stackingY
        ? `translateX(-50%) ${stackingY}`
        : 'translateX(-50%)'
      : stackingY ?? undefined

  const positionClass = basePositionClass

  const combinedStyle: CSSProperties = {
    zIndex: zIndex || TOAST_Z.container,
    ...(isHorizontallyCentered ? { left: '50%' } : {}),
    ...(outerTransform ? { transform: outerTransform } : {}),
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        closeTimerRef.current = setTimeout(() => {
          onClose?.(id)
        }, TOAST_EXIT_ANIMATION_MS) // Wait for fade out animation
      }, duration)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [duration, onClose, id])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    closeTimerRef.current = setTimeout(() => {
      onClose?.(id)
    }, TOAST_EXIT_ANIMATION_MS) // Wait for fade out animation
  }

  return (
    <div
      className={`pointer-events-auto fixed ${positionClass} w-[min(22rem,calc(100vw-1rem))] transition-transform duration-300 ease-in-out ${className}`}
      style={combinedStyle}
      role={a11yProps.role}
      aria-live={a11yProps['aria-live']}
    >
      <div
        className={`${colors.bg} ${colors.border} border rounded-lg shadow-lg p-2.5 transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {/* Icon */}
          <IconComponent className={`h-4 w-4 mt-0.5 shrink-0 ${colors.icon}`} />
          
          {/* Content */}
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className={`text-sm font-semibold leading-tight ${colors.text}`}>
                {title}
              </h3>
            )}
            <p className={`text-xs leading-tight opacity-85 ${colors.text} ${title ? 'mt-0.5' : ''}`}>
              {message}
            </p>
          </div>

          {/* Action + close rail */}
          {(action || showCloseButton) && (
            <div className="ml-1 flex shrink-0 items-center gap-1 self-center">
              {action ? (
                <Button
                  type="button"
                  variant="control"
                  size="sm"
                  onClick={action.onClick}
                  className={`h-7 px-2.5 text-xs ${colors.text}`}
                >
                  {action.label}
                </Button>
              ) : null}

              {showCloseButton && (
                <button
                  type="button"
                  onClick={handleClose}
                  className={`rounded-md p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${colors.text}`}
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 