'use client'

import React, { useState, useEffect } from 'react'
import type { RealtorWithAdmin } from '@/hooks'
import GlassInput from '@/components/design/inputs/glass-input'
import PrimaryButton from '@/components/design/primary-button'
import { Check, Undo } from 'lucide-react'

interface ConfigurationRealtorDetailsProps {
  realtor: RealtorWithAdmin | null
  isEditMode: boolean
  onExitEditMode: () => void
  onSave: (id: string, data: { name: string; email: string; phone: string | null }) => Promise<boolean>
}

export function ConfigurationRealtorDetails({
  realtor,
  isEditMode,
  onExitEditMode,
  onSave,
}: ConfigurationRealtorDetailsProps) {
  const admin = realtor?.members?.[0]?.user

  const [editName, setEditName] = useState(admin?.name ?? realtor?.name ?? '')
  const [editEmail, setEditEmail] = useState(admin?.email ?? '')
  const [editPhone, setEditPhone] = useState(admin?.phone ?? '')
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setEditName(admin?.name ?? realtor?.name ?? '')
    setEditEmail(admin?.email ?? '')
    setEditPhone(admin?.phone ?? '')
    setError(null)
  }, [realtor, admin?.name, admin?.email, admin?.phone, realtor?.name])

  if (!realtor) return null

  const handleSave = async () => {
    const name = editName.trim()
    const email = editEmail.trim()
    if (!name) {
      setError('Name is required.')
      return
    }
    if (!email) {
      setError('Email is required.')
      return
    }
    setError(null)
    setSaveLoading(true)
    try {
      const ok = await onSave(realtor.id, {
        name,
        email,
        phone: editPhone.trim() || null,
      })
      if (!ok) setError('Failed to update realtor. This email may already be in use.')
    } catch {
      setError('Failed to update realtor.')
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
            placeholder="Admin / contact name"
            label="Name"
            type="text"
            theme="dark"
            size="sm"
            labelPosition="top"
            required
          />
          <GlassInput
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            placeholder="Email"
            label="Email"
            type="email"
            theme="dark"
            size="sm"
            labelPosition="top"
            required
          />
          <GlassInput
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="Phone (optional)"
            label="Phone"
            type="tel"
            theme="dark"
            size="sm"
            labelPosition="top"
            required={false}
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
            <p className="text-foreground font-medium mt-0.5">{admin?.name ?? realtor.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm text-foreground/70">Email</p>
            <p className="text-foreground font-medium mt-0.5">{admin?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm text-foreground/70">Phone</p>
            <p className="text-foreground font-medium mt-0.5">{admin?.phone ?? '—'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
