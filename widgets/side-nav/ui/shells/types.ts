/** Temporary stub until auth is re-implemented. */
export interface SideNavUser {
  id: string
  email: string | null
  name: string | null
  phone?: string | null
  created_at: string
  updated_at: string
}

export interface SideNavShellProps {
  user: SideNavUser
  isScrollable?: boolean
}
