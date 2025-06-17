import { CardContainer, CardContainerWithChildren, CleanedDateResultObject, TimelineProps } from '../types'
import { FC } from 'react'
import { TimelineInner } from './timeline-inner'

const isDateInRange = ( date: CleanedDateResultObject, start: CleanedDateResultObject, end: CleanedDateResultObject ) => {
  return (
    date.normalizedDateString >= start.normalizedDateString &&
    date.normalizedDateString <= end.normalizedDateString
  )
}

/**
 * Iterate through the list of events and nest events under the child
 * tag of events which would contain them. Do this recursively until
 * there are no more child events.
 * 
 * @param {CardContainer[]} events - the list of events to nest
 * 
 * @returns {CardContainerWithChildren[]}
 */
const nestEvents = (
  events: CardContainer[]
): CardContainerWithChildren[] => {
  const sortedEvents = [...events].sort(( a, b ) => {
    return a.startDate.normalizedDateString.localeCompare( b.startDate.normalizedDateString ) 
  })

  const rootEvents: CardContainerWithChildren[] = []
  const stack: CardContainerWithChildren[] = []

  for ( const event of sortedEvents ) {
    const eventWithChildren = { ...event, children: [] }

    // Clean up the stack if event doesn't belong to top range
    while (
      stack.length > 0 &&
      !isDateInRange( event.startDate, stack[stack.length - 1].startDate, stack[stack.length - 1].endDate )
    ) {
      stack.pop()
    }

    // If there's a parent on the stack, add to its children
    if ( stack.length > 0 ) {
      stack[stack.length - 1].children.push( eventWithChildren )
    } else {
      rootEvents.push( eventWithChildren )
    }

    // If this is a range, it can have children — push to stack
    if ( event.type === 'range' ) {
      stack.push( eventWithChildren )
    }
  }

  return rootEvents
}

export const Timeline: FC<TimelineProps> = ({
  events,
  nestingLevel = 0,
  sideStart = 'left',
}) => {
  const sortedEvents = [...events].sort(( a, b ) => {
    return a.startDate.normalizedDateString.localeCompare( b.startDate.normalizedDateString )
  })

  const nestedEvents = nestEvents( sortedEvents )

  return (
    <TimelineInner events={nestedEvents} nestingLevel={nestingLevel} sideStart={sideStart} />
  )
}
