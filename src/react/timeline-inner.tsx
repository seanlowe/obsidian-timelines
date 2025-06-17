import { FC, useState, ReactNode, Fragment } from 'react'
import { TimelineRangeHead } from './timeline-range-head'
import { TimelineRangeTail } from './timeline-range-tail'
import { TimelineEvent } from './timeline-event'
import { InnerTimelineProps, CardContainerWithChildren } from '../types'

// has collapsible ranges (hides nested events and tails when collapsed)
// updates title of head when collapsed

// indentation is kind of working (could be more obvious though)

// line / arrow to the tail element is not correct (too short)
// circle / ovals on line aren't quite right either

// does not handle events that start in a nested range but end outside of it

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
      let side: 'left' | 'right'

      if (( index + depth ) % 2 === 0 ) {
        side = sideStart
      } else {
        if ( sideStart === 'left' ) {
          side = 'right'
        } else {
          side = 'left'
        }
      }

      const isNestedInCollapsed = activeRanges.some(( rid ) => {
        return collapsedRanges.has( rid ) 
      })
      if ( isNestedInCollapsed ) return

      if ( ['range', 'background'].includes( event.type )) {
        const isCollapsed = collapsedRanges.has( event.id )
        const dateLabel = `${event.startDate.readableDateString} to ${event.endDate.readableDateString}`

        output.push(
          <TimelineRangeHead
            event={event}
            side={side}
            depth={depth}
            isCollapsed={isCollapsed}
            dateLabel={dateLabel}
            toggleRangeCollapse={toggleRangeCollapse}
          />
        )

        if ( !isCollapsed && event.children && event.children.length > 0 ) {
          output.push(
            <Fragment key={`nested-${event.id}`}>
              {renderEvents( event.children, depth + 1, [...activeRanges, event.id] )}
            </Fragment>
          )
        }

        if ( !collapsedRanges.has( event.id )) {
          output.push( <TimelineRangeTail event={event} side={side} depth={depth} /> )
        }
      } else {
        output.push( <TimelineEvent event={event} side={side} depth={depth} /> )
      }
    })

    return output
  }

  return <> { renderEvents( events, nestingLevel ) } </>
}