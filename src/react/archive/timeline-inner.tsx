/* eslint-disable no-nested-ternary */
import { FC, Fragment, ReactNode, useState } from 'react'
import { CardContainer } from 'src/types'
import { logger } from 'src/utils'
import { TimelineCard } from '../final/timeline-card'
import { TimelineContainer } from '../final/timeline-container'
import { TimelineHeader } from '../final/timeline-header'
import { TimelineProps, InnerTimelineProps, CardContainerWithChildren } from '../final/timeline'

export const TimelineInner1: FC<TimelineProps> = ({
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
              side={side}
              indent={depth}
              head={false}
              tail
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

export const TimelineInner2: FC<TimelineProps> = ({
  events,
  nestingLevel = 0,
  sideStart = 'left',
}) => {
  const [collapsedRanges, setCollapsedRanges] = useState<Set<string>>( new Set())

  const toggleRangeCollapse = ( rangeId: string ) => {
    console.log( 'toggleRangeCollapse', rangeId )
    setCollapsedRanges(( prev ) => {
      const newSet = new Set( prev )

      if ( newSet.has( rangeId )) {
        newSet.delete( rangeId )
      } else {
        newSet.add( rangeId )
      }

      return newSet
    })
  }

  const renderEvents = (
    eventsToRender: CardContainer[],
    depth: number,
    renderedIds: Set<string>,
    parentEndDate?: string,
    activeRanges: string[] = []
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
        return
      }

      renderedIds.add( event.id )

      const side = ( index + depth ) % 2 === 0 ? sideStart : sideStart === 'left' ? 'right' : 'left'

      const isNestedInCollapsed = activeRanges.some(( rid ) => {
        return collapsedRanges.has( rid )
      })

      if ( isNestedInCollapsed ) return

      if ( event.type === 'range' ) {
        output.push(
          <TimelineContainer
            key={`head-${event.id}`}
            date={event.startDate.normalizedDateString}
            side={side}
            indent={depth}
            head
            tail={false}
            onClick={() => {
              return toggleRangeCollapse( event.id )
            }}
          >
            <TimelineCard event={event} />
            <TimelineHeader date={event.startDate.readableDateString} />
          </TimelineContainer>
        )

        output.push(
          <Fragment key={`nested-${event.id}`}>
            {renderEvents(
              eventsToRender.slice( index + 1 ),
              depth + 1,
              renderedIds,
              event.endDate.normalizedDateString,
              [...activeRanges, event.id]
            )}
          </Fragment>
        )

        if ( !collapsedRanges.has( event.id )) {
          output.push(
            <TimelineContainer
              key={`tail-${event.id}`}
              date={event.endDate.normalizedDateString}
              side={side}
              indent={depth}
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
            indent={depth}
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

  return (
    <>
      {renderEvents( events, nestingLevel, new Set())}
    </>
  )
}

export const TimelineInner3: FC<InnerTimelineProps> = ({
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
      const side = ( index + depth ) % 2 === 0 ? sideStart : sideStart === 'left' ? 'right' : 'left'

      const isNestedInCollapsed = activeRanges.some(( rid ) => {
        return collapsedRanges.has( rid ) 
      })

      if ( isNestedInCollapsed ) return

      if ( event.type === 'range' ) {
        output.push(
          <TimelineContainer
            key={`head-${event.id}`}
            date={event.startDate.normalizedDateString}
            side={side}
            indent={depth}
            head
            tail={false}
            onClick={() => {
              return toggleRangeCollapse( event.id ) 
            }}
          >
            <TimelineCard event={event} />
            <TimelineHeader date={event.startDate.readableDateString} />
          </TimelineContainer>
        )

        // if ( event.children && event.children.length > 0 ) {
        //   output.push(
        //     <Fragment key={`nested-${event.id}`}>
        //       {renderEvents( event.children, depth + 1, [...activeRanges, event.id] )}
        //     </Fragment>
        //   )
        // }

        // if ( !collapsedRanges.has( event.id )) {
        //   output.push(
        //     <TimelineContainer
        //       key={`tail-${event.id}`}
        //       date={event.endDate.normalizedDateString}
        //       side={side}
        //       indent={depth}
        //       head={false}
        //       tail
        //     >
        //       <TimelineHeader date={event.endDate.readableDateString} />
        //     </TimelineContainer>
        //   )
        // }

        if ( !collapsedRanges.has( event.id ) && event.children && event.children.length > 0 ) {
          output.push(
            <Fragment key={`nested-${event.id}`}>
              {renderEvents( event.children, depth + 1, [...activeRanges, event.id] )}
            </Fragment>
          )
        }

        // Always render tail
        output.push(
          <TimelineContainer
            key={`tail-${event.id}`}
            date={event.endDate.normalizedDateString}
            side={side}
            indent={depth}
            head={false}
            tail
          >
            <TimelineHeader date={event.endDate.readableDateString} />
          </TimelineContainer>
        )
      } else {
        output.push(
          <TimelineContainer
            key={`box-${event.id}`}
            date={event.startDate.normalizedDateString}
            side={side}
            indent={depth}
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

  return (
    <>
      {renderEvents( events, nestingLevel )}
    </>
  )
}