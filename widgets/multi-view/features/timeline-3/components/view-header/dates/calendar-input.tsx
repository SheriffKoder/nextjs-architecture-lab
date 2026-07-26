'use client'

import { useRef } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface CalendarInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}

/**
 * Calendar outline icon over a native datetime-local control
 * (date + time). Input is visually hidden; icon opens the picker.
 */
export function CalendarInput({
  value,
  onChange,
  className,
}: CalendarInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = () => {
    const el = inputRef.current
    if (!el) return
    // showPicker is supported in modern Chromium / Safari; fall back to focus.
    if (typeof el.showPicker === 'function') {
      try {
        el.showPicker()
        return
      } catch {
        // NotAllowedError if not from a user gesture — fall through.
      }
    }
    el.focus()
    el.click()
  }

  return (
    <div className={cn('relative inline-flex size-7 shrink-0', className)}>
      <button
        type="button"
        onClick={openPicker}
        aria-label="Jump to date and time"
        className={cn(
          'inline-flex size-7 items-center justify-center rounded-full',
          'text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground',
        )}
      >
        <Calendar className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
      <input
        ref={inputRef}
        type="datetime-local"
        value={value}
        onChange={onChange}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
      />
    </div>
  )
}
