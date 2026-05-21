/**
 * Score Cards Component
 * 
 * Purpose: Wrapper component that renders multiple score cards based on configuration
 * Used in: ProjectBoardContent and other components
 * Why: Provides a grid layout for displaying multiple score metrics
 * 
 * Function Index:
 * - ScoreCards: Wrapper component that maps over scoreCardsConfig and renders ScoreCard components
 */

import React from 'react'
import { ScoreData } from '../../../features/portfolio-project-board/types'
import ScoreCard from './score-card'

interface ScoreCardsProps {
  scoreCardsConfig: ScoreData[]
  className?: string
}

export default function ScoreCards({ scoreCardsConfig, className = '' }: ScoreCardsProps) {
  return (
    <div className={`grid grid-cols-3 gap-4 w-full ${className}`}>
      {scoreCardsConfig.map((scoreData, index) => (
        <ScoreCard key={index} data={scoreData} />
      ))}
    </div>
  )
}
