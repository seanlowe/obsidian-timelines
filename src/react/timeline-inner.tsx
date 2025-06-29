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

    let actualEventIndex = 0
    renderActions.forEach(( action ) => {
      const { kind, event, indent } = action

      switch ( kind ) {
      case 'HEAD': {
        const isCollapsed = collapsedRanges.has( event.id )
        const dateLabel = `${event.startDate.readableDateString} to ${event.endDate.readableDateString}`
        const isFirst = event.startDate.normalizedDateString === firstDate
        const side = determineSide( actualEventIndex )
        headSides.set( event.id, side )

        const toRender = <>
          <TimelineRangeHead
            event={event}
            side={side}
            depth={indent}
            dateLabel={isCollapsed ? dateLabel : event.startDate.readableDateString}
            toggleRangeCollapse={toggleRangeCollapse}
            isFirst={isFirst}
          />
          <TimelineHeadDot side={side} eventId={event.id} />
        </>

        output.push( toRender )
        actualEventIndex++
        break
      }
      case 'TAIL': {
        const side = headSides.get( event.id ) ?? sideStart
        output.push( <TimelineRangeTail firstDate={firstDate} event={event} side={side} depth={indent} /> )
        break
      }
      case 'EVENT': {
        const side = determineSide( actualEventIndex )
        output.push( <TimelineEvent event={event} side={side} depth={indent} /> )
        actualEventIndex++
        break
      }
      }
    })

    return output
  }

  return <> { renderEvents() } </>
}
