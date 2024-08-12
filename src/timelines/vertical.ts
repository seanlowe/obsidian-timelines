import { sortAndRenderNestedEvents } from '.'
import { AllNotesData, CardContainer, DivWithCalcFunc } from '../types'
import {
  buildMinimizedDateString,
  buildTimelineDate,
  createInternalLinkOnNoteCard,
  handleColor,
} from '../utils'

/**
   * Build a vertical timeline
   *
   * @param timeline - the timeline html element
   * @param timelineNotes - notes which have our timeline tags
   * @param timelineDates - dates we parsed from event data
   * @param el - the element to append the timeline to
   */
export async function buildVerticalTimeline(
  timeline: HTMLElement,
  timelineNotes: AllNotesData,
  timelineDates: string[],
  el: HTMLElement
) {
  let eventCount = 0
  // Build the timeline html element
  for ( const date of timelineDates ) {
    if ( !timelineNotes[date] ) {
      continue
    }

    const align = eventCount % 2 === 0 ? 'left' : 'right'
    const firstNote = timelineNotes[date][0]
    const firstDate = firstNote.startDate
    const {
      readable: readableStartDate,
      normalized: normalizedStartDate,
    } = buildMinimizedDateString( firstDate )
    const datedTo = [ readableStartDate + ( firstDate.era ? ` ${firstDate.era}` : '' )]

    const noteDivs: HTMLDivElement[] = []
    const containerDiv = timeline.createDiv(
      { cls: ['timeline-container', `timeline-${align}`] },
      ( div ) => {
        div.style.setProperty( '--timeline-indent', '0' )
        div.setAttribute( 'timeline-date', normalizedStartDate )
        div.setAttribute( 'collapsed', 'false' )
      }
    )

    noteDivs.push( containerDiv )

    const eventsDiv = containerDiv.createDiv({
      cls: 'timeline-event-list',
      attr: { style: 'display: block' }
    })

    containerDiv.createEl( 'h2', {
      attr: { style: `text-align: ${align};` },
      text: readableStartDate
    })

    for ( const rawNote of timelineNotes[date] ) {
      // for confirmation of types
      const note: CardContainer = rawNote
      const { endDate: end, era, startDate: start, type } = note
      const startDate: Date | null | string = buildTimelineDate( start )
      let endDate: Date | null | string     = buildTimelineDate( end )

      if ( !startDate ) {
        console.error( "Couldn't build a start date for timeline on vertical timeline" )
        continue
      }

      if ( !endDate ) {
        endDate = ''
      }

      // skip events that are of type 'box' or 'point', or if the endDate is invalid
      if ( ['box', 'point'].includes( type ) || endDate < startDate  || !noteDivs ) {
        continue
      }

      if ( !containerDiv.classList.contains( 'timeline-head' )) {
        containerDiv.classList.add( 'timeline-head' )
      }

      const {
        readable: readableEndDate,
        normalized: normalizedEndDate
      } = buildMinimizedDateString( end )
      const endDateFormatted = readableEndDate + ( era ? ` ${era}` : '' )


      const lastTimelineDate = buildTimelineDate( noteDivs[noteDivs.length - 1].getAttribute( 'timeline-date' ))
      if ( !lastTimelineDate ) {
        console.error( "There's no last timeline date" )
        continue // change to break?
      }

      if ( !datedTo[1] || endDate > lastTimelineDate ) {
        datedTo[1] = `${datedTo[0]} to ${endDateFormatted}`
      }

      const noteDiv = timeline.createDiv(
        { cls: ['timeline-container', `timeline-${align}`, 'timeline-tail'] },
        ( div ) => {
          div.style.setProperty( '--timeline-indent', '0' )
          div.setAttribute( 'timeline-date', normalizedEndDate )
        }
      )

      noteDiv.createEl( 'h2', {
        attr: { style: `text-align: ${align};` },
        text: endDateFormatted
      })
      noteDivs.push( noteDiv )

      for ( let i = noteDivs.length - 2; i >= 0; i-- ) {
        const timelineDate = buildTimelineDate( noteDivs[i].getAttribute( 'timeline-date' ))
        if ( timelineDate && ( timelineDate > endDate )) {
          noteDivs[i].before( noteDiv )
        }
      }

      /* The CSS 'timeline-timespan-length' determines both the length of the event timeline widget on the timeline,
           and the length of the vertical segment that spans between the displayed dates. If this value is not recalculated
           then these elements will not be responsive to layout changes. */
      ( noteDiv as DivWithCalcFunc ).calcLength = () => {
        const axisMin = containerDiv.getBoundingClientRect().top
        const axisMax = noteDiv.getBoundingClientRect().top
        const spanMin = containerDiv.querySelector( 'h2' )?.getBoundingClientRect().top ?? 0
        const spanMax = noteDiv.querySelector( 'h2' )?.getBoundingClientRect().top ?? 0


        containerDiv.style.setProperty( '--timeline-span-length', `${axisMax - axisMin}px` )
        noteDiv     .style.setProperty( '--timeline-span-length', `${spanMax - spanMin}px` )
      }
    }

    containerDiv.addEventListener( 'click', ( event ) => {
      event.preventDefault()
      console.log( 'clicked on an event div' )

      const collapsed = !JSON.parse( containerDiv.getAttribute( 'collapsed' ) ?? '{}' )
      containerDiv.setAttribute( 'collapsed', String( collapsed ))

      Array.from( containerDiv.getElementsByTagName( 'p' )).forEach(( p ) => {
        p.style.display = collapsed ? 'none' : 'block'
      })

      /* If this event has a duration (and thus has an end note), we hide all elements between the start and end
         note along with the end note itself */
      if ( noteDivs.length > 1 ) {
        const h2 = containerDiv.querySelector( 'h2' )
        if ( !h2 ) {
          return
        }

        h2.innerText = collapsed && datedTo[1] ? datedTo[1] : datedTo[0]
        const innerNotes = Array.from( timeline.children ).slice(
          Array.from( timeline.children ).indexOf( noteDivs[0] ) + 1,
          Array.from( timeline.children ).indexOf( noteDivs[noteDivs.length - 1] ) + 1
        )
        innerNotes.forEach(( note: DivWithCalcFunc ) => {
          note.style.display = collapsed ? 'none' : 'block'
          note.calcLength?.()
        })
      }

      /* The CSS '--timeline-indent' variable allows for scaling down the event when contained within another event,
         but in this case it also tells us how many time spanning events have had their length altered as a consequence
         of this note's mutation. */
      let nested = +containerDiv.style.getPropertyValue( '--timeline-indent' ) + noteDivs.length - 1
      let sibling = containerDiv.nextElementSibling
      while ( nested > 0 && sibling ) {
        if ( sibling.classList.contains( 'timeline-tail' )) {
          ( sibling as DivWithCalcFunc ).calcLength?.()
          nested--
        }
        sibling = sibling.nextElementSibling
      }
    })

    // doesn't apply to vertical timelines?
    /*noteContainer[0].addEventListener( 'click', ( event ) => {
      event.preventDefault()
      const currentStyle = eventContainer.style
      if ( currentStyle.getPropertyValue( 'display' ) === 'none' ) {
        currentStyle.setProperty( 'display', 'block' )
        return
      }

      // note from https://github.com/Darakah/obsidian-timelines/pull/58
      // TODO: Stop Propagation: don't close timeline-card when clicked.
      // `vis-timeline-graph2d.js` contains a method called `_updateContents` that makes the display
      // attribute disappear on click via line 7426: `element.innerHTML = '';`
      currentStyle.setProperty( 'display', 'none' )
    })*/

    for ( const eventAtDate of timelineNotes[date] ) {
      const noteCard = eventsDiv.createDiv({ cls: 'timeline-card' })
      createInternalLinkOnNoteCard( eventAtDate, noteCard )

      if ( eventAtDate.classes ) {
        noteCard.classList.add( eventAtDate.classes )
      }

      if ( eventAtDate.img ) {
        noteCard.createDiv({
          cls: 'thumb',
          attr: { style: `background-image: url(${eventAtDate.img});` }
        })
      }

      // todo : add more support for other custom classes
      if ( eventAtDate.color ) {
        handleColor( eventAtDate.color, noteCard, eventAtDate.id )
      }

      if ( eventAtDate.body ) {
        noteCard.createEl( 'p', { text: eventAtDate.body.trim() })
      }
    }

    sortAndRenderNestedEvents( noteDivs, timeline )

    eventCount++
  }

  // Replace the selected tags with the timeline html
  el.appendChild( timeline )

  // Initial length calculation must be done after appending notes to document
  el.querySelectorAll( '.timeline-tail' ).forEach(( note: DivWithCalcFunc ) => {
    note.calcLength?.()
  })

  return
}
