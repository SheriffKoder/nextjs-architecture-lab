"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

interface UseViewSwitcherOptions {
  /** Available view keys */
  availableViews: string[];
  /** Default view if no param in URL */
  defaultView?: string;
  /** URL parameter name (default: 'view') */
  paramName?: string;
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
 */
export function useViewSwitcher(
  options: UseViewSwitcherOptions,
): UseViewSwitcherReturn {
  const { availableViews, defaultView, paramName = "view" } = options;

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

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [
      availableViews,
      effectiveDefaultView,
      paramName,
      searchParams,
      pathname,
      router,
    ],
  );

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
