# Timeline UI Structure Documentation

This document details what UI components are rendered for each timeline view mode (Year, Month, Week, Day) and where the code is located.

---

## Overview

The timeline feature uses a hierarchical structure:
- **Container**: `timeline-container.tsx` - Main orchestrator
- **View Components**: `year-month-week-view.tsx` (Year/Month/Week) and `day-view.tsx` (Day)
- **Header Rows**: Separate components for each header row
- **Timeline Rows**: `timeline-row.tsx` (Year/Month/Week) and `timeline-row-day.tsx` (Day)
- **Item Pills**: `draggable-timeline-item.tsx` (Year/Month/Week) and `draggable-timeline-item-day.tsx` (Day)

---

## Year View

### Structure
```
Row 1: Year labels (e.g., "2024", "2025")
Row 2: Month labels (e.g., "Jan", "Feb", "Mar", ...)
Row 3: Week start days (e.g., "5", "12", "19", "26" for each week)
Row 4+: Timeline data rows (one per unique item ID)
  - Each row contains cells (one per day)
  - Weekend cells have different background color
  - Item pills span across multiple cells (drag & drop enabled)
```

### File Locations

#### Row 1: Year Labels
- **File**: `components/main/year-month-week-view.tsx`
- **Lines**: 122-148
- **Component**: Direct JSX in `YearMonthWeekView`
- **Rendering**: Maps through `yearsInRange`, renders year label or spacer for virtualization

#### Row 2: Month Labels
- **File**: `components/main/year-month-week-view.tsx`
- **Lines**: 150-194
- **Component**: Direct JSX in `YearMonthWeekView`
- **Rendering**: Maps through `yearsInRange`, then `MONTH_NAMES`, renders month label or spacer

#### Row 3: Week Start Days
- **File**: `components/header-rows/year/week-row.tsx`
- **Lines**: 1-87
- **Component**: `WeekRow`
- **Rendered in**: `year-month-week-view.tsx` lines 198-224
- **Rendering**: Maps through `yearsInRange`, renders `WeekRow` component for each visible year
- **Cell Structure**: Each month shows week start days (e.g., "5", "12", "19", "26")
- **Cell Width**: `yearWeekWidth` pixels per week (default: 50px)
- **Day Width**: `yearWeekWidth / 7` pixels per day

#### Row 4+: Timeline Data Rows
- **File**: `components/main/timeline-row.tsx`
- **Lines**: 1-444
- **Component**: `TimelineRow`
- **Rendered in**: `year-month-week-view.tsx` lines 282-322
- **Rendering**: Maps through `visibleRowIndices`, renders `TimelineRow` for each visible row
- **Cell Structure**: 
  - Unified CSS Grid spanning all years
  - Each cell represents 1 day
  - Cells have weekend styling (different background)
  - Droppable cells for drag & drop
- **Cell Width**: `adjustedCellWidth` (calculated from total width / total days)
- **Item Pills**: 
  - **File**: `components/dnd/draggable-timeline-item.tsx`
  - **Lines**: 1-391
  - **Component**: `DraggableTimelineItem`
  - **Rendered in**: `timeline-row.tsx` lines 200-250
  - **Features**: Draggable, resizable (left/right edges), shows title

---

## Month View

### Structure
```
Row 1: Year labels (e.g., "2024", "2025")
Row 2: Month labels (e.g., "January", "February", "March", ...)
Row 3: Day numbers (e.g., "1", "2", "3", ..., "31" for each month)
Row 4+: Timeline data rows (one per unique item ID)
  - Each row contains cells (one per day)
  - Weekend cells have different background color
  - Item pills span across multiple cells (drag & drop enabled)
```

### File Locations

#### Row 1: Year Labels
- **File**: `components/main/year-month-week-view.tsx`
- **Lines**: 122-148
- **Component**: Direct JSX in `YearMonthWeekView`
- **Rendering**: Same as Year view

#### Row 2: Month Labels
- **File**: `components/main/year-month-week-view.tsx`
- **Lines**: 150-194
- **Component**: Direct JSX in `YearMonthWeekView`
- **Rendering**: Same as Year view, but uses `MONTH_NAMES_FULL` instead of abbreviated

#### Row 3: Day Numbers
- **File**: `components/header-rows/month/month-row.tsx`
- **Lines**: 1-57
- **Component**: `MonthRow`
- **Rendered in**: `year-month-week-view.tsx` lines 226-252
- **Rendering**: Maps through `yearsInRange`, renders `MonthRow` component for each visible year
- **Cell Structure**: Each month shows all days (1-31, depending on month)
- **Cell Width**: `monthDayWidth` pixels per day (default: 50px)

