/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
import { CardContainer, ReactCardContainer } from 'src/types'
import { TimelineContainer } from './timeline-container'
import { TimelineCard } from './timeline-card'
import { TimelineHeader } from './timeline-header'
import { FC, ReactNode } from 'react'
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
  const renderEvents = (
    eventsToRender: CardContainer[],
    depth: number,
    renderedIds: Set<string>,
    parentEndDate?: string,
  ) => {
    const output: ReactNode[] = []
    if ( !eventsToRender.length ) {
      return <></>
    }
    
    logger( 'renderEvents | eventsToRender', eventsToRender )
    
    eventsToRender.forEach(( event, index ) => {
      // skip if we've already rendered this event or if the start date is after the parent end date
      const eventHasAlreadyBeenRendered = renderedIds.has( event.id )
      const eventStartsAfterParentEnds = parentEndDate && event.startDate.normalizedDateString > parentEndDate    
      if ( eventHasAlreadyBeenRendered || eventStartsAfterParentEnds ) {
        console.log( 'skipping' )
        return
      }

      renderedIds.add( event.id )

      const side = ( index + depth ) % 2 === 0 ? sideStart : sideStart === 'left' ? 'right' : 'left'

      output.push(
        <div key={event.id} onClick={() => {
          return console.log( 'clicked' ) 
        }}>
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

          { renderEvents(
            eventsToRender.slice( index + 1 ),
            depth + 1,
            renderedIds,
            event.endDate.normalizedDateString,
          )}

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
        </div>

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