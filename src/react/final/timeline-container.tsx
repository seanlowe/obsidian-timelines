import { FC, ReactNode } from 'react'

interface TimelineContainerProps {
  date: string;
  side: 'left' | 'right';
  indent: number;
  head: boolean;
  tail: boolean;
  children: ReactNode;
}

export const TimelineContainer: FC<TimelineContainerProps> = ({
  date,
  side,
  indent,
  head,
  tail,
  children,
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
    <div
      className={classes}
      timeline-date={date}
      style={{
        ['--timeline-indent' as string]: indent,
      }}
    >
      {children}
    </div>
  )
}