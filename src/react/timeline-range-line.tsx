import { useRef, useState, useLayoutEffect, FC } from 'react'
import { TimelineTailLineProps } from '../types'

export const TimelineTailLine: FC<TimelineTailLineProps> = ({ eventId, side }) => {
  const tailRef = useRef<HTMLDivElement>( null )
  const [lineHeight, setLineHeight] = useState( 0 )
  const [flatLength, setFlatLength] = useState( 0 )

  // console.log({ isHidden: tailRef.current?.hidden, tail: tailRef.current })

  useLayoutEffect(() => {
    const tailElement = tailRef.current
    const headElement = document.querySelector( `.react-timeline-head[data-id='${eventId}']` ) as HTMLDivElement | null

    if ( tailElement && headElement ) {
      const headRect = headElement.getBoundingClientRect()
      const tailRect = tailElement.getBoundingClientRect()
      const height = tailRect.top - headRect.bottom

      // set up some kind of default height for if there are no children
      setLineHeight( height > 0 ? height : 0 )
      setFlatLength( headRect.width - 85 )

      // update the timeline dot height
      const headHeight = headRect.height
      const firstEventEl = document.querySelector( "[data-is-first='true']" ) as HTMLDivElement | null
      const currentDotEl = document.querySelector(
        `.react-timeline-head-dot[data-id='${eventId}']`
      ) as HTMLDivElement | null
      if ( !currentDotEl ) {
        return
      }

      // either way, we need to set the height of the current dot
      currentDotEl.style.setProperty( 'height', `${height + headHeight}px` )
      if ( firstEventEl && firstEventEl === headElement ) {
        // if first event is the current event, set the top to 8.5px
        currentDotEl.style.setProperty( 'top', '8.5px' )
      } else if ( firstEventEl && currentDotEl ) {
        // set the top position to the 8.5 + abs(first dot's top - current dot's top)
        const topOfFirstDot = firstEventEl.getBoundingClientRect().top
        const topOfCurrentDot = currentDotEl.getBoundingClientRect().top
        const topOfAssociatedEvent =
          ( document.querySelector( `.react-timeline-head[data-id='${eventId}']` ) as HTMLDivElement | null )
            ?.getBoundingClientRect().top ?? topOfCurrentDot


        const top = 8.5 + Math.abs( topOfFirstDot - topOfAssociatedEvent )
        currentDotEl.style.setProperty( 'top', `${top}px` )
      }
    }
  }, [] )

  const flatWidth = `${flatLength + ( side === 'left' ? 5 : 0 )}px`

  return (
    <>
      <div
        ref={tailRef}
        className={`react-timeline-tail-line-${side}`}
        style={{
          height: `${lineHeight + 10}px`,
          top: `${lineHeight * -1}px`,
          left: side === 'right' ? 'calc(100% - var(--react-timeline-indent)* 30px + 5px)' : '',
          // left: side === 'right' ? 'calc(100% - var(--timeline-indent)* 30px + 5px)' : '',

          // for testing
          // backgroundColor: 'blue',
        }}
        data-id={eventId}
      />
      <div
        ref={tailRef}
        className={`react-timeline-tail-line-${side}-flat`}
        style={{
          position: 'absolute',
          top: 0,
          height: '10px',
          width: flatWidth,

          // only apply for left side, not right
          [side === 'left' ? 'right' : '']: side === 'left' ? '35px' : '',

          // for testing
          // backgroundColor: 'red',
        }}
        data-id={eventId}
      />
    </>
  )
}
