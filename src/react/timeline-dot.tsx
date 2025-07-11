import { useLayoutEffect, useRef } from 'react'

interface TimelineHeadDotProps {
  eventId: string,
  side: string,
  isCollapsed?: boolean,
}

export const TimelineHeadDot: React.FC<TimelineHeadDotProps> = ({ eventId, side, isCollapsed }) => {
  const headDotRef = useRef<HTMLDivElement>( null )

  useLayoutEffect(() => {
    if ( !isCollapsed ) {
      return
    }

    // comes in like '8.5px'
    const rawTopValue = headDotRef.current?.style.getPropertyValue( 'top' )
    const currentTopValue = parseFloat(( rawTopValue ?? '' ).replace( 'px', '' ))
    headDotRef.current?.style.setProperty( 'top', `${currentTopValue + 10}px` )
  }, [isCollapsed] )

  return (
    <div
      ref={headDotRef}
      className={`react-timeline-head-dot${isCollapsed ? '-collapsed' : ''}`}
      data-id={eventId}
      style={{
        [side]: 'calc(50% - 33px/2)',
      }}
    />
  )
}
