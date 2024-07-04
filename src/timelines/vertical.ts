import { AllNotesData, DivWithCalcFunc } from '../types'
import { buildTimelineDate, createInternalLinkOnNoteCard, handleColor } from '../utils'

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
    const align   = eventCount % 2 === 0 ? 'left' : 'right'
    const datedTo = [ timelineNotes[date][0].startDate.replace( /-0*$/g, '' )
                  + ( timelineNotes[date][0].era ? ` ${timelineNotes[date][0].era}` : '' )
    ]

    const noteDivs = [
      timeline.createDiv(
        { cls: ['timeline-container', `timeline-${align}`] }, 
        ( div ) => {
          div.style.setProperty( '--timeline-indent', '0' )
          div.setAttribute( 'timeline-date', timelineNotes[date][0].startDate )
          div.setAttribute( 'collapsed', 'false' )
        }
      )
    ]

    const eventsDiv = noteDivs[0].createDiv({
      cls: 'timeline-event-list',
      attr: { 'style': 'display: block' }
    })

    const noteHdrs = [noteDivs[0].createEl( 'h2', {
      attr: { 'style' : `text-align: ${align};` },
      text: datedTo[0]
    })]

    for ( const note of timelineNotes[date] ) {
      const { endDate: endDateString, era } = note
      const startDate = buildTimelineDate( note.startDate )
      const endDate = buildTimelineDate( endDateString )

      // skip events that are of type 'box' or 'point', or if the endDate is invalid
      if ( ['box', 'point'].includes( note.type ) || endDate < startDate ) {
        continue
      }

      if ( !noteDivs[0].classList.contains( 'timeline-head' )) {
        noteDivs[0].classList.add( 'timeline-head' ) 
      }

      const dated = endDateString + ( era ?? '' )
      const lastTimelineDate = buildTimelineDate( noteDivs.last().getAttribute( 'timeline-date' ))
      if ( !datedTo[1] || endDate > lastTimelineDate ) {
        datedTo[1] = datedTo[0] + ' to ' + dated
      }

      const noteDiv = timeline.createDiv(
        { cls: ['timeline-container', `timeline-${align}`, 'timeline-tail'] }, 
        ( div ) => {
          div.style.setProperty( '--timeline-indent', '0' )
          div.setAttribute( 'timeline-date', endDateString )
        }
      )
      
      const noteHdr = noteDiv.createEl( 'h2', {
        attr: { 'style' : `text-align: ${align};` },
        text: dated
      })

      noteHdrs.push( noteHdr )
      noteDivs.push( noteDiv )
      for ( const n of noteDivs ) {
        const timelineDate = buildTimelineDate( n.getAttribute( 'timeline-date' ))

        if ( timelineDate > endDate ) {
          n.before( noteDiv )
        }
      }

      /* The CSS 'timeline-timespan-length' determines both the length of the event timeline widget on the timeline,
           and the length of the vertical segment that spans between the displayed dates. If this value is not recalculated
           then these elements will not be responsive to layout changes. */
      ( noteDivs.last() as DivWithCalcFunc ).calcLength = () => {
        const axisMin = noteDivs[0].getBoundingClientRect().top
        const axisMax = noteDiv    .getBoundingClientRect().top
        const spanMin = noteHdrs[0].getBoundingClientRect().top
        const spanMax = noteHdr    .getBoundingClientRect().top

        noteDivs[0].style.setProperty( '--timeline-span-length', `${axisMax - axisMin}px` )
        noteDiv    .style.setProperty( '--timeline-span-length', `${spanMax - spanMin}px` )
      }
    }

    noteDivs[0].addEventListener( 'click', ( event ) => {
      event.preventDefault()

      const collapsed = !JSON.parse( noteDivs[0].getAttribute( 'collapsed' ))
      noteDivs[0].setAttribute( 'collapsed', String( collapsed ))
      for ( const p of noteDivs[0].getElementsByTagName( 'p' )) {
        p.setCssProps({ 'display': collapsed ? 'none' : 'block' })
      }
      /* If this event has a duration (and thus has an end note), we hide all elements between the start and end
         note along with the end note itself */
      if ( noteDivs.length > 0 ) {
        noteHdrs[0].setText( collapsed && datedTo[1] ? datedTo[1] : datedTo[0] )
        const notes = [...timeline.children]
        const inner = notes.slice( notes.indexOf( noteDivs.first()) + 1, notes.indexOf( noteDivs.last()) + 1 )
        inner.forEach(( note: DivWithCalcFunc ) => {
          note.style.display = collapsed ? 'none' : 'block'
          note.calcLength?.()
        })
      }

      /* The CSS '--timeline-indent' variable allows for scaling down the event when contained within another event,
         but in this case it also tells us how many time spanning events have had their length altered as a consequence
         of this note's mutation. */
      let nested = +noteDivs[0].style.getPropertyValue( '--timeline-indent' ) + noteDivs.length - 1
      for ( let f = 'nextElementSibling', sibling = noteDivs[0][f]; nested > 0; sibling = sibling[f] ) {
        if ( sibling.classList.contains( 'timeline-tail' )) {
          sibling.calcLength?.()
          nested--
        }
      }
    })


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

    if ( !timelineNotes[date] ) {
      continue 
    }

    for ( const eventAtDate of timelineNotes[date] ) {
      const noteCard = eventsDiv.createDiv({ cls: 'timeline-card' })
      // add an image only if available
      if ( eventAtDate.img ) {
        noteCard.createDiv({
          cls: 'thumb',
          attr: { style: `background-image: url(${eventAtDate.img});` }
        })
      }

      if ( eventAtDate.color ) {
        // todo : add more support for other custom classes
        handleColor( eventAtDate.color, noteCard, eventAtDate.id )
      }

      createInternalLinkOnNoteCard( eventAtDate, noteCard )
      eventAtDate.body && noteCard.createEl( 'p', { text: eventAtDate.body.trim() })
    }

    /* If the previous note is of class 'timeline-tail' then there's a chance that the current node belongs nested within
       the previous one. Here we iterate backwards for as long as elements of the class 'timeline-tail' are encountered.

       Then we sort an array containing the start and ending date of the current event along with the ending date of the
       previous event. If the index of the ending date of the previous event in the new array is greater than 0 then the
       note(s) preceding it (either the note belonging to the start date or the notes belonging to both the start and end
       dates of the current event) are placed before their predecessor. */
    for ( let s = [...timeline.children],i = s.indexOf( noteDivs[0] ); s[i-1]?.classList.contains( 'timeline-tail' ); i-- ) {
      const t = s[i-1].getAttribute( 'timeline-date' )
      const times = [
        t,
        ...noteDivs.map(( n ) => {
          return n.getAttribute( 'timeline-date' )
        })
      ]

      const lastTIndex = times.sort().lastIndexOf( t )
      for ( let j = lastTIndex; j > 0; s[i-1].before( ...noteDivs.slice( 0, j )), j = 0 ) {
        const indent = +noteDivs[0].style.getPropertyValue( '--timeline-indent' ) + 1
        noteDivs.forEach(( n ) => {
          n.style.setProperty( '--timeline-indent', `${ indent }` )
        })
      }
    }

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
