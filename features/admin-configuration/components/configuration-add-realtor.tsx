'use client'

import React, { useState } from 'react'
import GlassInput from '@/components/design/inputs/glass-input'
import PrimaryButton from '@/components/design/primary-button'
import { Check } from 'lucide-react'
import { useOrgs } from '@/hooks'
import { OrgTypeEnum } from '@/lib/constants'

interface ConfigurationAddRealtorProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ConfigurationAddRealtor({ onSuccess, onCancel }: ConfigurationAddRealtorProps) {
  const orgsHook = useOrgs()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  // const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    // if (!password) {
    //   setError('Password is required.')
    //   return
    // }
    setSubmitting(true)
    try {
      const org = await orgsHook.create({
        name: name.trim(),
        org_types: [OrgTypeEnum.REALTOR],
        adminName: name.trim(),
        adminEmail: email.trim(),
        // adminPassword: password,
        adminPhone: phone.trim() || undefined,
      })
      if (org) {
        onSuccess?.()
      } else {
        setError(orgsHook.error ?? 'Failed to create realtor.')
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
        placeholder="Enter realtor name"
        label="Name"
        type="text"
        theme="dark"
        size="sm"
        labelPosition="top"
        required={false}
      />
      <GlassInput
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
        label="Email"
        type="email"
        theme="dark"
        size="sm"
        labelPosition="top"
        required={false}
      />
      {/* <GlassInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        label="Password"
        type="password"
        theme="dark"
        size="sm"
        labelPosition="top"
        required={false}
      /> */}
      <GlassInput
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter phone (optional)"
        label="Phone (optional)"
        type="tel"
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
          {submitting ? 'Creating…' : 'Create Realtor'}
        </PrimaryButton>
      </div>
    </div>
  )
}
