interface TimelineHeadDotProps {
  eventId: string,
  side: string,
  isCollapsed?: boolean,
}

export const TimelineHeadDot: React.FC<TimelineHeadDotProps> = ({ eventId, side, isCollapsed }) => {
  return (
    <div
      className={`react-timeline-head-dot${isCollapsed ? '-collapsed' : ''}`}
      data-id={eventId}
      style={{
        [side]: isCollapsed ? 'calc(50% - 25px/2)' : 'calc(50% - 33px/2)',
      }}
    />
  )
}
