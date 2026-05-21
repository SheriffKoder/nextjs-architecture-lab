/**
 * Role Selector Component
 * 
 * Purpose: Child component for development toggle that displays role selection
 * Used in: components/layout/development-toggle.tsx
 * Why: Provides role selection functionality using multi-select dropdown
 * 
 * Function Index:
 * - RoleSelector: Component that displays role selection dropdown
 * 
 * Steps:
 * 1. Import role config and DropdownSelect component
 * 2. Manage selected roles state
 * 3. Render DropdownSelect with role configuration
 */

'use client'

import React, { useState } from 'react'
import { UserCog } from 'lucide-react'
import DropdownSelect from '@/features/ui-kit/forms/multi-select/dropdown-select'
import { roleConfig } from './role-config'

interface DropdownItem {
  id: string | number
  label: string
  value: any
}

export default function RoleSelector() {
  const [selectedRoles, setSelectedRoles] = useState<DropdownItem[]>([])

  // Convert role config to DropdownItem format
  const roleItems: DropdownItem[] = roleConfig.roles.map(role => ({
    id: role.id,
    label: role.name,
    value: role
  }))

  return (
      <DropdownSelect
        icon={UserCog}
        buttonText="Select Role"
        items={roleItems}
        selectedItems={selectedRoles}
        onSelectionChange={(items: DropdownItem[]) => {
          setSelectedRoles(items)
        }}
        searchPlaceholder="Search roles..."
        searchable={false}
        width="100%"
        maxHeight="400px"
        selectedText="roles"
        showSelectedItems={true}
        showItemCount={false}
        showCheckboxes={false}
        singleChoice={true}
        hideTopButtons={true}
        className="w-full"
      />
  )
}
