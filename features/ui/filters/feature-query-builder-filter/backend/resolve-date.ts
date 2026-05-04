/**
 * Resolve Date Utility
 * 
 * Purpose: Convert relative date values to ISO date strings
 * Used in: Backend filter processing
 * Why: Translates user-friendly date values to actual dates
 */

/**
 * Resolve relative date value to ISO string
 * WHY: Convert user-friendly date values (today, yesterday, etc.) to ISO dates
 * HOW: Calculate date based on value type and return ISO string
 * @param {string} value - Date value type (today, yesterday, days_ago, etc.)
 * @param {number} [days] - Number of days for days_ago/days_from_now
 * @returns {string} ISO date string
 */
export function resolveDate(value: string, days?: number): string {
  const now = new Date()
  
  switch (value) {
    case 'today':
      return now.toISOString().split('T')[0] // Return date only (YYYY-MM-DD)
    
    case 'tomorrow':
      now.setDate(now.getDate() + 1)
      return now.toISOString().split('T')[0]
    
    case 'yesterday':
      now.setDate(now.getDate() - 1)
      return now.toISOString().split('T')[0]
    
    case 'one_week_ago':
      now.setDate(now.getDate() - 7)
      return now.toISOString().split('T')[0]
    
    case 'one_week_from_now':
      now.setDate(now.getDate() + 7)
      return now.toISOString().split('T')[0]
    
    case 'one_month_ago':
      now.setMonth(now.getMonth() - 1)
      return now.toISOString().split('T')[0]
    
    case 'one_month_from_now':
      now.setMonth(now.getMonth() + 1)
      return now.toISOString().split('T')[0]
    
    case 'days_ago':
      if (days !== undefined) {
        now.setDate(now.getDate() - days)
        return now.toISOString().split('T')[0]
      }
      return now.toISOString().split('T')[0]
    
    case 'days_from_now':
      if (days !== undefined) {
        now.setDate(now.getDate() + days)
        return now.toISOString().split('T')[0]
      }
      return now.toISOString().split('T')[0]
    
    case 'exact_date':
      // If exact_date, the value should already be an ISO date string
      return value
    
    default:
      // Assume it's already an ISO date string
      return value
  }
}
