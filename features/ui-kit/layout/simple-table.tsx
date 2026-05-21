'use client'

import React from 'react'
import LoadingValue from '@/features/ui-kit/layout/loading-value'

export interface SimpleTableColumn<T = any> {
  key: string
  label: string
  minWidth: string
  /** Optional custom render. If not provided, row[column.key] is rendered. */
  render?: (value: unknown, row: T) => React.ReactNode
}

interface SimpleTableProps<T = any> {
  columns: SimpleTableColumn<T>[]
  data: T[]
  getRowKey: (row: T) => string
  /** Optional: custom cell content; overrides column.render and default row[column.key] */
  getCellContent?: (row: T, columnKey: string) => React.ReactNode
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
  /** Show loading skeleton rows when true */
  loading?: boolean
}

function SimpleTable<T = any>({
  columns,
  data,
  getRowKey,
  getCellContent,
  onRowClick,
  emptyMessage = 'No data',
  className = '',
  loading = false,
}: SimpleTableProps<T>) {
  const getDisplay = (row: T, column: SimpleTableColumn<T>): React.ReactNode => {
    if (getCellContent) {
      const node = getCellContent(row, column.key)
      if (node !== undefined && node !== null) return node
    }
    if (column.render) {
      const value = (row as Record<string, unknown>)[column.key]
      return column.render(value, row)
    }
    const value = (row as Record<string, unknown>)[column.key]
    if (value === undefined || value === null) return ''
    return String(value)
  }

  return (
    <div className={`w-full overflow-x-auto p-2 ${className}`}>
      {/* Table Header */}
      <div className="flex items-center sticky top-0 z-10 min-w-0 border border-border/50 bg-[#f1f1f1] dark:bg-[#131313] ">
        {columns.map((column, index) => (
          <div
            key={column.key}
            className={`relative flex items-center  inset-l py-2 px-4 min-w-0 shrink-0 text-xs font-semibold text-tertiary uppercase tracking-wider truncate ${
              index === 0 ? '' : ''
            } ${
              index === columns.length - 1 ? '' : ''
            }`}
            style={{ minWidth: column.minWidth, maxWidth: column.minWidth }}
          >
            {column.label}
          </div>
        ))}
      </div>

      {/* Table Rows */}
      <div className="min-w-0">
        {loading ? (
          // Loading skeleton rows
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className="flex items-stretch group border-b border-l border-r border-tertiary/10 bg-tertiary/5 min-w-0"
            >
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="min-w-0 shrink-0 overflow-hidden px-4 py-2 flex items-center"
                  style={{ minWidth: column.minWidth, maxWidth: column.minWidth }}
                >
                  <LoadingValue className="w-full h-4" />
                </div>
              ))}
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="px-3 py-6 text-sm text-muted-foreground text-center">
            {emptyMessage}
          </div>
        ) : (
          data.map((row) => (
            <div
              key={getRowKey(row)}
              className={`flex items-stretch group border-b border-l border-r border-tertiary/10 bg-tertiary/5 min-w-0 ${
                onRowClick ? 'cursor-pointer dark:hover:bg-neutral-800 hover:bg-neutral-200' : ''
              }`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="min-w-0 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap px-4 py-2 text-sm text-foreground/70 font-medium dark:font-light"
                  style={{ minWidth: column.minWidth, maxWidth: column.minWidth }}
                  title={String(getDisplay(row, column))}
                >
                  {getDisplay(row, column)}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SimpleTable
