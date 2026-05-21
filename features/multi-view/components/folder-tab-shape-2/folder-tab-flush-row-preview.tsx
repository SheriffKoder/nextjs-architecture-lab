/**
 * Folder tab flush row — presentational only.
 *
 * Purpose: Renders skewed tabs; `activeKey` + `onTabChange` come from the parent (e.g. `useViewSwitcher`).
 * Used in: app/development/folder-tab-shape-2/folder-tab-shape-2-view.tsx
 */

import { cn } from "./cn";
import type { FolderTabFlushRowItem } from "./config";
import shape from "./folder-tab-shape.module.css";

export type FolderTabFlushRowPreviewProps = {
  gap: string;
  items: FolderTabFlushRowItem[];
  activeKey: string;
  onTabChange: (key: string) => void;
  tabWidthClassName?: string;
  /**
   * When true: first tab keeps both wings; last tab hides the right wing (end strip).
   * When false: first tab is flush-left (no left wing); last tab keeps both wings.
   */
  isEnd?: boolean;
};

export function FolderTabFlushRowPreview({
  gap,
  items,
  activeKey,
  onTabChange,
  tabWidthClassName,
  isEnd = false,
}: FolderTabFlushRowPreviewProps) {
  const n = items.length;

  if (n === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-row flex-nowrap items-end"
      role="tablist"
      aria-orientation="horizontal"
      aria-label="View tabs"
    >
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === n - 1;
        const isActive = item.key === activeKey;
        const Icon = item.icon;

        const noLeadingWing = !isEnd && isFirst;
        const noTrailingWing = isEnd && isLast && n > 1;

        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={cn(
              shape.folderTab,
              shape.folderTabBordered,
              noLeadingWing && shape.folderTabNoLeadingWing,
              noTrailingWing && shape.folderTabNoTrailingWing,
              !isLast && shape.folderTabOverlapNext,
              isActive && shape.folderTabActive,
              "relative min-w-0 cursor-pointer text-left",
              tabWidthClassName,
            )}
            style={{
              zIndex: isActive ? n + 1 : n - index,
              marginLeft: index > 0 ? gap : undefined,
            }}
            onClick={() => {
              onTabChange(item.key);
            }}
          >
            <span
              className={cn(
                shape.folderTabFace,
                tabWidthClassName && "w-full",
                !isActive && "text-muted-foreground",
              )}
            >
              {Icon ? (
                <Icon className="size-4 shrink-0" aria-hidden />
              ) : null}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
