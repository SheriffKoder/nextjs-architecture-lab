/**
 * @file platform/url-kit/url-params/model/types.ts
 * Transport contract for URL read/write — router (RSC) vs shallow (hybrid).
 */

/** Query string without leading `?`. */
export type UrlParamsSnapshot = string

/**
 * Pluggable URL transport — implement per adapter (`router`, `shallow`, future `nuqs`).
 */
export type UrlParamsAdapter = {
  /** Live params for getters (optimistic on router/shallow). */
  effectiveParams: URLSearchParams
  getSnapshot(): UrlParamsSnapshot
  getEffectiveParams(): URLSearchParams
  buildParams(): URLSearchParams
  applyPendingSnapshot(next: UrlParamsSnapshot): void
  /** Commit full query string to the address bar (or router). */
  commit(next: UrlParamsSnapshot, options?: { skipIfUnchanged?: boolean }): void
  /** Navigate to pathname only — clears all query params. */
  clearAllParams(): void
  pathname: string
  /** No-op for shallow; `wrapNavigation` for RSC pending dimmer. */
  wrapNavigation(fn: () => void): void
  committedSnapshot: UrlParamsSnapshot
}

export type UrlParamsContextValue = UrlParamsAdapter
