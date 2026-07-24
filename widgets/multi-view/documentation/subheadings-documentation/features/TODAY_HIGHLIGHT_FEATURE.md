# Today Highlight Feature

## Overview

This document describes the implementation of the "today" highlight feature in both the timeline header rows (Row 3) and data rows for Year, Month, and Week views. The feature visually distinguishes today's date with:

**Header Rows (Row 3) - Month and Week views only**:
- Highlighted background with inverted text color
- Transparent borders
- Downward-pointing triangle indicator

**Data Rows**:
- Vertical line indicator at the center of today's cell (Year, Month, Week views)
- Upward-pointing triangle indicator at the top of first row (Year view only)

## Features

### 1. Today Highlight
- **Location**: Row 3 (days row) in Month and Week views only
- **Styling**: 
  - Background: `bg-foreground` (uses theme foreground color)
  - Text: `text-background` (uses theme background color for contrast)
- **Purpose**: Makes today's date immediately visible in the timeline header

### 2. Border Removal
- **When**: Applied only to today's cell
- **Styling**: All borders set to `border-transparent`
- **Purpose**: Creates a cleaner look by removing border lines from the highlighted cell, allowing the background color to stand out

### 3. Triangle Indicator (Header Rows Only)
- **Position**: Absolutely positioned at the bottom center of today's cell in header row
- **Styling**:
  - Size: 6px triangle (created using CSS borders)
  - Color: `hsl(var(--foreground))` (matches theme foreground)
  - Position: `-bottom-0 left-1/2 -translate-x-1/2 translate-y-full`
- **Purpose**: Provides a visual indicator pointing downward to emphasize today's date in the header

### 4. Vertical Line Indicator (Data Rows Only)
- **Position**: Absolutely positioned at the center of today's cell in data rows
- **Views**: Year, Month, and Week views
- **Styling**:
  - Width: `1px`
  - Height: `110%` (extends slightly beyond cell boundaries)
  - Color: `hsl(var(--foreground))` (matches theme foreground)
  - Position: `absolute -top-0 bottom-0 h-[110%] left-1/2 -translate-x-[calc(50%+2px)]`
  - Interaction: `pointer-events-none` (does not interfere with cell interactions)
- **Purpose**: Provides a vertical line indicator to align today's date across all timeline rows

### 5. Triangle Indicator at Top of First Row (Year View Data Rows Only)
- **Position**: Absolutely positioned at the top center of today's cell in the first data row
- **Views**: Year view only
- **Styling**:
  - Size: 6px triangle (created using CSS borders)
  - Color: `hsl(var(--foreground))` (matches theme foreground)
  - Position: `absolute -top-0 left-1/2 -translate-x-[calc(50%+2px)] -translate-y-[1px]`
  - Direction: Points upward (using `borderTop`)
  - Interaction: `pointer-events-none` (does not interfere with cell interactions)
- **Purpose**: Provides a visual indicator at the top of the first row in Year view, complementing the vertical line that runs through all rows

## Implementation

### Files Modified

1. **`components/header-rows/month/month-row.tsx`**
   - Added `isToday()` function to detect if a day matches today's date
   - Applied conditional styling for today's cell
   - Added triangle indicator component

2. **`components/header-rows/week/week-view-row.tsx`**
   - Added `isToday()` function to detect if a day matches today's date
   - Applied conditional styling for today's cell (preserving weekend styling logic)
   - Added triangle indicator component

3. **`components/main/timeline-row.tsx`**
   - Added `isToday()` function to detect if a day matches today's date
   - Detects today in the cell generation loop
   - Passes `isToday` prop to `DroppableTimelineCell` component
   - Renders vertical line and triangle indicators in regular div cells (non-droppable cells)

4. **`components/dnd/droppable-timeline-cell.tsx`**
   - Added `isToday?: boolean` prop to interface
   - Renders vertical line indicator when `isToday` is true and view is Year, Month, or Week
   - Renders upward-pointing triangle indicator when `isToday` is true, `timelineIndex === 0`, and view is Year

### Code Structure

#### Today Detection
```typescript
const isToday = (year: number, monthIndex: number, day: number) => {
  const today = new Date()
  return (
    year === today.getFullYear() &&
    monthIndex === today.getMonth() &&
    day === today.getDate()
  )
}
```

#### Cell Styling
```typescript
className={`relative flex items-center justify-center text-xs font-medium ${
  today
    ? 'bg-foreground text-background border-r border-b border-transparent'
    : 'text-foreground bg-[#f1f1f1] dark:bg-[#131313] border-r border-b border-border/50'
}`}
```

#### Triangle Indicator (Header Rows)
```typescript
{today && (
  <div
    className="absolute -bottom-0 left-1/2 -translate-x-1/2 translate-y-full"
    style={{
      width: 0,
      height: 0,
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTop: '6px solid hsl(var(--foreground))',
    }}
  />
)}
```

#### Vertical Line Indicator (Data Rows)
```typescript
{isToday && (view === 'Year' || view === 'Month' || view === 'Week') && (
  <div
    className="absolute -top-0 bottom-0 h-[110%] left-1/2 -translate-x-[calc(50%+2px)] pointer-events-none"
    style={{
      width: '1px',
      backgroundColor: 'hsl(var(--foreground))',
    }}
  />
)}
```

#### Triangle Indicator at Top of First Row (Year View Data Rows)
```typescript
{isToday && timelineIndex === 0 && view === 'Year' && (
  <div
    className="absolute -top-0 left-1/2 -translate-x-[calc(50%+2px)] -translate-y-[1px] pointer-events-none"
    style={{
      width: 0,
      height: 0,
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTop: '6px solid hsl(var(--foreground))',
    }}
  />
)}
```

## Notes

- **Year View Header**: The header row highlight (background, triangle) is NOT implemented in Year view (Row 3 shows week start days, not individual days)
- **Year View Data Rows**: 
  - The vertical line indicator IS implemented in Year view data rows
  - An upward-pointing triangle appears at the top of the first data row (timelineIndex === 0) for today's cell
- **Weekend Styling**: In Week view, the today highlight takes priority over weekend styling
- **Theme Support**: All colors use CSS variables for proper dark/light mode support
- **Positioning**: 
  - Header row triangle uses `translate-y-full` to position it below the cell border
  - Data row triangle (Year view) uses `-translate-y-[1px]` to position it slightly above the cell border
  - The vertical line extends 110% height and is slightly offset for visual alignment
- **Data Rows**: 
  - The vertical line appears in Year, Month, and Week views (not Day view)
  - The triangle indicator appears only in Year view on the first row (timelineIndex === 0)
- **Non-Interactive**: Both the vertical line and triangle have `pointer-events-none` to avoid interfering with cell interactions
- **Cell Types**: The indicators are rendered in both droppable cells (`DroppableTimelineCell`) and regular div cells to ensure visibility across all rows

## Visual Result

**Header Row (Row 3) - Month and Week views only**:
- Today's date cell has a contrasting background (foreground color)
- Text is inverted (background color) for readability
- No visible borders on today's cell
- A small downward-pointing triangle appears at the bottom center of today's cell

**Data Rows - Year, Month, and Week views**:
- A vertical line appears at the center of today's cell in all timeline rows
- The line extends slightly beyond the cell boundaries (110% height)
- The line uses the foreground color and does not interfere with cell interactions
- This creates a visual alignment indicator across all rows for today's date

**Data Rows - Year view only (first row)**:
- An upward-pointing triangle appears at the top center of today's cell in the first data row
- The triangle complements the vertical line, providing a clear visual marker at the top
- The triangle uses the foreground color and does not interfere with cell interactions
