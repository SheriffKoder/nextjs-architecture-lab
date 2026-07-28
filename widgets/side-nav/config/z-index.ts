import { RIGHT_DRAWER_Z } from '@/shared/ui/right-drawer/layers'

/**
 * Side-nav layering is intentionally derived from the shared drawer shell so
 * mobile nav can stay above it without hardcoded magic numbers.
 *
 * @see docs/reference/z-index.md
 */
export const SIDE_NAV_Z = {
  desktopRail: 40,
  mobileOverlay: RIGHT_DRAWER_Z.panel + 1,
  mobilePanel: RIGHT_DRAWER_Z.panel + 2,
  desktopTooltip: 75,
} as const

