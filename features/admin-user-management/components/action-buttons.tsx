/**
 * Action Buttons Component
 * 
 * Purpose: Container for action buttons (Add User)
 * Used in: features/admin-user-management/index.tsx
 * Why: Provides consistent action button layout
 * 
 * Function Index:
 * - ActionButtons: Component that renders add user button
 */

import React from 'react'
import { Plus } from 'lucide-react'
import PrimaryButton from '@/components/design/primary-button'

interface ActionButtonsProps {
  onAddUser: () => void
}

export default function ActionButtons({ onAddUser }: ActionButtonsProps) {
  return (
    <div className="flex flex-row gap-2 items-start w-full lg:w-auto relative">
      <PrimaryButton
        onClick={onAddUser}
        icon={Plus}
        iconPosition="left"
        buttonClassName="bg-primary text-white/90 whitespace-nowrap"
        size="default"
      >
        Add user
      </PrimaryButton>
    </div>
  )
}
