import React from 'react'
import { CardContainer } from '../../types'
import { TimelineEvent } from './timeline-event'

interface TimelineProps {
  events: CardContainer[];
}

const renderEvents = ( events: CardContainer[] ) => {
  let counter = 1
  const jsx = events.map(( event ) => {
    counter++
    return (
      <TimelineEvent key={event.id} event={event} side={counter % 2 === 0 ? 'left' : 'right'} />
    )
  })

  return jsx
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="timeline">
      {renderEvents( events )}
    </div>
  )
}