'use client'

import React, { useState } from 'react'
import GlassInput from '@/components/design/inputs/glass-input'
import PrimaryButton from '@/components/design/primary-button'
import { User, Phone, Lock, Save, Edit } from 'lucide-react'
import { User as UserType } from '@/lib/types'

interface PersonalInformationFormProps {
  user: UserType
  onSave?: (data: { name: string; phone: string; password: string }) => Promise<void>
}

const PersonalInformationForm = ({ user, onSave }: PersonalInformationFormProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [password, setPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setError(null)
    setIsSaving(true)
    
    try {
      if (onSave) {
        await onSave({ name, phone, password })
      }
      setIsEditing(false)
      setPassword('') // Clear password after save
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setName(user?.name || '')
    setPhone(user?.phone || '')
    setPassword('')
    setError(null)
    setIsEditing(false)
  }

  return (
    <div className="space-y-4 p-4">
      {error && (
        <div className="sticky top-0 left-0 right-0 z-50 bg-red-100 text-destructive dark:text-red-500 text-sm p-2 flex items-center justify-between gap-2 border border-destructive/20 rounded-md">
          <span className="flex-1">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <GlassInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          label="Name"
          type="text"
          theme="dark"
          size="sm"
          labelPosition="top"
          required={false}
          leftIcon={User}
          disabled={!isEditing}
        />

        <GlassInput
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          label="Phone"
          type="tel"
          theme="dark"
          size="sm"
          labelPosition="top"
          required={false}
          leftIcon={Phone}
          disabled={!isEditing}
        />

        <GlassInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isEditing ? "Enter new password (leave blank to keep current)" : "••••••••"}
          label="Password"
          type="password"
          theme="dark"
          size="sm"
          labelPosition="top"
          required={false}
          leftIcon={Lock}
          disabled={!isEditing}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {!isEditing ? (
          <PrimaryButton
            onClick={() => setIsEditing(true)}
            buttonClassName="bg-tertiary text-background border border-foreground/10 hover:bg-tertiary/30"
            size="sm"
            icon={Edit}
            iconPosition="left"
          >
            Edit
          </PrimaryButton>
        ) : (
          <>
            <PrimaryButton
              onClick={handleCancel}
              buttonClassName="bg-foreground/5 text-foreground border border-foreground/10 hover:bg-foreground/10"
              size="sm"
              disabled={isSaving}
            >
              Cancel
            </PrimaryButton>
            <PrimaryButton
              onClick={handleSave}
              buttonClassName="bg-tertiary text-background border border-foreground/10 hover:bg-tertiary/30"
              size="sm"
              icon={Save}
              iconPosition="left"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </PrimaryButton>
          </>
        )}
      </div>
    </div>
  )
}

export default PersonalInformationForm
