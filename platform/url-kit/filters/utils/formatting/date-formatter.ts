/**
 * Date and Time Formatting Utilities
 *
 * Purpose: Centralized date and time formatting for filters, dashboards, and timelines
 * Used in: Filter dropdowns (e.g. range quick select), tooltips, dashboard-style displays
 * Used for: Consistent, timezone-aware date handling and reduced duplication
 *
 * Function Index:
 * - createLocalDate: Parse YYYY-MM-DD / ISO date prefix to local calendar midnight
 * - formatDateMMDDYYYY: Numeric MM-DD-YYYY for filter quick-select labels
 * - formatDisplayDate: Short US month display (e.g. Jan 15, 2024)
 * - formatDisplayDateWithWeekday: Long weekday + date
 * - formatWeekdayShort: Weekday abbreviation
 * - formatProjectDate: Long date + time (preserves time from string)
 * - formatTime: HH:MM AM/PM from ISO timestamp
 * - formatDate: DD/MM/YYYY from ISO timestamp (en-GB)
 * - formatTimeInterval: Two formatTime values joined with " to "
 */

/////////////////////////////////////////////////////////////
// Base: local calendar date construction
/////////////////////////////////////////////////////////////

//////////////////////////////////
// Resolves an optional YYYY-MM-DD or ISO date prefix to a Date at local midnight.
// Used in: This module’s formatters that must not shift calendar day with UTC
// Used for: URL/API date-only strings and filter values before locale formatting
//
// Steps:
// 1. If no string, return “today” at local midnight (SSR-safe placeholder on server).
// 2. Otherwise strip time from ISO, split Y-M-D, and construct local Date (month 0-based).
export const createLocalDate = (dateString?: string): Date => {
  if (!dateString) {
    // 1. No input: today at local midnight, with SSR placeholder when window is absent
    if (typeof window === "undefined") {
      return new Date(2024, 0, 1);
    }
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  // 2. Date-only portion before "T", then local midnight
  const dateOnly = dateString.split("T")[0];
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/////////////////////////////////////////////////////////////
// Display: fixed-width and filter-oriented formats
/////////////////////////////////////////////////////////////

//////////////////////////////////
// Formats a calendar date as MM-DD-YYYY (zero-padded month and day).
// Used in: features/filters/feature-filtering/components/dropdown-filter/components/range-quick-select-list.tsx
// Used for: Date-range quick-select row labels; value stays ISO in state/URL
//
// Steps:
// 1. Return empty for null/undefined/"".
// 2. If Date instance, format components with pads (or "" if invalid).
// 3. If string, require YYYY-MM-DD on the date part; else return string unchanged.
// 4. Parse via createLocalDate, then emit MM-DD-YYYY.
export function formatDateMMDDYYYY(
  input: string | Date | null | undefined,
): string {
  if (input === null || input === undefined || input === "") return "";

  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return "";
    const mm = String(input.getMonth() + 1).padStart(2, "0");
    const dd = String(input.getDate()).padStart(2, "0");
    const yyyy = String(input.getFullYear());
    return `${mm}-${dd}-${yyyy}`;
  }

  const dateOnly = input.split("T")[0] ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return input;
  }

  const d = createLocalDate(dateOnly);
  if (Number.isNaN(d.getTime())) return input;

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${mm}-${dd}-${yyyy}`;
}

/////////////////////////////////////////////////////////////
// Display: locale-formatted calendar strings (createLocalDate where noted)
/////////////////////////////////////////////////////////////

//////////////////////////////////
// Short US month style (e.g. "Jan 15, 2024") using createLocalDate for string inputs.
// Used in: Tables, cards, and filter-related summaries
// Used for: Human-readable single dates without weekday
export const formatDisplayDate = (date?: string | Date): string => {
  let dateObj: Date;

  if (!date) {
    dateObj = createLocalDate();
  } else if (typeof date === "string") {
    dateObj = createLocalDate(date);
  } else {
    dateObj = date;
  }

  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

//////////////////////////////////
// Long weekday + full month date using createLocalDate for string inputs.
// Used in: Headers and detail panels that need full weekday context
// Used for: Accessible, explicit calendar phrasing
export const formatDisplayDateWithWeekday = (date?: string | Date): string => {
  let dateObj: Date;

  if (!date) {
    dateObj = createLocalDate();
  } else if (typeof date === "string") {
    dateObj = createLocalDate(date);
  } else {
    dateObj = date;
  }

  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

//////////////////////////////////
// Short weekday only (e.g. "Mon") using createLocalDate for string inputs.
// Used in: Compact column headers and chip labels
// Used for: Minimal weekday indication
export const formatWeekdayShort = (date?: string | Date): string => {
  let dateObj: Date;

  if (!date) {
    dateObj = createLocalDate();
  } else if (typeof date === "string") {
    dateObj = createLocalDate(date);
  } else {
    dateObj = date;
  }

  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
  });
};

//////////////////////////////////
// Long month/date plus time; preserves time from ISO strings (does not use createLocalDate for strings).
// Used in: Project / activity detail views
// Used for: Showing wall-clock from stored timestamps
export const formatProjectDate = (date?: string | Date): string => {
  let dateObj: Date;

  if (!date) {
    dateObj = new Date();
  } else if (typeof date === "string") {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/////////////////////////////////////////////////////////////
// Display: timestamps (local interpretation via Date)
/////////////////////////////////////////////////////////////

//////////////////////////////////
// Formats an ISO timestamp to HH:MM AM/PM in local time.
// Used in: Intervals, tooltips, and activity rows
// Used for: Time-only display
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

//////////////////////////////////
// Formats an ISO timestamp to DD/MM/YYYY (en-GB) in local time.
// Used in: Legacy UK-style displays alongside filters
// Used for: Numeric date without weekday
export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

//////////////////////////////////
// Joins two formatTime results with " to ".
// Used in: Schedules and ranges that are time-of-day only
// Used for: Readable local-time spans
export const formatTimeInterval = (startAt: string, endAt: string): string => {
  return `${formatTime(startAt)} to ${formatTime(endAt)}`;
};
