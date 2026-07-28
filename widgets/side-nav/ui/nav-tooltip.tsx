/**
 * @file widgets/side-nav/ui/nav-tooltip.tsx
 * Portaled tooltip for collapsed side-nav items. Anchors to the hovered item
 * and stays above page overlays via side-nav z-index tokens.
 */

'use client'

import React, { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SIDE_NAV_Z } from '../config/z-index'

/**
 * Props for {@link NavTooltip}.
 */
interface NavTooltipProps {
  text: string
  /** Parent group label shown above item name (collapsed child links). */
  groupLabel?: string
  color?: 'primary' | 'secondary'
  isActive: boolean
  show: boolean
  anchorRef: React.RefObject<HTMLElement | null>
}

export default function NavTooltip({
  text,
  groupLabel,
  color = 'primary',
  isActive,
  show,
  anchorRef,
}: NavTooltipProps) {
  //////////////////////////////////
  // Visual tone map for active/inactive states
  //////////////////////////////////
  const tooltipColors = {
    primary: {
      bg: 'bg-primary',
      text: 'text-white',
      arrow: 'border-r-primary'
    },
    secondary: {
      bg: 'bg-tertiary',
      text: 'text-background dark:text-background/70',
      arrow: 'border-r-tertiary'
    }
  }
  
  const tooltipColor = isActive ? tooltipColors[color] : tooltipColors.secondary

  //////////////////////////////////
  // Label formatting for display readability
  //////////////////////////////////
  const formatTooltipText = (text: string) => {
    return text.replace(/-/g, ' ').split(' ').map((word, index, array) => (
      <span key={index}>
        {word.charAt(0).toUpperCase() + word.slice(1)}
        {index < array.length - 1 && ' '}
      </span>
    ))
  }

  const tooltipRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  //////////////////////////////////
  // Keep tooltip aligned with its anchor (hovered nav item)
  //////////////////////////////////
  useLayoutEffect(() => {
    if (!show) return
    const anchor = anchorRef.current
    if (!anchor) return

    const updatePosition = () => {
      const rect = anchor.getBoundingClientRect()
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 23,
      })
    }

    updatePosition()

    const observer = new ResizeObserver(updatePosition)
    observer.observe(anchor)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [anchorRef, show])

  if (!show || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={tooltipRef}
      className="pointer-events-none fixed -translate-y-1/2 transition-opacity duration-150"
      style={{
        top: position.top,
        left: position.left,
        zIndex: SIDE_NAV_Z.desktopTooltip,
      }}
    >
      <div className="relative">
        {/* Arrow pointing right (towards tooltip) */}
        <div className={`absolute right-[calc(100%-3px)] top-1/2 -translate-y-1/2 h-0 w-0 border-t-[7px] border-b-[7px] border-r-[7px] border-t-transparent border-b-transparent ${tooltipColor.arrow}`} />
        {/* Tooltip content */}
        <div className={`${tooltipColor.bg} ${tooltipColor.text} whitespace-nowrap rounded-md px-3 py-1.5 shadow-lg`}>
          {groupLabel ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-normal leading-none opacity-70">
                {groupLabel}
              </span>
              <span className="text-xs font-medium leading-tight">
                {formatTooltipText(text)}
              </span>
            </div>
          ) : (
            <span className="text-xs font-medium">{formatTooltipText(text)}</span>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

