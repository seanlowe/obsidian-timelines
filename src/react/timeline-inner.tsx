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

  const renderEvents = () => {
    const output: ReactNode[] = []
    let side: 'left' | 'right'
    
    renderActions.forEach(( action, index ) => {
      const { kind, event, indent } = action

      if (( index + indent ) % 2 === 0 ) {
        side = sideStart
      } else {
        if ( sideStart === 'left' ) {
          side = 'right'
        } else {
          side = 'left'
        }
      }

      switch ( kind ) {
      case 'HEAD': {
        const dateLabel = `${event.startDate.readableDateString} to ${event.endDate.readableDateString}`
        const isFirst = event.startDate.normalizedDateString === firstDate

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
        break
      }
      case 'TAIL':
        output.push( <TimelineRangeTail firstDate={firstDate} event={event} side={side} depth={indent} /> )
        break
      case 'EVENT':
        output.push( <TimelineEvent event={event} side={side} depth={indent} /> )
        break
      }
    })

    return output
  }

  return <> { renderEvents() } </>
}
