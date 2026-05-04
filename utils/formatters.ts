  // Format currency values
  export const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A'
    return `$${value.toLocaleString()}`
  }

  // Format percentage values
  export const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A'
    return `${(value * 100).toFixed(1)}%`
  }

  // Format date values
  export const formatDate = (value: string | null | undefined): string => {
    if (!value) return 'N/A'
    try {
      const date = new Date(value)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return String(value)
    }
  }