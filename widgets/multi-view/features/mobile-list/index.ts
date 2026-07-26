/**
 * Mobile-list feature — implements the `cards` multi-view.
 *
 * @see docs/MOBILE_LIST_OUTLINE.md
 * @see docs/responsibilities.md
 */

export type {
  MobileListAccordionGroup,
  MobileListCardComposition,
  MobileListCardVirtualRow,
  MobileListConfig,
  MobileListFieldDef,
  MobileListGroupHeaderRow,
  MobileListVirtualRow,
  MobileListVirtualRowKind,
} from './types'

export {
  CardAccordionDetails,
  CardAccordionExpand,
  CardAccordionToggle,
  CardActions,
  CardBadges,
  CardFieldControl,
  CardPrimaryLine,
  CardRowExpansion,
  CardRowExpansionToggle,
  CardSecondaryLine,
  GroupSectionHeader,
  InteractionZone,
  MobileCard,
  MobileCardItem,
  MobileListWrapper,
  resolveAccordionGroups,
  resolveCardActionConfigs,
  type CardAccordionDetailsProps,
  type CardAccordionExpandProps,
  type CardAccordionToggleProps,
  type CardActionConfig,
  type CardActionsProps,
  type CardBadgesProps,
  type CardFieldControlProps,
  type CardPrimaryLineProps,
  type CardRowExpansionProps,
  type CardRowExpansionToggleProps,
  type CardSecondaryLineProps,
  type GroupSectionHeaderProps,
  type InteractionZoneProps,
  type MobileCardItemProps,
  type MobileCardProps,
  type MobileListWrapperProps,
} from './components'

export {
  buildAccordionGroups,
  buildFieldMap,
  buildVirtualRows,
  composeFieldLine,
  estimateVirtualRowSize,
  FIELD_LINE_SEPARATOR,
  formatFieldValue,
  getFieldDef,
  isCardSurfaceEditable,
  isInteractiveEventTarget,
  isMobileForcedSourceView,
  MOBILE_FORCED_SOURCE_VIEWS,
  resolveForcedMobileView,
  SearchHighlightedText,
  stopCardInteractionPropagation,
  stopMousePropagation,
  stopPointerPropagation,
  stopPropagation,
  type AccordionGroupBlock,
  type BuildVirtualRowsParams,
  type MobileForcedSourceView,
  type ResolveForcedMobileViewOptions,
  type SearchHighlightedTextProps,
} from './lib'
