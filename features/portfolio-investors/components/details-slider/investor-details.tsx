import CollapsibleCard from '@/components/design/CollapsibleCard-sm'
import DetailRow from '@/components/design/slider/detail-row'
import { ChevronDownIcon } from 'lucide-react'
import React from 'react'
import { InvestorTableItem } from '../../config/table-config'

/** Org from GET /api/orgs with members */
interface InvestorOrg {
  id: string
  name: string
  members?: Array<{ user?: { name: string | null; email: string | null; phone?: string | null } }>
  totalInvested?: number
  projectsCount?: number
}

interface InvestorDetailsProps {
  selectedInvestor: InvestorTableItem
  selectedOrg: InvestorOrg | null
}

const InvestorDetails = ({ selectedInvestor, selectedOrg }: InvestorDetailsProps) => {
  if (!selectedInvestor) {
    return null
  }

  const org = selectedOrg
  const firstMember = org?.members?.[0]?.user
  const displayName = firstMember?.name ?? org?.name ?? selectedInvestor.name ?? 'N/A'
  const displayEmail = firstMember?.email ?? selectedInvestor.email ?? 'N/A'
  const displayPhone = firstMember?.phone ?? 'N/A'
  const displayTotalInvested = org?.totalInvested ? `$${org.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N/A'

  return (
    <CollapsibleCard 
      headerText="Investor Details"
      rightIcon={ChevronDownIcon}
      defaultOpen={true}
      variant="sm"
    >
      <div className="">
        <div className="mt-0">
          <DetailRow label="Company Name" value={displayName} />
          <DetailRow label="Email" value={displayEmail} />
          <DetailRow label="Phone" value={displayPhone} />
          <DetailRow label="Total Invested" value={displayTotalInvested} />
          <DetailRow label="Projects Count" value={org?.projectsCount ?? 'N/A'} />
        </div>
      </div>
    </CollapsibleCard>
  )
}

export default InvestorDetails
