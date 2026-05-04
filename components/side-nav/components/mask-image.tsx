/**
 * Mask Image Component
 * 
 * Purpose: Renders an image using CSS mask properties for custom styling
 * Used in: Navigation links, buttons, and other UI elements requiring masked images
 * Why: Provides flexible image rendering with custom colors, gradients, and opacity control
 * 
 * Implementation Steps:
 * 1. Create component with organized props interface
 * 2. Use CSS mask properties for image rendering
 * 3. Support custom sizing and styling
 * 4. Apply background color or gradient through mask composite
 * 5. Support additional className for custom styling
 * 6. Add gradient support with direction and color stops
 */

import React from 'react'

/**
 * Gradient configuration interface
 * @interface GradientConfig
 */
interface GradientConfig {
  /** Gradient direction (e.g., 'to right', 'to bottom', '45deg') */
  direction: string
  /** Array of color stops with positions (e.g., ['#ff0000 0%', '#00ff00 100%']) */
  colors: string[]
}

/**
 * Mask Image component props interface
 * @interface MaskImageProps
 */
interface MaskImageProps {
  /** Width of the image in pixels */
  width: number
  /** Height of the image in pixels */
  height: number
  /** URL path to the image file */
  image: string
  /** Size of the mask relative to container (e.g., '80%', '100%') */
  maskSize?: string
  /** Background color class for the masked area (used when gradient is not provided) */
  bgColor?: string
  /** Gradient configuration (takes precedence over bgColor when provided) */
  gradient?: GradientConfig
  /** Additional CSS classes for custom styling */
  className?: string
}

/**
 * Mask Image component
 * 
 * Renders an image using CSS mask properties, allowing for custom colors,
 * gradients, and styling while maintaining the original image shape.
 * 
 * @param {MaskImageProps} props - Component props
 * @returns {JSX.Element} Masked image element
 * 
 * @example
 * ```tsx
 * // Solid color
 * <MaskImage
 *   width={20}
 *   height={20}
 *   image="/images/icons/leaf.png"
 *   maskSize="90%"
 *   bgColor="bg-primary"
 *   className="opacity-75"
 * />
 * 
 * // Gradient
 * <MaskImage
 *   width={20}
 *   height={20}
 *   image="/images/icons/leaf.png"
 *   maskSize="90%"
 *   gradient={{
 *     direction: 'to right',
 *     colors: ['#ff0000 0%', '#00ff00 100%']
 *   }}
 *   className="opacity-75"
 * />
 * ```
 */
const MaskImage = ({
  width,
  height,
  image,
  maskSize = '80%',
  bgColor,
  gradient,
  className
}: MaskImageProps) => {
  ///////////////////////
  // Generate background style based on props
  const getBackgroundStyle = () => {
    if (gradient) {
      const gradientString = `linear-gradient(${gradient.direction}, ${gradient.colors.join(', ')})`
      return { background: gradientString }
    }
    if (bgColor) {
      // If bgColor is a hex value (starts with #), use it directly
      if (bgColor.startsWith('#')) {
        return { backgroundColor: bgColor }
      }
      // Otherwise, return empty object to let Tailwind handle it
      return {}
    }
    return {}
  }

  const backgroundStyle = getBackgroundStyle()

  return (
    <div style={{ height: `${height}px`, width: `${width}px` }}>
      <div 
        className='h-full w-full'
        style={{
          maskImage: `url(${image})`,
          maskSize: `${maskSize}`,
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          maskComposite: 'xor',
        }}
      >
        <div 
          className={`h-full w-full ${bgColor || ''} ${className || ''}`}
          style={backgroundStyle}
        >
        </div>
      </div>
    </div>
  )
}

export default MaskImage
