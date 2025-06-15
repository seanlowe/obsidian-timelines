/* eslint-disable no-nested-ternary */
import { CardContainer, ReactCardContainer } from 'src/types'
import { TimelineContainer } from './timeline-container'
import { TimelineCard } from './timeline-card'
import { TimelineHeader } from './timeline-header'
import { FC, Fragment, ReactNode } from 'react'
import { logger } from 'src/utils'

interface TimelineProps {
  events: ReactCardContainer[];
  nestingLevel?: number;
  sideStart?: 'left' | 'right';
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  nestingLevel = 0,
  sideStart = 'left',
}) => {
  const sortedEvents = [...events].sort(( a, b ) => {
    return a.startDate.normalizedDateString.localeCompare( b.startDate.normalizedDateString ) 
  })

  return (
    <TimelineInner events={sortedEvents} nestingLevel={nestingLevel} sideStart={sideStart} />
  )
}

const TimelineInner: FC<TimelineProps> = ({
  events, // already sorted
  nestingLevel = 0,
  sideStart = 'left',
}) => {
  const renderEvents = ( eventsToRender: CardContainer[], depth: number, renderedIds: Set<string> ) => {
    const output: ReactNode[] = []
    if ( !eventsToRender.length ) {
      return <></>
    }
    
    logger( 'renderEvents | eventsToRender', eventsToRender )
    
    eventsToRender.forEach(( event, index ) => {
      // skip if we've already rendered this event
      if ( renderedIds.has( event.id )) {
        return
      }

      renderedIds.add( event.id )

      const side = ( index + depth ) % 2 === 0 ? sideStart : sideStart === 'left' ? 'right' : 'left'

      output.push(
        <Fragment key={event.id}>
          <TimelineContainer
            key={`head-${event.id}`}
            date={event.startDate.normalizedDateString}
            side={side}
            indent={depth}
            head={event.type === 'range'}
            tail={false}
          >
            <TimelineCard event={event} />
            <TimelineHeader date={event.startDate.readableDateString} />
          </TimelineContainer>

          { renderEvents( eventsToRender.slice( index + 1 ), depth + 1, renderedIds ) }

          {event.type === 'range' && (
            <TimelineContainer
              date={event.endDate.normalizedDateString}
              tail
              indent={depth}
              side={side} head={false}
            >
              <TimelineHeader date={event.endDate.readableDateString} />
            </TimelineContainer>
          )}
        </Fragment>

      )
    })

    logger( 'renderEvents | output', output )

    return output
  }

  return (
    <div className="timeline">
      {renderEvents( events, nestingLevel, new Set())}
    </div>
  )
}