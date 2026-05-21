# Timeline View Implementation Plan

## Overview

This plan outlines the integration of the Timeline view feature (`features/timeline-3`) into the `FilteringWrapper` component. The timeline view will be added as a new view option alongside existing views (table, kanban, calendar, map, subheadings).

---

## Current State

### Existing Timeline Feature
- **Location**: `features/filtering-wrapper-multi-display/features/timeline-3/`
- **Main Component**: `TimelineWrapper` (in `timeline-wrapper.tsx`)
- **Status**: ✅ Feature is implemented and working standalone
- **Integration Status**: ❌ Not yet integrated into `FilteringWrapper`

### TimelineWrapper Interface

```typescript
interface TimelineWrapperProps {
  timelineData: any[]
  mappingKeys: {
    startDateKey: string      // e.g., 'created_at'
    endDateKey: string        // e.g., 'due_date'
    titleKey?: string         // e.g., 'title'
    typeKey?: string          // e.g., 'type'
    statusKey?: string        // e.g., 'status'
    uniqueIdKey?: string      // e.g., 'id'
  }
  views?: string[]            // Default: ['Year', 'Month', 'Week', 'Day']
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
}
```

---

## Implementation Plan

### Phase 1: Add Timeline Configuration Type

**File**: `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`

**Add** timeline configuration to `FilteringWrapperProps` interface (around line 123, after `subheadingsConfig`):

```typescript
// Timeline configuration for timeline view
timelineConfig?: {
  // Field mappings to convert data items to timeline format
  mappingKeys: {
    startDateKey: string      // Required: field name for start date
    endDateKey: string        // Required: field name for end date
    titleKey?: string         // Optional: field name for item title
    typeKey?: string          // Optional: field name for item type
    statusKey?: string        // Optional: field name for item status
    uniqueIdKey?: string      // Optional: field name for unique identifier
  }
  // Available timeline views (default: ['Year', 'Month', 'Week', 'Day'])
  views?: string[]
  // Callback when a timeline event/item is clicked
  onEventClick?: (eventId: string) => void
  // Callback when an item is dragged to a new position
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  // Callback when an item is resized (start/end dates changed)
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
}
```

**Tasks**:
- [ ] Add `timelineConfig` prop to `FilteringWrapperProps` interface
- [ ] Ensure proper TypeScript typing with generic `T`

---

### Phase 2: Import TimelineWrapper Component

**File**: `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`

**Add** import statement (around line 34-36, with other view imports):

```typescript
import TimelineWrapper from "./features/timeline-3/timeline-wrapper";
```

**Tasks**:
- [ ] Add import for `TimelineWrapper`
- [ ] Verify import path is correct

---

### Phase 3: Add Timeline View Detection Logic

**File**: `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`

**Add** timeline view detection (around line 384-389, with other view checks):

```typescript
// Determine which view to render based on currentView and configs
const isKanbanView = currentView === 'kanban' && kanbanConfig !== undefined
const isCalendarView = currentView === 'calendar' && calendarConfig !== undefined
const isMapView = currentView === 'map' // mapConfig is optional, map view works without it
const isSubHeadingsView = currentView === 'subheadings' && subheadingsConfig !== undefined
const isTimelineView = currentView === 'timeline' && timelineConfig !== undefined  // ADD THIS
const isTableView = currentView === 'table' || (!isKanbanView && !isCalendarView && !isMapView && !isSubHeadingsView && !isTimelineView)  // UPDATE THIS
```

**Tasks**:
- [ ] Add `isTimelineView` boolean check
- [ ] Update `isTableView` fallback to exclude timeline view

---

### Phase 4: Add Timeline View Rendering

**File**: `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`

**Add** timeline view rendering in the main render section (around line 556, after map view):

```typescript
) : isMapView ? (
  /* Map View - Display MapVisualizer with mock data */
  <MapsContainerWithMock
    data={displayFilteredData}
    mapConfig={mapConfig}
  />
) : isTimelineView ? (  // ADD THIS BLOCK
  /* Timeline View */
  <TimelineWrapper
    timelineData={displayFilteredData}
    mappingKeys={timelineConfig.mappingKeys}
    views={timelineConfig.views}
    onEventClick={timelineConfig.onEventClick}
    onItemDrag={timelineConfig.onItemDrag}
    onItemResize={timelineConfig.onItemResize}
  />
) : isSubHeadingsView ? (
```

**Tasks**:
- [ ] Add timeline view conditional rendering
- [ ] Pass `displayFilteredData` as `timelineData`
- [ ] Map all timeline config props correctly
- [ ] Ensure proper placement in the conditional chain

---

### Phase 5: Add Timeline to View Switcher Options

**File**: `features/filtering-wrapper-multi-display/components/view-switcher-wrapper.tsx`

**Add** timeline option to `VIEW_OPTIONS` (around line 9-35):

```typescript
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
  },
  timeline: {  // ADD THIS
    key: 'timeline',
    label: 'Timeline',
    icon: TextAlignStart
  }
}
```

**Tasks**:
- [ ] Add `timeline` entry to `VIEW_OPTIONS`
- [ ] Import appropriate icon (or use existing TextAlignStart icon)
- [ ] Verify icon import

