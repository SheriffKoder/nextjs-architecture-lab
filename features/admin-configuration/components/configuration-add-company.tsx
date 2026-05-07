'use client'

import React, { useState } from 'react'
import GlassInput from '@/components/design/inputs/glass-input'
import PrimaryButton from '@/components/design/primary-button'
import { Check } from 'lucide-react'
import { useCompanies } from '@/hooks'

interface ConfigurationAddCompanyProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ConfigurationAddCompany({ onSuccess, onCancel }: ConfigurationAddCompanyProps) {
  const companiesHook = useCompanies()
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
      const company = await companiesHook.create({ name: name.trim() })
      if (company) {
        onSuccess?.()
      } else {
        setError(companiesHook.error ?? 'Failed to create company.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-2">{error}</div>
      )}
      <GlassInput
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter company name"
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
          {submitting ? 'Creating…' : 'Create Company'}
        </PrimaryButton>
      </div>
    </div>
  )
}
