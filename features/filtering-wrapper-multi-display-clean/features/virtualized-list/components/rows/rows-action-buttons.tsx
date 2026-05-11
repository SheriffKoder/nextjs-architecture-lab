import React, { useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { RowActionsDropdownPortal } from '../../../../components/row-actions-dropdown-portal'

interface ActionButtonProps {
  actions: Array<{
    key: string
    icon: React.ComponentType<{ size?: number }>
    label: string
    onClick: (e: React.MouseEvent) => void
    buttonClassName?: string
    iconClassName?: string
    buttonPadding?: string
    buttonBackground?: string
    buttonHoverBackground?: string
    iconColor?: string
    iconSize?: number
    buttonBorderRadius?: string
    buttonBorder?: string
  }>
  mode?: 'inline' | 'dropdown'
  buttonClassName?: string
  iconClassName?: string
  buttonPadding?: string
  buttonBackground?: string
  buttonHoverBackground?: string
  iconColor?: string
  iconSize?: number
  buttonBorderRadius?: string
  buttonBorder?: string
  dropdownBackground?: string
  dropdownBorder?: string
  dropdownShadow?: string
  dropdownItemHover?: string
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  actions,
  mode = 'inline',
  buttonClassName,
  iconClassName,
  buttonPadding = 'p-1',
  buttonBackground = 'bg-transparent',
  buttonHoverBackground = 'hover:bg-tertiary/20 dark:hover:bg-tertiary/10',
  iconColor = 'text-gray-600',
  iconSize = 16,
  buttonBorderRadius = 'rounded-md',
  buttonBorder = '',
  dropdownBackground = 'bg-background/90 backdrop-blur-sm',
  dropdownBorder = 'border-border',
  dropdownShadow = 'shadow-lg',
  dropdownItemHover = 'hover:text-tertiary',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent, actionKey: string) => {
    e.stopPropagation()
    const action = actions.find((a) => a.key === actionKey)
    if (action) {
      action.onClick(e)
      if (mode === 'dropdown') {
        setIsDropdownOpen(false)
      }
    }
  }

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDropdownOpen((o) => !o)
  }

  if (mode === 'inline') {
    return (
      <div className="flex items-center space-x-1">
        {actions.map((action) => {
          const IconComponent = action.icon
          const resolvedButtonClass = action.buttonClassName ?? buttonClassName
          const resolvedIconClass = action.iconClassName ?? iconClassName
          const padding = action.buttonPadding || buttonPadding
          const background = action.buttonBackground || buttonBackground
          const hoverBackground = action.buttonHoverBackground || buttonHoverBackground
          const borderRadius = action.buttonBorderRadius || buttonBorderRadius
          const border = action.buttonBorder || buttonBorder
          const color = action.iconColor || iconColor
          const size = action.iconSize || iconSize
          const buttonCls = resolvedButtonClass
            ? resolvedButtonClass
            : `${padding} ${background} ${hoverBackground} ${borderRadius} ${border} transition-colors`
          const iconCls = resolvedIconClass ? resolvedIconClass : color

          return (
            <button
              key={action.key}
              type="button"
              className={buttonCls}
              onClick={(e) => handleClick(e, action.key)}
              aria-label={action.label}
            >
              <span className={iconCls}>
                <IconComponent size={size} />
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  const panelClassName = `flex flex-col gap-0.5 rounded-md border p-1.5 ${dropdownBackground} ${dropdownBorder} ${dropdownShadow}`

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        className={`${buttonPadding} ${buttonBackground} ${buttonHoverBackground} ${buttonBorderRadius} ${buttonBorder} transition-colors`}
        onClick={toggleDropdown}
        aria-label="Row actions"
        aria-expanded={isDropdownOpen}
        aria-haspopup="menu"
      >
        <span className={iconColor}>
          <MoreHorizontal size={iconSize} />
        </span>
      </button>

      <RowActionsDropdownPortal
        open={isDropdownOpen}
        triggerRef={triggerRef}
        onOpenChange={setIsDropdownOpen}
        panelClassName={panelClassName}
      >
        {actions.map((action) => {
          const IconComponent = action.icon
          const resolvedButtonClass = action.buttonClassName ?? buttonClassName
          const resolvedIconClass = action.iconClassName ?? iconClassName
          const color = action.iconColor || iconColor
          const size = action.iconSize || iconSize
          const itemBackground = action.buttonBackground || ''
          const itemHoverBackground = action.buttonHoverBackground || buttonHoverBackground

          const menuButtonClass = resolvedButtonClass
            ? resolvedButtonClass
            : [
                'w-full px-3 py-2 text-left text-sm flex items-center space-x-2 transition-colors rounded-md',
                itemBackground,
                itemHoverBackground,
                dropdownItemHover,
              ]
                .filter(Boolean)
                .join(' ')
          const menuIconClass = resolvedIconClass ? resolvedIconClass : color

          return (
            <button
              key={action.key}
              type="button"
              className={menuButtonClass}
              onClick={(e) => handleClick(e, action.key)}
            >
              <span className={menuIconClass}>
                <IconComponent size={size - 2} />
              </span>
              <span>{action.label}</span>
            </button>
          )
        })}
      </RowActionsDropdownPortal>
    </div>
  )
}
