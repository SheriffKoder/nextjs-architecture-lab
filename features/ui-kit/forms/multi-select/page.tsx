/**
 * User Filter Development Page
 * 
 * Purpose: Test and demonstrate the user filter dropdown component
 */

'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import DropdownSelect from './dropdown-select'
import { getLabelClassName } from './utils/label-config'

interface DropdownItem {
  id: string | number
  label: string
  value: any
}

const MOCK_USERS: DropdownItem[] = [
  { id: '1', label: 'Alex Rivera', value: { id: '1', name: 'Alex Rivera', email: 'alex@example.com' } },
  { id: '2', label: 'Jordan Lee', value: { id: '2', name: 'Jordan Lee', email: 'jordan@example.com' } },
  { id: '3', label: 'Sam Chen', value: { id: '3', name: 'Sam Chen', email: 'sam@example.com' } },
  { id: '4', label: 'Taylor Brooks', value: { id: '4', name: 'Taylor Brooks', email: 'taylor@example.com' } },
]

export default function UserFilterPage() {
  const [users] = useState<DropdownItem[]>(MOCK_USERS)
  const [selectedUsers, setSelectedUsers] = useState<DropdownItem[]>([])

  return (
    <div className="min-h-screen p-8 bg-gray-50" id="multi-select-2">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">User Filter Component</h1>
        <p className="text-gray-600 mb-8">
          Reusable dropdown component with search, checkboxes, and multi-select functionality.
        </p>

        {/* Component Demo */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Component Demo</h2>
          <div className="flex items-center justify-center min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="w-full max-w-md">
              <DropdownSelect 
                icon={Users} // Button icon
                buttonText="Filter Users" // Button text
                items={users} // List of items to display in the dropdown
                selectedItems={selectedUsers} // external state to store selected items for highlighting and counting
                onSelectionChange={(items: DropdownItem[]) => {
                    setSelectedUsers(items) // update the external state when items are selected
                }}
                searchPlaceholder="Search users..." // placeholder for the search input
                searchable={true} // whether to show the search input
                width="100%" // width of the dropdown
                maxHeight="400px" // max height of the dropdown
                selectedText="users" // to display "All users are selected" or "1/8 users selected"
                showSelectedItems={true} // to show selected items as comma-separated list in button (when not all selected)
                showItemCount={true} // show count indicator next to each item
                countBy="email" // count by email property
                groupBy="label" // group items by label (items with same label will appear as one item)
                 getLabelClassName={getLabelClassName}
              />
            </div>
          </div>
        </div>

        {/* Selected Users */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Selected Users</h2>
          {selectedUsers.length === 0 ? (
            <p className="text-gray-500">No users selected</p>
          ) : (
            <ul className="space-y-2">
              {selectedUsers.map((user) => (
                <li key={user.id} className="p-2 bg-gray-50 rounded">
                  {user.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Multi-select with checkboxes</li>
            <li>• Search functionality</li>
            <li>• Select all / Deselect all</li>
            <li>• Customizable icon and button text</li>
            <li>• Configurable width and max height</li>
            <li>• Keyboard navigation support</li>
            <li>• Group items by property (groupBy prop)</li>
            <li>• Show count indicators for items (showItemCount prop)</li>
            <li>• Toggle checkboxes visibility (showCheckboxes prop)</li>
            <li>• Custom label styling via function (getLabelClassName prop)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
