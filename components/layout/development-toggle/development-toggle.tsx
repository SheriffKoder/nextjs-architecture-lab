/**
 * Development Toggle Component
 * 
 * Purpose: Fixed button to toggle development instructions modal
 * Used in: app/layout.tsx
 * Why: Provides easy access to development instructions from anywhere in the app
 * 
 * Function Index:
 * - DevelopmentToggle: Main component with fixed button and modal integration
 * 
 * Steps:
 * 1. Create fixed button with code icon and text
 * 2. Position at bottom-right (bottom-center below md)
 * 3. Manage modal state
 * 4. Integrate InstructionsModalListings component
 */

'use client'

import React, { useState } from 'react'
import { Code } from 'lucide-react'
import InstructionsModalListings from '@/components/design/InstructionsModalListings'
import RoleSelector from './role-selector'

export default function DevelopmentToggle() {
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)

  return (
    <>
      {/* Fixed Button - Bottom Center (below md), Bottom Right (md and above) */}
      <button
        onClick={() => setShowInstructionsModal(true)}
        className="fixed top-[92%] lg:top-auto lg:bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 z-[50]
        bg-tertiary/50 backdrop-blur-[2px] border border-tertiary/30 dark:border-tertiary/50 text-black/60 dark:text-white
        px-4 py-3 rounded-full whitespace-nowrap h-fit
        flex items-center gap-2 
        shadow-lg hover:shadow-xl
        transition-all duration-200
        hover:opacity-90
        font-medium text-sm"
        aria-label="Development toggles"
      >
        <Code className="w-4 h-4" />
        <span>Development toggles</span>
      </button>

      {/* Instructions Modal */}
      {showInstructionsModal && (
        <InstructionsModalListings
          setShowInstructionsModal={setShowInstructionsModal}
          showInstructionsModal={showInstructionsModal}
          headerText="Development toggles"
          descriptionText="Development tools and configuration options"
          icon={<Code className="w-full h-full text-foreground/50 group-hover:text-blue-500" />}
        >
          <div className="space-y-4">
            <div className='flex flex-col items-start justify-between gap-2'>
              <div className='flex flex-col items-start justify-start'>
                <h4 className="text-foreground text-sm whitespace-nowrap">Role Selection</h4>
                <p className="text-foreground/70 dark:text-foreground/50 text-xs whitespace-nowrap">Select a role to view the development tools and configuration options</p>
              </div>
              <RoleSelector />
            </div>
          </div>
        </InstructionsModalListings>
      )}
    </>
  )
}
