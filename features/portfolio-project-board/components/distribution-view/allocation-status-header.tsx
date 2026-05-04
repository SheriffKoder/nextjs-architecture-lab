import React from 'react'
import { Badge } from '@/components/ui/badge'

interface AllocationStatusHeaderProps {
  status: string
}

const AllocationStatusHeader = ({ status }: AllocationStatusHeaderProps) => {
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'active' || statusLower === 'completed') {
      return 'default'
    }
    if (statusLower === 'pending' || statusLower === 'processing') {
      return 'secondary'
    }
    if (statusLower === 'failed' || statusLower === 'cancelled') {
      return 'destructive'
    }
    return 'outline'
  }

  const getStatusDisplayName = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground">Allocation Status</span>
      <Badge variant={getStatusVariant(status)}>
        {getStatusDisplayName(status)}
      </Badge>
    </div>
  )
}

export default AllocationStatusHeader
