# Timeline-3 Component Documentation

## Overview
The Timeline-3 component is a sophisticated timeline visualization system that displays project data across multiple years with a grid-based layout. It provides a Gantt-chart-like interface where each project appears as a spanning bar across months within its respective year.

## Architecture

### Component Structure
```
timeline-3/
├── page.tsx                 # Main page component with mock data
├── timeline-mapper.tsx      # Core timeline visualization component
├── components/
│   └── timeline-item.tsx   # Individual timeline item renderer
└── utils/
    ├── year-start-end-extractor.ts  # Extracts year range from data
    ├── years-in-range.ts           # Generates year arrays
    ├── month-names.ts              # Month name constants
    ├── item-span.ts               # Calculates item spanning logic
    └── task-grouping.ts           # Groups tasks by ID for row management
```

## Data Flow

### 1. Data Input (`page.tsx`)
- **Source**: Mock project data array
- **Structure**: Each item contains:
  - `id`: Unique identifier
  - `title`: Project name
  - `type`: Project category
  - `status`: Current status (Done, In Progress, To Do)
  - `created_at`: Start date
  - `due_date`: End date
  - `project_id`: Project grouping identifier
  - `details`: Rich text content (TipTap/ProseMirror format)

### 2. Year Range Extraction (`year-start-end-extractor.ts`)
- **Purpose**: Determines timeline scope by finding earliest and latest years
- **Process**:
  1. Extract all `created_at` dates → find minimum year
  2. Extract all `due_date` dates → find maximum year
  3. Return `{startYear, endYear}` object
- **Example**: Data from 2024-2025 → `{startYear: 2024, endYear: 2025}`

### 3. Year Array Generation (`years-in-range.ts`)
- **Purpose**: Creates array of years for timeline rendering
- **Process**: Generate inclusive range from startYear to endYear
- **Example**: `generateYearsInRange(2024, 2025)` → `[2024, 2025]`

### 4. Task Grouping (`task-grouping.ts`)
- **Purpose**: Manages row assignments for consistent task positioning
- **Process**:
  1. `createGlobalTaskMapping()`: Assigns unique row indices to each task ID
  2. `getTaskInstancesForYear()`: Filters tasks for specific year using global mapping
- **Result**: Each unique task gets a reserved row across all years

### 5. Item Spanning (`item-span.ts`)
- **Purpose**: Calculates how many months each item spans
- **Process**:
  1. Extract start/end months from dates
  2. Calculate span duration
  3. Generate CSS Grid column positioning
- **Example**: May-June item → `{spanMonths: 2, gridColumn: '5 / 7'}`

### 6. Timeline Rendering (`timeline-mapper.tsx`)
- **Purpose**: Main visualization component
- **Layout**: CSS Grid with years as columns, months as sub-columns
- **Features**:
  - Horizontal scrolling for multi-year view
  - Sticky year headers
  - Month labels for each year
  - Row-based task organization

## UI Structure

