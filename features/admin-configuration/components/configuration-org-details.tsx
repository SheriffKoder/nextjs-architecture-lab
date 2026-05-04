'use client'

import React, { useState, useEffect } from 'react'
import type { Org } from '@/lib/types'
import GlassInput from '@/components/design/glass-input'
import PrimaryButton from '@/components/design/primary-button'
import { Check, Undo } from 'lucide-react'

interface ConfigurationOrgDetailsProps {
  org: Org | null
  isEditMode: boolean
  onExitEditMode: () => void
  onSave: (id: string, name: string) => Promise<boolean>
}

export function ConfigurationOrgDetails({
  org,
  isEditMode,
  onExitEditMode,
  onSave,
}: ConfigurationOrgDetailsProps) {
  const [editName, setEditName] = useState(org?.name ?? '')
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setEditName(org?.name ?? '')
    setError(null)
  }, [org])

  if (!org) return null

  const handleSave = async () => {
    const name = editName.trim()
    if (!name) {
      setError('Name is required.')
      return
    }
    setError(null)
    setSaveLoading(true)
    try {
      const ok = await onSave(org.id, name)
      if (!ok) setError('Failed to update organization.')
    } catch {
      setError('Failed to update organization.')
    } finally {
      setSaveLoading(false)
    }
  }

  const displayName = (org as Org & { members?: Array<{ user?: { name?: string | null } }> }).members?.[0]?.user?.name
    ?? org.name
    ?? ''

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">
          {error}
        </div>
      )}

      {isEditMode ? (
        <>
          <GlassInput
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Organization name"
            label="Name"
            type="text"
            theme="dark"
            size="sm"
            labelPosition="top"
            required
          />
          <div className="flex gap-2 justify-end">
            <PrimaryButton
              onClick={onExitEditMode}
              size="sm"
              icon={Undo}
              buttonClassName="bg-background text-foreground border border-foreground/10"
            >
              Cancel
            </PrimaryButton>
            <PrimaryButton
              onClick={handleSave}
              disabled={saveLoading}
              size="sm"
              icon={Check}
              iconPosition="right"
              buttonClassName="bg-primary text-primary-foreground"
            >
              {saveLoading ? 'Saving…' : 'Save'}
            </PrimaryButton>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-foreground/70">Name</p>
            <p className="text-foreground font-medium mt-0.5">{org.name}</p>
          </div>
          {displayName !== org.name && (
            <div>
              <p className="text-sm text-foreground/70">Admin / Contact</p>
              <p className="text-foreground font-medium mt-0.5">{displayName}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
