import React from 'react'
import classNames from 'classnames'

interface TimelineContainerProps {
  date: string;
  head?: boolean;
  tail?: boolean;
  indent: number;
  collapsed?: boolean;
  children: React.ReactNode;
  side: 'left' | 'right';
}

export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  date,
  head = false,
  tail = false,
  indent,
  collapsed = false,
  children,
  side,
}) => {
  const containerClasses = classNames(
    'timeline-container',
    `timeline-${side}`,
    {
      'timeline-head': head,
      'timeline-tail': tail,
    }
  )

  const style = {
    '--timeline-indent': indent,
    'collapsed': collapsed ? 'true' : 'false',
  } as React.CSSProperties

  return (
    <div
      className={containerClasses}
      style={style}
      // collapsed={collapsed ? 'true' : 'false'}
      timeline-date={date}
    >
      {children}
    </div>
  )
}