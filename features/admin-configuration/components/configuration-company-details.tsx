'use client'

import React, { useState, useEffect } from 'react'
import type { Company } from '@/lib/types'
import GlassInput from '@/components/design/glass-input'
import PrimaryButton from '@/components/design/primary-button'
import { Check, Undo } from 'lucide-react'

interface ConfigurationCompanyDetailsProps {
  company: Company | null
  isEditMode: boolean
  onExitEditMode: () => void
  onSave: (id: string, name: string) => Promise<boolean>
}

export function ConfigurationCompanyDetails({
  company,
  isEditMode,
  onExitEditMode,
  onSave,
}: ConfigurationCompanyDetailsProps) {
  const [editName, setEditName] = useState(company?.name ?? '')
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setEditName(company?.name ?? '')
    setError(null)
  }, [company])

  if (!company) return null

  const handleSave = async () => {
    const name = editName.trim()
    if (!name) {
      setError('Name is required.')
      return
    }
    setError(null)
    setSaveLoading(true)
    try {
      const ok = await onSave(company.id, name)
      if (!ok) setError('Failed to update company.')
    } catch {
      setError('Failed to update company.')
    } finally {
      setSaveLoading(false)
    }
  }

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
            placeholder="Company name"
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
        <div>
          <p className="text-sm text-foreground/70">Name</p>
          <p className="text-foreground font-medium mt-0.5">{company.name}</p>
        </div>
      )}
    </div>
  )
}
