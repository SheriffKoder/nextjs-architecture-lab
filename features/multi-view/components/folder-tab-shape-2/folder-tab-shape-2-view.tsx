/**
 * Client shell: URL view state + folder tab row.
 *
 * Purpose: `useViewSwitcher` (feature hook) owns active view; row is presentational.
 * Used in: app/development/folder-tab-shape-2/page.tsx (inside Suspense).
 */

"use client";

import { useMemo } from "react";

import { useViewSwitcher } from "@/features/multi-view/hooks/useViewSwitcher";

import {
  DEFAULT_VIEW_ORDER,
  buildFolderTabRowItems,
  viewDisplayOptions,
} from "./config";
import { FolderTabFlushRowPreview } from "./folder-tab-flush-row-preview";

export type FolderTabShape2ViewConfig = {
  /**
   * When true: first tab has both skew wings; last tab drops the right wing (strip end).
   * When false: first tab flush-left (no left wing); last tab keeps both wings.
   */
  isEnd?: boolean;
};

export type FolderTabShape2ViewProps = {
  config?: FolderTabShape2ViewConfig;
};

export function FolderTabShape2View({
  config,
}: FolderTabShape2ViewProps = {}) {
  const isEnd = config?.isEnd ?? false;
  const availableViews = useMemo(
    () => DEFAULT_VIEW_ORDER.map((k) => viewDisplayOptions[k].key),
    [],
  );

  const defaultView = availableViews[0] ?? "table";

  const { currentView, setView } = useViewSwitcher({
    availableViews,
    defaultView,
  });

  const items = useMemo(
    () => buildFolderTabRowItems(DEFAULT_VIEW_ORDER),
    [],
  );

  return (
    <>
          <FolderTabFlushRowPreview
            gap="10px"
            isEnd={isEnd}
            items={items}
            activeKey={currentView}
            onTabChange={setView}
            tabWidthClassName="min-w-[7.25rem] shrink-0 sm:min-w-[8rem]"
          />
    </>
  );
}
