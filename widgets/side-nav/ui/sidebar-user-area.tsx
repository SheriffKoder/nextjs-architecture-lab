/**
 * Sidebar User Area Component
 * 
 * Purpose: Display user information and actions in the sidebar
 * Used in: Side navigation component at the bottom
 * Why: Provides quick access to user profile, download, and logout
 * 
 * Implementation Steps:
 * 1. Display user avatar and details (name, email)
 * 2. Add Profile, Download, and Logout links/buttons
 * 3. Support collapsed sidebar state
 * 4. Handle logout functionality
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import UserAvatar from './user-avatar'
import { ThemeSwitcher } from '@/components/theme-switcher'

/** Temporary stub until auth is re-implemented. */
interface User {
  id: string
  email: string | null
  name: string | null
  phone?: string | null
  created_at: string
  updated_at: string
}

interface SidebarUserAreaProps {
  isCollapsed: boolean
  style: 'dark' | 'light'
  user: User
}

export default function SidebarUserArea({ isCollapsed, style, user }: SidebarUserAreaProps) {
  const router = useRouter()

  const handleLogout = async () => {
    router.push('/')
  }

  return (
    <div className={`p-4 ${style === 'dark' ? 'border-t border-border' : 'border-t border-tertiary/20'}`}>
      {!isCollapsed ? (
        // Expanded view - Show full user info and menu items
        <div className="space-y-3">
          {/* User Info Section */}
          <Link 
            href="/profile"
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <UserAvatar 
              size="md" 
              border={false}
              avatar={user?.name || user?.email}
              name={user?.name || user?.email || 'User'}
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${style === 'dark' ? 'text-white' : 'text-foreground'} truncate`}>
                {user?.name || 'User'}
              </p>
              <p className={`text-xs ${style === 'dark' ? 'text-white/60' : 'text-foreground/60'} truncate`}>
                {user?.email}
              </p>
            </div>
          </Link>

          {/* Menu Items */}
          <div className="space-y-0">
            <div className="flex items-center gap-2 -ml-1 text-foreground/60">
              <ThemeSwitcher isCollapsed={isCollapsed}/>
            </div>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-5 w-full px-2 py-2 text-sm ${style === 'dark' ? 'text-destructive hover:bg-destructive/10' : 'text-red-500 hover:bg-red-500/10'} rounded-md transition-colors duration-200`}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      ) : (
        // Collapsed view - Show only avatar with tooltip on hover
        <div className="flex flex-col items-center gap-2">
          <Link href="/profile" className="cursor-pointer hover:opacity-80 transition-opacity">
            <UserAvatar 
              size="md" 
              border={false}
              avatar={user?.name || user?.email}
              name={user?.name || user?.email || 'User'}
              className="cursor-pointer"
            />
          </Link>
          <div className="flex flex-col items-center gap-1">
            <ThemeSwitcher isCollapsed={isCollapsed}/>
            <button
              onClick={handleLogout}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

