"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  applyShowAllToSearchParams,
  isShowAllUrlParam,
  syncShowAllForViewChange,
  viewRequiresAllItems,
} from "@/features/url-kit/filters/feature-pagination/utils";

interface UseViewSwitcherOptions {
  /** Available view keys */
  availableViews: string[];
  /** Default view if no param in URL */
  defaultView?: string;
  /** URL parameter name (default: 'view') */
  paramName?: string;
  /** View keys that require `all=1` (full dataset) */
  useAllItems?: readonly string[];
  /** Default page size when leaving a useAllItems view */
  defaultPageSize?: number;
}

interface UseViewSwitcherReturn {
  /** Current view key (from URL only — avoids optimistic state vs URL races). */
  currentView: string;
  /** Change handler that updates URL */
  setView: (view: string) => void;
  /** Whether a specific view is available */
  isViewAvailable: (view: string) => boolean;
}

/**
 * Hook for managing view state synchronized with URL parameters.
 *
 * @example
 * ```tsx
 * const { currentView, setView } = useViewSwitcher({
 *   availableViews: ['table', 'kanban', 'map'],
 *   defaultView: 'table',
 *   useAllItems: ['kanban', 'map'],
 * })
 * ```
 */
export function useViewSwitcher(
  options: UseViewSwitcherOptions,
): UseViewSwitcherReturn {
  const {
    availableViews,
    defaultView,
    paramName = "view",
    useAllItems,
    defaultPageSize = 10,
  } = options;

  const effectiveDefaultView =
    defaultView || (availableViews.length > 0 ? availableViews[0] : "table");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentView = useMemo(() => {
    const viewParam = searchParams.get(paramName);
    if (viewParam && availableViews.includes(viewParam)) {
      return viewParam;
    }
    return effectiveDefaultView;
  }, [searchParams, paramName, availableViews, effectiveDefaultView]);

  const pushParams = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setView = useCallback(
    (view: string) => {
      if (!availableViews.includes(view)) {
        console.warn(`View "${view}" is not in availableViews:`, availableViews);
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      if (view === effectiveDefaultView) {
        params.delete(paramName);
      } else {
        params.set(paramName, view);
      }

      syncShowAllForViewChange(params, currentView, view, {
        useAllItems,
        defaultPageSize,
      });

      pushParams(params);
    },
    [
      availableViews,
      currentView,
      defaultPageSize,
      effectiveDefaultView,
      paramName,
      pushParams,
      searchParams,
      useAllItems,
    ],
  );

  // Deep link: ?view=kanban without all=1 → sync once on mount / URL change
  const didSyncShowAllRef = useRef<string | null>(null);
  useEffect(() => {
    if (!useAllItems?.length || !viewRequiresAllItems(currentView, useAllItems)) {
      didSyncShowAllRef.current = null;
      return;
    }
    if (isShowAllUrlParam(searchParams)) {
      didSyncShowAllRef.current = searchParams.toString();
      return;
    }

    const key = searchParams.toString();
    if (didSyncShowAllRef.current === key) return;
    didSyncShowAllRef.current = key;

    const params = new URLSearchParams(searchParams.toString());
    applyShowAllToSearchParams(params);
    pushParams(params);
  }, [currentView, pushParams, searchParams, useAllItems]);

  const isViewAvailable = useCallback(
    (view: string): boolean => availableViews.includes(view),
    [availableViews],
  );

  return {
    currentView,
    setView,
    isViewAvailable,
  };
}
