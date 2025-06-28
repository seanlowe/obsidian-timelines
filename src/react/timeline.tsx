import { TimelineProps } from '../types'
import { FC } from 'react'
import { TimelineInner } from './timeline-inner'
import { createTimelineActions } from '../utils'

export const Timeline: FC<TimelineProps> = ({
  events,
  sideStart = 'left',
}) => {
  const sortedEvents = [...events].sort(( a, b ) => {
    return a.startDate.normalizedDateString.localeCompare( b.startDate.normalizedDateString )
  })

  const renderActions = createTimelineActions( sortedEvents )

  return (
    <TimelineInner renderActions={renderActions} sideStart={sideStart} />
  )
}
