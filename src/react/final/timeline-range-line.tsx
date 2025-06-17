import { useRef, useState, useLayoutEffect, FC } from 'react'

interface TimelineTailLineProps {
  eventId: string;
  side: 'left' | 'right';
}

export const TimelineTailLine: FC<TimelineTailLineProps> = ({ eventId, side }) => {
  const tailRef = useRef<HTMLDivElement>( null )
  const [lineHeight, setLineHeight] = useState( 0 )

  useLayoutEffect(() => {
    const tailEl = tailRef.current
    const headEl = document.querySelector( `.timeline-head[data-id='${eventId}']` ) as HTMLDivElement | null

    if ( tailEl && headEl ) {
      const headRect = headEl.getBoundingClientRect()
      const tailRect = tailEl.getBoundingClientRect()
      const height = tailRect.top - headRect.bottom

      // set up some kind of default height for if there are no children
      setLineHeight( height > 0 ? height : 0 )
    }
  }, [] )

  return (
    <>
      <div
        ref={tailRef}
        className={`timeline-tail-line-${side}`}
        style={{
          // backgroundColor: 'blue',
          height: `${lineHeight + 10}px`,
          top: `${lineHeight * -1}px`,
          left: `${side === 'left' ? 'unset' : '87.7%'}`, // needs logic for indentation
        }}
        data-id={eventId}
      />
      <div
        ref={tailRef}
        className={`timeline-tail-line-${side}-flat`}
        style={{
          position: 'absolute',
          top: 0,
          [side === 'left' ? 'right' : 'left']: side === 'left' ? '30px' : '50px',
          // backgroundColor: 'red',
          height: '10px',
          width: 'calc(100% - ( (var(--timeline-indent) + 1.5) * 30px ))',

          // top: `${( lineHeight - 100 ) * -1}px`,
          // left: `${side === 'left' ? 'unset' : '87.7%'}`, // needs logic for indentation
        }}
        data-id={eventId}
      />
    </>
  )
}
