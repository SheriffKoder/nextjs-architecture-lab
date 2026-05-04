# View Switching System Migration Plan

## Overview

This plan outlines the migration from the current numeric-based view switching system (`viewToggleConfig` with 0/1 values) to a new string-based system using URL parameters and the `ViewSwitcher` component.

---

## Current System (To Be Removed)

### Current Implementation
- Uses `viewToggleConfig` prop with numeric `value` (0 or 1)
- Parent component manages state
- No URL parameter synchronization
- Limited to 2 views per toggle

### Files to Modify
- `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`
- Any components using `viewToggleConfig`

---

## New System (To Be Implemented)

### Key Features
- ✅ String-based view keys (`'table'`, `'kanban'`, `'map'`, etc.)
- ✅ URL parameter synchronization (`?view=kanban`)
- ✅ Support for multiple views (not just 2)
- ✅ Pre-configured view options component
- ✅ Conditional display based on `availableViews` prop
- ✅ Default to `'table'` when no param provided

---

## Implementation Plan

### Phase 1: Create New Hook for URL-Based View Management

**File**: `features/filtering-wrapper-multi-display/hooks/useViewSwitcher.ts` (NEW)

```typescript
'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UseViewSwitcherOptions {
  /** Available view keys */
  availableViews: string[]
  /** Default view if no param in URL */
  defaultView?: string
  /** URL parameter name (default: 'view') */
  paramName?: string
}

interface UseViewSwitcherReturn {
  /** Current view key */
  currentView: string
  /** Change handler that updates URL */
  setView: (view: string) => void
  /** Whether a specific view is available */
  isViewAvailable: (view: string) => boolean
}

/**
 * Hook for managing view state synchronized with URL parameters
 * 
 * @example
 * ```tsx
 * const { currentView, setView } = useViewSwitcher({
 *   availableViews: ['table', 'kanban', 'map'],
 *   defaultView: 'table'
 * })
 * ```
 */
export function useViewSwitcher(options: UseViewSwitcherOptions): UseViewSwitcherReturn {
  const {
    availableViews,
    defaultView = 'table',
    paramName = 'view'
  } = options

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Get initial view from URL or use default
  const getViewFromUrl = (): string => {
    const viewParam = searchParams.get(paramName)
    if (viewParam && availableViews.includes(viewParam)) {
      return viewParam
    }
    return defaultView
  }

  const [currentView, setCurrentView] = useState<string>(getViewFromUrl)

  // Sync with URL params when they change (browser back/forward)
  useEffect(() => {
    const urlView = getViewFromUrl()
    if (urlView !== currentView) {
      setCurrentView(urlView)
    }
  }, [searchParams, paramName, availableViews, defaultView])

  const setView = (view: string) => {
    if (!availableViews.includes(view)) {
      console.warn(`View "${view}" is not in availableViews:`, availableViews)
      return
    }

    setCurrentView(view)
    
    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    if (view === defaultView) {
      // Remove param if it's the default view (cleaner URLs)
      params.delete(paramName)
    } else {
      params.set(paramName, view)
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const isViewAvailable = (view: string): boolean => {
    return availableViews.includes(view)
  }

  return {
    currentView,
    setView,
    isViewAvailable
  }
}
```

**Tasks**:
- [ ] Create `hooks/useViewSwitcher.ts`
- [ ] Add TypeScript types
- [ ] Implement URL param reading/writing
- [ ] Handle browser back/forward navigation
- [ ] Add validation for available views

---

### Phase 2: Create View Switcher Wrapper Component

**File**: `features/filtering-wrapper-multi-display/components/view-switcher-wrapper.tsx` (NEW)

```typescript
'use client'

import React from 'react'
import { useViewSwitcher } from '@/hooks/useViewSwitcher'
import ViewSwitcher, { ViewSwitcherOption } from '@/components/design/view-switcher'
import { Table, LayoutDashboard, Map, Calendar, List } from 'lucide-react'

// Pre-configured view options
const VIEW_OPTIONS: Record<string, ViewSwitcherOption> = {
  table: {
    key: 'table',
    label: 'Table',
    icon: Table
  },
  kanban: {
    key: 'kanban',
    label: 'Kanban',
    icon: LayoutDashboard
  },
  map: {
    key: 'map',
    label: 'Map',
    icon: Map
  },
  calendar: {
    key: 'calendar',
    label: 'Calendar',
    icon: Calendar
  },
  subheadings: {
    key: 'subheadings',
    label: 'SubHeadings',
    icon: List
  }
}

interface ViewSwitcherWrapperProps {
  /** Available view keys to display */
  availableViews: string[]
  /** Optional className */
  className?: string
  /** Optional disabled state */
  disabled?: boolean
}

/**
 * Wrapper component that integrates ViewSwitcher with URL params
 * Only displays views that are in availableViews array
 * 
 * @example
 * ```tsx
 * <ViewSwitcherWrapper availableViews={['table', 'kanban']} />
 * ```
 */
export function ViewSwitcherWrapper({
  availableViews,
  className = '',
  disabled = false
}: ViewSwitcherWrapperProps) {
  const { currentView, setView } = useViewSwitcher({
    availableViews,
    defaultView: 'table'
  })

  // Filter options to only show available views
  const options = availableViews
    .map(key => VIEW_OPTIONS[key])
    .filter((option): option is ViewSwitcherOption => option !== undefined)

  // Don't render if no valid options or only one option
  if (options.length <= 1) {
    return null
  }

  return (
    <ViewSwitcher
      options={options}
      value={currentView}
      onChange={setView}
      disabled={disabled}
      className={className}
    />
  )
}
```

