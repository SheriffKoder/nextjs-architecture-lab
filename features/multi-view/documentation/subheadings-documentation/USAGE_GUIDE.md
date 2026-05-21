# Timeline Usage Guide

## Overview

This guide explains how to integrate and use the Timeline feature in your pages via the `FilteringWrapper` component. The timeline provides a visual representation of data items across time with support for multiple views (Year, Month, Week, Day) and grouping options.

## Quick Start

### 1. Import FilteringWrapper

```typescript
import { FilteringWrapper } from '@/components/filtering-wrapper-multi-display/filtering-wrapper'
```

### 2. Configure Timeline

Create a `timelineConfig` object with the required mapping keys and optional settings:

```typescript
const timelineConfig = useMemo(() => ({
  mappingKeys: {
    startDateKey: 'start_date',    // Required: field name for start date
    endDateKey: 'end_date',        // Required: field name for end date
    titleKey: 'title',             // Optional: field name for item title
    typeKey: 'type',               // Optional: field name for item type
    statusKey: 'status',           // Optional: field name for item status
    uniqueIdKey: 'id'              // Optional: field name for unique ID
  },
  views: ['Year', 'Month', 'Week'], // Optional: available views
  // ... other options
}), [/* dependencies */])
```

### 3. Add Timeline to Available Views

Include `'timeline'` in your `availableViews` array:

```typescript
const availableViews = useMemo(() => ['table', 'kanban', 'calendar', 'timeline'], [])
```

### 4. Pass to FilteringWrapper

```typescript
<FilteringWrapper
  data={yourData}
  columns={yourColumns}
  availableViews={availableViews}
  timelineConfig={timelineConfig}
  // ... other props
/>
```

## Complete Example

Here's a complete example from `tasks-2/page.tsx`:

```typescript
'use client'

import { useState, useCallback, useMemo } from 'react'
import { FilteringWrapper } from '@/components/filtering-wrapper-multi-display/filtering-wrapper'

export default function TasksPage() {
  const [tasks, setTasks] = useState([]) // Your data

  // Handle timeline event click
  const handleTimelineEventClick = useCallback((eventId: string) => {
    console.log('Timeline event clicked:', eventId)
    // Navigate to detail page, open modal, etc.
  }, [])

  // Handle item drag (date change)
  const handleItemDrag = useCallback((item: { 
    id: string; 
    start_date: string; 
    end_date: string 
  }) => {
    console.log('Item dragged:', item)
    // Update item dates in your database
    // await updateTask(item.id, { start_date: item.start_date, end_date: item.end_date })
  }, [])

  // Handle item resize (duration change)
  const handleItemResize = useCallback((item: { 
    id: string; 
    start_date: string; 
    end_date: string 
  }) => {
    console.log('Item resized:', item)
    // Update item dates in your database
    // await updateTask(item.id, { start_date: item.start_date, end_date: item.end_date })
  }, [])

  // Timeline configuration
  const timelineConfig = useMemo(() => ({
    mappingKeys: {
      startDateKey: 'start_date',
      endDateKey: 'end_date',
      titleKey: 'title',
      typeKey: 'type',
      statusKey: 'status',
      uniqueIdKey: 'id'
    },
    views: ['Year', 'Month', 'Week', 'Day'],
    groupByKey: 'project_name',      // Optional: Group items by project
    isGroupInline: false,             // Optional: Use sidebar grouping
    onEventClick: handleTimelineEventClick,
    onItemDrag: handleItemDrag,
    onItemResize: handleItemResize
  }), [handleTimelineEventClick, handleItemDrag, handleItemResize])

  // Available views
  const availableViews = useMemo(() => ['table', 'kanban', 'calendar', 'timeline'], [])

  return (
    <div className="flex-1 min-h-0">
      <FilteringWrapper
        data={tasks}
        columns={tableColumns}
        availableViews={availableViews}
        timelineConfig={timelineConfig}
        // ... other props
      />
    </div>
  )
}
```

## Configuration Options

### Required Properties

#### `mappingKeys.startDateKey` (string)
- **Required**: Field name in your data items that contains the start date
- **Format**: ISO date string (e.g., `'2024-01-15'`) or Date object
- **Example**: `'start_date'`, `'created_at'`, `'begin_date'`

#### `mappingKeys.endDateKey` (string)
- **Required**: Field name in your data items that contains the end date
- **Format**: ISO date string (e.g., `'2024-01-20'`) or Date object
- **Example**: `'end_date'`, `'due_date'`, `'finish_date'`

### Optional Properties

