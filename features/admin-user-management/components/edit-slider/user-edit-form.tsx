'use client'

import React from 'react'
import { AdminUserTableItem } from '../../config/table-config'
import CollapsibleCard from '@/components/design/CollapsibleCard-sm'
import { ChevronDownIcon, UserIcon } from 'lucide-react'
import GlassInput from '@/components/design/glass-input'
import DropdownSelect from '@/components/design/multi-select-2/dropdown-select'
import type { Role } from '@/lib/types'

interface DropdownItem {
  id: string | number
  label: string
  value: string
}

export interface UserEditFormProps {
  selectedUser: AdminUserTableItem
  formData: AdminUserTableItem
  setFormData: React.Dispatch<React.SetStateAction<AdminUserTableItem>>
  roleOptions: Role[]
}

const UserEditForm = ({ selectedUser, formData, setFormData, roleOptions }: UserEditFormProps) => {
  const roleItems: DropdownItem[] = roleOptions.map((r) => ({
    id: r.id,
    label: r.name || r.key,
    value: r.id,
  }))
  const selectedRoleItem = formData.role
    ? roleItems.find(
        (item) =>
          item.label === formData.role ||
          item.label.toLowerCase() === formData.role?.toLowerCase()
      ) ?? null
    : null
  const selectedRoleItems: DropdownItem[] = selectedRoleItem ? [selectedRoleItem] : []

  const handleInputChange = (field: keyof AdminUserTableItem) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatValueForInput = (value: any): string => {
    if (value === null || value === undefined) return ''
    return String(value)
  }

  return (
    <CollapsibleCard 
      headerText="Edit User Details"
      leftIcon={UserIcon}
      rightIcon={ChevronDownIcon}
      defaultOpen={true}
      variant="sm"
    >
      <div className="space-y-4 p-3">
        <GlassInput
          value={formatValueForInput(formData.name)}
          onChange={handleInputChange('name')}
          placeholder="Enter user name"
          required={false}
          label="Name"
          type="text"
          theme="dark"
          size="sm"
          labelPosition="top"
        />

<div className="flex flex-col gap-2">
          <label className="block text-sm text-foreground/70">Role</label>
          <DropdownSelect
            buttonText={selectedRoleItem ? selectedRoleItem.label : "Select Role"}
            items={roleItems}
            selectedItems={selectedRoleItems}
            onSelectionChange={(items: DropdownItem[]) => {
              if (items.length > 0) {
                setFormData((prev) => ({
                  ...prev,
                  role: items[0].label,
                }))
              }
            }}
            searchPlaceholder="Search role..."
            searchable={false}
            width="100%"
            maxHeight="400px"
            selectedText="role"
            showSelectedItems={true}
            showItemCount={false}
            showCheckboxes={false}
            singleChoice={true}
            hideTopButtons={true}
            className="w-full"
          />
        </div>

        <GlassInput
          value={formatValueForInput(formData.email)}
          onChange={handleInputChange('email')}
          placeholder="Enter email"
          required={false}
          label="Email"
          type="email"
          theme="dark"
          size="sm"
          labelPosition="top"
        />

        <GlassInput
          value={formatValueForInput(formData.phone)}
          onChange={handleInputChange('phone')}
          placeholder="Enter phone"
          required={false}
          label="Phone"
          type="tel"
          theme="dark"
          size="sm"
          labelPosition="top"
        />
      </div>
    </CollapsibleCard>
  )
}

export default UserEditForm
