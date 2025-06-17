import { FC } from 'react'
import { TimelineContainer } from './timeline-container'
import { TimelineCard } from './timeline-card'
import { TimelineHeader } from './timeline-header'
import { CardContainerWithChildren } from './timeline'

interface TimelineRangeHeadProps {
  event: CardContainerWithChildren;
  side: 'left' | 'right';
  depth: number;
  isCollapsed: boolean;
  dateLabel: string;
  toggleRangeCollapse: ( rangeId: string ) => void;
}

export const TimelineRangeHead: FC<TimelineRangeHeadProps>  = ({
  event,
  side,
  depth,
  isCollapsed,
  dateLabel,
  toggleRangeCollapse,
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
        return toggleRangeCollapse( event.id ) 
      }}
      eventId={event.id}
    >
      <TimelineCard event={event} />
      <TimelineHeader side={side} date={isCollapsed ? dateLabel : event.startDate.readableDateString} />
    </TimelineContainer>
  )
}
