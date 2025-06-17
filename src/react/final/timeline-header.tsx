import { FC } from 'react'

interface TimelineHeaderProps {
  date: string,
  side: 'left' | 'right',
}

export const TimelineHeader: FC<TimelineHeaderProps> = ({ date, side }) => {
  return <h2 style={{ textAlign: side }}>{date}</h2>
}
