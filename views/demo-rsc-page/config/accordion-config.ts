/**
 * Accordion Configuration
 *
 * Purpose: Configuration for column grouping in accordion/collapsible sections
 * Used in: Demo RSC table view via `FilteringWrapper` `accordionConfig`
 *
 * Groups:
 * - Updates — location, mileage, pricePerDay, setActivity (after license plate)
 *
 * `color` — header tint overlay (use opacity so `#f1f1f1` header shows through);
 * `buttonColor` — solid expand/collapse button; `textColor` — icon on button;
 * `labelColor` — closed-state group name; `borderColor` — connector lines.
 */

export const accordionConfig = {
  groups: [
    {
      id: 'updates',
      name: 'Updates',
      color: 'bg-emerald-500/10 dark:bg-emerald-800/30',
      buttonColor: 'bg-emerald-800 dark:bg-emerald-900',
      textColor: 'text-emerald-300',
      labelColor: 'text-emerald-500',
      borderColor: 'dark:border-emerald-800/50 border-emerald-600/50',
    },
  ],
  allowMultipleOpen: true,
  defaultOpenGroup: 'updates',
}