**Tasks**:
- [ ] Create `features/filtering-wrapper-multi-display/components/view-switcher-wrapper.tsx`
- [ ] Import all necessary icons
- [ ] Define VIEW_OPTIONS constant
- [ ] Integrate with `useViewSwitcher` hook
- [ ] Filter options based on `availableViews`
- [ ] Handle edge cases (no options, single option)

---

### Phase 3: Update FilteringWrapper Interface

**File**: `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`

#### 3.1 Remove Old Props

**Remove**:
```typescript
// REMOVE THIS:
viewToggleConfig?: {
  value: number;
  optionOne: string;
  optionTwo: string;
  iconOne: LucideIcon;
  iconTwo: LucideIcon;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
};
```

#### 3.2 Add New Props

**Add**:
```typescript
// ADD THIS:
/** Available view modes to display in switcher */
availableViews?: string[]; // e.g., ['table', 'kanban', 'map']
```

#### 3.3 Update Component Signature

```typescript
export function FilteringWrapper<T extends Record<string, any> = Record<string, any>>({
  data,
  columns,
  // ... other props
  availableViews = ['table'], // Default to table only
  // ... rest of props
}: FilteringWrapperProps<T>) {
```

**Tasks**:
- [ ] Remove `viewToggleConfig` from interface
- [ ] Add `availableViews?: string[]` prop
- [ ] Update component function signature
- [ ] Set default value to `['table']`

---

### Phase 4: Update View Determination Logic

**File**: `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`

#### 4.1 Import New Hook

```typescript
import { useViewSwitcher } from '@/hooks/useViewSwitcher'
```

#### 4.2 Replace View Logic

**Remove** (lines 360-368):
```typescript
// REMOVE THIS:
const currentViewMode = viewToggleConfig?.value;
const isAlternativeView = currentViewMode === 1;
const isKanbanView = isAlternativeView && kanbanConfig !== undefined;
const isCalendarView = isAlternativeView && calendarConfig !== undefined && !isKanbanView;
const isSubHeadingsView = currentViewMode === 0 && subheadingsConfig !== undefined;
```

**Replace with**:
```typescript
// ADD THIS:
const { currentView } = useViewSwitcher({
  availableViews: availableViews || ['table'],
  defaultView: 'table'
})

// Determine which view to render
const isKanbanView = currentView === 'kanban' && kanbanConfig !== undefined
const isCalendarView = currentView === 'calendar' && calendarConfig !== undefined
const isMapView = currentView === 'map' && mapConfig !== undefined // If you add map support
const isSubHeadingsView = currentView === 'subheadings' && subheadingsConfig !== undefined
const isTableView = currentView === 'table' || (!isKanbanView && !isCalendarView && !isMapView && !isSubHeadingsView)
```

**Tasks**:
- [ ] Import `useViewSwitcher` hook
- [ ] Remove old view determination logic
- [ ] Add new string-based view checks
- [ ] Ensure table is default fallback

---

### Phase 5: Update View Switcher Rendering

**File**: `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`

#### 5.1 Remove Old Toggle Button

**Remove** (lines 395-409):
```typescript
// REMOVE THIS:
{viewToggleConfig && (
  <div className="w-full flex justify-end my-auto">
    <ViewToggleButton
      value={viewToggleConfig.value}
      optionOne={viewToggleConfig.optionOne}
      optionTwo={viewToggleConfig.optionTwo}
      iconOne={viewToggleConfig.iconOne}
      iconTwo={viewToggleConfig.iconTwo}
      onChange={viewToggleConfig.onChange}
      disabled={viewToggleConfig.disabled}
      className={viewToggleConfig.className}
    />
  </div>
)}
```

#### 5.2 Add New Switcher

**Add**:
```typescript
// ADD THIS:
{availableViews && availableViews.length > 1 && (
  <div className="w-full flex justify-end my-auto">
    <ViewSwitcherWrapper
      availableViews={availableViews}
    />
  </div>
)}
```

