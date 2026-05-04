'use client'

import React, { useState } from 'react'
import GlassInput from '@/components/design/glass-input'
import PrimaryButton from '@/components/design/primary-button'
import { Check } from 'lucide-react'
import { useOrgs } from '@/hooks'
import type { OrgType } from '@/lib/types'

interface ConfigurationAddOrgProps {
  orgType: OrgType
  onSuccess?: () => void
  onCancel?: () => void
}

export function ConfigurationAddOrg({ orgType, onSuccess, onCancel }: ConfigurationAddOrgProps) {
  const orgsHook = useOrgs()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    setSubmitting(true)
    try {
      const org = await orgsHook.create({ name: name.trim(), org_types: [orgType] })
      if (org) {
        onSuccess?.()
      } else {
        setError(orgsHook.error ?? 'Failed to create.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const label = orgType.charAt(0).toUpperCase() + orgType.slice(1)

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-2">{error}</div>
      )}
      <GlassInput
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()} name`}
        label="Name"
        type="text"
        theme="dark"
        size="sm"
        labelPosition="top"
        required={false}
      />
      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <PrimaryButton
            onClick={onCancel}
            buttonClassName="bg-background text-foreground border border-foreground/10 hover:bg-tertiary/30"
            size="sm"
          >
            Cancel
          </PrimaryButton>
        )}
        <PrimaryButton
          onClick={handleSubmit}
          disabled={submitting}
          buttonClassName="bg-tertiary text-tertiary-foreground hover:bg-tertiary/90"
          size="sm"
          icon={Check}
          iconPosition="right"
        >
          {submitting ? 'Creating…' : `Create ${label}`}
        </PrimaryButton>
      </div>
    </div>
  )
}
