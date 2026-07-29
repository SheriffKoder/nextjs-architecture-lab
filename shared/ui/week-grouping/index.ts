/**
 * @file shared/week-grouping/index.ts
 * Public exports for the week grouping shared module.
 */

export {
  formatWeekDateLabel,
  formatWeekDateLabelWithWeekday,
  formatWeekRangeLabel,
} from "@/shared/ui/week-grouping/lib/format-week-date-label";
export {
  getWeeksInMonth,
  type WeekInMonthRange,
} from "@/shared/ui/week-grouping/lib/get-weeks-in-month";
export {
  groupItemsByWeekInMonth,
  resolveItemDateByKey,
  type GroupByWeekInMonthOptions,
  type GroupByWeekInMonthResult,
  type WeekInMonthGroup,
} from "@/shared/ui/week-grouping/lib/group-by-week-in-month";
export { type WeekGroupingConfig } from "@/shared/ui/week-grouping/model/types";
export { WeekOrganizer, type WeekOrganizerProps } from "@/shared/ui/week-grouping/ui/week-organizer";