**Tasks**:
- [ ] Remove `ViewToggleButton` import and usage
- [ ] Import `ViewSwitcherWrapper`
- [ ] Add conditional rendering based on `availableViews`
- [ ] Only show when more than 1 view is available

---

### Phase 6: Update View Rendering Logic

**File**: `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`

**Update** the view rendering section (lines 490-608) to use new view checks:

```typescript
{noTableDisplay && isDashboardRoute ? (
  <DashboardContent ... />
) : noTableDisplay ? (
  null
) : isKanbanView ? (
  <KanbanWrapper ... />
) : isCalendarView ? (
  <CalendarContainer ... />
) : isMapView ? (  // If you add map support
  <MapContainer ... />
) : isSubHeadingsView ? (
  <SubHeadingsContainer ... />
) : (
  <VirtualizedTableComponent ... />
)}
```

**Tasks**:
- [ ] Update conditional checks to use new boolean flags
- [ ] Ensure proper fallback to table view
- [ ] Add map view support if needed

---

### Phase 7: Cleanup

#### 7.1 Remove Unused Imports

**File**: `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`

**Remove**:
```typescript
// REMOVE:
import ViewToggleButton from "./components/view-toggle-button";
import { LucideIcon } from "lucide-react"; // If only used for viewToggleConfig
```

#### 7.2 Remove Old Documentation

**Files to Update/Remove**:
- [ ] Update `view-switching-logic.md` to reflect new system
- [ ] Remove or archive old examples using `viewToggleConfig`

#### 7.3 Update Type Definitions

**File**: `features/filtering-wrapper-multi-display/types/index.ts` (if exists)

- [ ] Remove any types related to `viewToggleConfig`
- [ ] Add types for `availableViews` if needed

---

## Migration Checklist

### New Files to Create
- [ ] `hooks/useViewSwitcher.ts` - URL-based view management hook
- [ ] `features/filtering-wrapper-multi-display/components/view-switcher-wrapper.tsx` - Wrapper component

### Files to Modify
- [ ] `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`
  - [ ] Remove `viewToggleConfig` prop
  - [ ] Add `availableViews` prop
  - [ ] Update view determination logic
  - [ ] Replace toggle button with ViewSwitcherWrapper
  - [ ] Update view rendering conditions
  - [ ] Remove unused imports

### Files to Update/Remove
- [ ] `features/filtering-wrapper-multi-display/documentation/view-switching-logic.md`
- [ ] `features/reports-expirations/expirations-content.tsx` - Update Table/Calendar toggle
- [ ] `features/portfolio-project-board/projectboard-content.tsx` - Update SubHeadings/Kanban toggle

### Testing Checklist
- [ ] Test URL param reading on page load
- [ ] Test URL param writing on view change
- [ ] Test browser back/forward navigation
- [ ] Test with single view (should hide switcher)
- [ ] Test with multiple views
- [ ] Test default fallback to table
- [ ] Test invalid view params (should default to table)
- [ ] Test view switching with different combinations:
  - [ ] Table ↔ Kanban
  - [ ] Table ↔ Calendar
  - [ ] Table ↔ Kanban ↔ Map (if supported)
  - [ ] SubHeadings ↔ Kanban

---

## Specific File Migrations

### File 1: `features/reports-expirations/expirations-content.tsx`

**Current Code** (lines 36-49):
```typescript
const viewToggleConfig = {
  value: viewMode,
  optionOne: 'Table',
  optionTwo: 'Calendar',
  iconOne: Table,
  iconTwo: LayoutDashboard,
  onChange: (value: number) => {
    onViewModeChange(value)
    console.log('View mode changed to:', value === 0 ? 'Table' : 'Calendar')
  },
  disabled: false,
  className: 'w-[230px]'
}
```

**Migration Steps**:
1. Remove `viewMode` and `onViewModeChange` props (no longer needed)
2. Remove `viewToggleConfig` object
3. Update FilteringWrapper usage:

**New Code**:
```typescript
// Remove viewMode and onViewModeChange from component props
// Remove viewToggleConfig object

<FilteringWrapper
  data={tableData}
  columns={tableColumns}
  onRowClick={handleRowClick}
  filterConfig={filterConfig}
  tableConfig={{
    ...tableConfig,
    loading: loading,
  }}
  availableViews={['table', 'calendar']}  // ADD THIS
  calendarConfig={calendarConfig}
/>
```

**Tasks**:
- [ ] Remove `viewMode` and `onViewModeChange` from component interface
- [ ] Remove `viewToggleConfig` object
- [ ] Add `availableViews={['table', 'calendar']}` prop
- [ ] Remove `viewToggleConfig` prop from FilteringWrapper
- [ ] Update parent component to remove viewMode state management

---

### File 2: `features/portfolio-project-board/projectboard-content.tsx`

