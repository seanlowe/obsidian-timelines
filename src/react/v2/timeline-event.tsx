import React from 'react'
import { CardContainer } from '../../types'
import { TimelineContainer } from './timeline-container'
import { TimelineCard } from '../v1/timeline-card'
import { TimelineEventList } from '../v1/timeline-event-list'
import { TimelineHeader } from '../v1/timeline-header'

interface TimelineEventProps {
  event: CardContainer;
  side: 'left' | 'right';
}

export const TimelineEvent: React.FC<TimelineEventProps> = ({ event, side }) => {
  const {
    // id,
    body,
    startDate,
    endDate,
    title,
    path,
    type,
  } = event

  const indent = 0
  const collapsed = false

  if ( type === 'range' ) {
    // Range: head + tail
    return (
      <>
        <TimelineContainer
          date={startDate.normalizedDateString}
          head
          indent={indent}
          collapsed={collapsed}
          side={side}
        >
          <TimelineEventList>
            <TimelineCard title={title} link={path} description={body} />
          </TimelineEventList>
          <TimelineHeader date={startDate.readableDateString} />
        </TimelineContainer>

        <TimelineContainer
          date={endDate.normalizedDateString}
          tail
          indent={indent}
          collapsed={collapsed}
          side={side}
        >
          <TimelineHeader date={endDate.readableDateString} />
        </TimelineContainer>
      </>
    )
  }

  // Everything else (box, moment, etc.)
  return (
    <TimelineContainer
      date={startDate.normalizedDateString}
      indent={indent}
      collapsed={collapsed}
      side={side}
    >
      <TimelineEventList>
        <TimelineCard title={title} link={path} description={body} />
      </TimelineEventList>
      <TimelineHeader date={startDate.readableDateString} />
    </TimelineContainer>
  )
}
