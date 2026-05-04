'use client'

import React from 'react'
import { ArrowRight, ChevronRight } from 'lucide-react'

interface InvestorDetailSliderProps {
  isOpen: boolean
  onClose: () => void
  investorName?: string | null
  children?: React.ReactNode
  className?: string
}

/**
 * Investor Detail Slider Component
 * 
 * A wrapper component for displaying investor details in a sliding panel.
 * Features a non-sticky header with icon and investor name.
 */
const InvestorDetailSlider: React.FC<InvestorDetailSliderProps> = ({
  isOpen,
  onClose,
  investorName,
  children,
  className = ''
}) => {
  return (
    <div
      className={`absolute top-0 right-0 h-full border-l dark:border-border border-neutral-400/30 transform transition-all 
        duration-500 ease-in-out flex flex-col bg-neutral-100/80 backdrop-blur-sm dark:bg-neutral-900 ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-100 pointer-events-none'
      } lg:w-[40vw] w-full ${className}`}
      style={{
        zIndex: 1,
        boxShadow: '0 0 20px 0 hsl(var(--foreground) / 0.05)',
      }}
    >

      <div className='absolute inset-0 bg-tertiary/15 z-[0] dark:hidden'></div>
      {/* Non-sticky Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b dark:border-border border-neutral-400/30 flex-shrink-0 bg-neutral-300/20 dark:bg-neutral-900/20">
        <span className="flex items-center justify-center hover:bg-foreground/5 rounded-md p-1 cursor-pointer" onClick={onClose}>
        <ArrowRight className="w-5 h-5 text-foreground flex-shrink-0 z-[1]" />
        </span>
        <h2 className="text-sm font-medium text-foreground">
          {investorName}
        </h2>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 relative z-[1]">
        {children}
      </div>
    </div>
  )
}

export default InvestorDetailSlider
