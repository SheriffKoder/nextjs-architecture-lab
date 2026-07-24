/**
 * @file shared/ui/badges/index.ts
 * Public barrel for badge variants and palette tokens.
 */

export type { BadgePalette } from './model/badge-palette'

export {
  badgeSemanticPalettes,
  notionBadgePalette,
  type BadgeSemantic,
  type NotionBadgeColor,
} from './model/badge-semantic-palettes'

export { RoundedBadge } from './variants/rounded-badge'
export { RoundedDotBadge } from './variants/rounded-dot-badge'
export { RoundedIconBadge } from './variants/rounded-icon-badge'
export { SemiRoundedBadge } from './variants/semi-rounded-badge'