### Visual Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Start Year: 2024    End Year: 2025                         │
├─────────────────────────────────────────────────────────────┤
│ 2024                    │ 2025                             │
├─────────────────────────┼─────────────────────────────────┤
│ Jan Feb Mar Apr May Jun │ Jan Feb Mar Apr May Jun         │
├─────────────────────────┼─────────────────────────────────┤
│ ████████                │                                 │ ← Row 1: Project 1
├─────────────────────────┼─────────────────────────────────┤
│                         │ ████████                        │ ← Row 2: Project 2
├─────────────────────────┼─────────────────────────────────┤
│                         │ ████████                        │ ← Row 3: Project 3
└─────────────────────────┴─────────────────────────────────┘
```

### Grid System
- **Years**: Horizontal columns (200px × 12 months = 2400px per year)
- **Months**: Sub-columns within each year (200px each)
- **Rows**: Reserved for each unique task ID
- **Items**: Spanning bars across multiple months

### Styling Configuration
- **Row Height**: 40px
- **Column Width**: 200px
- **Item Style**: Black background, white text, rounded corners
- **Hover Effects**: Smooth transitions
- **Responsive**: Horizontal scroll for overflow

## Key Features

### 1. Multi-Year Support
- Automatically calculates year range from data
- Renders multiple years side-by-side
- Horizontal scrolling for navigation

### 2. Task Row Management
- Each unique task ID gets a reserved row
- Consistent positioning across years
- Prevents overlapping items

### 3. Flexible Spanning
- Items can span multiple months
- Automatic span calculation based on dates
- CSS Grid positioning for precise layout

### 4. Configurable Data Keys
- `startDateKey`: Field for start date (default: 'created_at')
- `endDateKey`: Field for end date (default: 'due_date')
- `titleKey`: Field for display title (default: 'title')
- `typeKey`: Field for item type (default: 'type')
- `statusKey`: Field for status (default: 'status')

### 5. Rich Content Support
- TipTap/ProseMirror document format
- Structured content with paragraphs
- Extensible for complex content types

## Configuration Options

### Timeline Dimensions
```typescript
const rowHeight = 40        // Height of each task row
const columnWidth = 200     // Width of each month column
const monthsPerYear = 12    // Months per year
```

### Visual Styling
```typescript
const cellStyle = {
  backgroundColor: '#000000',
  textColor: '#ffffff',
  borderRadius: '6px',
  fontSize: '12px',
  // ... additional styling options
}
```

### Data Field Mapping
```typescript
const startDateKey = 'created_at'  // Start date field
const endDateKey = 'due_date'      // End date field
const titleKey = 'title'           // Display title field
const typeKey = 'type'            // Item type field
const statusKey = 'status'         // Status field
```

## Usage Example

```tsx
import TimelineMapper from './timeline-mapper'

const timelineData = [
  {
    id: 'project-1',
    title: 'Q2 2024 Development Sprint',
    type: 'Development',
    status: 'Done',
    created_at: '2024-05-01T00:00:00+00:00',
    due_date: '2024-06-01T00:00:00+00:00',
    // ... additional fields
  }
  // ... more items
]

return (
  <div className='w-full h-[calc(100vh-4rem)] flex items-center justify-center'>
    <TimelineMapper data={timelineData} />
  </div>
)
```

## Data Requirements

### Required Fields
- `id`: Unique identifier (string)
- `created_at`: Start date (ISO string)
- `due_date`: End date (ISO string)
- `title`: Display name (string)

### Optional Fields
- `type`: Item category (string)
- `status`: Current status (string)
- `project_id`: Project grouping (string)
- `details`: Rich content object

### Date Format
- **Input**: ISO 8601 strings (`'2024-05-01T00:00:00+00:00'`)
- **Processing**: Converted to JavaScript Date objects
- **Validation**: Invalid dates are filtered out

## Performance Considerations

### Optimization Strategies
1. **Memoization**: Year range calculation cached
2. **Efficient Filtering**: Only render items for visible years
3. **CSS Grid**: Hardware-accelerated layout
4. **Virtual Scrolling**: Horizontal overflow handling

### Scalability
- **Data Size**: Handles hundreds of timeline items
- **Year Range**: Supports multi-decade timelines
- **Memory**: Efficient row management prevents memory leaks

## Browser Compatibility
- **CSS Grid**: Modern browsers (Chrome 57+, Firefox 52+, Safari 10.1+)
- **Flexbox**: Universal support
- **ES6+**: Modern JavaScript features

## Future Enhancements

### Planned Features
1. **Interactive Editing**: Drag-and-drop timeline modification
2. **Zoom Levels**: Month/week/day view options
3. **Filtering**: Status/type-based filtering
4. **Export**: PDF/image export functionality
5. **Real-time Updates**: Live data synchronization

### Extensibility
- **Plugin System**: Custom item renderers
- **Theme Support**: Multiple visual themes
- **API Integration**: Real-time data sources
- **Accessibility**: Screen reader support

## Troubleshooting

### Common Issues
1. **Empty Timeline**: Check data format and date validity
2. **Overlapping Items**: Verify unique task IDs
3. **Layout Issues**: Ensure CSS Grid support
4. **Performance**: Limit data size for large datasets

### Debug Information
- Console logs show extracted year ranges
- Task mapping details available in dev tools
- Span calculations logged for verification