#### Row 4+: Timeline Data Rows
- **File**: `components/main/timeline-row.tsx`
- **Lines**: 1-444
- **Component**: `TimelineRow`
- **Rendered in**: `year-month-week-view.tsx` lines 282-322
- **Rendering**: Same structure as Year view
- **Cell Width**: `monthDayWidth` pixels per day
- **Item Pills**: Same as Year view (`draggable-timeline-item.tsx`)

---

## Week View

### Structure
```
Row 1: Year labels (e.g., "2024", "2025")
Row 2: Month labels (e.g., "January", "February", "March", ...)
Row 3: Day labels with day name (e.g., "Mon 3", "Tue 4", "Wed 5", ...)
  - Weekend days (Sat/Sun) have darker background
  - Sunday has thicker right border
Row 4+: Timeline data rows (one per unique item ID)
  - Each row contains cells (one per day)
  - Weekend cells have different background color
  - Item pills span across multiple cells (drag & drop enabled)
```

### File Locations

#### Row 1: Year Labels
- **File**: `components/main/year-month-week-view.tsx`
- **Lines**: 122-148
- **Component**: Direct JSX in `YearMonthWeekView`
- **Rendering**: Same as Year/Month view

#### Row 2: Month Labels
- **File**: `components/main/year-month-week-view.tsx`
- **Lines**: 150-194
- **Component**: Direct JSX in `YearMonthWeekView`
- **Rendering**: Same as Month view (uses `MONTH_NAMES_FULL`)

#### Row 3: Day Labels with Day Name
- **File**: `components/header-rows/week/week-view-row.tsx`
- **Lines**: 1-94
- **Component**: `WeekViewRow` (exported as `WeekRow`)
- **Rendered in**: `year-month-week-view.tsx` lines 253-279
- **Rendering**: Maps through `yearsInRange`, renders `WeekViewRow` component for each visible year
- **Cell Structure**: Each month shows all days with format "DayName DayNumber" (e.g., "Mon 3", "Tue 4")
- **Cell Width**: `weekDayWidth` pixels per day (default: 150px)
- **Weekend Styling**: Weekend days (Sat/Sun) have `bg-gray-100` background
- **Sunday Border**: Sunday has thicker right border (`2px solid`)

#### Row 4+: Timeline Data Rows
- **File**: `components/main/timeline-row.tsx`
- **Lines**: 1-444
- **Component**: `TimelineRow`
- **Rendered in**: `year-month-week-view.tsx` lines 282-322
- **Rendering**: Same structure as Year/Month view
- **Cell Width**: `weekDayWidth` pixels per day
- **Item Pills**: Same as Year/Month view (`draggable-timeline-item.tsx`)

---

## Day View

### Structure
```
Row 1: Day labels (e.g., "May 1, 2024", "May 2, 2024", ...)
Row 2: Hour labels (e.g., "0", "1", "2", ..., "23" for each day)
Row 3+: Timeline data rows (one per unique item ID)
  - Each row contains cells (one per 5-minute interval)
  - Each hour contains 12 cells (0-55 minutes, with cell 55 extending to 59:59.999)
  - Item pills span across multiple cells (drag & drop enabled)
```

### File Locations

#### Row 1: Day Labels
- **File**: `components/main/day-view.tsx`
- **Lines**: 92-121
- **Component**: Direct JSX in `DayView`
- **Rendering**: Maps through `daysInRange`, renders day label or spacer for virtualization
- **Format**: Uses `formatDayLabel(day)` utility function
- **Day Width**: `24 hours * hourColumnWidth` pixels per day

#### Row 2: Hour Labels
- **File**: `components/main/day-view.tsx`
- **Lines**: 123-154
- **Component**: Direct JSX in `DayView`
- **Rendering**: Maps through `daysInRange`, then `HOURS` array (0-23), renders hour label or spacer
- **Cell Structure**: Each day shows 24 hour labels (0-23)
- **Cell Width**: `hourColumnWidth` pixels per hour (default: 100px)

#### Row 3+: Timeline Data Rows
- **File**: `components/main/timeline-row-day.tsx`
- **Lines**: 1-350
- **Component**: `TimelineRowDay`
- **Rendered in**: `day-view.tsx` lines 157-194
- **Rendering**: Maps through `visibleRowIndices`, renders `TimelineRowDay` for each visible row
- **Cell Structure**: 
  - Unified CSS Grid spanning all days
  - Each cell represents 5-minute interval
  - Each hour contains 12 cells (0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55)
  - Cell 55 extends to 59:59.999
  - Droppable cells for drag & drop
- **Cell Width**: `cellWidth = hourColumnWidth / 12` pixels per 5-minute cell
- **Item Pills**: 
  - **File**: `components/dnd/draggable-timeline-item-day.tsx`
  - **Lines**: 1-375
  - **Component**: `DraggableTimelineItemDay`
  - **Rendered in**: `timeline-row-day.tsx` lines 200-280
  - **Features**: Draggable, resizable (left/right edges), shows title, handles 5-minute intervals

