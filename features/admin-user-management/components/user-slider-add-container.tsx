'use client'

import React, { useState } from 'react'
import GlassInput from '@/components/design/glass-input'
import DropdownSelect from '@/components/design/multi-select-2/dropdown-select'
import PrimaryButton from '@/components/design/primary-button'
import { Tag, Check } from 'lucide-react'
import type { Role, User } from '@/lib/types'

interface DropdownItem {
  id: string | number
  label: string
  value: string
}

interface UserSliderAddContainerProps {
  roleOptions: Role[]
  /** Default org for new user (e.g. internal org id from user management) */
  defaultOrgId?: string
  onCreateUser: (data: { email: string; password: string; name?: string; phone?: string; role_id: string; org_id?: string }) => Promise<unknown>
  onSuccess: (createdUser: User) => void
  onCancel?: () => void
}

export default function UserSliderAddContainer({
  roleOptions,
  defaultOrgId,
  onCreateUser,
  onSuccess,
  onCancel,
}: UserSliderAddContainerProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [roleId, setRoleId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const roleItems: DropdownItem[] = roleOptions.map((r) => ({
    id: r.id,
    label: r.name || r.key,
    value: r.id,
  }))
  const selectedRoleItem = roleId
    ? roleItems.find((item) => (item.value === roleId)) ?? null
    : null;
  const selectedRoleItems = selectedRoleItem ? [selectedRoleItem] : ([] as DropdownItem[]);

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
    if (!password) {
      setError('Password is required.')
      return
    }
    if (!roleId) {
      setError('Role is required.')
      return
    }
    setSubmitting(true)
    try {
      const createdUser = await onCreateUser({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        role_id: roleId,
        org_id: defaultOrgId,
      }) as User
      onSuccess(createdUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">
          {error}
        </div>
      )}

      <GlassInput
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
        label="Name"
        type="text"
        theme="dark"
        size="sm"
        labelPosition="top"
        required
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
        required
      />

      <GlassInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        label="Password"
        type="password"
        theme="dark"
        size="sm"
        labelPosition="top"
        required
      />

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

      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Role</label>
        <DropdownSelect
          icon={Tag}
          buttonText={selectedRoleItem ? selectedRoleItem.label : 'Select role'}
          items={roleItems}
          selectedItems={selectedRoleItems}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setRoleId(items.at(-1)?.value ?? null)
            else setRoleId(null)
          }}
          placeholder="Select role"
          searchable={false}
          showCheckboxes={false}
          singleChoice={true}
          hideTopButtons={true}
          showItemCount={false}
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <PrimaryButton
            onClick={onCancel}
            size="sm"
            buttonClassName="bg-background text-foreground border border-foreground/10"
          >
            Cancel
          </PrimaryButton>
        )}
        <PrimaryButton
          onClick={handleSubmit}
          size="sm"
          icon={Check}
          iconPosition="right"
          disabled={submitting}
          buttonClassName="bg-primary text-primary-foreground"
        >
          {submitting ? 'Creating…' : 'Create user'}
        </PrimaryButton>
      </div>
    </div>
  )
}
