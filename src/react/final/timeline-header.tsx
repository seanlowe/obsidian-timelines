import { FC } from 'react'

interface TimelineHeaderProps {
  date: string;
}

export const TimelineHeader: FC<TimelineHeaderProps> = ({ date }) => {
  return <h2 style={{ textAlign: 'left' }}>{date}</h2>
}
