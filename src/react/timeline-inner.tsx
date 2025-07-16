import { FC, useState, ReactNode, Fragment } from 'react'
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
    const activeCollapsedRanges = new Set<string>()
    const hiddenDueToParent = new Set<string>()
    const headSides = new Map<string, 'left' | 'right'>()
    const overlapCounts = new Map<string, number>()

    let actualEventIndex = 0
    renderActions.forEach(( action ) => {
      const { kind, event, indent } = action
      const isCollapsed = collapsedRanges.has( event.id )

      switch ( kind ) {
      case 'HEAD': {
        const insideAnotherCollapsed = Array.from( activeCollapsedRanges ).some(( rangeId ) => {
          if ( rangeId === event.id ) return false // allow its own HEAD

          const rangeAction = renderActions.find(( a ) => {
            return a.kind === 'HEAD' && a.event.id === rangeId
          })
          if ( !rangeAction ) return false

          return (
            event.startDate.normalizedDateString >= rangeAction.event.startDate.normalizedDateString &&
            event.endDate.normalizedDateString <= rangeAction.event.endDate.normalizedDateString
          )
        })

        if ( insideAnotherCollapsed ) {
          hiddenDueToParent.add( event.id )
          return // skip rendering this HEAD
        }

        const side = determineSide( actualEventIndex )
        headSides.set( event.id, side )

        if ( isCollapsed ) activeCollapsedRanges.add( event.id )

        const overlaps = overlapCounts.get( event.id ) ?? 0
        const dateLabel = isCollapsed
          ? `${event.startDate.readableDateString} to ${event.endDate.readableDateString}${overlaps > 0 ? ' +' : ''}`
          : event.startDate.readableDateString

        const isFirst = event.startDate.normalizedDateString === firstDate

        output.push(
          <Fragment key={`head-${event.id}`}>
            <TimelineRangeHead
              event={event}
              side={side}
              depth={indent}
              dateLabel={dateLabel}
              toggleRangeCollapse={toggleRangeCollapse}
              isFirst={isFirst}
            />
            <TimelineHeadDot isCollapsed={isCollapsed} side={side} eventId={event.id} />
          </Fragment>
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
        output.push(
          <Fragment key={`event-${event.id}`}>
            <TimelineEvent event={event} side={side} depth={indent} />
            <TimelineHeadDot isRange={false} isCollapsed={false} side={side} eventId={event.id} />
          </Fragment>
        )

        actualEventIndex++
        break
      }

      case 'TAIL': {
        const side = headSides.get( event.id ) ?? sideStart
        const overlaps = overlapCounts.get( event.id ) ?? 0
        const isCollapsed = collapsedRanges.has( event.id )

        // If range was hidden due to a parent being collapsed, skip tail
        if ( hiddenDueToParent.has( event.id )) {
          activeCollapsedRanges.delete( event.id )
          return
        }

        // If collapsed and no overlaps → skip tail
        if ( isCollapsed && overlaps === 0 ) {
          activeCollapsedRanges.delete( event.id )
          return
        }

        /* 
         * If I add a fragment here (the last one to not get a fragment and therefore solve the key warning),
         * the vertical part of the tails end up moving when I collapse things.
         */
        output.push(
          // <Fragment key={`tail-${event.id}`}>
          <TimelineRangeTail firstDate={firstDate} event={event} side={side} depth={indent} />
          // </Fragment>
        )

        activeCollapsedRanges.delete( event.id )
        break
      }
      }
    })

    return output
  }

  return <> { renderEvents() } </>
}
