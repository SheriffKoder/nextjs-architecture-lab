import React from 'react'
import { AdminUserTableItem } from '../../config/table-config'
import CollapsibleCard from '@/components/design/CollapsibleCard-sm'
import DetailRow from '@/components/design/slider/detail-row'
import { ChevronDownIcon, UserIcon } from 'lucide-react'

const UserDetails = ({ selectedUser }: { selectedUser: AdminUserTableItem | null }) => {
  if (!selectedUser) {
    return null
  }

  return (
    <CollapsibleCard 
      headerText="User Details"
      leftIcon={UserIcon}
      rightIcon={ChevronDownIcon}
      defaultOpen={true}
      variant="sm"
    >
      <div className="">
        <div className="mt-0">
          <DetailRow label="Name" value={selectedUser.name || 'N/A'} />
          <DetailRow label="Role" value={selectedUser.role || 'N/A'} />
          <DetailRow label="Email" value={selectedUser.email || 'N/A'} />
          <DetailRow label="Phone" value={selectedUser.phone || 'N/A'} />
        </div>
      </div>
    </CollapsibleCard>
  )
}

export default UserDetails
