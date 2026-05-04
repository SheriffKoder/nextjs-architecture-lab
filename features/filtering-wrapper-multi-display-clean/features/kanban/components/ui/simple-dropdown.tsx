/**
 * Simple Dropdown Component
 * 
 * Purpose: A simple dropdown component that works with any type of data
 * Used in: Forms and other components that need simple dropdown selection
 * Why: Provides a lightweight alternative to the complex DropdownSelect component
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Simple dropdown item interface
 */
interface SimpleDropdownItem {
  id: string | number
  label: string
  value: any
}

/**
 * Simple dropdown props interface
 */
interface SimpleDropdownProps {
  items: SimpleDropdownItem[]
  selectedValue: any
  onSelectionChange: (value: any) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Simple dropdown component
 * @param {SimpleDropdownProps} props - Component props
 * @returns {JSX.Element} Simple dropdown component
 */
export default function SimpleDropdown({
  items,
  selectedValue,
  onSelectionChange,
  placeholder = "Select an option",
  disabled = false,
  className = ""
}: SimpleDropdownProps) {
  ///////////////////////
  // State management
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  ///////////////////////
  // Get selected item
  const selectedItem = items.find(item => item.value === selectedValue)

  ///////////////////////
  // Calculate dropdown position - allows to calculate if the dropdown should be above or below the button based on available space vertically
  const calculatePosition = () => {
    if (!buttonRef.current) return 'bottom'
    
    const buttonRect = buttonRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = Math.min(items.length * 40 + 20, 240) // Approximate dropdown height
    
    // Check if dropdown would go below viewport
    if (buttonRect.bottom + dropdownHeight > viewportHeight) {
      return 'top'
    }
    
    return 'bottom'
  }

  ///////////////////////
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  ///////////////////////
  // Handle item selection
  const handleItemClick = (item: SimpleDropdownItem) => {
    onSelectionChange(item.value)
    setIsOpen(false)
  }

  ///////////////////////
  // Handle button click
  const handleButtonClick = () => {
    if (!disabled) {
      const newPosition = calculatePosition()
      setDropdownPosition(newPosition)
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Button */}
      <button
        type="button"
        ref={buttonRef}
        onClick={handleButtonClick}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left border  rounded-md 
          focus:outline-none focus:ring-1 focus:ring-white ring-offset-0
          ${disabled 
            ? 'bg-white/20 text-gray-400 cursor-not-allowed border-gray-300/10' 
            : 'bg-white hover:bg-gray-50 cursor-pointer border-gray-300'
          }
          ${selectedItem ? 'text-gray-900' : 'text-gray-500'}
        `}
      >
        <div className="flex items-center justify-between">
          <span className="truncate text-sm">
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <ChevronDown 
            className={`h-4 w-4 text-gray-900 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-auto
          ${dropdownPosition === 'bottom' ? 'mt-1' : 'mb-1 bottom-full'}
        `}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              className={`
                w-full px-3 py-2 text-left  transition-colors duration-150 text-sm
                ${item.value === selectedValue 
                  ? 'bg-black text-white border-l-2 border-black hover:bg-black/80' 
                  : 'text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 