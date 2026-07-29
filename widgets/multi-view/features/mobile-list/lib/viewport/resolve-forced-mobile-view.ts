/**
 * Below `md`, table / list render as `cards`.
 * URL view is preserved; only the orchestrator render target swaps.
 */

export const MOBILE_FORCED_SOURCE_VIEWS = ['table', 'list'] as const

export type MobileForcedSourceView =
  (typeof MOBILE_FORCED_SOURCE_VIEWS)[number]

export function isMobileForcedSourceView(
  view: string,
): view is MobileForcedSourceView {
  return (MOBILE_FORCED_SOURCE_VIEWS as readonly string[]).includes(view)
}

export type ResolveForcedMobileViewOptions = {
  isMobile: boolean
  /** True when `mobileListConfig` is present and cards can render. */
  canRenderCards: boolean
}

/**
 * Returns `cards` when on mobile and the URL/resolved view is a forced source;
 * otherwise returns `renderView` unchanged.
 */
export function resolveForcedMobileView(
  renderView: string,
  options: ResolveForcedMobileViewOptions,
): string {
  if (
    options.isMobile &&
    options.canRenderCards &&
    isMobileForcedSourceView(renderView)
  ) {
    return 'cards'
  }
  return renderView
}
