import { DataSet } from 'vis-data'

import { ArrowObject, CombinedTimelineEventData } from '../types'
import { logger } from '../utils'

export * from './horizontal'
export * from './vertical'

const createArrow = ( currentId: number, targetId: number, title?: string ): ArrowObject => {
  let arrow: ArrowObject = {
    id: targetId,
    id_item_1: currentId,
    id_item_2: targetId,
  }

  if ( title ) {
    arrow = {
      ...arrow,
      title,
    }
  }

  return arrow
}

export function makeArrowsArray( items: DataSet<CombinedTimelineEventData, 'id'> ): ArrowObject[] {
  const allItems = items.get()
  logger( 'makeArrowsArray | all items', { allItems })

  // loop over the items array and check if any have the 'pointsTo' property
  // take the value of that property, normalize it, and then find the item with that id
  // if it exists, then add an arrow to the timeline
  const arrows: ArrowObject[] = []
  for ( const item of allItems ) {
    const { _event: eventItem } = item
    if ( eventItem?.pointsTo ) {
      const pointsTo = eventItem.pointsTo

      // points to is the original start date of the event
      // this can be found on event.startDate.originalDateString
      const targetItem = allItems.find(( item ) => {
        return item._event?.startDate?.originalDateString === pointsTo
      })
      if ( targetItem ) {
        const arrowObject = createArrow( item.id, targetItem.id )
        arrows.push( arrowObject )
      }
    }
  }

  logger( 'makeArrowsArray | arrows ', { arrows })

  return arrows
}

export async function showEmptyTimelineMessage( el: HTMLElement, tagList: string[] ) {
  const timelineDiv = document.createElement( 'div' )
  timelineDiv.setAttribute( 'class', 'empty-timeline' )
  const message = `No events found for tags: [ '${tagList.join( "', '" )}' ]`

  timelineDiv.createEl( 'p', { text: message })
  el.appendChild( timelineDiv )
}

export function sortAndRenderNestedEvents( noteDivs: HTMLDivElement[], timeline: HTMLElement ) {
  /* 
   * If the previous note is of class 'timeline-tail' then there's a chance that
   * the current node belongs nested within the previous one. Here we iterate
   * backwards for as long as elements of the class 'timeline-tail' are encountered.
   *
   * Then we sort an array containing the start and ending date of the current event
   * along with the ending date of the previous event. If the index of the ending
   * date of the previous event in the new array is greater than 0 then the note(s)
   * preceding it (either the note belonging to the start date or the notes belonging
   * to both the start and end dates of the current event) are placed before their predecessor.
   */

  const timelineElements = [...timeline.children]
  let currentIndex = timelineElements.indexOf( noteDivs[0] )

  // iterate backwards through the timeline elements
  while ( currentIndex > 0 && timelineElements[currentIndex - 1]?.classList.contains( 'timeline-tail' )) {
    const previousElement = timelineElements[currentIndex - 1]
    const previousDate = previousElement.getAttribute( 'timeline-date' )

    // create an array of dates including the previous element's date and noteDivs' dates
    const dates = [previousDate, ...noteDivs.map(( note ) => {
      return note.getAttribute( 'timeline-date' ) 
    })].sort()
  
    // if the previous Date is not the first item in the sorted array, reorder elements
    const previousDateLastIndex = dates.lastIndexOf( previousDate )
    if ( previousDateLastIndex > 0 ) {
      const elementsToMove = noteDivs.slice( 0, previousDateLastIndex )
      previousElement.before( ...elementsToMove )

      // adjust indentation (for nested elements)
      const currentIndent = parseInt( noteDivs[0].style.getPropertyValue( '--timeline-indent' ), 10 ) + 1
      noteDivs.forEach(( note ) => {
        note.style.setProperty( '--timeline-indent', `${currentIndent}` )
      })
    }

    currentIndex--
  }
}
