/**
 * Named intensity palettes (high / low / …) — each `BadgePalette`: bg, border, text, icon.
 */

import type { BadgePalette } from "./badge-palette";

export type BadgeSemantic = "low" | "medium" | "high" | "ultra" | "info" | "neutral";

export const badgeSemanticPalettes: Record<BadgeSemantic, BadgePalette> = {
  high: {
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border border-green-300/40 dark:border-green-700/50",
    text: "text-green-800 dark:text-green-400",
    icon: "text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400",
    dotFill: "bg-green-600 dark:bg-green-400",
  },
  medium: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    border: "border border-yellow-300/40 dark:border-yellow-700/50",
    text: "text-yellow-800 dark:text-yellow-400",
    icon: "text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400",
    dotFill: "bg-yellow-600 dark:bg-yellow-400",
  },
  low: {
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border border-red-300/40 dark:border-red-700/50",
    text: "text-red-800 dark:text-[#ff6369]",
    icon: "text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400",
    dotFill: "bg-red-600 dark:bg-[#ff6369]",
  },
  ultra: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border border-purple-300/40 dark:border-purple-700/50",
    text: "text-purple-800 dark:text-purple-400",
    icon: "text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400",
    dotFill: "bg-purple-600 dark:bg-purple-400",
  },
  info: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border border-blue-300/40 dark:border-blue-700/50",
    text: "text-blue-800 dark:text-blue-400",
    icon: "text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400",
    dotFill: "bg-blue-600 dark:bg-blue-400",
  },
  neutral: {
    bg: "bg-muted",
    border: "border border-border",
    text: "text-muted-foreground",
    icon: "text-muted-foreground fill-muted-foreground",
    dotFill: "bg-muted-foreground",
  },
};

/** Notion-style status colors (bg / text / dot). */
export type NotionBadgeColor =
  | "blue"
  | "green"
  | "red"
  | "purple"
  | "yellow"
  | "neutral";

const notionBorder = "border border-transparent";

export const notionBadgePalette: Record<NotionBadgeColor, BadgePalette> = {
  blue: {
    bg: "bg-[#0076d934] darK:bg-[#51a6ff7e]",
    border: notionBorder,
    text: "text-[#264a72] dark:text-[#e5f2fc]",
    icon: "text-[#2783de] fill-[#2783de]",
    dotFill: "bg-[#2783de]",
  },
  green: {
    bg: "bg-[#00602628] dark:bg-[#71ffaf56]",
    border: notionBorder,
    text: "text-[#2a533c] dark:text-[#e8f1ec]",
    icon: "text-[#46a171] fill-[#46a171]",
    dotFill: "bg-[#46a171]",
  },
  red: {
    bg: "bg-[#ce18002a] dark:bg-[#ff746986]",
    border: notionBorder,
    text: "text-[#6d3531] dark:text-[#fce9e7]",
    icon: "text-[#e56458] fill-[#e56458]",
    dotFill: "bg-[#e56458]",
  },
  purple: {
    bg: "bg-[#5c00a324] dark:bg-[#d093ff6d]",
    border: notionBorder,
    text: "text-[#553b69] dark:text-[#f3ebf9]",
    icon: "text-[#b577d6] fill-[#b577d6]",
    dotFill: "bg-[#b577d6]",
  },
  yellow: {
    bg: "dark:bg-[#ffbc3575] bg-[#d19c0048]",
    border: notionBorder,
    text: "text-[#655121] dark:text-[#f9f3dc]",
    icon: "text-[#d8a32f] fill-[#d8a32f]",
    dotFill: "bg-[#d8a32f]",
  },
  neutral: {
    bg: "dark:bg-[#fffceb4e] bg-[#1c13011c]",
    border: notionBorder,
    text: "text-[#494846] dark:text-[#f0efed]",
    icon: "text-[#8e8b86] fill-[#8e8b86]",
    dotFill: "bg-[#8e8b86]",
  },
};
