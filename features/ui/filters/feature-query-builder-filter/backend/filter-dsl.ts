/**
 * Filter DSL (Domain Specific Language)
 * 
 * Purpose: Translate filter operators to Supabase query operators
 * Used in: Backend filter processing
 * Why: Maps user-friendly operators to database query operators
 */

import { resolveDate } from './resolve-date'

/**
 * Filter DSL mapping operators to Supabase query operations
 * WHY: Translate filter operators to database query format
 * HOW: Returns { op, value } objects for Supabase queries
 */
export const FilterDSL = {
  text: {
    contains: (v: string) => ({ op: 'ilike' as const, value: `%${v}%` }),
    does_not_contain: (v: string) => ({ op: 'not.ilike' as const, value: `%${v}%` }),
    is: (v: string) => ({ op: 'eq' as const, value: v }),
    is_not: (v: string) => ({ op: 'neq' as const, value: v }),
    is_empty: () => ({ op: 'is' as const, value: null }),
    is_not_empty: () => ({ op: 'not.is' as const, value: null }),
  },

  number: {
    eq: (v: number) => ({ op: 'eq' as const, value: v }),
    neq: (v: number) => ({ op: 'neq' as const, value: v }),
    gt: (v: number) => ({ op: 'gt' as const, value: v }),
    lt: (v: number) => ({ op: 'lt' as const, value: v }),
    gte: (v: number) => ({ op: 'gte' as const, value: v }),
    lte: (v: number) => ({ op: 'lte' as const, value: v }),
    is_empty: () => ({ op: 'is' as const, value: null }),
    is_not_empty: () => ({ op: 'not.is' as const, value: null }),
  },

  date: {
    is: (v: string, dateType?: string, days?: number) => {
      const resolvedDate = dateType ? resolveDate(dateType, days) : v
      return { op: 'eq' as const, value: resolvedDate }
    },
    before: (v: string, dateType?: string, days?: number) => {
      const resolvedDate = dateType ? resolveDate(dateType, days) : v
      return { op: 'lt' as const, value: resolvedDate }
    },
    after: (v: string, dateType?: string, days?: number) => {
      const resolvedDate = dateType ? resolveDate(dateType, days) : v
      return { op: 'gt' as const, value: resolvedDate }
    },
    on_or_before: (v: string, dateType?: string, days?: number) => {
      const resolvedDate = dateType ? resolveDate(dateType, days) : v
      return { op: 'lte' as const, value: resolvedDate }
    },
    on_or_after: (v: string, dateType?: string, days?: number) => {
      const resolvedDate = dateType ? resolveDate(dateType, days) : v
      return { op: 'gte' as const, value: resolvedDate }
    },
    is_not: (v: string, dateType?: string, days?: number) => {
      const resolvedDate = dateType ? resolveDate(dateType, days) : v
      return { op: 'neq' as const, value: resolvedDate }
    },
    is_empty: () => ({ op: 'is' as const, value: null }),
    is_not_empty: () => ({ op: 'not.is' as const, value: null }),
  },
}
