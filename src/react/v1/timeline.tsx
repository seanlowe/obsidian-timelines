import React from 'react'
// import { TimelineContainerProps } from './timeline-container'

interface TimelineProps {
  children: React.ReactNode;
}

export const Timeline: React.FC<TimelineProps> = ({ children }) => {
  return <div className="timeline">{children}</div>
}
