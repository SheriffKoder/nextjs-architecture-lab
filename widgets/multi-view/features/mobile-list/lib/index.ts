/**
 * Mobile-list helpers — grouped by responsibility.
 */

export {
  buildAccordionGroups,
  buildFieldMap,
  composeFieldLine,
  FIELD_LINE_SEPARATOR,
  formatFieldValue,
  getFieldDef,
  type AccordionGroupBlock,
} from './formatting'

export {
  isCardSurfaceEditable,
  isInteractiveEventTarget,
  stopCardInteractionPropagation,
  stopMousePropagation,
  stopPointerPropagation,
  stopPropagation,
} from './interactions'

export {
  SearchHighlightedText,
  type SearchHighlightedTextProps,
} from './search'

export {
  buildVirtualRows,
  estimateVirtualRowSize,
  type BuildVirtualRowsParams,
} from './virtualization'

export {
  isMobileForcedSourceView,
  MOBILE_FORCED_SOURCE_VIEWS,
  resolveForcedMobileView,
  type MobileForcedSourceView,
  type ResolveForcedMobileViewOptions,
} from './viewport'
