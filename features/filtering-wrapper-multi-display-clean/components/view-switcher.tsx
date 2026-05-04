/**
 * View Switcher Component
 * 
 * Purpose: Flexible view switcher for multiple view modes
 * Used in: Pages requiring multiple view modes (Table, Kanban, Map, etc.)
 * Why: Provides consistent UI for switching between different view modes
 */

'use client'

import React, { useRef, useEffect, useState } from 'react'
import { LucideIcon } from 'lucide-react'

export interface ViewSwitcherOption {
  /** Unique key for the view mode */
  key: string
  /** Display label */
  label: string
  /** Icon component */
  icon: LucideIcon
}

interface ViewSwitcherProps {
  /** Array of view options with key, label, and icon */
  options: ViewSwitcherOption[]
  /** Current view mode key */
  value: string
  /** Change handler */
  onChange: (value: string) => void
  /** Whether the switcher is disabled */
  disabled?: boolean
  /** Optional className */
  className?: string
}

/**
 * View switcher component with configurable options
 * 
 * @example
 * ```tsx
 * <ViewSwitcher
 *   options={[
 *     { key: 'table', label: 'Table', icon: Table },
 *     { key: 'kanban', label: 'Kanban', icon: LayoutDashboard },
 *     { key: 'map', label: 'Map', icon: Map }
 *   ]}
 *   value={currentView}
 *   onChange={handleViewChange}
 * />
 * ```
 */
export default function ViewSwitcher({
  options,
  value,
  onChange,
  disabled = false,
  className = ''
}: ViewSwitcherProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [sliderStyle, setSliderStyle] = useState<{ width: number; left: number }>({ width: 0, left: 0 })

  const handleOptionSelect = (optionKey: string) => {
    if (!disabled && optionKey !== value) {
      onChange(optionKey)
    }
  }

  const activeIndex = options.findIndex(opt => opt.key === value)

  // Measure button positions and update slider
  useEffect(() => {
    if (activeIndex === -1 || !containerRef.current) return

    const activeButton = buttonRefs.current[activeIndex]
    if (!activeButton) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()

    setSliderStyle({
      width: buttonRect.width,
      left: buttonRect.left - containerRect.left
    })
  }, [activeIndex, options.length, value]) // Recalculate when active index or options change

  return (
    <div className={`relative ${className}`}>
      {/* Container that looks like an input field */}
      <div 
        ref={containerRef}
        className="w-full py-1 px-1 rounded-md border border-foreground/10 dark:border-foreground/5 bg-[#f1f1f1] dark:bg-[#131313] backdrop-blur-sm relative overflow-hidden"
      >
        {/* Sliding background element */}
        <div 
          className="absolute top-1 bottom-1 bg-foreground rounded-md transition-all duration-300 ease-in-out"
          style={{ 
            width: `${sliderStyle.width}px`,
            left: `${sliderStyle.left}px`
          }}
        />
        
        <div className="flex gap-1 relative z-10 w-full">
          {options.map((option, index) => {
            const Icon = option.icon
            const isActive = option.key === value
            
            return (
              <button
                key={option.key}
                ref={(el) => { buttonRefs.current[index] = el }}
                type="button"
                onClick={() => handleOptionSelect(option.key)}
                disabled={disabled}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors relative z-10 ${
                  isActive
                    ? 'text-background'
                    : 'text-foreground/70 hover:text-foreground'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
