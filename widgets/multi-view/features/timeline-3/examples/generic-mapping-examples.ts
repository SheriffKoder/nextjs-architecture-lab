/**
 * Generic Mapping Examples
 * 
 * Demonstrates how the timeline mapping utility works with different data structures
 */

import { mapTimelineDataToCellIds, MappingKeys } from '../utils/mapping/timeline-mapping'

// Example 1: Project data structure
const projectData = [
  {
    id: 'project-1',
    title: 'Website Redesign',
    created_at: '2024-01-15',
    due_date: '2024-03-15',
    type: 'project',
    status: 'in-progress',
    client: 'Acme Corp'
  },
  {
    id: 'project-1',
    title: 'Website Redesign',
    created_at: '2024-06-01',
    due_date: '2024-08-01',
    type: 'project',
    status: 'in-progress',
    client: 'Acme Corp'
  },
  {
    id: 'project-2',
    title: 'Mobile App',
    created_at: '2024-02-01',
    due_date: '2024-05-01',
    type: 'project',
    status: 'completed',
    client: 'Tech Inc'
  }
]

// Example 2: Task data structure (different property names)
const taskData = [
  {
    task_id: 'task-1',
    name: 'Design Mockups',
    start_date: '2024-01-01',
    end_date: '2024-01-15',
    category: 'design',
    priority: 'high',
    assignee: 'John Doe'
  },
  {
    task_id: 'task-1',
    name: 'Design Mockups',
    start_date: '2024-03-01',
    end_date: '2024-03-15',
    category: 'design',
    priority: 'high',
    assignee: 'John Doe'
  },
  {
    task_id: 'task-2',
    name: 'Code Review',
    start_date: '2024-02-01',
    end_date: '2024-02-05',
    category: 'development',
    priority: 'medium',
    assignee: 'Jane Smith'
  }
]

// Example 3: Event data structure (completely different)
const eventData = [
  {
    eventId: 'event-1',
    eventName: 'Team Meeting',
    beginsAt: '2024-01-10',
    endsAt: '2024-01-10',
    eventType: 'meeting',
    location: 'Conference Room A'
  },
  {
    eventId: 'event-1',
    eventName: 'Team Meeting',
    beginsAt: '2024-02-10',
    endsAt: '2024-02-10',
    eventType: 'meeting',
    location: 'Conference Room A'
  },
  {
    eventId: 'event-2',
    eventName: 'Product Launch',
    beginsAt: '2024-03-01',
    endsAt: '2024-03-03',
    eventType: 'milestone',
    location: 'Main Office'
  }
]

// Mapping configurations for each data structure
const projectMappingKeys: MappingKeys = {
  startDateKey: 'created_at',
  endDateKey: 'due_date',
  titleKey: 'title',
  typeKey: 'type',
  statusKey: 'status',
  uniqueIdKey: 'id'
}

const taskMappingKeys: MappingKeys = {
  startDateKey: 'start_date',
  endDateKey: 'end_date',
  titleKey: 'name',
  typeKey: 'category',
  statusKey: 'priority',
  uniqueIdKey: 'task_id'
}

const eventMappingKeys: MappingKeys = {
  startDateKey: 'beginsAt',
  endDateKey: 'endsAt',
  titleKey: 'eventName',
  typeKey: 'eventType',
  statusKey: 'location',
  uniqueIdKey: 'eventId'
}

// Usage examples
export const examples = {
  // Map project data
  mappedProjects: mapTimelineDataToCellIds(projectData, projectMappingKeys),
  
  // Map task data
  mappedTasks: mapTimelineDataToCellIds(taskData, taskMappingKeys),
  
  // Map event data
  mappedEvents: mapTimelineDataToCellIds(eventData, eventMappingKeys)
}

// Example of how to unwrap data for saving
export const unwrapExamples = {
  // Unwrap project data
  unwrapProjects: () => {
    return examples.mappedProjects
      .flatMap(group => group)
      .map(item => {
        const { mapping, ...cleanItem } = item
        return cleanItem
      })
  },
  
  // Unwrap task data
  unwrapTasks: () => {
    return examples.mappedTasks
      .flatMap(group => group)
      .map(item => {
        const { mapping, ...cleanItem } = item
        return cleanItem
      })
  },
  
  // Unwrap event data
  unwrapEvents: () => {
    return examples.mappedEvents
      .flatMap(group => group)
      .map(item => {
        const { mapping, ...cleanItem } = item
        return cleanItem
      })
  }
}

console.log('📊 GENERIC MAPPING EXAMPLES:')
console.log('Projects:', examples.mappedProjects)
console.log('Tasks:', examples.mappedTasks)
console.log('Events:', examples.mappedEvents)
