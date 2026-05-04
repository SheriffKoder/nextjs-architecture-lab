import React from 'react'
import { ProjectBoardTableItem } from '../config/table-config'
import ProjectDetails from './details-slider/project-details'
import ProjectAllocations from './details-slider/project-allocations'

const ProjectSliderDetailsContainer = ({ selectedProject }: { selectedProject: ProjectBoardTableItem | null }) => {
  if (!selectedProject) {
    return null
  }

  return (
    <div className='space-y-4'>
      {/* Project Details */}
      <ProjectDetails selectedProject={selectedProject} />

      {/* Project Allocations */}
      <ProjectAllocations selectedProject={selectedProject} />
    </div>
  )
}

export default ProjectSliderDetailsContainer
