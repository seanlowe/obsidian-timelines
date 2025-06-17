import { FC } from 'react'
import { TimelineContainer } from './timeline-container'
import { TimelineHeader } from './timeline-header'
import { TimelineTailLine } from './timeline-range-line'
import { TimelineRangeTailProps } from '../types'

export const TimelineRangeTail: FC<TimelineRangeTailProps> = ({ event, side, depth }) => {
  const {
    id,
    endDate: { normalizedDateString, readableDateString }
  } = event

  const flippedSide = side === 'left' ? 'right' : 'left'

  return (
    <TimelineContainer
      key={`tail-${id}`}
      date={normalizedDateString}
      side={side}
      indent={depth + 1}
      head={false}
      tail
    >
      <TimelineTailLine eventId={id} side={side} />
      <TimelineHeader side={flippedSide} date={readableDateString} />
    </TimelineContainer>
  )
}
