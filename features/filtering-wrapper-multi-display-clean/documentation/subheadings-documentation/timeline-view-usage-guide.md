# Timeline View Usage Guide

## Overview

The Timeline view is a powerful visualization component that displays data items on a time-based axis. It supports multiple time scales (Year, Month, Week, Day) and provides interactive features like dragging, resizing, and clicking timeline items.

---

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Configuration Options](#configuration-options)
3. [Data Format Requirements](#data-format-requirements)
4. [Mapping Keys](#mapping-keys)
5. [Timeline Views](#timeline-views)
6. [Event Handlers](#event-handlers)
7. [Integration with FilteringWrapper](#integration-with-filteringwrapper)
8. [Examples](#examples)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Basic Usage

### Minimal Configuration

The simplest timeline configuration requires only the date mapping keys:

```typescript
<FilteringWrapper
  data={timelineData}
  columns={columns}
  availableViews={['table', 'timeline']}
  timelineConfig={{
    mappingKeys: {
      startDateKey: 'created_at',
      endDateKey: 'due_date'
    }
  }}
/>
```

### Full Configuration

A complete timeline configuration with all options:

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
      // Navigate to detail page, show modal, etc.
    },
    onItemDrag: (item) => {
      console.log('Item dragged:', item)
      // Update item dates in database
      updateItemDates(item.id, item.start_date, item.end_date)
    },
    onItemResize: (item) => {
      console.log('Item resized:', item)
      // Update item duration in database
      updateItemDates(item.id, item.start_date, item.end_date)
    }
  }}
/>
```

---

## Configuration Options

### `timelineConfig.mappingKeys`

**Required**: `startDateKey`, `endDateKey`  
**Optional**: `titleKey`, `typeKey`, `statusKey`, `uniqueIdKey`

Maps your data fields to timeline component fields.

```typescript
mappingKeys: {
  startDateKey: 'created_at',    // Required: field for start date
  endDateKey: 'due_date',        // Required: field for end date
  titleKey: 'title',             // Optional: field for item title
  typeKey: 'type',               // Optional: field for item type/category
  statusKey: 'status',           // Optional: field for item status
  uniqueIdKey: 'id'              // Optional: field for unique identifier
}
```

### `timelineConfig.views`

**Type**: `string[]`  
**Default**: `['Year', 'Month', 'Week', 'Day']`  
**Optional**: Yes

Available timeline view scales. Users can switch between these views.

```typescript
views: ['Year', 'Month', 'Week', 'Day']  // All views
views: ['Month', 'Week']                 // Only month and week
views: ['Day']                           // Only day view
```

### `timelineConfig.onEventClick`

**Type**: `(eventId: string) => void`  
**Optional**: Yes

Callback fired when a timeline item is clicked.

```typescript
onEventClick: (eventId: string) => {
  // eventId is the value from uniqueIdKey field (or 'id' by default)
  router.push(`/projects/${eventId}`)
  // Or show a modal, update state, etc.
}
```

### `timelineConfig.onItemDrag`

**Type**: `(item: { id: string; start_date: string; end_date: string }) => void`  
**Optional**: Yes

Callback fired when a timeline item is dragged to a new position. The dates are updated automatically.

```typescript
onItemDrag: async (item) => {
  // item contains: id, start_date, end_date
  await updateProjectDates(item.id, {
    startDate: item.start_date,
    endDate: item.end_date
  })
  // Optionally refetch data or update local state
}
```

### `timelineConfig.onItemResize`

**Type**: `(item: { id: string; start_date: string; end_date: string }) => void`  
**Optional**: Yes

Callback fired when a timeline item is resized (start or end date changed by dragging edges).

```typescript
onItemResize: async (item) => {
  // item contains: id, start_date, end_date
  await updateProjectDuration(item.id, {
    startDate: item.start_date,
    endDate: item.end_date
  })
  // Optionally refetch data or update local state
}
```

---

## Data Format Requirements

### Required Fields

Your data items must include fields for start and end dates:

```typescript
interface TimelineItem {
  // Required: Start date field (name specified in mappingKeys.startDateKey)
  created_at: string | Date  // ISO string or Date object
  
  // Required: End date field (name specified in mappingKeys.endDateKey)
  due_date: string | Date    // ISO string or Date object
}
```

### Optional Fields

These fields are used if specified in `mappingKeys`:

```typescript
interface TimelineItem {
  id?: string           // Used if mappingKeys.uniqueIdKey is set
  title?: string        // Used if mappingKeys.titleKey is set
  type?: string         // Used if mappingKeys.typeKey is set
  status?: string       // Used if mappingKeys.statusKey is set
  // ... any other fields
}
```

### Date Format

Dates can be provided as:
- **ISO 8601 strings**: `"2024-05-01T00:00:00+00:00"`
- **Date objects**: `new Date('2024-05-01')`
- **Timestamp strings**: `"2024-05-01T00:00:00Z"`

The timeline component handles timezone conversion automatically.

---

## Mapping Keys

### Understanding Mapping Keys

Mapping keys tell the timeline component which fields in your data correspond to timeline properties.

**Example Data**:
```typescript
const project = {
  project_id: "proj-123",
  project_name: "Q2 2024 Sprint",
  start_date: "2024-05-01T00:00:00+00:00",
  end_date: "2024-06-01T00:00:00+00:00",
  category: "Development",
  current_status: "In Progress"
}
```

**Mapping Configuration**:
```typescript
mappingKeys: {
  startDateKey: 'start_date',      // Maps to project.start_date
  endDateKey: 'end_date',          // Maps to project.end_date
  titleKey: 'project_name',        // Maps to project.project_name
  typeKey: 'category',             // Maps to project.category
  statusKey: 'current_status',     // Maps to project.current_status
  uniqueIdKey: 'project_id'        // Maps to project.project_id
}
```

### Common Mapping Patterns

#### Pattern 1: Standard Project/Task Fields
```typescript
mappingKeys: {
  startDateKey: 'start_date',
  endDateKey: 'end_date',
  titleKey: 'name',
  uniqueIdKey: 'id'
}
```

#### Pattern 2: Created/Due Date Pattern
```typescript
mappingKeys: {
  startDateKey: 'created_at',
  endDateKey: 'due_date',
  titleKey: 'title',
  uniqueIdKey: 'id'
}
```

#### Pattern 3: Event Pattern
```typescript
mappingKeys: {
  startDateKey: 'event_start',
  endDateKey: 'event_end',
  titleKey: 'event_name',
  typeKey: 'event_type',
  uniqueIdKey: 'event_id'
}
```

---

## Timeline Views

### Year View

Displays items across multiple years. Best for long-term planning and overview.

- **Scale**: Weeks within years
- **Use Case**: Multi-year projects, annual planning
- **Width Control**: `yearWeekWidth` (default: 50px per week)

### Month View

Displays items across months. Good for quarterly planning.

- **Scale**: Days within months
- **Use Case**: Monthly sprints, quarterly projects
- **Width Control**: `monthDayWidth` (default: 50px per day)

### Week View

Displays items within weeks. Ideal for weekly planning.

- **Scale**: Days within weeks
- **Use Case**: Weekly sprints, short-term tasks
- **Width Control**: `weekDayWidth` (default: 150px per day)

### Day View

Displays items within a single day. Perfect for hourly scheduling.

- **Scale**: Hours within days
- **Use Case**: Daily schedules, hourly tasks
- **Width Control**: `hourColumnWidth` (default: 100px per hour)

### View Switching

Users can switch between views using the view selector in the timeline header. The current view is preserved in the URL parameter (`?view=timeline`).

---

## Event Handlers

### onEventClick

Handle clicks on timeline items:

```typescript
onEventClick: (eventId: string) => {
  // Navigate to detail page
  router.push(`/projects/${eventId}`)
  
  // Or show a modal
  setSelectedProject(eventId)
  setShowModal(true)
  
  // Or update state
  setSelectedItem(eventId)
}
```

### onItemDrag

Handle dragging items to new dates:

```typescript
onItemDrag: async (item) => {
  try {
    // Update in database
    await api.updateProject(item.id, {
      startDate: item.start_date,
      endDate: item.end_date
    })
    
    // Update local state
    setProjects(prev => prev.map(p => 
      p.id === item.id 
        ? { ...p, start_date: item.start_date, end_date: item.end_date }
        : p
    ))
    
    // Show success message
    toast.success('Project dates updated')
  } catch (error) {
    toast.error('Failed to update dates')
    console.error(error)
  }
}
```

### onItemResize

Handle resizing items (changing duration):

```typescript
onItemResize: async (item) => {
  // Similar to onItemDrag, but specifically for duration changes
  await api.updateProjectDuration(item.id, {
    startDate: item.start_date,
    endDate: item.end_date
  })
  
  // Optionally validate duration
  const duration = new Date(item.end_date).getTime() - new Date(item.start_date).getTime()
  if (duration < 0) {
    toast.error('End date must be after start date')
    return
  }
}
```

---

## Integration with FilteringWrapper

### With Filtering

Timeline view automatically uses filtered data from FilteringWrapper:

```typescript
<FilteringWrapper
  data={allProjects}
  columns={columns}
  availableViews={['table', 'timeline']}
  timelineConfig={timelineConfig}
  filterConfig={{
    showPill: true,
    autoApplyDropdown: true
  }}
  onFilterApply={(key, items, type) => {
    // Filters are applied automatically to timeline view
    console.log('Filter applied:', key, items)
  }}
/>
```

### With Search

Timeline view respects global search:

```typescript
<FilteringWrapper
  data={projects}
  columns={columns}
  availableViews={['table', 'timeline']}
  timelineConfig={timelineConfig}
  globalSearchText={searchTerm}  // Timeline shows only matching items
/>
```

### With Server Pagination

When using server pagination, timeline receives paginated data:

```typescript
<FilteringWrapper
  data={paginatedProjects}
  columns={columns}
  availableViews={['table', 'timeline']}
  timelineConfig={timelineConfig}
  serverPagination={{
    total: 100,
    page: 1,
    limit: 20,
    onPageChange: (page) => fetchProjects(page)
  }}
/>
```

**Note**: Timeline view may show fewer items when server pagination is active. Consider increasing the page limit for timeline view or implementing timeline-specific pagination.

---

## Examples

### Example 1: Project Timeline

```typescript
const projects = [
  {
    id: "proj-1",
    name: "Q2 2024 Development",
    start_date: "2024-05-01T00:00:00+00:00",
    end_date: "2024-06-01T00:00:00+00:00",
    status: "In Progress",
    type: "Development"
  },
  // ... more projects
]

<FilteringWrapper
  data={projects}
  columns={projectColumns}
  availableViews={['table', 'timeline']}
  timelineConfig={{
    mappingKeys: {
      startDateKey: 'start_date',
      endDateKey: 'end_date',
      titleKey: 'name',
      statusKey: 'status',
      typeKey: 'type',
      uniqueIdKey: 'id'
    },
    onEventClick: (id) => router.push(`/projects/${id}`),
    onItemDrag: async (item) => {
      await updateProjectDates(item.id, item.start_date, item.end_date)
    }
  }}
/>
```

### Example 2: Task Timeline with Multiple Views

```typescript
<FilteringWrapper
  data={tasks}
  columns={taskColumns}
  availableViews={['table', 'timeline', 'kanban']}
  timelineConfig={{
    mappingKeys: {
      startDateKey: 'created_at',
      endDateKey: 'due_date',
      titleKey: 'title',
      uniqueIdKey: 'id'
    },
    views: ['Week', 'Day'],  // Only week and day views
    onEventClick: (id) => openTaskModal(id),
    onItemResize: async (item) => {
      await updateTaskDeadline(item.id, item.end_date)
    }
  }}
/>
```

### Example 3: Event Calendar Timeline

```typescript
<FilteringWrapper
  data={events}
  columns={eventColumns}
  availableViews={['calendar', 'timeline']}
  timelineConfig={{
    mappingKeys: {
      startDateKey: 'event_start',
      endDateKey: 'event_end',
      titleKey: 'event_name',
      typeKey: 'event_category',
      uniqueIdKey: 'event_id'
    },
    views: ['Month', 'Week', 'Day'],
    onEventClick: (id) => {
      const event = events.find(e => e.event_id === id)
      showEventDetails(event)
    }
  }}
/>
```

---

## Common Patterns

### Pattern 1: Sync with Database

```typescript
onItemDrag: async (item) => {
  // Optimistic update
  const updatedData = data.map(d => 
    d.id === item.id 
      ? { ...d, start_date: item.start_date, end_date: item.end_date }
      : d
  )
  setData(updatedData)
  
  // Sync with server
  try {
    await api.updateItem(item.id, {
      start_date: item.start_date,
      end_date: item.end_date
    })
  } catch (error) {
    // Rollback on error
    setData(data)
    toast.error('Failed to update')
  }
}
```

### Pattern 2: Validation Before Update

```typescript
onItemResize: async (item) => {
  const start = new Date(item.start_date)
  const end = new Date(item.end_date)
  const duration = end.getTime() - start.getTime()
  
  // Validate duration
  if (duration < 0) {
    toast.error('End date must be after start date')
    return
  }
  
  if (duration > 90 * 24 * 60 * 60 * 1000) {  // 90 days
    toast.error('Duration cannot exceed 90 days')
    return
  }
  
  // Proceed with update
  await updateItem(item)
}
```

### Pattern 3: Multi-Select and Bulk Operations

```typescript
const [selectedItems, setSelectedItems] = useState<string[]>([])

// In timeline config
onEventClick: (id) => {
  setSelectedItems(prev => 
    prev.includes(id) 
      ? prev.filter(i => i !== id)
      : [...prev, id]
  )
}

// Bulk update selected items
const bulkUpdateDates = async (newStart: string, newEnd: string) => {
  await Promise.all(
    selectedItems.map(id => 
      api.updateItem(id, { start_date: newStart, end_date: newEnd })
    )
  )
}
```

---

## Troubleshooting

### Issue: Timeline items not displaying

**Possible Causes**:
1. Date fields are missing or incorrectly named
2. Date format is invalid
3. Mapping keys don't match data field names

**Solution**:
```typescript
// Verify data structure
console.log('Timeline data:', data)
console.log('Mapping keys:', timelineConfig.mappingKeys)

// Ensure dates are valid
data.forEach(item => {
  console.log('Start:', item[timelineConfig.mappingKeys.startDateKey])
  console.log('End:', item[timelineConfig.mappingKeys.endDateKey])
})
```

### Issue: Timeline view not appearing in switcher

**Possible Causes**:
1. `'timeline'` not in `availableViews`
2. `timelineConfig` is missing
3. View switcher only shows when multiple views are available

**Solution**:
```typescript
// Ensure timeline is in availableViews
availableViews={['table', 'timeline']}  // ✅ Correct

// Ensure timelineConfig is provided
timelineConfig={{ mappingKeys: { ... } }}  // ✅ Correct
```

### Issue: Drag/Resize not working

**Possible Causes**:
1. Callbacks not provided
2. Data not updating after drag/resize
3. Permissions/validation blocking updates

**Solution**:
```typescript
// Provide callbacks
onItemDrag: (item) => {
  console.log('Drag event:', item)  // Debug
  // Update data
}

// Ensure data updates trigger re-render
const [data, setData] = useState(initialData)
onItemDrag: (item) => {
  setData(prev => prev.map(d => 
    d.id === item.id ? { ...d, ...item } : d
  ))
}
```

### Issue: Dates showing incorrectly

**Possible Causes**:
1. Timezone issues
2. Date format not recognized
3. Date parsing errors

**Solution**:
```typescript
// Ensure dates are ISO strings
const normalizedData = data.map(item => ({
  ...item,
  start_date: new Date(item.start_date).toISOString(),
  end_date: new Date(item.end_date).toISOString()
}))

// Check timezone handling
// Timeline component handles timezone conversion automatically
```

---

## Best Practices

1. **Always provide unique IDs**: Use `uniqueIdKey` to ensure items are properly identified
2. **Validate dates**: Check that end dates are after start dates
3. **Handle errors gracefully**: Wrap async operations in try-catch
4. **Optimistic updates**: Update UI immediately, sync with server in background
5. **Consider performance**: For large datasets, consider server-side filtering/pagination
6. **Test all views**: Ensure your data works across Year, Month, Week, and Day views
7. **Provide user feedback**: Show loading states and success/error messages

---

## Related Documentation

- [Timeline Implementation Plan](./timeline-view-implementation-plan.md) - Implementation details
- [View Switching Migration Plan](./view-switching-migration-plan.md) - View system overview
- [FilteringWrapper Component](../filtering-wrapper.tsx) - Main component documentation
