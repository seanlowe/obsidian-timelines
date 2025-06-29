import { FC } from 'react'
import { TimelineHeaderProps } from '../types'

export const TimelineHeader: FC<TimelineHeaderProps> = ({ date, side }) => {
  if (date.includes('to')) {
    return <h3 style={{ textAlign: side }}>{date}</h3>
  }

  return <h2 style={{ textAlign: side }}>{date}</h2>
}
