/**
 * Folder tab shape demo (URL-driven active tab).
 *
 * Purpose: `/development/folder-tab-shape-2` — row UI is dumb; `useViewSwitcher` lives in the client view.
 * Used in: Next.js app route.
 */

import { Suspense } from "react";

import { FolderTabShape2View } from "./folder-tab-shape-2-view";

export default function DevelopmentFolderTabShape2Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto p-8 text-sm text-muted-foreground">Loading…</div>
      }
    >
      <FolderTabShape2View config={{ isEnd: true }} />
    </Suspense>
  );
}
