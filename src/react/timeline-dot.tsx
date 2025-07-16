import classNames from 'classnames'
import { useLayoutEffect, useRef } from 'react'

interface TimelineHeadDotProps {
  eventId: string,
  side: string,
  isCollapsed?: boolean,
  isRange?: boolean,
}

export const TimelineHeadDot: React.FC<TimelineHeadDotProps> = ({ eventId, side, isCollapsed, isRange }) => {
  const headDotRef = useRef<HTMLDivElement>( null )

  useLayoutEffect(() => {
    const modifier = isCollapsed ? 10 : -10

    // comes in like '8.5px'
    const rawTopValue = headDotRef.current?.style.getPropertyValue( 'top' )
    const currentTopValue = parseFloat(( rawTopValue ?? '' ).replace( 'px', '' ))
    headDotRef.current?.style.setProperty( 'top', `${currentTopValue + modifier}px` )
  }, [isCollapsed] )

  const className = classNames({
    [`react-timeline-head-dot${isCollapsed ? '-collapsed' : ''}`]: true,
    ['react-timeline-event-dot']: !isRange,
  })

  return (
    <div
      ref={headDotRef}
      className={className}
      // className={`react-timeline-head-dot${isCollapsed ? '-collapsed' : ''}`}
      data-id={eventId}
      style={{
        [side]: 'calc(50% - 33px/2)',
      }}
    />
  )
}