---

## Common Components

### Droppable Cells
- **Year/Month/Week**: `components/dnd/droppable-timeline-cell.tsx`
- **Day**: `components/dnd/droppable-timeline-cell-day.tsx`
- **Purpose**: Provides drop zones for drag & drop functionality
- **Features**: Only enabled around item spans (performance optimization)

### Resize Ghost
- **File**: `components/dnd/resize-ghost.tsx`
- **Purpose**: Visual preview during resize operations
- **Used in**: Both `draggable-timeline-item.tsx` and `draggable-timeline-item-day.tsx`

### Drag Preview Overlay
- **File**: `components/dnd/drag-preview-overlay.tsx`
- **Rendered in**: `timeline-container.tsx` lines 1065-1072
- **Purpose**: Shows preview of item being dragged

---

## Theming Support

All header rows support both **light** and **dark** themes using Tailwind's `dark:` modifier. The timeline automatically adapts to the user's theme preference, matching the virtualized table header styling.

### Header Rows Theming

The header rows use the same color scheme as the virtualized table header:
- **Background**: `bg-[#f1f1f1] dark:bg-[#131313]`
- **Text**: `text-foreground`
- **Borders**: `border-border/50`

#### Row 1: Year/Day Labels
- **File**: 
  - `components/main/year-month-week-view.tsx:132` (Year/Month/Week views)
  - `components/main/day-view.tsx:106` (Day view)
- **Classes**: `text-foreground bg-[#f1f1f1] dark:bg-[#131313] border-r border-border/50`
- **Container**: `bg-[#f1f1f1] dark:bg-[#131313]` (line 119 for Year/Month/Week, line 91 for Day)

#### Row 2: Month/Hour Labels
- **File**: 
  - `components/main/year-month-week-view.tsx:185` (Year/Month/Week views)
  - `components/main/day-view.tsx:146` (Day view)
- **Classes**: `text-foreground bg-[#f1f1f1] dark:bg-[#131313] border-r-2 border-border/50`
- **Border**: `border-b border-border/50` for row container

#### Row 3: Day/Week Labels

**Year View** (`components/header-rows/year/week-row.tsx:70`):
- **Classes**: `text-foreground bg-[#f1f1f1] dark:bg-[#131313] border-r border-border/50`
- **Container**: `border-r border-b border-border/50`

**Month View** (`components/header-rows/month/month-row.tsx:43`):
- **Classes**: `text-foreground bg-[#f1f1f1] dark:bg-[#131313] border-r border-b border-border/50`
- **Container**: `border-r border-border/50`

**Week View** (`components/header-rows/week/week-view-row.tsx:71`):
- **Weekdays**: `text-foreground bg-[#f1f1f1] dark:bg-[#131313] border-b border-r border-border/50`
- **Weekends**: `text-foreground bg-gray-100 dark:bg-gray-800 border-b border-r border-border/50`
- **Sunday border**: `border-r-2 border-border/50` (thicker right border)
- **Container**: `border-r border-border/50`

### Container Background
- **Header Container**: `bg-[#f1f1f1] dark:bg-[#131313]`
- **Files**: 
  - `components/main/year-month-week-view.tsx:119` (Year/Month/Week views)
  - `components/main/day-view.tsx:91` (Day view)

### Timeline Data Rows Theming

The timeline data rows (where items are displayed) use theme-aware styling:
- **Normal Cells**: Transparent background (inherits from parent)
- **Weekend Cells**: `bg-foreground/5` (works in both light and dark themes)
- **Borders**: `border-border/60` using CSS custom properties for theme support
- **Row Containers**: `border-r border-border/60` for right border
- **Files**:
  - `components/main/timeline-row.tsx:313,328,358` (Year/Month/Week views - cells and container)
  - `components/main/timeline-row-day.tsx:248,264` (Day view - cells and container)
  - `components/dnd/droppable-timeline-cell.tsx:103-110` (Year/Month/Week droppable cells)
  - `components/dnd/droppable-timeline-cell-day.tsx:108-118` (Day droppable cells)

---

## Item Pills (Draggable Timeline Items) Theming

The timeline item pills (draggable/resizable items) use theme-aware styling:
- **Background**: `bg-tertiary/50` (works in both light and dark themes)
- **Text Color**: `text-foreground` (adapts to theme)
- **Files**:
  - `components/dnd/draggable-timeline-item.tsx:294-306` (Year/Month/Week views - main item div)
  - `components/dnd/draggable-timeline-item.tsx:349-353` (Year/Month/Week views - title text)
  - `components/dnd/draggable-timeline-item-day.tsx:294-306` (Day view - main item div)
  - `components/dnd/draggable-timeline-item-day.tsx:333-337` (Day view - title text)
