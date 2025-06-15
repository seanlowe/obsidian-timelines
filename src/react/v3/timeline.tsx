/* eslint-disable no-nested-ternary */
import { ReactCardContainer } from 'src/types'
// import { Fragment } from 'react'
import { TimelineContainer } from './timeline-container'
import { TimelineCard } from './timeline-card'

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

  const openRanges: { event: ReactCardContainer; side: 'left' | 'right' }[] = []
  const output: React.ReactNode[] = []

  sortedEvents.forEach(( event, index ) => {
    while (
      openRanges.length &&
      event.startDate.normalizedDateString >=
        openRanges[openRanges.length - 1].event.endDate.normalizedDateString
    ) {
      const closing = openRanges.pop()!
      output.push(
        <TimelineContainer
          key={`tail-${closing.event.id}`}
          date={closing.event.endDate.normalizedDateString}
          side={closing.side}
          indent={openRanges.length}
          head={false}
          tail={true}
        >
          <h2 style={{ textAlign: 'left' }}>{closing.event.endDate.readableDateString}</h2>
        </TimelineContainer>
      )
    }

    const currentNesting = openRanges.length
    const side = ( index + nestingLevel ) % 2 === 0 ? sideStart : sideStart === 'left' ? 'right' : 'left'

    if ( event.type === 'range' ) {
      openRanges.push({ event, side })
    }

    output.push(
      <TimelineContainer
        key={`head-${event.id}`}
        date={event.startDate.normalizedDateString}
        side={side}
        indent={currentNesting}
        head={event.type === 'range'}
        tail={false}
      >
        <TimelineCard event={event} />
        {event.children && event.children.length > 0 && (
          <Timeline
            events={event.children}
            nestingLevel={currentNesting + 1}
            sideStart={sideStart}
          />
        )}
      </TimelineContainer>
    )
  })

  while ( openRanges.length ) {
    const closing = openRanges.pop()
    if ( !closing ) {
      break
    }

    output.push(
      <TimelineContainer
        key={`tail-${closing.event.id}`}
        date={closing.event.endDate.normalizedDateString}
        side={closing.side}
        indent={openRanges.length}
        head={false}
        tail={true}
      >
        <h2 style={{ textAlign: 'left' }}>{closing.event.endDate.readableDateString}</h2>
      </TimelineContainer>
    )
  }

  return <div className="timeline">{output}</div>
}