#### `mappingKeys.titleKey` (string)
- **Optional**: Field name for the item title displayed on timeline pills
- **Default**: Uses `uniqueIdKey` if not provided
- **Example**: `'title'`, `'name'`, `'task_name'`

#### `mappingKeys.typeKey` (string)
- **Optional**: Field name for item type (used for styling/color coding)
- **Example**: `'type'`, `'category'`, `'priority'`

#### `mappingKeys.statusKey` (string)
- **Optional**: Field name for item status (used for styling/color coding)
- **Example**: `'status'`, `'state'`, `'phase'`

#### `mappingKeys.uniqueIdKey` (string)
- **Optional**: Field name for unique identifier
- **Default**: Uses array index if not provided
- **Example**: `'id'`, `'uuid'`, `'_id'`

#### `views` (string[])
- **Optional**: Available timeline views
- **Default**: `['Year', 'Month', 'Week', 'Day']`
- **Options**: `'Year'`, `'Month'`, `'Week'`, `'Day'`
- **Example**: `['Year', 'Month', 'Week']` (excludes Day view)

#### `groupByKey` (string)
- **Optional**: Field name to group timeline items by
- **When set**: Items are grouped by the specified field value
- **Example**: `'project_name'`, `'status'`, `'team'`
- **Note**: Requires `isGroupInline` to be set (see below)

#### `isGroupInline` (boolean)
- **Optional**: Determines grouping display style
- **Default**: `true` (inline headers)
- **Options**:
  - `true`: Groups displayed as header rows within the timeline
  - `false`: Groups displayed in a sidebar on the left
- **Example**: 
  ```typescript
  groupByKey: 'project_name',
  isGroupInline: false  // Sidebar grouping
  ```

#### `onEventClick` (function)
- **Optional**: Callback when a timeline item/event is clicked
- **Signature**: `(eventId: string) => void`
- **Parameters**:
  - `eventId`: The unique ID of the clicked item
- **Example**:
  ```typescript
  onEventClick: (eventId: string) => {
    router.push(`/tasks/${eventId}`)
  }
  ```

#### `onItemDrag` (function)
- **Optional**: Callback when an item is dragged to a new position
- **Signature**: `(item: { id: string; start_date: string; end_date: string }) => void`
- **Parameters**:
  - `item.id`: The unique ID of the item
  - `item.start_date`: New start date (ISO string)
  - `item.end_date`: New end date (ISO string)
- **Example**:
  ```typescript
  onItemDrag: async (item) => {
    await updateTask(item.id, {
      start_date: item.start_date,
      end_date: item.end_date
    })
  }
  ```

#### `onItemResize` (function)
- **Optional**: Callback when an item is resized (start/end dates changed)
- **Signature**: `(item: { id: string; start_date: string; end_date: string }) => void`
- **Parameters**:
  - `item.id`: The unique ID of the item
  - `item.start_date`: New start date (ISO string)
  - `item.end_date`: New end date (ISO string)
- **Example**:
  ```typescript
  onItemResize: async (item) => {
    await updateTask(item.id, {
      start_date: item.start_date,
      end_date: item.end_date
    })
  }
  ```

## Data Format Requirements

Your data items should have the following structure:

```typescript
interface TimelineItem {
  id: string                    // Unique identifier
  start_date: string           // ISO date string (required)
  end_date: string            // ISO date string (required)
  title?: string              // Optional: displayed on timeline
  type?: string              // Optional: for styling
  status?: string            // Optional: for styling
  // ... other fields
}
```

### Example Data

```typescript
const tasks = [
  {
    id: '1',
    start_date: '2024-01-15',
    end_date: '2024-01-20',
    title: 'Project Planning',
    type: 'project',
    status: 'in-progress',
    project_name: 'Project A'
  },
  {
    id: '2',
    start_date: '2024-01-18',
    end_date: '2024-01-25',
    title: 'Design Phase',
    type: 'task',
    status: 'pending',
    project_name: 'Project A'
  },
  {
    id: '3',
    start_date: '2024-01-22',
    end_date: '2024-01-30',
    title: 'Development',
    type: 'task',
    status: 'in-progress',
    project_name: 'Project B'
  }
]
```

## Grouping Examples

### Inline Grouping (Default)

Groups are displayed as header rows within the timeline:

```typescript
const timelineConfig = {
  mappingKeys: { /* ... */ },
  groupByKey: 'project_name',
  isGroupInline: true  // or omit (defaults to true)
}
```

**Result**: Header rows appear between groups showing the group name.

### Sidebar Grouping

Groups are displayed in a sidebar on the left:

```typescript
const timelineConfig = {
  mappingKeys: { /* ... */ },
  groupByKey: 'project_name',
  isGroupInline: false
}
```

