/**
 * Card subarea — shell + composition + actions + interactions + expansion.
 */

export {
  CardBadges,
  CardPrimaryLine,
  CardSecondaryLine,
  type CardBadgesProps,
  type CardPrimaryLineProps,
  type CardSecondaryLineProps,
} from './composition'

export {
  CardActions,
  type CardActionConfig,
  type CardActionsProps,
} from './actions'

export {
  CardFieldControl,
  InteractionZone,
  resolveCardActionConfigs,
  type CardFieldControlProps,
  type InteractionZoneProps,
} from './interactions'

export {
  CardAccordionDetails,
  CardAccordionExpand,
  CardAccordionToggle,
  CardRowExpansion,
  CardRowExpansionToggle,
  resolveAccordionGroups,
  type CardAccordionDetailsProps,
  type CardAccordionExpandProps,
  type CardAccordionToggleProps,
  type CardRowExpansionProps,
  type CardRowExpansionToggleProps,
} from './expansion'

export { MobileCard, type MobileCardProps } from './mobile-card'
export { MobileCardItem, type MobileCardItemProps } from './mobile-card-item'
