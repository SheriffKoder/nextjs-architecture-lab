/**
 * Client shell: URL view state + folder tab row.
 *
 * Pass `availableViews` from the page views config (single source of truth).
 */

'use client'

import { useMemo } from 'react'

import { useViewResolution } from '@/platform/url-kit/minimal-controls'

import {
  buildFolderTabRowItems,
  viewDisplayOptions,
  type ViewDisplayOptionKey,
} from './config'
import { FolderTabFlushRowPreview } from './folder-tab-flush-row-preview'

export type FolderTabsConfig = {
  /**
   * When true: first tab has both skew wings; last tab drops the right wing (strip end).
   * When false: first tab flush-left (no left wing); last tab keeps both wings.
   */
  isEnd?: boolean
}

export type FolderTabsProps = {
  /** Available view keys — from page views config */
  availableViews: readonly string[]
  defaultView?: string
  useAllItems?: readonly string[]
  defaultPageSize?: number
  config?: FolderTabsConfig
}

function toKnownViewKeys(
  keys: readonly string[],
): ViewDisplayOptionKey[] {
  return keys.filter(
    (k): k is ViewDisplayOptionKey => k in viewDisplayOptions,
  )
}

export function FolderTabs({
  availableViews,
  defaultView,
  useAllItems,
  defaultPageSize,
  config,
}: FolderTabsProps) {
  const isEnd = config?.isEnd ?? false
  const knownKeys = useMemo(
    () => toKnownViewKeys(availableViews),
    [availableViews],
  )
  const views = useMemo(() => knownKeys.map(String), [knownKeys])
  const effectiveDefault =
    defaultView || (views.length > 0 ? views[0] : 'table')

  const { currentView, setView } = useViewResolution({
    availableViews: views,
    defaultView: effectiveDefault,
    useAllItems,
    defaultPageSize,
  })

  const items = useMemo(
    () => buildFolderTabRowItems(knownKeys),
    [knownKeys],
  )

  if (items.length <= 1) {
    return null
  }

  return (
    <FolderTabFlushRowPreview
      gap="10px"
      isEnd={isEnd}
      items={items}
      activeKey={currentView}
      onTabChange={setView}
      tabWidthClassName="min-w-[7.25rem] shrink-0 sm:min-w-[8rem]"
    />
  )
}
