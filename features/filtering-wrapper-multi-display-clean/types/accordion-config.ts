/**
 * Accordion column grouping configuration (shared across table, list, subheadings).
 */

export interface AccordionGroupConfig {
  id: string;
  name: string;
  /** Header cell tint overlay — use opacity (e.g. `bg-emerald-500/20`) so base header shows through */
  color: string;
  /** Solid fill for expand/collapse button (e.g. `bg-emerald-800`); defaults to `color` if omitted */
  buttonColor?: string;
  textColor: string;
  /** Line and button border (e.g. `border-emerald-800`) — must be in source for Tailwind */
  borderColor: string;
  /** Closed expand label text (e.g. `text-emerald-800`); defaults from `color` if omitted */
  labelColor?: string;
}

export interface AccordionConfig {
  groups: AccordionGroupConfig[];
  allowMultipleOpen?: boolean;
  defaultOpenGroup?: string;
}
