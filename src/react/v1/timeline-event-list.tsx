import React from 'react'

interface TimelineEventListProps {
  children: React.ReactNode;
  visible?: boolean;
}

export const TimelineEventList: React.FC<TimelineEventListProps> = ({
  children,
  visible = true,
}) => {
  return (
    <div className="timeline-event-list" style={{ display: visible ? 'block' : 'none' }}>
      {children}
    </div>
  )
}
