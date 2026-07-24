/**
 * Accordion Configuration
 * 
 * Purpose: Configuration for column grouping in accordion/collapsible sections
 * Used in: Table views that support column grouping
 * Why: Allows organizing columns into collapsible groups for better UX
 */

/**
 * Accordion configuration for grouping columns
 * WHY: Groups related columns together in collapsible sections
 * HOW: Defines groups with IDs, names, and styling
 * 
 * Groups: Vehicle Details (color, licensePlate)
 */
export const accordionConfig = {
  groups: [
    {
      id: 'vehicle-details',
      name: 'Vehicle Details',
      color: 'bg-tertiary',
      textColor: 'text-white',
      borderColor: 'border-tertiary',
    },
  ],
  allowMultipleOpen: true, // Allow multiple groups to be open at once
  defaultOpenGroup: 'vehicle-details', // Open vehicle details by default
};
