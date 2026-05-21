'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { SearchIcon } from 'lucide-react'

interface ZoomSwitcherProps {
  // value represents a factor (e.g., 0.5, 1, 1.5, 2)
  options?: Array<{ label: string, value: number }>
  defaultValue?: number
  value?: number
  onChange?: (value: number) => void
  className?: string
}

export function ZoomSwitcher({
  options = [
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '1.5x', value: 1.5 },
    { label: '2x', value: 2 },
  ],
  defaultValue = 1,
  value,
  onChange,
  className
}: ZoomSwitcherProps) {
  const [internalValue, setInternalValue] = useState<number>(defaultValue)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [sliderStyle, setSliderStyle] = useState<{ width: number; left: number }>({ width: 0, left: 0 })

  // Sync internal state when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  const handleChange = (next: number) => {
    // Uncontrolled: update internal state
    if (value === undefined) {
      setInternalValue(next)
    }
    // Notify parent
    onChange?.(next)
  }

  const activeValue = value !== undefined ? value : internalValue
  const activeIndex = options.findIndex(opt => opt.value === activeValue)

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
  }, [activeIndex, options.length, activeValue])

  return (

    <div className='w-fit flex flex-row gap-2 items-center justify-start'>


      
      <div className={cn('relative', className)}>
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
            {options.map((opt, index) => {
              const isActive = activeValue === opt.value

              return (
                <button
                  key={opt.label}
                  ref={(el) => { buttonRefs.current[index] = el }}
                  onClick={() => handleChange(opt.value)}
                  className={cn(
                    'flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md relative z-10',
                    {
                      'text-background': isActive,
                      'text-foreground/70 hover:text-foreground': !isActive,
                    }
                  )}
                  aria-pressed={isActive}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className='text-sm font-medium flex flex-row gap-2 items-center justify-start'>
        <SearchIcon className='w-4 h-4 text-foreground/70' />
      </div>
    </div>
  )
}

export default ZoomSwitcher


