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
  const [firstDate, ] = useState<string>( renderActions[0].event.startDate.normalizedDateString )

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

      // console.log({ index, indent, sideStart, isEven: actualEventIndex % 2 === 0, side })

      switch ( kind ) {
      case 'HEAD': {
        const dateLabel = `${event.startDate.readableDateString} to ${event.endDate.readableDateString}`
        const isFirst = event.startDate.normalizedDateString === firstDate
        const side = determineSide( actualEventIndex )
        headSides.set( event.id, side )

        const toRender = <>
          <TimelineRangeHead
            event={event}
            side={side}
            depth={indent}
            isCollapsed={false}
            dateLabel={dateLabel}
            toggleRangeCollapse={() => {}}
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
