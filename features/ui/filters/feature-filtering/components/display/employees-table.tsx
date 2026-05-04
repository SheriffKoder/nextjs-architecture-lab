/**
 * Employees Table Component
 * 
 * Purpose: Displays employees data in a table-like layout using divs
 * Used in: Pages that need to display employee data
 * Why: Provides a clean, responsive table layout without HTML table elements
 * 
 * Function Index:
 * - EmployeesTable: Component that renders employees in a table format
 *   Example input: <EmployeesTable employees={employees} />
 *   Example output: Table with employee data displayed in rows
 * 
 * Steps:
 * 1. Define props interface with employees array
 * 2. Create header row with column labels
 * 3. Map over employees to create data rows
 * 4. Style using Tailwind CSS for table-like appearance
 */

import React from "react"
import type { Employee } from "@/features/ui/filters/page-server/feature-config-server/data-source"

//////////////////////////////////
// Component Props
//////////////////////////////////

/**
 * EmployeesTable component props
 * WHY: Type-safe props for the component
 * HOW: Defines employees array as required prop
 */
interface EmployeesTableProps {
  employees: Employee[]
}

//////////////////////////////////
// Helper Functions
//////////////////////////////////

/**
 * Format currency amount
 * WHY: Display salary in readable format
 * HOW: Convert number to currency string
 * @param {number} salary - Salary to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(salary: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(salary)
}

/**
 * Format status badge color
 * WHY: Visual distinction between statuses
 * HOW: Return appropriate Tailwind class based on status
 * @param {string} status - Employee status
 * @returns {string} Tailwind CSS class for badge color
 */
function getStatusColor(status: Employee["status"]): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "inactive":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

/**
 * Format status label
 * WHY: Display human-readable status labels
 * HOW: Capitalize status string
 * @param {string} status - Employee status
 * @returns {string} Formatted status label
 */
function formatStatus(status: Employee["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

/**
 * Format role label
 * WHY: Display human-readable role labels
 * HOW: Capitalize role string
 * @param {string} role - Employee role
 * @returns {string} Formatted role label
 */
function formatRole(role: Employee["role"]): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

//////////////////////////////////
// Main Component
//////////////////////////////////

/**
 * Employees table component
 * WHY: Display employees in a clean table format using divs
 * HOW: Renders header row and maps over employees to create data rows
 * @param {EmployeesTableProps} props - Component props
 * @param {Employee[]} props.employees - Array of employees to display
 * @returns {React.ReactElement} Table component with employees data
 */
export function EmployeesTable({ employees }: EmployeesTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      {/* Table Container */}
      {/* WHY: Provides scrollable container for responsive design */}
      {/* HOW: Uses overflow-x-auto for horizontal scrolling on small screens */}
      <div className="min-w-full border rounded-lg overflow-hidden">
        {/* Header Row */}
        {/* WHY: Displays column labels */}
        {/* HOW: Grid layout with consistent column widths */}
        <div className="grid grid-cols-7 gap-4 p-4 bg-muted font-semibold text-sm border-b">
          <div className="col-span-1">ID</div>
          <div className="col-span-1">Name</div>
          <div className="col-span-1">Email</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Role</div>
          <div className="col-span-1">Department</div>
          <div className="col-span-1">Salary</div>
        </div>

        {/* Data Rows */}
        {/* WHY: Display each employee's data */}
        {/* HOW: Map over employees array and render row for each employee */}
        {employees.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No employees found
          </div>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="grid grid-cols-7 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
            >
              {/* ID */}
              <div className="col-span-1 text-sm font-mono text-muted-foreground">
                {employee.id}
              </div>

              {/* Name */}
              <div className="col-span-1">
                <div className="font-medium">{employee.name}</div>
              </div>

              {/* Email */}
              <div className="col-span-1 text-sm text-muted-foreground">
                {employee.email}
              </div>

              {/* Status */}
              <div className="col-span-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    employee.status
                  )}`}
                >
                  {formatStatus(employee.status)}
                </span>
              </div>

              {/* Role */}
              <div className="col-span-1 text-sm">
                {formatRole(employee.role)}
              </div>

              {/* Department */}
              <div className="col-span-1 text-sm">
                {employee.department}
              </div>

              {/* Salary */}
              <div className="col-span-1 text-sm font-medium">
                {formatCurrency(employee.salary)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
