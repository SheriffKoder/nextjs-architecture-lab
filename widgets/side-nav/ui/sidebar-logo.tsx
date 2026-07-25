/**
 * Sidebar Logo Component
 * 
 * Purpose: Isolated logo section with GSAP animation for logoText
 * Used in: components/side-nav/components/side-nav.tsx
 * Why: Separates logo logic and provides smooth width animation for logoText
 * 
 * Function Index:
 * - SidebarLogo: Main component that renders logo and animated logoText
 * 
 * Steps:
 * 1. Render main logo icon (always visible)
 * 2. Render logoText image at fixed width 100 inside wrapper div
 * 3. Animate wrapper div width from 100px to 0px when collapsed
 * 4. Animate wrapper div width from 0px to 100px when expanded
 * 5. Use overflow-hidden on wrapper to clip image during animation
 */

'use client'

import React, { useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'

interface SidebarLogoProps {
  logo: {
    src: string
    alt: string
    href: string
  }
  logoText?: {
    src: string
    alt: string
  }
  isCollapsed: boolean
}

export default function SidebarLogo({ logo, logoText, isCollapsed }: SidebarLogoProps) {
  // Ref for the logoText wrapper div to animate its width
  const logoTextWrapperRef = useRef<HTMLDivElement>(null)
  // Skip tween on first paint so defaultCollapsed does not flash expand→collapse
  const hasMountedRef = useRef(false)

  /////////////////////////////////////
  // Animate wrapper div width based on collapse state
  // Why: Provides smooth width transition to reveal/hide logoText
  // How: GSAP animates wrapper width from 100px to 0px (or vice versa), image stays at fixed 100px width
  useEffect(() => {
    if (!logoTextWrapperRef.current || !logoText) return

    const width = isCollapsed ? 0 : 200

    // First paint: set immediately (matches defaultCollapsed / initial isCollapsed)
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      gsap.set(logoTextWrapperRef.current, { width })
      return
    }

    gsap.to(logoTextWrapperRef.current, {
      width,
      duration: 0.3,
      ease: 'power2.inOut',
    })
  }, [isCollapsed, logoText])

  return (
    <Link 
      href={logo.href} 
      className="p-0 pt-4 pb-2 flex items-center justify-center relative dark:brightness-150"
    >
      {/* Main Logo Icon - Always visible */}
      <Image 
        src={logo.src}
        alt={logo.alt}
        width={60}
        height={30}
        className="object-contain transition-all duration-300 flex-shrink-0"
      />
      
      {/* Logo Text - Wrapper div animated with GSAP, image stays at fixed width */}
      {logoText && (
        <div
          ref={logoTextWrapperRef}
          className="overflow-hidden flex-shrink-0"
          style={{ width: isCollapsed ? 0 : 200 }}
        >
          <div className="w-[200px] h-[75px]">
            <Image 
              src={logoText.src}
              alt={logoText.alt}
              width={200}
              height={75}
              style={{
                width: '200px',
                height: '75px',
                flexShrink: 0,
                display: 'block'
              }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}
