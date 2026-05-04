import CollapsibleCard from '@/components/design/CollapsibleCard-sm'
import DetailRow from '@/components/design/slider/detail-row'
import { ChevronDownIcon } from 'lucide-react'
import React from 'react'
import { ProjectBoardTableItem } from '../../config/table-config'
import { formatCurrency, formatDate, formatPercentage } from '@/utils/formatters'
import { capitalizeAllFirstLetters } from '@/lib/utils'

const ProjectDetails = ({ selectedProject }: { selectedProject: ProjectBoardTableItem }) => {

    if (!selectedProject) {
        return null
    }

    return (
    <CollapsibleCard 
    headerText="Project Details"
    rightIcon={ChevronDownIcon}
    defaultOpen={true}
    variant="sm"
  >
    <div className="">
      {/* Project Information */}
      <div className="mt-0">
        <h3 className="text-xs font-semibold text-tertiary uppercase tracking-wider px-3 py-2
        border-b border-foreground/10">Project Information</h3>
        <DetailRow label="Address" value={selectedProject.address} />
        <DetailRow label="Title Company" value={selectedProject.company?.name} />
        {selectedProject.lender_org && <DetailRow label="Lender" value={selectedProject.lender_org?.name} />}
        <DetailRow label="Status" value={capitalizeAllFirstLetters(selectedProject.status)} />
      </div>

      {/* Purchase Details */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold text-tertiary uppercase tracking-wider px-3 py-2
        border-b border-foreground/10">Purchase Details</h3>
        <DetailRow label="Purchase Price" value={formatCurrency(selectedProject.purchase_price)} />
        <DetailRow label="Purchase Closing Date" value={formatDate(selectedProject.purchase_closing_date)} />
      </div>

      {/* Financials */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold text-tertiary uppercase tracking-wider px-3 py-2
        border-b border-foreground/10">Financials</h3>
        <DetailRow label="Rehab Budget" value={formatCurrency(selectedProject.rehab_budget)} />
        <DetailRow label="After Repair Value" value={formatCurrency(selectedProject.after_repair_value)} />
        <DetailRow label="Mortgage Amount" value={formatCurrency(selectedProject.mortgage_amount)} />
        <DetailRow label="Total Cost" value={formatCurrency(selectedProject.total_cost)} />
        <DetailRow label="Equity" value={formatCurrency(selectedProject.equity)} />
      </div>

      {/* Investor Details */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold text-tertiary uppercase tracking-wider px-3 py-2
        border-b border-foreground/10">Investor Details</h3>
        <DetailRow label="Investor Current Value" value={formatCurrency(selectedProject.investor_current_value)} />
        <DetailRow label="Investor Capital" value={formatCurrency(selectedProject.investor_capital)} />
        <DetailRow label="Leverage Percentage" value={formatPercentage(selectedProject.leverage_percentage)} />
      </div>

      {/* Metadata */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold text-tertiary uppercase tracking-wider px-3 py-2
        border-b border-foreground/10">Metadata</h3>
        <DetailRow label="Created At" value={formatDate(selectedProject.created_at)} />
        <DetailRow label="Updated At" value={formatDate(selectedProject.updated_at)} />
      </div>
    </div>
  </CollapsibleCard>
  )
}

export default ProjectDetails
