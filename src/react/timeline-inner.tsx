import { FC, useState, ReactNode } from 'react'
import { TimelineRangeHead } from './timeline-range-head'
import { TimelineRangeTail } from './timeline-range-tail'
import { TimelineEvent } from './timeline-event'
import { InnerTimelineProps } from '../types'
import { TimelineHeadDot } from './timeline-dot'

export const TimelineInner: FC<InnerTimelineProps> = ({
  renderActions,
  sideStart = 'left',
}) => {
  const [collapsedRanges, setCollapsedRanges] = useState<Set<string>>( new Set())
  const [firstDate, ] = useState<string>( renderActions[0].event.startDate.normalizedDateString )

  const toggleRangeCollapse = ( rangeId: string ) => {
    setCollapsedRanges(( prev ) => {
      const newSet = new Set( prev )
      newSet.has( rangeId ) ? newSet.delete( rangeId ) : newSet.add( rangeId )
      return newSet
    })
  }

  const oppositeSide = ( s: 'left' | 'right' ) => {
    return ( s === 'left' ? 'right' : 'left' )
  }

  const determineSide = ( index: number ): 'left' | 'right' => {
    return index % 2 === 0 ? sideStart : oppositeSide( sideStart )
  }

  const renderEvents = () => {
    const output: ReactNode[] = []
    const headSides = new Map<string, 'left' | 'right'>()
    const activeCollapsedRanges = new Set<string>()
    const overlapCounts = new Map<string, number>()

    let actualEventIndex = 0
    renderActions.forEach(( action ) => {
      const { kind, event, indent } = action
      const isCollapsed = collapsedRanges.has( event.id )

      switch ( kind ) {
      case 'HEAD': {
        const side = determineSide( actualEventIndex )
        headSides.set( event.id, side )

        if ( isCollapsed ) activeCollapsedRanges.add( event.id )

        const overlaps = overlapCounts.get( event.id ) ?? 0
        const dateLabel = isCollapsed
          ? `${event.startDate.readableDateString} to ${event.endDate.readableDateString}${overlaps > 0 ? ' +' : ''}`
          : event.startDate.readableDateString

        const isFirst = event.startDate.normalizedDateString === firstDate

        output.push(
          <>
            <TimelineRangeHead
              event={event}
              side={side}
              depth={indent}
              dateLabel={dateLabel}
              toggleRangeCollapse={toggleRangeCollapse}
              isFirst={isFirst}
            />
            <TimelineHeadDot side={side} eventId={event.id} />
          </>
        )

        actualEventIndex++
        break
      }

      case 'EVENT': {
        // Skip if fully inside any active collapsed range
        const insideCollapsed = Array.from( activeCollapsedRanges ).some(( rangeId ) => {
          const rangeAction = renderActions.find(( a ) => {
            return a.kind === 'HEAD' && a.event.id === rangeId 
          })
          if ( !rangeAction ) return false

          return (
            event.startDate.normalizedDateString >= rangeAction.event.startDate.normalizedDateString &&
            event.endDate.normalizedDateString <= rangeAction.event.endDate.normalizedDateString
          )
        })

        if ( insideCollapsed ) return

        // If overlaps any active collapsed range, increment overlap count
        activeCollapsedRanges.forEach(( rangeId ) => {
          const rangeAction = renderActions.find(( a ) => {
            return a.kind === 'HEAD' && a.event.id === rangeId 
          })
          if ( !rangeAction ) return

          if (
            event.startDate.normalizedDateString < rangeAction.event.endDate.normalizedDateString &&
            event.endDate.normalizedDateString > rangeAction.event.endDate.normalizedDateString
          ) {
            const prev = overlapCounts.get( rangeId ) ?? 0
            overlapCounts.set( rangeId, prev + 1 )
          }
        })

        const side = determineSide( actualEventIndex )
        output.push( <TimelineEvent event={event} side={side} depth={indent} /> )
        actualEventIndex++
        break
      }

      case 'TAIL': {
        const side = headSides.get( event.id ) ?? sideStart
        const overlaps = overlapCounts.get( event.id ) ?? 0
        const isCollapsed = collapsedRanges.has( event.id )

        // If collapsed and no overlaps → skip tail
        if ( isCollapsed && overlaps === 0 ) {
          activeCollapsedRanges.delete( event.id )
          return
        }

        output.push( <TimelineRangeTail firstDate={firstDate} event={event} side={side} depth={indent} /> )
        activeCollapsedRanges.delete( event.id )
        break
      }
      }
    })

    return output
  }

  return <> { renderEvents() } </>
}
