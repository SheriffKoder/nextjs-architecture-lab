import React, { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Eye, Download, ChevronDown } from "lucide-react";

interface ActionButtonProps {
  actions: Array<{
    key: string;
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    onClick: (e: React.MouseEvent) => void;
    // Individual styling for each action
    buttonPadding?: string;
    buttonBackground?: string;
    buttonHoverBackground?: string;
    iconColor?: string;
    iconSize?: number;
    buttonBorderRadius?: string;
    buttonBorder?: string;
  }>;
  mode?: 'inline' | 'dropdown';
  // Global styling props (fallbacks for actions without individual styles)
  buttonPadding?: string;
  buttonBackground?: string;
  buttonHoverBackground?: string;
  iconColor?: string;
  iconSize?: number;
  buttonBorderRadius?: string;
  buttonBorder?: string;
  dropdownBackground?: string;
  dropdownBorder?: string;
  dropdownShadow?: string;
  dropdownItemHover?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  actions, 
  mode = 'inline',
  // Global defaults
  buttonPadding = 'p-1',
  buttonBackground = 'bg-transparent',
  buttonHoverBackground = 'hover:bg-gray-100',
  iconColor = 'text-gray-600',
  iconSize = 16,
  buttonBorderRadius = 'rounded-md',
  buttonBorder = '',
  dropdownBackground = 'bg-background/90 backdrop-blur-sm',
  dropdownBorder = 'border-border',
  dropdownShadow = 'shadow-lg',
  dropdownItemHover = 'hover:text-tertiary'
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleClick = (e: React.MouseEvent, actionKey: string) => {
    // Prevent event bubbling to avoid triggering row click
    e.stopPropagation();
    
    // Find and call the specific action
    const action = actions.find(a => a.key === actionKey);
    if (action) {
      action.onClick(e);
      // Close dropdown after action
      if (mode === 'dropdown') {
        setIsDropdownOpen(false);
      }
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Inline mode - show all buttons horizontally
  if (mode === 'inline') {
    return React.createElement('div', {
      className: 'flex items-center space-x-1'
    }, 
      actions.map((action) => {
        const IconComponent = action.icon;
        // Use individual action styles or fall back to global styles
        const padding = action.buttonPadding || buttonPadding;
        const background = action.buttonBackground || buttonBackground;
        const hoverBackground = action.buttonHoverBackground || buttonHoverBackground;
        const borderRadius = action.buttonBorderRadius || buttonBorderRadius;
        const border = action.buttonBorder || buttonBorder;
        const color = action.iconColor || iconColor;
        const size = action.iconSize || iconSize;
        
        return React.createElement('button', {
          key: action.key,
          className: `${padding} ${background} ${hoverBackground} ${borderRadius} ${border} transition-colors`,
          onClick: (e: React.MouseEvent) => handleClick(e, action.key),
          'aria-label': action.label
        }, React.createElement('span', {
          className: color
        }, React.createElement(IconComponent, { 
          size: size
        })));
      })
    );
  }

  // Dropdown mode - show three dots with dropdown menu
  return React.createElement('div', {
    className: 'relative'
  }, [
    // Dropdown trigger button
    React.createElement('button', {
      key: 'trigger',
      className: `${buttonPadding} ${buttonBackground} ${buttonHoverBackground} ${buttonBorderRadius} ${buttonBorder} transition-colors`,
      onClick: toggleDropdown,
      'aria-label': 'Row actions'
    }, React.createElement('span', {
      className: iconColor
    }, React.createElement(MoreHorizontal, { 
      size: iconSize
    }))),
    
    // Dropdown menu
    isDropdownOpen && React.createElement('div', {
      key: 'dropdown',
      className: `absolute right-0 top-full mt-1 ${dropdownBackground} ${dropdownBorder} rounded-md ${dropdownShadow} z-10 min-w-[170px]`,
      onClick: (e: React.MouseEvent) => e.stopPropagation()
    }, 
      actions.map((action) => {
        const IconComponent = action.icon;
        // Use individual action styles or fall back to global styles
        const color = action.iconColor || iconColor;
        const size = action.iconSize || iconSize;
        
        return React.createElement('button', {
          key: action.key,
          className: `w-full px-3 py-2 text-left text-sm ${dropdownItemHover} flex items-center space-x-2`,
          onClick: (e: React.MouseEvent) => handleClick(e, action.key)
        }, [
          React.createElement('span', { 
            key: 'icon',
            className: color
          }, React.createElement(IconComponent, { 
            size: size - 2
          })),
          React.createElement('span', { key: 'label' }, action.label)
        ]);
      })
    )
  ]);
}; 