'use client'

/**
 * Rethrows a server-caught error during client render so `TablePaginationErrorBoundary` can handle it.
 * (Client error boundaries do not catch throws from async Server Components directly.)
 * used in: `TableAndPaginationSection`
 * purpose: to rethrow the error to the error boundary so it can be handled by the fallback component
 */
export default function TablePaginationErrorRethrow({
  error,
}: {
  error: unknown
}): never {
  if (error instanceof Error) {
    throw error
  }
  throw new Error(
    typeof error === 'string' ? error : 'Failed to load table and pagination.'
  )
}
