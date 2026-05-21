/**
 * Scroll Utilities
 * 
 * Purpose: Helpers for horizontally scrolling the virtualized table container to a target group
 */

/**
 * Scroll the container so that the first header of a given groupId is centered in view.
 * Requires header cells to have data-attributes: data-accordion-first="true" and data-group-id
 */
export function scrollContainerToGroupCenter(container: HTMLElement, groupId: string): void {
  if (!container || !groupId) return;

  const containerRect = container.getBoundingClientRect();
  const firstHeaders = container.querySelectorAll('[data-accordion-first="true"]');
  let targetCenter: number | null = null;

  firstHeaders.forEach((node) => {
    const el = node as HTMLElement;
    if (el.getAttribute('data-group-id') !== groupId) return;
    const rect = el.getBoundingClientRect();
    const left = rect.left - containerRect.left + container.scrollLeft;
    targetCenter = left + rect.width / 2;
  });

  if (targetCenter == null) return;
  const desiredScrollLeft = Math.max(0, targetCenter - container.clientWidth / 2);
  container.scrollLeft = desiredScrollLeft;
}


