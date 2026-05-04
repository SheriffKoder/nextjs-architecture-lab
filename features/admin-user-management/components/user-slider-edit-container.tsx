'use client'

import React, { useState, useEffect } from 'react'
import { AdminUserTableItem } from '../config/table-config'
import UserEditForm from './edit-slider/user-edit-form'
import PrimaryButton from '@/components/design/primary-button'
import { Check } from 'lucide-react'
import { useAppSelector } from '@/lib/store/hooks'
import { useUsers } from '@/hooks'
import type { User } from '@/lib/types'

interface UserSliderEditContainerProps {
  selectedUser: AdminUserTableItem | null
  onSuccess?: (updatedUser: User) => void
}

const UserSliderEditContainer = ({ selectedUser, onSuccess }: UserSliderEditContainerProps) => {
  const roles = useAppSelector((state) => state.role.roles)
  const usersHook = useUsers()
  const [formData, setFormData] = useState<AdminUserTableItem>(selectedUser || {} as AdminUserTableItem)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update formData when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setFormData(selectedUser)
    }
  }, [selectedUser])

  if (!selectedUser) {
    return null
  }

  const handleApply = async () => {
    const roleId = formData.role
      ? roles.find(
          (r) =>
            (r.name || r.key) === formData.role ||
            (r.name || r.key)?.toLowerCase() === formData.role?.toLowerCase()
        )?.id
      : undefined
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      ...(roleId && { role_id: roleId }),
    }
    setIsSubmitting(true)
    try {
      const updated = await usersHook.update(selectedUser.id, payload)
      if (updated) {
        onSuccess?.(updated)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='space-y-4'>
      {/* Apply Button */}
      <div className="flex justify-end">
        <PrimaryButton
          onClick={handleApply}
          disabled={isSubmitting}
          buttonClassName="bg-background text-foreground border border-foreground/10 hover:bg-tertiary/30 transition-all duration-500"
          size="sm"
          icon={Check}
          iconPosition="right"
        >
          {isSubmitting ? 'Applying…' : 'Apply'}
        </PrimaryButton>
      </div>

      {/* User Edit Form */}
      <UserEditForm
        selectedUser={selectedUser}
        formData={formData}
        setFormData={setFormData}
        roleOptions={roles}
      />
    </div>
  )
}

export default UserSliderEditContainer
