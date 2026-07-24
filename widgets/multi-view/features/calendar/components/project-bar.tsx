/**
 * Project Bar Component
 * 
 * Purpose: Renders a project as a spanning bar in calendar cells
 * Used in: app/development/calendar/components/project-bar.tsx
 * Why: Provides visual continuity for projects across multiple days
 * 
 * Function Index:
 * ProjectBar: Main component that renders project spanning bars
 * 
 * Steps:
 * 1. Accept project data and position props
 * 2. Determine border radius based on position
 * 3. Render project bar with appropriate styling
 * 4. Show project name only on start/single positions
 */

'use client'

interface ProjectBarProps {
  project: any
  position: 'start' | 'middle' | 'end' | 'single'
  color: string
  nameKey?: string
  className?: string
  onProjectClick?: (project: any) => void
}

const ProjectBar = ({ project, position, color, nameKey = 'name', className = '', onProjectClick }: ProjectBarProps) => {
  // Determine border radius based on position using inline CSS
  const getBorderRadius = () => {
    switch (position) {
      case 'start':
        return '3px 0 0 3px' // rounded left only
      case 'end':
        return '0 3px 3px 0' // rounded right only
      case 'single':
        return '3px' // rounded all corners
      case 'middle':
        return '0' // no rounding
      default:
        return '3px' // default rounded
    }
  }

  return (
    <div 
      className={`h-5 px-1 flex items-center text-xs text-background bg-secondary truncate cursor-pointer ${className}`}
      style={{ 
        // backgroundColor: color,
        // backgroundColor: 'var(--color-secondary)',
        borderRadius: getBorderRadius(),
        marginLeft: position === 'start' || position === 'single' ? '6px' : '0px',
        marginRight: position === 'end' || position === 'single' ? '6px' : '0px',
      }}
      title={project[nameKey]}
      onClick={() => onProjectClick?.(project)}
    >
      {/* Show project name only on start or single day */}
      {(position === 'start' || position === 'single') && project[nameKey]}
      {/* {project[nameKey] + ' ' + position} */}

    </div>
  )
}

export default ProjectBar
