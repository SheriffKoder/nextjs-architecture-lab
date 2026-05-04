/**
 * Page Names Enum
 * 
 * Purpose: Centralized enum for all available pages in the application
 * Used in: User management, permissions, navigation
 * Why: Single source of truth for page identifiers
 * 
 * Enum values correspond to browser URL paths
 */

export enum PageName {
  DASHBOARD = '/dashboard',
  PORTFOLIO_PROJECT_BOARD = '/portfolio-management/project-board',
  PORTFOLIO_INVESTORS = '/portfolio-management/investors',
  FINANCIAL_MONTHLY_DISTRIBUTIONS = '/financial-reports/monthly-distributions',
  FINANCIAL_NOTE_EXPIRATIONS = '/financial-reports/note-expirations',
  FINANCIAL_NEWSLETTER_TRACKER = '/financial-reports/newsletter-tracker',
  ADMIN_CONFIGURATION = '/admin-settings/configuration',
  ADMIN_USER_MANAGEMENT = '/admin-settings/user-management',
}

/**
 * Mapping from page URL to display name
 */
export const pageDisplayNames: Record<PageName, string> = {
  [PageName.DASHBOARD]: 'Dashboard',
  [PageName.PORTFOLIO_PROJECT_BOARD]: 'Portfolio/Project Board',
  [PageName.PORTFOLIO_INVESTORS]: 'Portfolio/Investors',
  [PageName.FINANCIAL_MONTHLY_DISTRIBUTIONS]: 'Financial Reports/Monthly Distributions',
  [PageName.FINANCIAL_NOTE_EXPIRATIONS]: 'Financial Reports/Note Expirations',
  [PageName.FINANCIAL_NEWSLETTER_TRACKER]: 'Financial Reports/Newsletter Tracker',
  [PageName.ADMIN_CONFIGURATION]: 'Admin Settings/Configuration',
  [PageName.ADMIN_USER_MANAGEMENT]: 'Admin Settings/User Management',
}

/**
 * Get all page names as an array
 */
export const getAllPageNames = (): PageName[] => {
  return Object.values(PageName) as PageName[]
}

/**
 * Get display name for a page
 */
export const getPageDisplayName = (pageName: PageName): string => {
  return pageDisplayNames[pageName] || pageName
}
