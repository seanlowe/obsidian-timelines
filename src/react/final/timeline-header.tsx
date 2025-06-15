import React from 'react'

interface TimelineHeaderProps {
  date: string;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ date }) => {
  return <h2 style={{ textAlign: 'left' }}>{date}</h2>
}
