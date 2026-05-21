/**
 * Field Types
 * 
 * Purpose: TypeScript types for filter fields
 * Used in: Field configuration and field selector components
 * Why: Provides type safety for field definitions
 */

export type FieldType = "text" | "date" | "number"

export interface FilterField {
  key: string
  label: string
  type: FieldType
}
