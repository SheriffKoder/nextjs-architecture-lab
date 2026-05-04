/**
 * Data Source
 * 
 * Purpose: Centralized dataset for employees used across RSC and client pages
 * Used in: mock-data.ts (RSC) and handler.ts (client TanStack Query)
 * Why: Single source of truth for employee data, ensures consistency
 * 
 * Function Index:
 * - employees: Array of employee objects with all required fields
 *   Example output: Array of employee objects with id, name, email, status, role, department, salary, createdAt
 * 
 * Steps:
 * 1. Define Employee interface with salary field
 * 2. Create comprehensive array of mock employee data
 * 3. Export for use in both RSC and client components
 */

/**
 * Employee interface
 * WHY: Type-safe employee data structure
 * HOW: Defines all properties an employee should have including salary
 */
export interface Employee {
  id: string
  name: string
  email: string
  status: "active" | "inactive" | "pending"
  role: "admin" | "user" | "manager" | "developer"
  department: string
  salary: number
  createdAt: string
}

/**
 * Mock employee data
 * WHY: Provides sample data for filtering demonstration
 * HOW: Array of employee objects with various statuses, roles, departments, and salaries
 */
export const employees: Employee[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "active",
    role: "admin",
    department: "Engineering",
    salary: 95000,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "active",
    role: "manager",
    department: "Product",
    salary: 110000,
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    status: "inactive",
    role: "developer",
    department: "Engineering",
    salary: 85000,
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice.williams@example.com",
    status: "active",
    role: "user",
    department: "Sales",
    salary: 65000,
    createdAt: "2024-01-05",
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    status: "pending",
    role: "developer",
    department: "Engineering",
    salary: 80000,
    createdAt: "2024-04-01",
  },
  {
    id: "6",
    name: "Diana Prince",
    email: "diana.prince@example.com",
    status: "active",
    role: "admin",
    department: "HR",
    salary: 92000,
    createdAt: "2024-02-14",
  },
  {
    id: "7",
    name: "Edward Norton",
    email: "edward.norton@example.com",
    status: "inactive",
    role: "user",
    department: "Marketing",
    salary: 70000,
    createdAt: "2024-03-25",
  },
  {
    id: "8",
    name: "Fiona Apple",
    email: "fiona.apple@example.com",
    status: "active",
    role: "manager",
    department: "Product",
    salary: 105000,
    createdAt: "2024-01-30",
  },
  {
    id: "9",
    name: "George Lucas",
    email: "george.lucas@example.com",
    status: "active",
    role: "developer",
    department: "Engineering",
    salary: 88000,
    createdAt: "2024-02-10",
  },
  {
    id: "10",
    name: "Helen Keller",
    email: "helen.keller@example.com",
    status: "active",
    role: "user",
    department: "Sales",
    salary: 68000,
    createdAt: "2024-03-15",
  },
  {
    id: "11",
    name: "Isaac Newton",
    email: "isaac.newton@example.com",
    status: "active",
    role: "developer",
    department: "Engineering",
    salary: 90000,
    createdAt: "2024-01-20",
  },
  {
    id: "12",
    name: "Julia Roberts",
    email: "julia.roberts@example.com",
    status: "pending",
    role: "manager",
    department: "Marketing",
    salary: 98000,
    createdAt: "2024-04-05",
  },
]
