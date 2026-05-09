'use client'

/**
 * NL filter assistant — compact feedback line (tertiary)
 *
 * Purpose: Icon + copy without a heavy result card.
 * Used in: `NlFilterAssistant`
 */

import { MessageSquareText } from 'lucide-react'

export function NlFilterFeedback({ text }: { text: string }) {
  return (
    <div className="flex gap-2 text-sm text-tertiary">
      <MessageSquareText className="mt-0.5 size-4 shrink-0 opacity-90" aria-hidden />
      <p className="min-w-0 whitespace-pre-wrap leading-relaxed">{text}</p>
    </div>
  )
}
