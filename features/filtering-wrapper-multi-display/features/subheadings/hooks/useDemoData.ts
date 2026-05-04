/**
 * useDemoData Hook
 * 
 * Purpose: Generates mock data for the virtualized table demo
 * Used in: app/virtualized-table/page.tsx
 * Why: Provides realistic test data to demonstrate table performance with large datasets
 * 
 * Steps:
 * 1. Initialize empty data array and loading state
 * 2. Generate 20,000 mock items with realistic properties
 * 3. Simulate network delay for realistic UX
 * 4. Return data and loading state for component consumption
 */

import { useState, useEffect } from "react";
// Import table item type from new types folder structure
import { TableItem } from "../../../types/table-item";

/**
 * Custom hook that generates mock data for virtualized table demonstration
 * 
 * @returns {Object} Object containing data array and loading state
 * @returns {TableItem[]} returns.data - Array of mock items for table display
 * @returns {boolean} returns.loading - Loading state indicator
 * 
 * @example
 * ```tsx
 * const { data, loading } = useDemoData();
 * if (loading) return <LoadingSpinner />;
 * return <VirtualizedTable data={data} />;
 * ```
 */
export function useDemoData() {
  ////////////////////////////////////
  // State Management: Track data and loading state
  ////////////////////////////////////
  
  // Store the generated mock data items
  const [data, setData] = useState<TableItem[]>([]);
  // Track whether data is still being generated (for loading UI)
  const [loading, setLoading] = useState(true);

  ////////////////////////////////////
  // Data Generation: Create realistic mock dataset
  ////////////////////////////////////
  
  // Generate large dataset - runs once on component mount
  useEffect(() => {
    /**
     * Internal function to generate mock data items
     * Creates 20,000 items with realistic properties for table demonstration
     */
    const generateData = () => {
      // Define possible status values for realistic data variety
      const statuses = ["pending", "completed", "cancelled", "active"];
      // Initialize empty array to store generated items
      const items: TableItem[] = [];
      
      // Generate 20,000 items for performance testing
      for (let i = 0; i < 20000; i++) {
        // Generate a random date within the last year for realistic timestamps
        const randomDate = new Date(Date.now() - Math.random() * 31536000000);
        
        // Format date as MM/DD/YYYY for consistent display
        const month = String(randomDate.getMonth() + 1).padStart(2, '0');
        const day = String(randomDate.getDate()).padStart(2, '0');
        const year = randomDate.getFullYear();
        const formattedDate = `${month}/${day}/${year}`;
        
        // Format time as HH:MM:SS for precise time tracking
        const hours = String(randomDate.getHours()).padStart(2, '0');
        const minutes = String(randomDate.getMinutes()).padStart(2, '0');
        const seconds = String(randomDate.getSeconds()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}:${seconds}`;
        
        // Create descriptive name with reasonable length (1-3 lines max)
        const shortNames = [
          "John Doe",
          "Jane Smith", 
          "Bob Johnson",
          "Alice Brown",
          "Charlie Wilson"
        ];
        
        const mediumNames = [
          "This is a medium length name for testing purposes",
          "Lorem ipsum dolor sit amet consectetur adipiscing",
          "The quick brown fox jumps over the lazy dog",
          "Pellentesque euismod nisi vel consectetur euismod",
          "Extra long entry for overflow demonstration"
        ];
        
        const longNames = [
          "This is a very long name that will definitely wrap to multiple lines in the table cell",
          "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt",
          "The quick brown fox jumps over the lazy dog and this text continues to demonstrate wrapping",
          "Pellentesque euismod nisi vel consectetur euismod nunc tincidunt nunc pulvinar sapien",
          "Extra long entry for overflow demonstration purposes to test dynamic row height calculation"
        ];
        
        // Randomly choose 1, 2, or 3 lines
        const lineCount = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 lines
        let name;
        
        if (lineCount === 1) {
          name = shortNames[Math.floor(Math.random() * shortNames.length)];
        } else if (lineCount === 2) {
          name = mediumNames[Math.floor(Math.random() * mediumNames.length)];
        } else {
          name = longNames[Math.floor(Math.random() * longNames.length)];
        }
        // Create individual item with all required properties
        items.push({
          // Generate unique ID with zero-padding for consistent sorting
          id: `ID-${i.toString().padStart(5, '0')}`,
          // Create descriptive name for easy identification (random length)
          name,
          // Generate random amount between 0-100 with 2 decimal places
          amount: Math.round(Math.random() * 10000) / 100,
          // Use formatted date for display consistency
          date: formattedDate, // to be formatted for display in the column formatter
          // Date picker field in YYYY-MM-DD format for custom date filtering
          datepicker: randomDate.toISOString().split('T')[0],
          // Use formatted time for precise tracking
          time: formattedTime,
          // Randomly assign status from predefined options
          status: statuses[Math.floor(Math.random() * statuses.length)]
        });
      }
      
      // Update state with generated data and mark loading as complete
      setData(items);
      setLoading(false);
    };
    
    // Simulate network delay for realistic user experience (500ms)
    setTimeout(generateData, 500);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Return data and loading state for component consumption
  return { data, loading };
} 