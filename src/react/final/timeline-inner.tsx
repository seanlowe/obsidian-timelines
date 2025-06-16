import { FC, useState, ReactNode, Fragment } from 'react'
import { InnerTimelineProps, CardContainerWithChildren } from './timeline'
import { TimelineCard } from './timeline-card'
import { TimelineContainer } from './timeline-container'
import { TimelineHeader } from './timeline-header'

// has collapsible ranges (hides nested events and tails when collapsed)
// updates title of head when collapsed
// indentation is working (could be more obvious though)

// line / arrow to the tail element is not correct (too short)
// circle / ovals on line aren't quite right either

export const TimelineInner: FC<InnerTimelineProps> = ({
  events,
  nestingLevel = 0,
  sideStart = 'left',
}) => {
  const [collapsedRanges, setCollapsedRanges] = useState<Set<string>>( new Set())

  const toggleRangeCollapse = ( rangeId: string ) => {
    setCollapsedRanges(( prev ) => {
      const newSet = new Set( prev )
      newSet.has( rangeId ) ? newSet.delete( rangeId ) : newSet.add( rangeId )
      return newSet
    })
  }

  const renderEvents = (
    eventsToRender: CardContainerWithChildren[],
    depth: number,
    activeRanges: string[] = []
  ) => {
    const output: ReactNode[] = []

    eventsToRender.forEach(( event, index ) => {
      // eslint-disable-next-line no-nested-ternary
      const side = ( index + depth ) % 2 === 0 ? sideStart : sideStart === 'left' ? 'right' : 'left'

      const isNestedInCollapsed = activeRanges.some(( rid ) => {
        return collapsedRanges.has( rid ) 
      })
      if ( isNestedInCollapsed ) return

      if ( event.type === 'range' ) {
        const isCollapsed = collapsedRanges.has( event.id )
        const dateLabel = `${event.startDate.readableDateString} to ${event.endDate.readableDateString}`

        output.push(
          <TimelineContainer
            key={`head-${event.id}`}
            date={event.startDate.normalizedDateString}
            side={side}
            indent={depth + 1}
            head
            tail={false}
            onClick={() => {
              return toggleRangeCollapse( event.id ) 
            }}
          >
            <TimelineCard event={event} />
            <TimelineHeader date={isCollapsed ? dateLabel : event.startDate.readableDateString} />
          </TimelineContainer>
        )

        if ( !isCollapsed && event.children && event.children.length > 0 ) {
          output.push(
            <Fragment key={`nested-${event.id}`}>
              {renderEvents( event.children, depth + 1, [...activeRanges, event.id] )}
            </Fragment>
          )
        }

        if ( !collapsedRanges.has( event.id )) {
          output.push(
            <TimelineContainer
              key={`tail-${event.id}`}
              date={event.endDate.normalizedDateString}
              side={side}
              indent={depth + 1}
              head={false}
              tail
            >
              <TimelineHeader date={event.endDate.readableDateString} />
            </TimelineContainer>
          )
        }
      } else {
        output.push(
          <TimelineContainer
            key={`box-${event.id}`}
            date={event.startDate.normalizedDateString}
            side={side}
            indent={depth + 1}
            head={false}
            tail={false}
          >
            <TimelineCard event={event} />
            <TimelineHeader date={event.startDate.readableDateString} />
          </TimelineContainer>
        )
      }
    })

    return output
  }

  return <>{renderEvents( events, nestingLevel )}</>
}