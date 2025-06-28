import { FC } from 'react'
import { TimelineContainerProps } from '../types'

export const TimelineContainer: FC<TimelineContainerProps> = ({
  date,
  side,
  indent,
  head,
  tail,
  children,
  onClick,
  eventId,
  isFirst
}) => {
  const classes = [
    'react-timeline-container',
    `react-timeline-${side}`,
    head ? 'react-timeline-head' : '',
    tail ? 'react-timeline-tail' : '',
  ]
    .filter( Boolean )
    .join( ' ' )

  return (
    <>
      {/* initial card arrow pointing at the timeline --- handle later */}
      {/* <div style={{
        border: '1px solid red',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}/> */}
      <div
        className={classes}
        timeline-date={date}
        onClick={onClick}
        style={{
          ['--react-timeline-indent' as string]: indent,
        }}
        data-id={head ? eventId : undefined}
        data-is-first={isFirst}
      >
        {children}
      </div>
    </>
  )
}
