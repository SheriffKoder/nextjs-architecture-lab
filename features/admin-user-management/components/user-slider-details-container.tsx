import React from 'react'
import { AdminUserTableItem } from '../config/table-config'
import UserDetails from './details-slider/user-details'

const UserSliderDetailsContainer = ({ selectedUser }: { selectedUser: AdminUserTableItem | null }) => {
  if (!selectedUser) {
    return null
  }

  return (
    <div className='space-y-4'>
      <UserDetails selectedUser={selectedUser} />
    </div>
  )
}

export default UserSliderDetailsContainer
