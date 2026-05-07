/**
 * Local `cn` for this route folder only (avoids importing `@/lib/utils`).
 *
 * Purpose: Merge Tailwind classes with `tailwind-merge`.
 * Used in: app/development/folder-tab-shape/page.tsx, folder-tab-flush-row-preview.tsx
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
