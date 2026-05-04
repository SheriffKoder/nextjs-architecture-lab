"use client";

import React, { useState, ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface CollapsibleCardProps {
  headerText: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  variant?: 'default' | 'sm';
}

const CollapsibleCard = ({ 
  headerText, 
  leftIcon, 
  rightIcon, 
  children, 
  defaultOpen = true,
  className = "",
  variant = 'default'
}: CollapsibleCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Variant-based styling
  const isSmall = variant === 'sm';
  const headerTextSize = isSmall ? 'text-sm' : 'text-base';
  const iconSize = isSmall ? 'w-4 h-4' : 'w-5 h-5';
  const childrenPadding = isSmall ? 'p-3' : 'p-4';

  return (
    <div className={`w-full rounded-[10px] overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className={`${childrenPadding} cursor-pointer hover:bg-primary bg-foreground/80 dark:bg-foreground/10 text-white 
          backdrop-blur-sm transition-all duration-300 ease-in-out
         ${isOpen ? "rounded-b-[0px] border-b-[1px] border-transparent  dark:border-foreground/20" : ""}`}
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
      bg-foreground/5 dark:bg-foreground/20 text-foreground/90 dark:text-foreground/90 backdrop-blur-sm
        
      ${
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}>
        <div className="overflow-hidden">
          <div className={childrenPadding}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollapsibleCard;