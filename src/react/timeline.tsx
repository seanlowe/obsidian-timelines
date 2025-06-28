import { TimelineProps } from '../types'
import { FC } from 'react'
import { TimelineInner } from './timeline-inner'
import { createTimelineActions, nestEvents } from '../utils'

export const Timeline: FC<TimelineProps> = ({
  events,
  nestingLevel = 0,
  sideStart = 'left',
}) => {
  const sortedEvents = [...events].sort(( a, b ) => {
    return a.startDate.normalizedDateString.localeCompare( b.startDate.normalizedDateString )
  })

  const nestedEvents = nestEvents( sortedEvents )

  const newEvents = createTimelineActions( sortedEvents )

  console.log({ newEvents })
  // console.log({ sortedEvents, events, nestedEvents, newEvents })

  return (
    <TimelineInner events={nestedEvents} nestingLevel={nestingLevel} sideStart={sideStart} />
  )
}
