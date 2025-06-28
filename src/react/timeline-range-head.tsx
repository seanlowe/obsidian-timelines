import { FC } from 'react'
import { TimelineContainer } from './timeline-container'
import { TimelineCard } from './timeline-card'
import { TimelineHeader } from './timeline-header'
import { TimelineRangeHeadProps } from '../types'

export const TimelineRangeHead: FC<TimelineRangeHeadProps>  = ({
  event,
  side,
  depth,
  isCollapsed,
  dateLabel,
  isFirst,
}) => {
  return (
    <TimelineContainer
      key={`head-${event.id}`}
      date={event.startDate.normalizedDateString}
      side={side}
      indent={depth + 1}
      head
      tail={false}
      onClick={() => {
        console.log( 'clicked' )
      }}
      eventId={event.id}
      isFirst={isFirst}
    >
      <TimelineCard event={event} />
      <TimelineHeader side={side} date={isCollapsed ? dateLabel : event.startDate.readableDateString} />
    </TimelineContainer>
  )
}
