import React from 'react'
import HealthCard, { HealthCardConfig } from './health-card'

interface HealthCardsConfig {
  cards: HealthCardConfig[]
}

interface ScoreCardsContainerProps {
  config: HealthCardsConfig
}

const ScoreCardsContainer = ({ config }: ScoreCardsContainerProps) => {
  return (
    <div className='grid grid-cols-2 xl:grid-cols-4 h-full w-full'>
      {config.cards.map((cardConfig, index) => (
      <div key={index} className='col-span-1 p-1 md:p-2 w-full'>
        <HealthCard config={cardConfig} />
      </div>
      ))}
    </div>
  )
}

export default ScoreCardsContainer