- **Configuration**: `timeline-container.tsx:162-194` (cellStyle object - backgroundColor and textColor removed, using Tailwind classes instead)

---

## Cell Styling

### Timeline Data Row Cells (Year/Month/Week views)
- **File**: `components/main/timeline-row.tsx`
- **Normal Cells**: Transparent background (no background color)
- **Weekend Cells**: `bg-foreground/5` for weekend days (Saturday/Sunday)
- **Borders**: `border-border/60` using CSS custom properties (`hsl(var(--border) / 0.5)`)
- **Droppable Cells**: 
  - **File**: `components/dnd/droppable-timeline-cell.tsx`
  - **Normal**: Transparent background, `bg-foreground/5` for weekends
  - **Drag Over**: `#bfdbfe` background with `2px solid #3b82f6` border
  - **Borders**: `border-border/60` (thicker `border-r-2` for Sundays in Week view)

### Timeline Data Row Cells (Day view)
- **File**: `components/main/timeline-row-day.tsx`
- **All Cells**: Transparent background (no background color)
- **Borders**: `border-border/60` using CSS custom properties (`hsl(var(--border) / 0.5)`)
- **Droppable Cells**: 
  - **File**: `components/dnd/droppable-timeline-cell-day.tsx`
  - **Normal**: Transparent background
  - **Hover**: `#eff6ff` background
  - **Drag Over**: `#bfdbfe` background with `2px solid #3b82f6` border
  - **Borders**: `1px solid #f3f4f6` bottom border

---

## Virtualization

All views use virtualization for performance:
- **Horizontal**: Only visible years/days are fully rendered, others use spacers
- **Vertical**: Only visible rows are rendered (with overscan)
- **Context**: `virtualization/context/visible-range-context.tsx`
- **Hooks**: 
  - `use-visible-years.ts` (Year/Month/Week)
  - `use-visible-days.ts` (Day)
  - `use-visible-rows.ts` (All views)

---

## Summary Table

| View | Row 1 | Row 2 | Row 3 | Row 4+ | Item Pills |
|------|-------|-------|-------|--------|------------|
| **Year** | Year labels<br/>`year-month-week-view.tsx:122-148` | Month labels<br/>`year-month-week-view.tsx:150-194` | Week start days<br/>`week-row.tsx:1-87` | Timeline rows<br/>`timeline-row.tsx:1-444` | `draggable-timeline-item.tsx:1-391` |
| **Month** | Year labels<br/>`year-month-week-view.tsx:122-148` | Month labels<br/>`year-month-week-view.tsx:150-194` | Day numbers<br/>`month-row.tsx:1-57` | Timeline rows<br/>`timeline-row.tsx:1-444` | `draggable-timeline-item.tsx:1-391` |
| **Week** | Year labels<br/>`year-month-week-view.tsx:122-148` | Month labels<br/>`year-month-week-view.tsx:150-194` | Day labels<br/>`week-view-row.tsx:1-94` | Timeline rows<br/>`timeline-row.tsx:1-444` | `draggable-timeline-item.tsx:1-391` |
| **Day** | Day labels<br/>`day-view.tsx:92-121` | Hour labels<br/>`day-view.tsx:123-154` | N/A | Timeline rows<br/>`timeline-row-day.tsx:1-350` | `draggable-timeline-item-day.tsx:1-375` |

---

## Key Files Reference

### Main Components
- `timeline-container.tsx` - Main orchestrator, handles data mapping and DnD
- `timeline-wrapper.tsx` - Wrapper with view switcher and zoom controls

### View Components
- `components/main/year-month-week-view.tsx` - Year/Month/Week view renderer
- `components/main/day-view.tsx` - Day view renderer

### Header Rows
- `components/header-rows/year/week-row.tsx` - Year view Row 3 (week start days)
- `components/header-rows/month/month-row.tsx` - Month view Row 3 (day numbers)
- `components/header-rows/week/week-view-row.tsx` - Week view Row 3 (day labels)

### Timeline Rows
- `components/main/timeline-row.tsx` - Year/Month/Week timeline data rows
- `components/main/timeline-row-day.tsx` - Day timeline data rows

### Item Pills
- `components/dnd/draggable-timeline-item.tsx` - Year/Month/Week item pills
- `components/dnd/draggable-timeline-item-day.tsx` - Day item pills

### DnD Components
- `components/dnd/droppable-timeline-cell.tsx` - Year/Month/Week drop zones
- `components/dnd/droppable-timeline-cell-day.tsx` - Day drop zones
- `components/dnd/drag-preview-overlay.tsx` - Drag preview
- `components/dnd/resize-ghost.tsx` - Resize preview
