/**
 * Navigation Configuration Types
 * 
 * Purpose: TypeScript interfaces for navigation configuration
 * Used in: Side navigation component configuration
 */

import { LucideIcon } from 'lucide-react'

/**
 * Icon configuration for independent items
 */
export interface IndependentIconConfig {
  /** Image URL for the icon */
  imageUrl: string
  /** Hex color for the icon (e.g., '#3B82F6') */
  color: string
  /** Width in pixels */
  width: number
  /** Height in pixels */
  height: number
  /** Border radius class (e.g., 'rounded-md', 'rounded-xl') */
  borderRadius?: string
}

/**
 * Container configuration for independent items
 */
export interface IndependentContainerConfig {
  /** Container background color class */
  backgroundColor?: string
  /** Container border color class */
  borderColor?: string
  /** Container border radius class */
  borderRadius?: string
  /** Container padding class */
  padding?: string
  /** Container gap between icons */
  gap?: string
}

/**
 * Styling configuration for independent items
 */
export interface IndependentStylingConfig {
  active: {
    dark: string
    light: string
  }
  inactive: {
    dark: string
    light: string
  }
}

/**
 * Complete configuration for independent button items
 */
export interface IndependentButtonConfig {
  icon1: IndependentIconConfig
  icon2: IndependentIconConfig
  container: IndependentContainerConfig
  styling: IndependentStylingConfig
  /** Optional subtext to display below the second icon */
  subtext?: string
}

/**
 * Navigation item configuration
 */
export interface NavItemConfig {
  href: string
  text: string
  subtext?: string
  icon?: LucideIcon
  imageUrl?: string
  expandable?: boolean
  children?: NavItemConfig[]
  color?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  independent?: boolean
  /** Per-item icon configuration (overrides global config when provided) */
  independentConfig?: IndependentButtonConfig
  /** When true, this expandable group is open by default (unless a route child is active) */
  defaultOpen?: boolean
}

/**
 * Sidebar configuration
 */
export interface SidebarConfig {
  logo?: {
    src: string
    alt: string
    href: string
  }
  logoText?: {
    src: string
    alt: string
    href: string
  }
  items: NavItemConfig[]
  style?: 'dark' | 'light'
  /** When true, the sidebar starts in the narrow (icon-only) collapsed state. */
  defaultCollapsed?: boolean
}

