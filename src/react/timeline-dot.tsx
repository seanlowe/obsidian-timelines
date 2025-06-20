interface TimelineHeadDotProps {
  eventId: string,
  side: string,
}

export const TimelineHeadDot: React.FC<TimelineHeadDotProps> = ({ eventId, side }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: '33px',
    minHeight: '33px',
    backgroundColor: 'var(--background-secondary)',
    filter: 'hue-rotate(180deg)',
    border: '4px solid var(--text-accent)',
    borderRadius: '33px',
    zIndex: 1,
    [side]: 'calc(50% - 33px/2)',
    
    // gets set in timeline-range-line.tsx
    // top: '8.5px',
    // height: `${spanLength + 33}px`,
  }

  return <div className="timeline-head-dot" data-id={eventId} style={style} />
}
