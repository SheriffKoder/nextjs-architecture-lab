/**
 * Action Utilities
 * 
 * Purpose: Centralized action configurations and handlers for the virtualized table
 * Used in: VirtualizedTable components and demo pages
 * Why: Provides reusable action logic with consistent styling and behavior
 * 
 * Steps:
 * 1. Import required icons and types
 * 2. Define action configurations with styling
 * 3. Define action handler functions
 * 4. Export reusable action utilities
 */

import { Eye, Edit, Trash2 } from "lucide-react";
import { TableItem } from "../types";

////////////////////////////////////
// Action Handler Types: Define function signatures
////////////////////////////////////

/**
 * Type for action click handler functions
 * Receives action key and row data for processing
 */
export type ActionHandler<T = any> = (action: string, row: T) => void;

////////////////////////////////////
// Action Handler Functions: Centralized action logic
////////////////////////////////////

/**
 * Default action handler for table actions
 * Handles common actions like view, edit, delete with console logging
 * Can be extended with actual API calls and business logic
 * 
 * @param {string} action - The type of action (view, edit, delete, etc.)
 * @param {TableItem} item - The row data for the action
 */
export const handleActionClick = (action: string, item: TableItem) => {
  // Log action item for debugging and demonstration purposes
  console.log(`Action "${action}" clicked for:`, item);
  
  // Handle different action types
  switch (action) {
    case "view":
      console.log("Opening view modal for:", 'item.name');
      // TODO: Implement view modal logic
      // openViewModal(item);
      break;
    case "edit":
      console.log("Opening edit form for:", item.name);
      // TODO: Implement edit form logic
      // openEditForm(item);
      break;
    case "delete":
      console.log("Confirming deletion for:", item.name);
      // TODO: Implement delete confirmation logic
      // showDeleteConfirmation(item);
      break;
    default:
      console.log("Unknown action:", action);
  }
};

/**
 * Async action handler with loading state support
 * Example of how to implement async actions with proper error handling
 * 
 * @param {string} action - The type of action
 * @param {TableItem} item - The row data
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const handleAsyncActionClick = async (
  action: string, 
  item: TableItem,
  onSuccess?: (action: string, item: TableItem) => void,
  onError?: (error: Error, action: string, item: TableItem) => void
) => {
  try {
    switch (action) {
      case "view":
        // await openViewModal(item);
        console.log("Opening view modal for:", item.name);
        break;
      case "edit":
        // await openEditForm(item);
        console.log("Opening edit form for:", item.name);
        break;
      case "delete":
        // const confirmed = await showDeleteConfirmation(item);
        // if (confirmed) {
        //   await deleteItem(item.id);
        // }
        console.log("Confirming deletion for:", item.name);
        break;
      default:
        console.log("Unknown action:", action);
    }
    
    onSuccess?.(action, item);
  } catch (error) {
    console.error(`Error in ${action} action:`, error);
    onError?.(error as Error, action, item);
  }
};

////////////////////////////////////
// Action Configurations: Define styling and behavior
////////////////////////////////////

/**
 * Helper function to create action configurations with row data binding
 * This ensures each action has access to the specific row data
 * 
 * @param {ActionHandler<T>} onActionClick - Handler function for action clicks
 * @param {T} rowData - The row data to bind to actions
 * @returns {Array} Array of action configurations with bound row data
 */
export const actionConfigs = <T = any>(onActionClick: ActionHandler<T>, rowData: T) => [
  {
    key: "view",
    icon: Eye,
    label: "View details",
    onClick: (e: React.MouseEvent) => onActionClick("view", rowData),
    // Blue theme for view action
    buttonPadding: "p-2",
    buttonBackground: "bg-info/5",
    buttonHoverBackground: "hover:bg-info/10",
    iconColor: "text-info",
    iconSize: 16,
    buttonBorderRadius: "rounded-md",
    buttonBorder: "border border-info"
  },
  {
    key: "edit",
    icon: Edit,
    label: "Edit item",
    onClick: (e: React.MouseEvent) => onActionClick("edit", rowData),
    // Green theme for edit action
    buttonPadding: "p-2",
    buttonBackground: "bg-success/5",
    buttonHoverBackground: "hover:bg-success/10",
    iconColor: "text-success",
    iconSize: 16,
    buttonBorderRadius: "rounded-md",
    buttonBorder: "border border-success"
  },
  {
    key: "delete",
    icon: Trash2,
    label: "Delete item",
    onClick: (e: React.MouseEvent) => onActionClick("delete", rowData),
    // Red theme for delete action
    buttonPadding: "p-2",
    buttonBackground: "bg-error/5",
    buttonHoverBackground: "hover:bg-error/10",
    iconColor: "text-error",
    iconSize: 16,
    buttonBorderRadius: "rounded-md",
    buttonBorder: "border border-error"
  }
];

/**
 * Create action configs with the default handler
 * Convenience function for quick setup
 * 
 * @param {T} rowData - The row data
 * @returns {Array} Array of action configurations with default handler
 */
export const createDefaultActionConfigs = <T extends TableItem = TableItem>(rowData: T) => {
  return actionConfigs(handleActionClick as ActionHandler<T>, rowData);
}; 