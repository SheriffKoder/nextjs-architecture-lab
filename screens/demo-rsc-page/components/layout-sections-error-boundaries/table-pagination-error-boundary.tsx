'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import TablePaginationErrorFallback from './table-pagination-error-fallback'

type BoundaryProps = {
  children: ReactNode
  onReset?: () => void
}

type BoundaryState = {
  error: Error | null
}

class TablePaginationErrorBoundaryClass extends Component<
  BoundaryProps,
  BoundaryState
> {
  state: BoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[table-pagination boundary]', error, info)
  }

  resetErrorBoundary = () => {
    this.props.onReset?.()
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <TablePaginationErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      )
    }
    return this.props.children
  }
}

/**
 * Wraps table `<Suspense>` in `demo-rsc-index`. Exposes `resetErrorBoundary` to the fallback
 * (clears boundary state + `router.refresh()` for server loaders).
 */
export default function TablePaginationErrorBoundary({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()

  return (
    <TablePaginationErrorBoundaryClass onReset={() => router.refresh()}>
      {children}
    </TablePaginationErrorBoundaryClass>
  )
}
