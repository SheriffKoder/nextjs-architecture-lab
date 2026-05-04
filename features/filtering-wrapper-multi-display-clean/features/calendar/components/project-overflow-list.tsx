/**
 * Project Overflow List Component
 * 
 * Purpose: Displays a list of projects when there are more than the visible limit
 * Used in: app/development/calendar/components/project-overflow-list.tsx
 * Why: Handles overflow projects with click interaction and smooth animations
 * 
 * Function Index:
 * ProjectOverflowList: Main component that renders the overflow list
 * 
 * Steps:
 * 1. Accept projects and visibility state props
 * 2. Handle click events to show/hide the list
 * 3. Animate the list from bottom to original position
 * 4. Render project items with proper styling
 */

'use client'

import { useState } from 'react'

interface ProjectOverflowListProps {
  projects: any[]
  visibleCount: number
  nameKey?: string
  className?: string
  onProjectClick?: (project: any) => void
}

const ProjectOverflowList = ({ 
  projects, 
  visibleCount, 
  nameKey = 'name',
  className = '',
  onProjectClick
}: ProjectOverflowListProps) => {
  const [isVisible, setIsVisible] = useState(false)
  
  // Don't render if there are no overflow projects
//   if (projects.length <= visibleCount) {
//     return null
//   }

  const overflowProjects = projects.slice(visibleCount)
  const remainingCount = projects.length - visibleCount

  const handleToggle = () => {
    setIsVisible(!isVisible)
  }

  const handleProjectClick = (project: any) => {
    onProjectClick?.(project)
    setIsVisible(false) // Close the overflow list after clicking
  }

  return (
    <>
      {/* View More Button */}
      <div 
        className={`text-[10px] w-full text-center underline mb-1 text-muted-foreground cursor-pointer hover:text-foreground transition-colors
        ${className}
        ${remainingCount > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleToggle}
      >
        +{remainingCount} more
      </div>

      {/* Overflow List */}
      <div 
        className={`absolute top-0 left-0 w-full h-full bg-background border border-border rounded-lg flex flex-col gap-0 p-2 z-10 shadow-lg ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={(e) => {
          // Close when clicking the backdrop
          if (e.target === e.currentTarget) {
            setIsVisible(false)
          }
        }}
      >
          {/* Close button */}
          <div className="flex justify-end absolute top-2 right-2">
            <button 
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
              onClick={handleToggle}
            >
              ✕
            </button>
          </div>
          
          {/* Project list */}
          <div className="flex-1 overflow-y-auto">
            {overflowProjects.map((project, index) => (
              <div 
                key={project.id || index} 
                className="flex items-center gap-2 text-start cursor-pointer hover:bg-muted p-1 rounded transition-colors"
                onClick={() => handleProjectClick(project)}
              >
                <div 
                  className="w-2 h-6 rounded-full"
                  style={{ backgroundColor: project.tagColor || 'var(--color-primary)' }}
                ></div>
                <span className="text-xs text-foreground">{project[nameKey]}</span>
              </div>
            ))}
          </div>
        </div>
    </>
  )
}

export default ProjectOverflowList
