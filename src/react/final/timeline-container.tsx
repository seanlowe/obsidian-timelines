import { FC, ReactNode } from 'react'

interface TimelineContainerProps {
  date: string,
  side: 'left' | 'right',
  indent: number,
  head: boolean,
  tail: boolean,
  children: ReactNode,
  onClick?: () => void,
  eventId?: string,
}

export const TimelineContainer: FC<TimelineContainerProps> = ({
  date,
  side,
  indent,
  head,
  tail,
  children,
  onClick,
  eventId,
}) => {
  const classes = [
    'timeline-container',
    `timeline-${side}`,
    head ? 'timeline-head' : '',
    tail ? 'timeline-tail' : '',
  ]
    .filter( Boolean )
    .join( ' ' )

  return (
    <>
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
          ['--timeline-indent' as string]: indent,
        }}
        data-id={head ? eventId : undefined}
      >
        {children}
      </div>
    </>
  )
}