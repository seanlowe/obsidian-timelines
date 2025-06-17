import { FC } from 'react'
import { TimelineCard } from './timeline-card'
import { TimelineContainer } from './timeline-container'
import { TimelineHeader } from './timeline-header'
import { CardContainer } from 'src/types'

interface TimelineEventProps {
  event: CardContainer;
  side: 'left' | 'right';
  depth: number;
}

export const TimelineEvent: FC<TimelineEventProps> = ({ event, side, depth }) => {
  return (
    <TimelineContainer
      key={`box-${event.id}`}
      date={event.startDate.normalizedDateString}
      side={side}
      indent={depth + 1}
      head={false}
      tail={false}
    >
      <TimelineCard event={event} />
      <TimelineHeader side={side} date={event.startDate.readableDateString} />
    </TimelineContainer>
  )
}
