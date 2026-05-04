
  import { 
    LayoutDashboard, 
    Briefcase, 
    FileText, 
    Settings, 
    FolderKanban, 
    Users, 
    DollarSign, 
    Calendar, 
    Mail, 
    Wrench, 
    UserCog, 
    Link
  } from 'lucide-react'
  import { SidebarConfig, IndependentButtonConfig } from './types'

  /**
   * Independent Button Configuration
   * 
   * Purpose: Configuration for independent button items using LogoIconPair
   * Used in: side-nav.tsx for items marked as independent
   * Why: Centralized config for button styling and icon configuration
   */
  export const independentButtonConfig = {
    icon1: {
      imageUrl: '/icons/appfolio-logo.png',
      color: '#000000', // Blue color in hex
      width: 20, // w-10 = 40px
      height: 20, // h-10 = 40px
      borderRadius: 'rounded-md'
    },
    icon2: {
      imageUrl: '/icons/appfolio-text.png',
      color: '#000000', // Green color in hex
      width: 60, // w-24 = 96px
      height: 25, // h-10 = 40px
      borderRadius: 'rounded-md'
    },
    container: {
      backgroundColor: '',
      borderColor: 'border',
      borderRadius: 'rounded-lg',
      padding: 'py-2 px-4',
      gap: 'gap-2'
    },
    // Styling configuration for active/inactive states
    styling: {
      active: {
        dark: 'bg-tertiary/20 border-tertiary/30',
        light: 'bg-transparent border-transparent'
      },
      inactive: {
        dark: 'hover:bg-tertiary/10 border-transparent hover:border-tertiary/20',
        light: 'hover:bg-transparent border-transparent hover:border-transparent'
      }
    },
    // Optional subtext to display below the second icon
    subtext: undefined
  }

  /**
   * Sidebar Color Configuration
   * 
   * Purpose: Centralized color styling for navigation components
   * Used in: nav-link.tsx, expandable-group.tsx
   * Why: Single source of truth for all color classes, easier to maintain and update
   */
  export const sidebarColorConfig = {
    // Primary color variants
    primary: {
      active: {
        dark: 'text-tertiary bg-gradient-to-r from-tertiary/30',
        light: 'text-tertiary bg-gradient-to-r from-tertiary/20 hover:from-tertiary/10'
      },
      inactive: {
        dark: 'text-white/60 hover:bg-gradient-to-r hover:from-tertiary/30 hover:to-transparent',
        light: 'text-foreground/80 hover:text-tertiary hover:bg-gradient-to-r hover:from-tertiary/10 hover:to-transparent'
      },
      indicator: 'bg-tertiary rounded-md shadow-[1px_0_12px_0_rgba(53,146,6,0.4)]',
      icon: {
        active: 'text-tertiary',
        inactive: {
          dark: 'text-white/60',
          light: 'text-foreground/80 group-hover:text-tertiary'
        }
      }
    },
    // Secondary color variants
    secondary: {
      active: {
        dark: 'text-tertiary bg-gradient-to-r from-tertiary/30',
        light: 'text-tertiary bg-gradient-to-r from-black/5 hover:from-tertiary/20'
      },
      inactive: {
        dark: 'text-white/60 hover:text-tertiary',
        light: 'text-gray-600 hover:text-tertiary hover:bg-gradient-to-r hover:from-tertiary/10 hover:to-transparent'
      },
      indicator: 'bg-tertiary rounded-md shadow-[1px_0_12px_0_rgba(53,146,6,0.4)]',
      icon: {
        active: 'text-tertiary',
        inactive: {
          dark: 'text-white/60',
          light: 'text-foreground/80 group-hover:text-tertiary'
        }
      }
    },
    // Expandable group specific colors
    expandableGroup: {
      active: {
        dark: 'text-tertiary bg-gradient-to-r from-tertiary/30 hover:from-tertiary/20',
        light: 'text-tertiary bg-gradient-to-r from-tertiary/10 hover:from-tertiary/20'
      },
      inactive: {
        dark: 'text-white/60 hover:bg-gradient-to-r hover:from-tertiary/30 hover:to-transparent',
        light: 'text-foreground/80 hover:text-tertiary hover:bg-gradient-to-r hover:from-tertiary/10 hover:to-transparent'
      },
      indicator: {
        active: 'bg-tertiary rounded-md shadow-[1px_0_12px_0_rgba(53,146,6,0.4)]',
        hover: 'bg-transparent group-hover:bg-tertiary rounded-md'
      },
      border: {
        collapsed: 'border border-tertiary/30 rounded-md',
        expanded: 'border-l-2 border-tertiary/30'
      },
      icon: {
        active: 'text-tertiary',
        inactive: ''
      }
    },
    // Subtext colors
    subtext: {
      dark: 'text-white/50',
      light: 'text-foreground/50 font-normal dark:font-light group-hover:text-tertiary transition-colors duration-300'
    },
    // Common hover indicators
    hoverIndicator: 'bg-transparent group-hover:bg-tertiary rounded-md'
  }

  // Navigation configuration
  export const sidebarConfig: SidebarConfig = {
    logo: {
      src: '/images/revilo-logo-icon.png',
      alt: 'Revilo Property Group Logo',
      href: '/dashboard'
    },
    logoText: {
      src: '/images/revilo-logo-text.png',
      alt: 'Revilo Property Group Logo',
      href: '/dashboard'
    },
    style: 'light',
    items: [
      {
        href: '/dashboard',
        text: 'My Dashboard',
        subtext: 'Home',
        icon: LayoutDashboard,
        expandable: false,
        defaultOpen: true
      },
      {
        href: '/rental-cars',
        text: 'Demo pages',
        subtext: 'Demo pages',
        icon: Briefcase,
        expandable: true,
        children: [
          {
            href: '/demo-rsc-page',
            text: 'Car Rentals (Server)',
            subtext: 'Server-rendered',
            icon: FolderKanban,
            // expandable: false,
            color: 'secondary',
            size: 'sm'
          },
          {
            href: '/demo-client-page',
            text: 'Car Rentals (Client)',
            subtext: 'Client-rendered with TanStack Query',
            icon: FolderKanban,
            // expandable: false,
            color: 'secondary',
            size: 'sm'
          },
          {
            href: '/demo-client-page-airtable',
            text: 'Car Rentals (Client/Minimal)',
            subtext: 'Client-rendered with TanStack Query (AirTable Style)',
            icon: FolderKanban,
            // expandable: false,
            color: 'secondary',
            size: 'sm'
          },
          {
            href: '/demo-client-page-agent',
            text: 'Car Rentals (Client/AI)',
            subtext: 'Client-rendered with TanStack Query (with AI Agent Panel)',
            icon: FolderKanban,
            // expandable: false,
            color: 'secondary',
            size: 'sm'
          },
        ]
      },
      {
        href: '/portfolio-management',
        text: 'Portfolio',
        subtext: 'Group',
        icon: Briefcase,
        expandable: true,
        children: [
          {
            href: '/portfolio-management/project-board',
            text: 'Project Board',
            subtext: 'All projects + Lifecycle tabs',
            icon: FolderKanban,
            expandable: false,
            color: 'secondary',
            size: 'sm'
          },
          {
            href: '/portfolio-management/investors',
            text: 'Investors',
            subtext: 'List of investors + Total positions',
            icon: Users,
            expandable: false,
            color: 'secondary',
            size: 'sm'
          }
        ]
      },
      {
        href: '/financial-reports',
        text: 'Financial Reports',
        subtext: 'Group',
        icon: FileText,
        expandable: true,
        children: [
          {
            href: '/financial-reports/monthly-distributions',
            text: 'Monthly Distributions',
            subtext: 'Payout tracker',
            icon: DollarSign,
            expandable: false,
            color: 'secondary',
            size: 'sm'
          },
          {
            href: '/financial-reports/note-expirations',
            text: 'Note Expirations',
            subtext: 'Maturity tracking + Calendar',
            icon: Calendar,
            expandable: false,
            color: 'secondary',
            size: 'sm'
          },
          {
            href: '/financial-reports/newsletter-tracker',
            text: 'Newsletter Tracker',
            subtext: 'Exportable mailing list',
            icon: Mail,
            expandable: false,
            color: 'secondary',
            size: 'sm'
          }
        ]
      },
      {
        href: '/admin-settings',
        text: 'Admin Settings',
        subtext: 'Group',
        icon: Settings,
        expandable: true,
        children: [
          {
            href: '/admin-settings/configuration',
            text: 'Configuration',
            subtext: 'Lenders, Contractors, Agents, etc.',
            icon: Wrench,
            expandable: false,
            color: 'secondary',
            size: 'sm'
          },
          {
            href: '/admin-settings/user-management',
            text: 'User Management',
            subtext: 'Admin only',
            icon: UserCog,
            expandable: false,
            color: 'secondary',
            size: 'sm'
          }
        ]
      },



      {
        href: '/external-links',
        text: 'External Links',
        subtext: 'Group',
        icon: Link,
        expandable: true,
        children: [
          {
            href: 'https://appfolio.com',
            text: 'Appfolio',
            subtext: 'Manage my properties',
            icon: LayoutDashboard,
            expandable: false,
            independent: true,
            // Per-item configuration (overrides global independentButtonConfig)
            independentConfig: {
                icon1: {
                    imageUrl: '/icons/appfolio-logo.png',
                    color: '#000000', // Blue color in hex
                    width: 20, // w-10 = 40px
                    height: 20, // h-10 = 40px
                    borderRadius: 'rounded-md'
                    },
                    icon2: {
                    imageUrl: '/icons/appfolio-text.png',
                    color: '#000000', // Green color in hex
                    width: 60, // w-24 = 96px
                    height: 25, // h-10 = 40px
                    borderRadius: 'rounded-md'
                    },
                    container: {
                    backgroundColor: '',
                    borderColor: 'border',
                    borderRadius: 'rounded-lg',
                    padding: 'py-2 px-4',
                    gap: 'gap-2'
                    },
                    // Styling configuration for active/inactive states
                    styling: {
                    active: {
                        dark: 'bg-tertiary/20 border-tertiary/30',
                        light: 'bg-transparent border-transparent'
                    },
                    inactive: {
                        dark: 'hover:bg-tertiary/10 border-transparent hover:border-tertiary/20',
                        light: 'bg-gradient-to-r from-transparent hover:from-tertiary/20 to-transparent border-transparent border-r-0'
                    }
                    },
                    subtext: 'Manage my properties'
                }
          },
          {
            href: 'https://quickbooks.intuit.com',
            text: 'Quickbooks',
            subtext: 'Manage my accounting',
            icon: LayoutDashboard,
            expandable: false,
            independent: true,
            // Another example with different configuration
            independentConfig: {
                icon1: {
                    imageUrl: '/icons/quickbooks-logo.png',
                    color: '#000000', // Blue color in hex
                    width: 20, // w-10 = 40px
                    height: 20, // h-10 = 40px
                    borderRadius: 'rounded-md'
                  },
                  icon2: {
                    imageUrl: '/icons/quickbooks-text.png',
                    color: '#000000', // Green color in hex
                    width: 80, // w-24 = 96px
                    height: 25, // h-10 = 40px
                    borderRadius: 'rounded-md'
                  },
                  container: {
                    backgroundColor: '',
                    borderColor: 'border',
                    borderRadius: 'rounded-lg',
                    padding: 'py-2 px-4',
                    gap: 'gap-2'
                  },
                  // Styling configuration for active/inactive states
                  styling: {
                    active: {
                        dark: 'bg-tertiary/20 border-tertiary/30',
                        light: 'bg-transparent border-transparent'
                    },
                    inactive: {
                        dark: 'hover:bg-tertiary/10 border-transparent hover:border-tertiary/20',
                        light: 'bg-gradient-to-r from-transparent hover:from-tertiary/20 to-transparent border-transparent border-r-0'
                    }
                  },
                  subtext: 'Manage my accounting'
                }
          },
          {
            href: 'https://buildertrend.net',
            text: 'Buildertrend',
            subtext: 'Manage my projects',
            icon: LayoutDashboard,
            expandable: false,
            independent: true,
            // Another example with different configuration
            independentConfig: {
                icon1: {
                    imageUrl: '/icons/buildertrend-icon-light.png',
                    color: '#000000', // Blue color in hex
                    width: 20, // w-10 = 40px
                    height: 20, // h-10 = 40px
                    borderRadius: 'rounded-md'
                  },
                  icon2: {
                    imageUrl: '/icons/buildertrend-text.png',
                    color: '#000000', // Green color in hex
                    width: 80, // w-24 = 96px
                    height: 25, // h-10 = 40px
                    borderRadius: 'rounded-md'
                  },
                  container: {
                    backgroundColor: '',
                    borderColor: 'border',
                    borderRadius: 'rounded-lg',
                    padding: 'py-2 px-4',
                    gap: 'gap-2'
                  },
                  // Styling configuration for active/inactive states
                  styling: {
                    active: {
                        dark: 'bg-tertiary/20 border-tertiary/30',
                        light: 'bg-transparent border-transparent'
                    },
                    inactive: {
                        dark: 'hover:bg-tertiary/10 border-transparent hover:border-tertiary/20',
                        light: 'bg-gradient-to-r from-transparent hover:from-tertiary/20 to-transparent border-transparent border-r-0'
                    }
                  },
                  subtext: 'Manage my projects'
                }
          },
        ]
      },
    ]
  }