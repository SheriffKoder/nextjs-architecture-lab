/**
 * Dropdown Select Component
 * 
 * Purpose: Reusable dropdown component with search, checkboxes, and configurable options
 * Used in: Dashboard page for user filtering, and other pages requiring multi-select dropdowns
 * Why: Provides consistent UI pattern for filtering and selection across the application
 * 
 * Implementation Steps:
 * 1. Create configurable dropdown button with icon, text, and chevron
 * 2. Implement absolute positioned dropdown menu
 * 3. Add search functionality with debounced input
 * 4. Create checkbox list with select all/none options
 * 5. Handle keyboard navigation and accessibility
 * 6. Implement click outside to close functionality
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { LucideIcon, ChevronDown, Search, Check, X } from 'lucide-react'
import { getNestedValue } from './utils/get-nested-value'
import { 
  getGroupValue, 
  groupItems, 
  getDisplayItems, 
  filterDisplayItems,
  type DropdownItem,
  type GroupedItem
} from './utils/grouping'
import { getItemCount } from './utils/get-count'

/**
 * Dropdown select props interface
 * @interface DropdownSelectProps
 */
interface DropdownSelectProps {
  // Button configuration
  icon?: LucideIcon // Optional; omit for single-choice role-style dropdowns with no left icon
  buttonText: string
  placeholder?: string
  selectedText?: string // Text to use in selection count (e.g., "scopes", "items")
  showSelectedItems?: boolean // Show selected items as comma-separated list in button (when not all selected)
  
  // Data and selection
  items: DropdownItem[]
  selectedItems: DropdownItem[]
  onSelectionChange: (items: DropdownItem[]) => void
  
  // Search configuration
  searchPlaceholder?: string
  searchable?: boolean
  
  // Display configuration
  maxHeight?: string
  width?: string
  disabled?: boolean
  showItemCount?: boolean // Show count indicator next to each item
  showCheckboxes?: boolean // Show checkboxes next to items (default: true)
  countBy?: string | ((item: DropdownItem) => any) // Property to count by, or function to get count value
  groupBy?: string | ((item: DropdownItem) => any) // Property to group by, or function to get group value
  getLabelClassName?: (item: DropdownItem) => string // Function to get custom className for item labels
  singleChoice?: boolean // Allow only one item to be selected at a time
  hideTopButtons?: boolean // Hide "Select All" and "Clear All" buttons
  
  // Custom styling
  className?: string
  buttonClassName?: string
  menuClassName?: string
  buttonHeight?: string // Height of the dropdown button (e.g., '38px')
}

/**
 * Reusable dropdown select component with search and multi-select functionality
 * @param {DropdownSelectProps} props - Component configuration props
 * @returns {JSX.Element} Dropdown select component
 */
