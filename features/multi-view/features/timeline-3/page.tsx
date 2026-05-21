'use client'

import React, { useState } from 'react'
import TimelineWrapper from './timeline-wrapper'

const Page = () => {
  // State for view selection (optional - can be controlled via TimelineWrapper)
  const [selectedView, setSelectedView] = useState<'Year' | 'Month' | 'Week' | 'Day'>('Year')
  
  // State for zoom/width configuration
  const [hourColumnWidth, setHourColumnWidth] = useState<number>(100) // Day view: width per hour
  const [weekDayWidth, setWeekDayWidth] = useState<number>(150) // Week view: width per day
  const [monthDayWidth, setMonthDayWidth] = useState<number>(50) // Month view: width per day
  const [yearWeekWidth, setYearWeekWidth] = useState<number>(50) // Year view: width per week

    const timelineData = [
        {
            "id": "project-1-2024-may",
            "title": "Q2 2024 Development Sprint",
            "type": "Development",
            "status": "Done",
            "due_date": "2021-05-01T00:10:00+00:00",
            "project_id": "project-2024-q2",
            "details": {
                "type": "doc",
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "text": "Q2 2024 development sprint focusing on core features and user interface improvements",
                                "type": "text"
                            }
                        ]
                    }
                ]
            },
            "created_at": "2021-05-01T00:00:00+00:00"
        },
        {
          "id": "project-2-2024-nov",
          "title": "Q4 2024 Feature Release",
          "type": "Development",
          "status": "Done",
          "due_date": "2024-06-01T00:00:00+00:00",
          "project_id": "project-2024-q4",
          "details": {
              "type": "doc",
              "content": [
                  {
                      "type": "paragraph",
                      "content": [
                          {
                              "text": "Q2 2024 development sprint focusing on core features and user interface improvements",
                              "type": "text"
                          }
                      ]
                  }
              ]
          },
          "created_at": "2024-05-01T00:00:00+00:00"
      },
        {
            "id": "project-2-2024-nov",
            "title": "Q4 2024 Feature Release",
            "type": "Development",
            "status": "Done",
            "due_date": "2024-12-01T00:00:00+00:00",
            "project_id": "project-2024-q4",
            "details": {
                "type": "doc",
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "text": "Q4 2024 feature release including advanced analytics and reporting capabilities",
                                "type": "text"
                            }
                        ]
                    }
                ]
            },
            "created_at": "2024-11-01T00:00:00+00:00"
        },
        {
            "id": "project-3-2025-may",
            "title": "Q2 2025 Platform Upgrade",
            "type": "Development",
            "status": "In Progress",
            "due_date": "2025-06-01T00:00:00+00:00",
            "project_id": "project-2025-q2",
            "details": {
                "type": "doc",
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "text": "Q2 2025 platform upgrade with new architecture and performance optimizations",
                                "type": "text"
                            }
                        ]
                    }
                ]
            },
            "created_at": "2025-05-01T00:00:00+00:00"
        },
        {
            "id": "project-4-2025-nov",
            "title": "Q4 2025 Integration Phase",
            "type": "Development",
            "status": "To Do",
            "due_date": "2025-12-01T00:00:00+00:00",
            "project_id": "project-2025-q4",
            "details": {
                "type": "doc",
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "text": "Q4 2025 integration phase connecting all system components and final testing",
                                "type": "text"
                            }
                        ]
                    }
                ]
            },
            "created_at": "2025-11-01T00:00:00+00:00"
        }
    ]
  
    const timelineDataDays = [
      //   Task 1: Starts April 30, 2024 at 10 PM and ends May 1, 2024 at 3 AM
      {
          "id": "task-1-2024-apr-may",
          "title": "Task 1: Night Shift Work",
          "type": "Task",
          "status": "In Progress",
          "created_at": "2024-04-30T22:00:00+00:00", // April 30 2024 10 PM
          "due_date": "2024-05-01T03:00:00+00:00", // May 1 2024 3 AM
          "project_id": "project-2024-q2",
          "details": {
              "type": "doc",
              "content": [
                  {
                      "type": "paragraph",
                      "content": [
                          {
                              "text": "Task spanning from April 30 10 PM to May 1 3 AM",
                              "type": "text"
                          }
                      ]
                  }
              ]
          }
      },
    //   Task 2: Starts May 2, 2024 at 3 PM and ends May 2, 2024 at 11 PM
      {
          "id": "task-2-2024-may",
          "title": "Task 2: Afternoon Session",
          "type": "Task",
          "status": "To Do",
          "created_at": "2024-05-02T15:00:00+00:00", // May 2 2024 3 PM
          "due_date": "2024-05-02T22:59:00+00:00", // May 2 2024 10:57 PM
          "project_id": "project-2024-q2",
          "details": {
              "type": "doc",
              "content": [
                  {
                      "type": "paragraph",
                      "content": [
                          {
                              "text": "Task from May 2 3 PM to 11 PM",
                              "type": "text"
                          }
                      ]
                  }
              ]
          }
      }
    ]
  
    // Mapping keys configuration
    const mappingKeys: any = {
      startDateKey: 'created_at', // used to know when a data item starts
      endDateKey: 'due_date', // used to know when a data item ends
      titleKey: 'title',
      typeKey: 'type',
      statusKey: 'status',
      uniqueIdKey: 'id' // used to group multiple instances of the same item
    }

  // Callback handlers with console logging
  const handleEventClick = (eventId: string) => {
    console.log('📅 Event Clicked:', {
      eventId,
      timestamp: new Date().toISOString(),
      view: selectedView
    })
  }

  const handleItemDrag = (item: { id: string; start_date: string; end_date: string }) => {
    console.log('🔄 Item Dragged:', {
      item,
      timestamp: new Date().toISOString(),
      view: selectedView,
      oldDates: {
        start: item.start_date,
        end: item.end_date
      }
    })
  }

  const handleItemResize = (item: { id: string; start_date: string; end_date: string }) => {
    console.log('📏 Item Resized:', {
      item,
      timestamp: new Date().toISOString(),
      view: selectedView,
      newDates: {
        start: item.start_date,
        end: item.end_date
      }
    })
  }

  // Merge timelineData and timelineDataDays into single array
  const mergedTimelineData = React.useMemo(() => {
    return [...timelineData, ...timelineDataDays]
  }, [timelineData, timelineDataDays])

  // Log all props on mount/change
  React.useEffect(() => {
    console.log('🎛️ Timeline Page Props:', {
      selectedView,
      widthConfig: {
        hourColumnWidth,
        weekDayWidth,
        monthDayWidth,
        yearWeekWidth
      },
      dataCounts: {
        timelineData: timelineData.length,
        timelineDataDays: timelineDataDays.length,
        merged: mergedTimelineData.length
      },
      mappingKeys,
      callbacks: {
        onEventClick: handleEventClick.name,
        onItemDrag: handleItemDrag.name,
        onItemResize: handleItemResize.name
      },
      fullData: mergedTimelineData,
      dataBreakdown: {
        regularItems: timelineData.map(item => ({ id: item.id, title: item.title })),
        dayItems: timelineDataDays.map(item => ({ id: item.id, title: item.title }))
      }
    })
  }, [selectedView, hourColumnWidth, weekDayWidth, monthDayWidth, yearWeekWidth, mergedTimelineData, timelineData, timelineDataDays])

  return (
    <div className='w-full h-[calc(100vh-4rem)] flex flex-col items-center justify-center'>
      {/* Props Debug Panel */}
      {/* <div className='fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 text-xs max-w-xs'>
        <h3 className='font-bold mb-2'>Timeline Props</h3>
        <div className='space-y-1'>
          <div><strong>View:</strong> {selectedView}</div>
          <div><strong>Hour Width:</strong> {hourColumnWidth}px</div>
          <div><strong>Week Day Width:</strong> {weekDayWidth}px</div>
          <div><strong>Month Day Width:</strong> {monthDayWidth}px</div>
          <div><strong>Year Week Width:</strong> {yearWeekWidth}px</div>
          <div><strong>Data Items:</strong> {timelineData.length}</div>
          <div><strong>Day Items:</strong> {timelineDataDays.length}</div>
          <div><strong>Total Items:</strong> {mergedTimelineData.length}</div>
        </div>
        <div className='mt-3 pt-3 border-t border-gray-200'>
          <div className='text-gray-500 text-xs'>
            Check console for detailed logs
          </div>
        </div>
      </div> */}

      <TimelineWrapper 
        timelineData={timelineData} 
        // timelineDataDays={timelineDataDays} 
        mappingKeys={mappingKeys}
        onEventClick={handleEventClick}
        onItemDrag={handleItemDrag}
        onItemResize={handleItemResize}
      />
    </div>
  )
}

export default Page
