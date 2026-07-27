/**
 * @file views/demo-hybrid-page/index.ts
 * Public barrel for the hybrid demo view — import via `@/views/demo-hybrid-page`.
 *
 * Purpose: Expose the client page entry and content stub without deep UI imports
 * Used in: `app/(root)/demo-hybrid-page/page.tsx`
 * Used for: Route shell imports view composition only (PROJECT-STRUCTURE §5)
 */

export { default as DemoHybridPage } from './ui/demo-hybrid-page'
export { DemoHybridContent } from './ui/demo-hybrid-content'
