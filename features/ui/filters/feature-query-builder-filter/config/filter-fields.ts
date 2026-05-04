/**
 * Filter Fields Configuration
 * 
 * Purpose: Define available fields for filtering
 * Used in: Field selector component and filter builder
 * Why: Centralized configuration for filterable fields
 */

import type { FilterField } from '../types/field'

export const filterFields: FilterField[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "status", label: "Status", type: "text" },
  { key: "createdAt", label: "Created Date", type: "date" },
  { key: "updatedAt", label: "Updated Date", type: "date" },
  { key: "amount", label: "Amount", type: "number" },
  { key: "salary", label: "Salary", type: "number" },
]
