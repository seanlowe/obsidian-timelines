import React from 'react'
// import { TimelineEventList } from './timeline-event-list'
// import { TimelineHeader } from './timeline-header'

export interface TimelineContainerProps {
  date: string;
  indent?: number;
  spanLength?: number;
  collapsed?: boolean;
  head?: boolean;
  tail?: boolean;
  children?: React.ReactNode;
}

export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  date,
  indent = 0,
  spanLength,
  collapsed = false,
  head = false,
  tail = false,
  children,
}) => {
  const classes = [
    'timeline-container',
    'timeline-left',
    head ? 'timeline-head' : '',
    tail ? 'timeline-tail' : '',
  ]
    .filter( Boolean )
    .join( ' ' )

  const style: React.CSSProperties = {
    ['--timeline-indent' as string]: indent,
    ['collapsed' as string]: collapsed.toString(),
    ...( spanLength !== undefined && { ['--timeline-span-length' as string]: `${spanLength}px` }),
  }

  return (
    // <div className={classes} style={style} timeline-date={date} collapsed={collapsed.toString()}>
    <div className={classes} style={style} timeline-date={date}>
      {children}
    </div>
  )
}