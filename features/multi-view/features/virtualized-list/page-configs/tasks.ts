/**
 * Task Table Item Type Definition
 * 
 * Purpose: Defines the TypeScript interface for task table items
 * Used in: Virtualized table components for task data
 * Why: Provides type safety for task data structure
 */

/**
 * Task table item interface
 * Represents a task with all its properties for table display
 */
export interface TaskTableItem {
  id: string;
  title?: string;
  summary?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  created_at?: string;
  project_id?: string;
  project_name?: string;
  assignedUsers?: Array<{
    id: string;
    name?: string;
    email?: string;
  }>;
  parent_id?: string | null;
  [key: string]: any; // Allow additional properties
}
