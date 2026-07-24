/**
 * @file shared/ui/collapsible-card/collapsible-card.tsx
 * Expand/collapse card shell with optional header icons and size variants.
 */

"use client";

import React, { useState, ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface CollapsibleCardProps {
  headerText: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  variant?: 'default' | 'sm';
  /** When true, hides the scrollbar in the content area (default: false) */
  hideScrollbar?: boolean;
  isExpandedView?: boolean;
}

/**
 * Renders a header that toggles a collapsible content panel.
 *
 * @param props - see {@link CollapsibleCardProps}
 */
const CollapsibleCard = ({ 
  headerText, 
  leftIcon, 
  rightIcon, 
  children, 
  defaultOpen = true,
  className = "",
  variant = 'default',
  hideScrollbar = false,
  isExpandedView = true // removes background and border when true, also allows for overflow-y-auto
}: CollapsibleCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Variant-based styling
  const isSmall = variant === 'sm';
  const headerTextSize = isSmall ? 'text-sm' : 'text-base';
  const iconSize = isSmall ? 'w-4 h-4' : 'w-5 h-5';
  const childrenPadding = isSmall ? '' : 'p-4';
  const HeaderPadding = isSmall ? 'p-3' : 'p-4';

  return (
    <div className={`w-full rounded-[5px] overflow-hidden border ${className} ${isExpandedView ? 'border-foreground/10' : 'border-transparent'}`}>
      {/* Header */}
      <div 
        className={`${HeaderPadding} cursor-pointer hover:bg-tertiary/40 dark:hover:bg-tertiary/40 bg-tertiary/20 dark:bg-tertiary/ text-tertiary 
          backdrop-blur-sm transition-all duration-300 ease-in-out
         ${isOpen ? "" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {leftIcon && (() => {
              const LeftIcon = leftIcon;
              return (
                <span className="flex-shrink-0">
                  <LeftIcon className={iconSize} />
                </span>
              );
            })()}
            <h3 className={`font-semibold ${headerTextSize}`}>{headerText}</h3>
          </div>
          {rightIcon && (() => {
            const RightIcon = rightIcon;
            return (
              <span className={`transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                <RightIcon className={iconSize} />
              </span>
            );
          })()}
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`grid transition-all duration-300 ease-in-out
       h-full text-foreground/90 dark:text-foreground/90
      ${isExpandedView ? 'bg-[rgba(0,0,0,0.025)] dark:bg-foreground/5 backdrop-blur-sm' : ''}
      ${
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}>
        <div className={`${isSmall ? (isExpandedView ? 'max-h-[500px] overflow-y-auto' : 'h-full overflow-y-auto') : ''} ${hideScrollbar ? '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : ''}`}>
          <div className={childrenPadding}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollapsibleCard;
