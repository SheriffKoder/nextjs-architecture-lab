/**
 * Date Value Types Configuration
 * 
 * Purpose: Define available date value types for date fields
 * Used in: Date type selector component
 * Why: Centralized configuration for date value options
 */

export const dateValues = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "yesterday", label: "Yesterday" },
  { value: "one_week_ago", label: "One week ago" },
  { value: "one_week_from_now", label: "One week from now" },
  { value: "one_month_ago", label: "One month ago" },
  { value: "one_month_from_now", label: "One month from now" },
  { value: "days_ago", label: "Number of days ago" },
  { value: "days_from_now", label: "Number of days from now" },
  { value: "exact_date", label: "Exact date" }
] as const

export type DateValueType = typeof dateValues[number]['value']
