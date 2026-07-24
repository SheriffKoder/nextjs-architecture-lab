/**
 * Calendar Development Page
 * 
 * Purpose: Main page for calendar development features
 * Used in: app/development/calendar/page.tsx
 * Why: Entry point for calendar development functionality
 * 
 * Function Index:
 * CalendarPage: Main page component for calendar development
 * 
 * Steps:
 * 1. Create shared state for current date
 * 2. Pass date and setter to both components
 * 3. Keep page structure minimal and focused
 */

'use client'

import { useState } from 'react'
import CurrentYear from './components/current-year'
import MonthNavigation from './components/month-navigation'
import CalendarGrid from './components/calendar-grid'
import { getProjectsForMonth } from './utils/mapping-calculations'
import CalendarContainer from './calendar-container'

const CalendarPage = () => {
  // Get current date and format month as two-digit string
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0') // Month is 0-indexed, so add 1

  // All available projects
  const allProjects = [
    {
        name: 'Project 1',
        startDate: `${currentYear}-${currentMonth}-14T00:00:00.000Z`,
        endDate: `${currentYear}-${currentMonth}-16T00:00:00.000Z`,
        // tagColor: '#3b82f6'
    },
    {
        name: 'Project 2',
        startDate: `${currentYear}-${currentMonth}-01T00:00:00.000Z`,
        endDate: `${currentYear}-${currentMonth}-06T00:00:00.000Z`,
        // tagColor: '#f59e0b'
    },
    {
        name: 'Project 3',
        startDate: `${currentYear}-${currentMonth}-14T00:00:00.000Z`,
        endDate: `${currentYear}-${currentMonth}-20T00:00:00.000Z`,
        // tagColor: '#06b6d4'
    },
    {
        name: '📆 Project 4',
        startDate: `${currentYear}-${currentMonth}-20T00:00:00.000Z`,
        endDate: `${currentYear}-${currentMonth}-21T00:00:00.000Z`,
        // tagColor: '#06b6d4'
    },
    {
        name: 'Project 5',
        startDate: `${currentYear}-${currentMonth}-20T00:00:00.000Z`,
        endDate: `${currentYear}-${currentMonth}-20T00:00:00.000Z`,
        // tagColor: '#06b6d4'
    },
    {
        name: 'Project 6',
        startDate: `${currentYear}-${currentMonth}-20T00:00:00.000Z`,
        endDate: `${currentYear}-${currentMonth}-20T00:00:00.000Z`,
        // tagColor: '#06b6d4'
    },    {
        name: 'Project 7',
        startDate: `${currentYear}-${currentMonth}-20T00:00:00.000Z`,
        endDate: `${currentYear}-${currentMonth}-20T00:00:00.000Z`,
        // tagColor: '#06b6d4'
    },
  ]



  return (
    <div className='w-full h-screen flex justify-center px-[4rem] py-[2rem] bg-white' id='calendar'>
      <div className='w-full h-full'>
        <CalendarContainer projects={allProjects} startDateKey="startDate" endDateKey="endDate" 
        nameKey="name" />
      </div>
    </div>
  )
}

export default CalendarPage
