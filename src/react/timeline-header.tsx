import { FC } from 'react'
import { TimelineHeaderProps } from '../types'

export const TimelineHeader: FC<TimelineHeaderProps> = ({ date, side }) => {
  return <h2 style={{ textAlign: side }}>{date}</h2>
}
