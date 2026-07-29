/**
 * @file shared/calendar/index.ts
 * Public exports for the shared calendar module (month grid UI).
 *
 * Wall-clock "today" lives in `@/shared/lib/today` — not here.
 */

export {
  buildMonthGrid,
  formatDayAriaLabel,
  formatMonthAriaLabel,
  WEEKDAY_LABELS,
} from "@/widgets/calendar/lib/month-grid";
export type {
  CalendarCellRenderContext,
  CalendarGridCell,
  InMonthDay,
  MonthCalendarProps,
} from "@/widgets/calendar/model/types";
export { MonthCalendar } from "@/widgets/calendar/ui/month-calendar";
