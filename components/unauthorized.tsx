'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldX } from 'lucide-react'

/**
 * Global Unauthorized view. Use when the user does not have permission to access the current page (e.g. admin-only areas).
 */
export default function Unauthorized() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <div className="flex flex-col items-center gap-4 max-w-md">
        <div className="rounded-full bg-destructive/10 p-4">
          <ShieldX className="w-12 h-12 text-destructive" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Unauthorized</h1>
        <p className="text-muted-foreground">
          You don&apos;t have permission to view this page. Contact an administrator if you believe this is an error.
        </p>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-tertiary hover:text-tertiary/90 underline underline-offset-4"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  )
}