**Result**: A sidebar appears on the left showing group names, aligned with timeline rows.

## View Options

### Available Views

- **Year**: Shows items across multiple years with week-level granularity
- **Month**: Shows items with day-level granularity, organized by months
- **Week**: Shows items with day-level granularity, organized by weeks
- **Day**: Shows items with hour-level granularity

### Customizing Views

```typescript
// Show only Year, Month, and Week (exclude Day view)
views: ['Year', 'Month', 'Week']

// Show only Month and Week
views: ['Month', 'Week']

// Show all views (default)
views: ['Year', 'Month', 'Week', 'Day']
```

## Event Handlers

### Click Handler

Handle clicks on timeline items:

```typescript
const handleTimelineEventClick = useCallback((eventId: string) => {
  // Navigate to detail page
  router.push(`/tasks/${eventId}`)
  
  // Or open a modal
  setSelectedTaskId(eventId)
  setIsDetailModalOpen(true)
}, [])
```

### Drag Handler

Handle when items are dragged to new dates:

```typescript
const handleItemDrag = useCallback(async (item: { 
  id: string; 
  start_date: string; 
  end_date: string 
}) => {
  try {
    await updateTask(item.id, {
      start_date: item.start_date,
      end_date: item.end_date
    })
    // Optionally refresh data or show success message
  } catch (error) {
    console.error('Failed to update task:', error)
    // Show error message
  }
}, [])
```

### Resize Handler

Handle when items are resized (duration changed):

```typescript
const handleItemResize = useCallback(async (item: { 
  id: string; 
  start_date: string; 
  end_date: string 
}) => {
  try {
    await updateTask(item.id, {
      start_date: item.start_date,
      end_date: item.end_date
    })
    // Optionally refresh data or show success message
  } catch (error) {
    console.error('Failed to update task:', error)
    // Show error message
  }
}, [])
```

## Best Practices

### 1. Use `useMemo` for Configuration

Always wrap `timelineConfig` in `useMemo` to prevent unnecessary re-renders:

```typescript
const timelineConfig = useMemo(() => ({
  // ... config
}), [handleTimelineEventClick, handleItemDrag, handleItemResize])
```

### 2. Memoize Event Handlers

Use `useCallback` for event handlers to maintain referential equality:

```typescript
const handleTimelineEventClick = useCallback((eventId: string) => {
  // ... handler logic
}, [/* dependencies */])
```

### 3. Date Format

Ensure your dates are in ISO format (YYYY-MM-DD) or JavaScript Date objects:

```typescript
// Good
start_date: '2024-01-15'
start_date: new Date('2024-01-15')

// Avoid
start_date: '01/15/2024'  // May cause parsing issues
```

### 4. Performance Considerations

- The timeline uses virtualization for large datasets
- Grouping can impact performance with very large datasets (>1000 items)
- Consider filtering data before passing to FilteringWrapper

### 5. Error Handling

Always handle errors in drag/resize handlers:

```typescript
const handleItemDrag = useCallback(async (item) => {
  try {
    await updateTask(item.id, item)
  } catch (error) {
    console.error('Update failed:', error)
    // Show user-friendly error message
    toast.error('Failed to update task dates')
  }
}, [])
```

## Troubleshooting

### Timeline Not Appearing

1. **Check `availableViews`**: Ensure `'timeline'` is included
2. **Check `timelineConfig`**: Ensure required `mappingKeys` are provided
3. **Check data format**: Ensure dates are valid ISO strings

### Items Not Displaying

1. **Check date fields**: Verify `startDateKey` and `endDateKey` match your data
2. **Check date values**: Ensure dates are valid and within a reasonable range
3. **Check console**: Look for mapping errors in browser console

### Grouping Not Working

1. **Check `groupByKey`**: Ensure the field exists in your data
2. **Check field values**: Ensure the grouping field has values (not null/undefined)
3. **Check `isGroupInline`**: Verify it's set correctly (true/false)

### Drag/Resize Not Working

1. **Check handlers**: Ensure `onItemDrag` and `onItemResize` are provided
2. **Check permissions**: Verify user has permission to update items
3. **Check API**: Verify your update API is working correctly

## Additional Resources

- [Today Highlight Feature](./TODAY_HIGHLIGHT_FEATURE.md) - Documentation on today's date highlighting
- [Sidebar Grouping Implementation](./SIDEBAR_GROUPING_IMPLEMENTATION_PLAN.md) - Details on grouping features
- [Grouping Implementation Plan](./GROUPING_IMPLEMENTATION_PLAN.md) - Inline grouping details
