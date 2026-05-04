'use client'

import { useState, useRef, useEffect } from 'react'

interface ViewSwitcherProps {
  views: string[]
  selectedView?: string
  onViewChange?: (view: string) => void
  className?: string
}

export function ViewSwitcher({ 
  views, 
  selectedView: controlledView, 
  onViewChange, 
  className = '' 
}: ViewSwitcherProps) {
  const [internalView, setInternalView] = useState(views[0])
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [sliderStyle, setSliderStyle] = useState<{ width: number; left: number }>({ width: 0, left: 0 })
  
  // Use controlled view if provided, otherwise use internal state
  const activeView = controlledView !== undefined ? controlledView : internalView

  const handleViewChange = (view: string) => {
    if (controlledView === undefined) {
      setInternalView(view)
    }
    onViewChange?.(view)
  }

  const activeIndex = views.findIndex(view => view === activeView)

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
  }, [activeIndex, views.length, activeView])

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
          {views.map((view, index) => {
            const isActive = activeView === view

            return (
              <button
                key={view}
                ref={(el) => { buttonRefs.current[index] = el }}
                onClick={() => handleViewChange(view)}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md relative z-10 ${
                  isActive ? 'text-background' : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