**Current Code** (lines 19-31):
```typescript
const viewToggleConfig = {
  value: viewMode,
  optionOne: 'Grouped',
  optionTwo: 'Kanban',
  iconOne: BetweenHorizonalStart,
  iconTwo: LayoutDashboard,
  onChange: (value: number) => {
    onViewModeChange(value)
    console.log('View mode changed to:', value === 0 ? 'Grouped' : 'Kanban')
  },
  disabled: false,
  className: 'w-[230px]'
}
```

**Migration Steps**:
1. Remove `viewMode` and `onViewModeChange` props (no longer needed)
2. Remove `viewToggleConfig` object
3. Update FilteringWrapper usage:

**New Code**:
```typescript
// Remove viewMode and onViewModeChange from component props
// Remove viewToggleConfig object

<FilteringWrapper
  key={pathname}
  data={data}
  columns={tableColumns}
  onRowClick={handleRowClick}
  filterConfig={filterConfig}
  tableConfig={{
    ...tableConfig,
    loading: loading,
  }}
  availableViews={['subheadings', 'kanban']}  // ADD THIS
  kanbanConfig={kanbanConfig}
  subheadingsConfig={subheadingsConfig}
  onFilterApply={onFilterApply}
  onSortChange={onSortChange}
  serverPagination={serverPagination}
  filterUniqueValues={filterUniqueValues}
/>
```

**Tasks**:
- [ ] Remove `viewMode` and `onViewModeChange` from component interface
- [ ] Remove `viewToggleConfig` object
- [ ] Add `availableViews={['subheadings', 'kanban']}` prop
- [ ] Remove `viewToggleConfig` prop from FilteringWrapper
- [ ] Update parent component to remove viewMode state management

---

## Usage Examples

### Example 1: Table and Kanban Only

```typescript
<FilteringWrapper
  data={data}
  columns={columns}
  availableViews={['table', 'kanban']}
  kanbanConfig={{
    columnKey: 'status',
    cardKey: 'id',
    // ... other config
  }}
/>
```

### Example 2: Multiple Views

```typescript
<FilteringWrapper
  data={data}
  columns={columns}
  availableViews={['table', 'kanban', 'map', 'calendar']}
  kanbanConfig={kanbanConfig}
  calendarConfig={calendarConfig}
  mapConfig={mapConfig} // If you add map support
/>
```

### Example 3: Single View (No Switcher)

```typescript
<FilteringWrapper
  data={data}
  columns={columns}
  availableViews={['table']} // Switcher won't show
/>
```

### Example 4: SubHeadings and Kanban

```typescript
<FilteringWrapper
  data={data}
  columns={columns}
  availableViews={['subheadings', 'kanban']}
  subheadingsConfig={subheadingsConfig}
  kanbanConfig={kanbanConfig}
/>
```

---

## Backward Compatibility

### Breaking Changes
- ❌ `viewToggleConfig` prop is removed
- ❌ Numeric view mode (0/1) is replaced with string keys
- ❌ Parent components must update to use new system

### Migration Path for Existing Code

**Old Code**:
```typescript
const [viewMode, setViewMode] = useState(0)

<FilteringWrapper
  viewToggleConfig={{
    value: viewMode,
    optionOne: 'Table',
    optionTwo: 'Kanban',
    iconOne: Table,
    iconTwo: LayoutDashboard,
    onChange: setViewMode
  }}
  kanbanConfig={viewMode === 1 ? kanbanConfig : undefined}
/>
```

**New Code**:
```typescript
<FilteringWrapper
  availableViews={['table', 'kanban']}
  kanbanConfig={kanbanConfig} // Can always be provided
/>
```

**Benefits**:
- ✅ No parent state management needed
- ✅ URL params automatically handled
- ✅ Browser back/forward works
- ✅ Shareable URLs with view state

---

## Future Enhancements

### Potential Additions
1. **Map View Support**: Add `mapConfig` prop and map view rendering
2. **Custom View Options**: Allow passing custom view options instead of pre-configured ones
3. **View Persistence**: Store last selected view in localStorage
4. **View-Specific Filters**: Different filter configs per view
5. **View Transitions**: Smooth animations when switching views

---

## Rollout Strategy

### Phase 1: Development
1. Create new hook and wrapper component
2. Update FilteringWrapper internally
3. Test thoroughly in development

### Phase 2: Migration
1. Update all components using `viewToggleConfig`
2. Test each updated component
3. Remove old code

### Phase 3: Cleanup
1. Remove unused imports
2. Update documentation
3. Archive old examples

---

## Notes

- The new system uses URL params, so views are shareable via URL
- Default view is always `'table'` if no param or invalid param
- The switcher only shows when `availableViews.length > 1`
- All view configs can be provided simultaneously (no need to conditionally pass)
- The hook validates that only available views can be set