---

### Phase 6: Update Component Props Destructuring

**File**: `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`

**Add** `timelineConfig` to component props destructuring (around line 178-202):

```typescript
export function FilteringWrapper<T extends Record<string, any> = Record<string, any>>({
  data,
  columns,
  onRowClick,
  onActionClick,
  actionConfigs,
  selectedItemId,
  onCellValueChange,
  globalSearchText,
  isItemLoading,
  accordionConfig,
  filterConfig,
  tableConfig,
  availableViews = ['table'],
  calendarConfig,
  kanbanConfig,
  subheadingsConfig,
  mapConfig,
  timelineConfig,  // ADD THIS
  noTableDisplay = false,
  onFilterApply,
  onSortChange,
  serverPagination,
  filterUniqueValues,
  columnActions,
}: FilteringWrapperProps<T>) {
```

**Tasks**:
- [ ] Add `timelineConfig` to destructured props
- [ ] Ensure it's properly typed

---

## Testing Checklist

### Unit Tests
- [ ] Timeline view renders when `currentView === 'timeline'` and `timelineConfig` is provided
- [ ] Timeline view does not render when `timelineConfig` is missing
- [ ] Timeline view receives filtered data correctly
- [ ] Timeline callbacks (`onEventClick`, `onItemDrag`, `onItemResize`) are passed correctly

### Integration Tests
- [ ] Timeline view appears in view switcher when `availableViews` includes `'timeline'`
- [ ] Switching to timeline view works via URL parameter (`?view=timeline`)
- [ ] Timeline view respects filtering (uses `displayFilteredData`)
- [ ] Timeline view respects search results
- [ ] Timeline view works with server pagination (if applicable)

### Manual Testing
- [ ] Test with sample data matching timeline format
- [ ] Test all timeline views (Year, Month, Week, Day)
- [ ] Test timeline interactions (click, drag, resize)
- [ ] Test view switching between timeline and other views
- [ ] Test filtering with timeline view active
- [ ] Test search with timeline view active

---

## Usage Example

After implementation, timeline view can be used like this:

```typescript
<FilteringWrapper
  data={timelineData}
  columns={columns}
  availableViews={['table', 'timeline', 'kanban']}
  timelineConfig={{
    mappingKeys: {
      startDateKey: 'created_at',
      endDateKey: 'due_date',
      titleKey: 'title',
      typeKey: 'type',
      statusKey: 'status',
      uniqueIdKey: 'id'
    },
    views: ['Year', 'Month', 'Week', 'Day'],
    onEventClick: (eventId) => {
      console.log('Event clicked:', eventId)
    },
    onItemDrag: (item) => {
      console.log('Item dragged:', item)
      // Update item in database/state
    },
    onItemResize: (item) => {
      console.log('Item resized:', item)
      // Update item dates in database/state
    }
  }}
  filterConfig={filterConfig}
  tableConfig={tableConfig}
/>
```

---

## Migration Notes

### Breaking Changes
- None (this is a new feature addition)

### Backward Compatibility
- ✅ Existing code continues to work without changes
- ✅ Timeline view is opt-in (only appears when `timelineConfig` is provided)
- ✅ Timeline view only appears in switcher when `'timeline'` is in `availableViews`

### Data Format Requirements

Timeline view expects data items with date fields. Ensure your data includes:
- Start date field (specified in `mappingKeys.startDateKey`)
- End date field (specified in `mappingKeys.endDateKey`)
- Optional: title, type, status, unique ID fields

Example data format:
```typescript
{
  id: "project-1",
  title: "Q2 2024 Development Sprint",
  type: "Development",
  status: "Done",
  created_at: "2024-05-01T00:00:00+00:00",  // startDateKey
  due_date: "2024-06-01T00:00:00+00:00"    // endDateKey
}
```

---

## Future Enhancements

Potential improvements for future iterations:
- [ ] Support for custom timeline view configurations
- [ ] Integration with filtering for date ranges
- [ ] Timeline-specific sorting options
- [ ] Export timeline view as image/PDF
- [ ] Timeline view with multiple data series/colors
- [ ] Customizable timeline item rendering
- [ ] Timeline view with dependencies/relationships

---

## Implementation Order

1. ✅ **Phase 1**: Add timeline configuration type
2. ✅ **Phase 2**: Import TimelineWrapper component
3. ✅ **Phase 3**: Add timeline view detection logic
4. ✅ **Phase 4**: Add timeline view rendering
5. ✅ **Phase 5**: Add timeline to view switcher options
6. ✅ **Phase 6**: Update component props destructuring
7. ✅ **Testing**: Run through testing checklist
8. ✅ **Documentation**: Update usage guide

---

## Related Files

- `features/filtering-wrapper-multi-display/filtering-wrapper.tsx` - Main component
- `features/filtering-wrapper-multi-display/components/view-switcher-wrapper.tsx` - View switcher
- `features/filtering-wrapper-multi-display/features/timeline-3/timeline-wrapper.tsx` - Timeline component
- `features/filtering-wrapper-multi-display/features/timeline-3/page.tsx` - Example usage
- `features/filtering-wrapper-multi-display/documentation/timeline-view-usage-guide.md` - Usage guide