export default function DropdownSelect({
  icon: Icon,
  buttonText,
  placeholder = 'Select items...',
  selectedText,
  showSelectedItems = false,
  items,
  selectedItems,
  onSelectionChange,
  searchPlaceholder = 'Search...',
  searchable = true,
  maxHeight = '300px',
  width = '300px',
  disabled = false,
  showItemCount = false,
  showCheckboxes = true,
  countBy,
  groupBy,
  getLabelClassName,
  singleChoice = false,
  hideTopButtons = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  buttonHeight
}: DropdownSelectProps) {
  const showIcon = Icon != null
  ///////////////////////
  // State management for dropdown functionality
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  
  ///////////////////////
  // Refs for DOM manipulation and accessibility
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  ///////////////////////
  // Group items based on groupBy prop
  // Reason: Combine items with same group value into single display items
  const groupedItemsMap = groupItems(items, groupBy, getNestedValue)

  ///////////////////////
  // Get group value helper function
  // Reason: Wrapper to pass groupBy to utility function
  const getGroupValueForItem = (item: DropdownItem): any => {
    return getGroupValue(item, groupBy, getNestedValue)
  }

  ///////////////////////
  // Get display items (grouped or ungrouped)
  // Reason: Return items to display in dropdown
  const displayItems = getDisplayItems(items, groupedItemsMap)

  ///////////////////////
  // Filter items based on search term
  // Reason: Need to show only matching items when user searches
  const filteredItems = filterDisplayItems(
    displayItems,
    searchTerm,
    groupedItemsMap,
    getGroupValueForItem
  )

  ///////////////////////
  // Get count for an item
  // Reason: Calculate how many items in data match this item
  const getItemCountForDisplay = (item: DropdownItem): number => {
    return getItemCount(
      item,
      showItemCount,
      items,
      countBy,
      !!groupBy,
      groupedItemsMap,
      getGroupValueForItem,
      getNestedValue
    )
  }

  ///////////////////////
  // Handle item selection/deselection
  // Reason: Toggle selection state and notify parent component
  const handleItemToggle = useCallback((item: DropdownItem) => {
    // Single choice mode: only allow one selection at a time
    if (singleChoice) {
      const isSelected = selectedItems.some(selected => selected.id === item.id)
      if (isSelected) {
        // Deselect if already selected
        onSelectionChange([])
      } else {
        // Select only this item
        onSelectionChange([item])
      }
      return
    }

    // If grouped, toggle all items in the group
    if (groupBy && groupedItemsMap) {
      const groupKey = JSON.stringify(getGroupValueForItem(item))
      const group = groupedItemsMap.get(groupKey)
      
      if (group) {
        // Check if all items in group are selected
        const allGroupItemsSelected = group.items.every(groupItem =>
          selectedItems.some(selected => selected.id === groupItem.id)
        )
        
        if (allGroupItemsSelected) {
          // Deselect all items in group
          const groupItemIds = new Set(group.items.map(i => i.id))
          onSelectionChange(selectedItems.filter(selected => !groupItemIds.has(selected.id)))
        } else {
          // Select all items in group that aren't already selected
          const groupItemIds = new Set(selectedItems.map(s => s.id))
          const newItems = group.items.filter(groupItem => !groupItemIds.has(groupItem.id))
          onSelectionChange([...selectedItems, ...newItems])
        }
        return
      }
    }
    
    // Default behavior for ungrouped items
    const isSelected = selectedItems.some(selected => selected.id === item.id)
    
    if (isSelected) {
      onSelectionChange(selectedItems.filter(selected => selected.id !== item.id))
    } else {
      onSelectionChange([...selectedItems, item])
    }
  }, [selectedItems, onSelectionChange, groupBy, groupedItemsMap, singleChoice])

  ///////////////////////
  // Handle select all/none functionality
  // Reason: Provide convenient bulk selection options
  const handleSelectAll = useCallback(() => {
    onSelectionChange([...items])
  }, [items, onSelectionChange])

  const handleSelectNone = useCallback(() => {
    onSelectionChange([])
  }, [onSelectionChange])

  ///////////////////////
  // Keyboard navigation handlers
  // Reason: Improve accessibility and user experience
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => Math.min(prev + 1, filteredItems.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
          handleItemToggle(filteredItems[focusedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }, [isOpen, focusedIndex, filteredItems, handleItemToggle])

  ///////////////////////
  // Click outside to close dropdown
  // Reason: Standard UX pattern for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  ///////////////////////
  // Focus search input when dropdown opens
  // Reason: Improve UX by allowing immediate typing
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  ///////////////////////
  // Scroll focused item into view
  // Reason: Ensure keyboard navigation is visible
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  }, [focusedIndex])

  ///////////////////////
  // Toggle dropdown open/close
  // Reason: Handle button click to show/hide dropdown
  const toggleDropdown = () => {
    if (disabled) return
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchTerm('')
      setFocusedIndex(-1)
    }
  }

  ///////////////////////
  // Get display text for button
  // Reason: Show selected items count or placeholder text
  const getButtonText = () => {
    if (selectedItems.length === 0) return buttonText

    // Single choice: always show the selected item's label (never "All X are selected")
    if (singleChoice && selectedItems.length > 0) {
      return selectedItems[0].label
    }
    
    const totalItems = items.length
    const selectedCount = selectedItems.length
    
    // If showSelectedItems is enabled and not all items are selected
    if (showSelectedItems && selectedCount < totalItems && selectedCount > 0) {
      const itemLabels = selectedItems.map(item => item.label).join(', ')
      return itemLabels
    }
    
    // If selectedText is provided, use custom formatting
    if (selectedText) {
      if (selectedCount === totalItems) {
        return `All ${selectedText} are selected`
      }
      return `${selectedCount}/${totalItems} ${selectedText} selected`
    }
    
    // Default behavior when selectedText is not provided
    if (selectedItems.length === 1) return selectedItems[0].label
    return `${selectedItems.length} selected`
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`cursor-pointer
          flex items-center gap-2 px-3 py-2 border border-foreground/10 rounded-sm
           text-left text-sm font-medium
           bg-[rgba(255,255,255,0.25)] md:bg-[rgba(26,26,26,0.02)] dark:md:bg-background/10 dark:bg-background/50
           text-foreground placeholder-foreground/30
           focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary/50
           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10
           transition-all
          ${buttonClassName}
        `}
        style={{ width, height: buttonHeight }}
      >
        {showIcon && <Icon className={`w-4 h-4 text-foreground shrink-0 ${isOpen ? 'text-tertiary' : ''}`} />}
        <span className={`flex-1 truncate text-foreground/90 font-normal text-sm ${isOpen ? 'text-tertiary' : ''}`}>{getButtonText()}</span>
        <ChevronDown 
          className={`w-4 h-4 text-foreground/50 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-tertiary' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute top-full left-0 mt-1 rounded-sm shadow-lg
            z-50 overflow-hidden border border-foreground/10
            bg-background/80 dark:bg-background/90
            backdrop-blur-[20px]
            ${menuClassName}
          `}
          style={{ width, maxHeight }}
        >
          {/* Search Bar */}
          {searchable && (
            <div className="p-3 border-b border-foreground/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-foreground/10 rounded-sm bg-transparent
                           text-foreground placeholder-foreground/30
                           focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary/50
                           transition-all"
                />
              </div>
            </div>
          )}

          {/* Select All/None Buttons */}
          {!hideTopButtons && (
            <div className="flex gap-2 p-2 border-b border-foreground/10">
              <button
                type="button"
                onClick={handleSelectAll}
                className="cursor-pointer text-xs text-primary hover:text-gray-500 hover:underline font-medium"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleSelectNone}
                className="cursor-pointer text-xs text-gray-600 hover:text-gray-500 hover:underline font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Items List */}
          <div 
            className="overflow-y-auto max-h-[300px]"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            {filteredItems.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No items found
              </div>
            ) : (
              filteredItems.map((item, index) => {
                // For grouped items, check if all items in group are selected
                let isSelected = false
                if (groupBy && groupedItemsMap) {
                  const groupKey = JSON.stringify(getGroupValueForItem(item))
                  const group = groupedItemsMap.get(groupKey)
                  if (group) {
                    isSelected = group.items.every(groupItem =>
                      selectedItems.some(selected => selected.id === groupItem.id)
                    )
                  }
                } else {
                  isSelected = selectedItems.some(selected => selected.id === item.id)
                }
                
                const isFocused = index === focusedIndex
                
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[index] = el
                    }}
                    onClick={() => handleItemToggle(item)}
                    className={`
                      flex items-center gap-3 px-3 py-2 cursor-pointer text-xs
                      hover:bg-tertiary/10 transition-all duration-200 
                      ${isFocused ? 'bg-gray-50' : ''}
                      ${isSelected ? 'bg-tertiary/30 text-foreground' : 'text-foreground dark:text-gray-400'}
                    `}
                  >
                    {/* Checkbox */}
                    {showCheckboxes && (
                      <div className={`
                        w-4 h-4 border-2 rounded flex items-center justify-center
                        ${isSelected 
                          ? 'bg-tertiary/30 border-tertiary/30' 
                          : 'border-[rgba(0,0,0,0.2)] dark:border-[rgba(255,255,255,0.2)]'
                        }
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-foreground" />}
                      </div>
                    )}
                    
                    {/* Item Label */}
                    <span className={`flex-1 truncate ${getLabelClassName ? getLabelClassName(item) : ''}`}>
                      {item.label}
                    </span>
                    
                    {/* Count Indicator */}
                    {showItemCount && (
                      <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                        {getItemCountForDisplay(item)}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
} 