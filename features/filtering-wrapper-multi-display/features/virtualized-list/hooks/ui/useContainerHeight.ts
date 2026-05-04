/**
 * useContainerHeight Hook
 * 
 * Purpose: Provides dynamic height calculation for responsive components
 * Used in: VirtualizedTable and other components that need responsive height
 * Why: Centralizes height calculation logic for reusability and consistency
 * 
 * Features:
 * - Automatic height calculation from container ref
 * - Window resize handling
 * - Optional fixed height override
 * - Cleanup on unmount
 * 
 * Steps:
 * 1. Create ref for container element
 * 2. Calculate initial height
 * 3. Set up resize listener
 * 4. Return ref and calculated height
 */

import { useRef, useEffect, useState } from 'react';

////////////////////////////////////
// Hook Parameters and Return Types
////////////////////////////////////

/**
 * Parameters for the useContainerHeight hook
 */
interface UseContainerHeightParams {
  // Optional fixed height to use instead of calculating from container
  fixedHeight?: number;
  // Minimum height to ensure (default: 200px)
  minHeight?: number;
  // Whether to enable window resize listener (default: true)
  enableResizeListener?: boolean;
}

/**
 * Return values from the useContainerHeight hook
 */
interface UseContainerHeightReturn {
  // Ref to attach to the container element
  containerRef: React.RefObject<HTMLDivElement | null>;
  // Calculated height (either fixed or from container)
  height: number;
  // Whether the height is from container calculation (not fixed)
  isDynamic: boolean;
}

////////////////////////////////////
// Hook Implementation: Dynamic height calculation
////////////////////////////////////

/**
 * Hook for calculating dynamic container height with resize handling
 * 
 * @param {UseContainerHeightParams} params - Hook parameters
 * @returns {UseContainerHeightReturn} Container ref and calculated height
 * 
 * @example
 * ```tsx
 * const { containerRef, height, isDynamic } = useContainerHeight({
 *   fixedHeight: 500,
 *   minHeight: 200
 * });
 * 
 * return (
 *   <div ref={containerRef} className="h-full">
 *     <Component height={height} />
 *   </div>
 * );
 * ```
 */
export function useContainerHeight({
  fixedHeight,
  minHeight = 200,
  enableResizeListener = true
}: UseContainerHeightParams = {}): UseContainerHeightReturn {
  ////////////////////////////////////
  // State and Refs: Container reference and height tracking
  ////////////////////////////////////
  
  // Reference to the container element for height calculation
  const containerRef = useRef<HTMLDivElement>(null);
  // State to track the calculated height
  const [height, setHeight] = useState(fixedHeight || minHeight);

  ////////////////////////////////////
  // Height Calculation: Dynamic height calculation logic
  ////////////////////////////////////
  
  useEffect(() => {
    // If fixed height is provided, use it directly
    if (fixedHeight) {
      setHeight(fixedHeight);
      return;
    }

    // Function to update height from container
    const updateHeight = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        // Ensure minimum height
        const calculatedHeight = Math.max(containerHeight, minHeight);
        setHeight(calculatedHeight);
      }
    };

    // Calculate initial height
    updateHeight();

    // Set up resize listener if enabled
    if (enableResizeListener) {
      window.addEventListener('resize', updateHeight);
      
      // Cleanup function
      return () => {
        window.removeEventListener('resize', updateHeight);
      };
    }
  }, [fixedHeight, minHeight, enableResizeListener]);

  ////////////////////////////////////
  // Return Values: Container ref and calculated height
  ////////////////////////////////////
  
  return {
    containerRef,
    height,
    isDynamic: !fixedHeight
  };
}

// Export default for convenience
export default useContainerHeight; 