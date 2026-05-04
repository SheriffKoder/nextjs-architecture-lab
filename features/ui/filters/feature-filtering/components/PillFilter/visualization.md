┌─────────────────────────────────────────────────────────────────────────┐
│                         PILL FILTER COMPONENT                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  MAIN PILL CONTAINER (border, rounded-lg)                               │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  FILTER BUTTON (rounded-l-lg)  │  SEARCH INPUT (flex-1)          │ │
│  │  ┌──────────────────────────┐  │  ┌────────────────────────────┐ │ │
│  │  │ 🔍 Filter  [3]           │  │  │ 🔍 Search...          [▼]  │ │ │
│  │  │                          │  │  │                            │ │ │
│  │  │ • Filter icon            │  │  │ • Search icon on left      │ │ │
│  │  │ • "Filter" text          │  │  │ • Input field (flex-1)     │ │ │
│  │  │ • Count badge [3]        │  │  │ • Chevron up/down on right │ │ │
│  │  │   (if filters active)    │  │  │   (toggle dropdown)        │ │ │
│  │  │                          │  │  │                            │ │ │
│  │  │ Background: tertiary      │  │  │ Background: tertiary/10    │ │ │
│  │  │ Border-right: border      │  │  │ Rounded-r-md               │ │ │
│  │  └──────────────────────────┘  │  └────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

                    ▼ (when isFilterLayoutVisible = true)

┌─────────────────────────────────────────────────────────────────────────┐
│  DROPDOWN PANEL (absolute, below pill, shadow-lg, backdrop-blur)      │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                                                                   │ │
│  │  ┌──────────────┐  ┌──────────────────────────────────────────┐ │ │
│  │  │ COLUMN       │  │  FILTER OPTIONS (for active column)       │ │ │
│  │  │ TITLES       │  │                                          │ │ │
│  │  │ (Left Side)  │  │  ┌────────────────────────────────────┐ │ │ │
│  │  │              │  │  │ Status Filter                       │ │ │ │
│  │  │ ┌──────────┐ │  │  │ ┌────────────────────────────────┐ │ │ │ │
│  │  │ │ Status   │ │  │  │ │ ☑ Active (5)                    │ │ │ │ │
│  │  │ │ [active] │ │  │  │ │ ☐ Inactive (3)                  │ │ │ │ │
│  │  │ └──────────┘ │  │  │ │ ☐ Pending (2)                   │ │ │ │ │
│  │  │              │  │  │ └────────────────────────────────┘ │ │ │ │
│  │  │ ┌──────────┐ │  │  │                                      │ │ │ │
│  │  │ │ Role     │ │  │  │ ┌────────────────────────────────┐ │ │ │ │
│  │  │ │          │ │  │  │ │ Role Filter                     │ │ │ │ │
│  │  │ └──────────┘ │  │  │ │ ┌────────────────────────────┐ │ │ │ │
│  │  │              │  │  │ │ │ ○ Admin (2)                 │ │ │ │ │
│  │  │ ┌──────────┐ │  │  │ │ │ ○ Manager (3)               │ │ │ │ │
│  │  │ │ Department│ │  │  │ │ │ ○ Developer (4)             │ │ │ │ │
│  │  │ │          │ │  │  │ │ └────────────────────────────┘ │ │ │ │
│  │  │ └──────────┘ │  │  │ └────────────────────────────────┘ │ │ │ │
│  │  │              │  │  │                                      │ │ │ │
│  │  │ ┌──────────┐ │  │  │ ┌────────────────────────────────┐ │ │ │ │
│  │  │ │ Salary   │ │  │  │ │ Salary Range                    │ │ │ │ │
│  │  │ │          │ │  │  │ │ Min: [____] Max: [____]         │ │ │ │ │
│  │  │ └──────────┘ │  │  │ └────────────────────────────────┘ │ │ │ │
│  │  │              │  │  │                                      │ │ │ │
│  │  │ (w-32 lg:w-48)│  │  │ (flex-1, space-y-2 lg:space-y-4)  │ │ │ │
│  │  │              │  │  │                                      │ │ │ │
│  │  │ • Vertical    │  │  │ • Only active column's filters    │ │ │ │
│  │  │   scrollable  │  │  │   are visible                       │ │ │ │
│  │  │ • Gradient    │  │  │ • Others are hidden                │ │ │ │
│  │  │   bg for      │  │  │                                      │ │ │ │
│  │  │   active      │  │  │                                      │ │ │ │
│  │  └──────────────┘  │  └────────────────────────────────────┘ │ │ │
│  │                     │                                          │ │ │
│  └─────────────────────┴──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

KEY FEATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PILL CONTAINER:
   • Combined Filter button + Search input in one rounded container
   • Filter button: Left side, rounded-l-lg, tertiary background
   • Search input: Right side (flex-1), rounded-r-md, tertiary/10 background
   • Chevron button: Absolute positioned on right side of search input

2. FILTER BUTTON:
   • Filter icon (🔍) + "Filter" text
   • Count badge: Shows number of active filters (e.g., [3])
   • Badge style: px-3 py-0.5, rounded-full, bg-foreground/30
   • Highlighted when filters are active

3. SEARCH INPUT:
   • Search icon on left (or loading spinner when searching)
   • Input field takes remaining space
   • Clear button (X) appears when text is entered
   • Chevron up/down on right to toggle dropdown

4. DROPDOWN PANEL:
   • Absolute positioned below pill container
   • Backdrop blur effect (bg-background/80 backdrop-blur-sm)
   • Two-column layout: Column titles (left) + Filter options (right)
   • Only active column's filters are visible
   • Smooth transitions (opacity, visibility)

5. COLUMN TITLES (Left):
   • Vertical list, w-32 lg:w-48
   • Active column: Gradient bg (from-tertiary/30 to-transparent)
   • Previously selected with filters: Gradient bg (from-tertiary/10)
   • Scrollable if many columns (max-h-[500px])

6. FILTER OPTIONS (Right):
   • Only shows filters for active column
   • Multi-select: Checkboxes with counts (e.g., ☑ Active (5))
   • Single-select: Radio buttons with counts (e.g., ○ Admin (2))
   • Range filters: Min/Max inputs
   • Spacing: space-y-2 lg:space-y-4