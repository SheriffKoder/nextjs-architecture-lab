'use client'

import React from 'react'
import CollapsibleCard from '@/shared/ui/collapsible-card'
import DetailRow from '@/shared/ui/loading-skeletons/detail-row/detail-row'
import EditableAvatar from './ui/editable-avatar'
import PersonalInformationForm from './ui/personal-information-form'
import { UserIcon, Calendar } from 'lucide-react'
import { format } from 'date-fns'

/** Temporary stub until auth is re-implemented. */
interface User {
  id: string
  email: string | null
  name: string | null
  phone?: string | null
  created_at: string
  updated_at: string
}

const fallbackUser: User = {
  id: '',
  email: null,
  name: null,
  phone: null,
  created_at: '1970-01-01T00:00:00.000Z',
  updated_at: '1970-01-01T00:00:00.000Z',
}

const Profile = () => {
  const user = fallbackUser

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const ImageUpload = async (file: File) => {
    console.log('Uploading avatar:', file.name)
  }

  return (
    <div className='flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative'>
      <header className='absolute top-0 left-0 w-full lg:w-[calc(100%)] flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0
      bg-background/20 backdrop-blur-sm z-[50]'>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold tracking-tight">
            Profile
          </h1>
          <p className="hidden text-sm text-muted-foreground md:block">
            Profile information and account details
          </p>
        </div>
      </header>

      <div className='flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-8 p-6 md:p-8 pb-0 min-w-0 min-h-0 pt-[200px] lg:pt-[120px] w-full'>
        <div className='flex flex-col gap-6 max-w-4xl mx-auto w-full'>
        {/* User Avatar and Basic Info */}
        <div className="flex items-center gap-6 p-3 rounded-lg border border-border/50 bg-tertiary/5">
          <EditableAvatar 
            user={user}
            onImageChange={ImageUpload}
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {user?.name || 'User'}
            </h2>
            <p className="text-sm text-foreground/60">
              {user?.email || 'No email'}
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <CollapsibleCard 
          headerText="Personal Information"
          leftIcon={UserIcon}
          defaultOpen={true}
          variant="sm"
        >
          <PersonalInformationForm 
            user={user}
            onSave={async (data) => {
              // TODO: Implement API call to update user profile
              console.log('Saving profile data:', data)
              // Example: await updateUserProfile(data)
            }}
          />
          {/* <div className="mt-4 pt-4 border-t border-tertiary/10">
            <DetailRow label="Email" value={user?.email || 'N/A'} />
            <DetailRow label="User ID" value={user?.id || 'N/A'} />
          </div> */}
        </CollapsibleCard>

        {/* Account Details */}
        <CollapsibleCard 
          headerText="Account Details"
          leftIcon={Calendar}
          defaultOpen={true}
          variant="sm"
        >
          <div className="">
            <DetailRow label="Account Created" value={formatDate(user?.created_at)} />
            <DetailRow label="Last Updated" value={formatDate(user?.updated_at)} />
          </div>
        </CollapsibleCard>

        </div>
      </div>
    </div>
  )
}

export default Profile
