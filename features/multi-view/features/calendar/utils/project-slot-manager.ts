/**
 * Project Slot Manager
 * 
 * Purpose: Manages consistent row slots for projects across calendar cells with dynamic slot allocation
 * Used in: app/development/calendar/utils/project-slot-manager.ts
 * Why: Ensures projects maintain the same vertical position across all cells they span while efficiently managing slot availability
 * 
 * Function Index:
 * ProjectSlotManager: Class for managing project slot assignments with active project tracking
 * getProjectSlot: Get or assign a slot for a project (marks project as active)
 * getProjectPosition: Determine if project is start/middle/end/single (uses configurable date keys)
 * releaseInactiveSlots: Release slots for projects that are no longer active
 * getAvailableSlots: Get array of available slots
 * reset: Reset slots when changing months
 * 
 * Steps:
 * 1. Track project slots in a Map and active projects in a Set
 * 2. Assign slots to new projects (starting from slot 0)
 * 3. Mark projects as active when they appear on a day
 * 4. Release slots for inactive projects after processing each day
 * 5. Determine project position in date range
 * 6. Reset slots when changing months
 * 
 * Key Features:
 * - Dynamic slot allocation and release
 * - Active project tracking per day
 * - Automatic slot cleanup for ended projects
 * - All slots (0-5) available for projects
 */

export class ProjectSlotManager {
  private projectSlots = new Map<string, number>()
  private usedSlots = new Set<number>()
  private maxSlots = 6
  private activeProjects = new Set<string>() // Track currently active projects

  /**
   * Get or assign a slot for a project
   * @param projectId - Unique identifier for the project
   * @returns Slot number (0-5)
   */
  getProjectSlot(projectId: string): number {
    // Mark project as active
    this.activeProjects.add(projectId)
    
    if (this.projectSlots.has(projectId)) {
      return this.projectSlots.get(projectId)!
    }

    // Find next available slot
    let slot = 0 // Start from slot 0
    while (this.usedSlots.has(slot) && slot < this.maxSlots) {
      slot++
    }

    if (slot < this.maxSlots) {
      this.projectSlots.set(projectId, slot)
      this.usedSlots.add(slot)
    }

    return slot
  }

  /**
   * Release slots for projects that are no longer active
   * Call this method after processing all projects for a day
   */
  releaseInactiveSlots() {
    // Find projects that are no longer active
    const inactiveProjects = []
    for (const [projectId, slot] of this.projectSlots) {
      if (!this.activeProjects.has(projectId)) {
        inactiveProjects.push({ projectId, slot })
      }
    }

    // Release slots for inactive projects
    inactiveProjects.forEach(({ projectId, slot }) => {
      this.projectSlots.delete(projectId)
      this.usedSlots.delete(slot)
    })

    // Clear active projects for next day
    this.activeProjects.clear()
  }

  /**
   * Check if a project is in its first, middle, or last cell
   * @param dayNumber - Current day number
   * @param project - Project object
   * @param startDateKey - Key for start date in project
   * @param endDateKey - Key for end date in project
   * @returns Position type
   */
  getProjectPosition(
    dayNumber: number,
    project: any,
    startDateKey: string = 'startDate',
    endDateKey: string = 'endDate'
  ): 'start' | 'middle' | 'end' | 'single' {
    // Extract day numbers from project dates using configurable keys
    const startDate = new Date(project[startDateKey])
    
    // Check if end date exists
    const hasEndDate = project[endDateKey] && project[endDateKey] !== null && project[endDateKey] !== undefined
    const endDate = hasEndDate ? new Date(project[endDateKey]) : new Date()
    
    // Use UTC methods to match calendar grid's UTC date handling
    const projectStartDay = startDate.getUTCDate()
    const projectEndDay = endDate.getUTCDate()

    // Check if single day project (only if there's an actual end date)
    if (hasEndDate && projectStartDay === projectEndDay) return 'single'
    
    // Check position based on day comparison
    if (dayNumber === projectStartDay && dayNumber !== projectEndDay) return 'start'
    
    // Only show "end" if there's an actual end date and we're on the end day
    if (hasEndDate && dayNumber !== projectStartDay && dayNumber === projectEndDay) return 'end'
    
    // All other cases (including when there's no end date) show as middle
    if (dayNumber !== projectStartDay && dayNumber !== projectEndDay) return 'middle'
    
    // Fallback
    return 'middle'
  }

  /**
   * Get available slots
   * @returns Array of available slot numbers
   */
  getAvailableSlots(): number[] {
    const available = []
    for (let i = 0; i < this.maxSlots; i++) {
      if (!this.usedSlots.has(i)) {
        available.push(i)
      }
    }
    return available
  }

  /**
   * Reset slots (call when changing months)
   */
  reset() {
    this.projectSlots.clear()
    this.usedSlots.clear()
  }
}