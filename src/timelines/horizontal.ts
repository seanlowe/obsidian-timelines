import { AllNotesData, CardContainer, EventItem } from '../types'
import { buildTimelineDate, createInternalLinkOnNoteCard, handleColor, logger } from '../utils'

// Horizontal (Vis-Timeline) specific imports
import { Timeline } from 'vis-timeline/esnext'
import { DataSet } from 'vis-data'

/**
   * Build a horizontal timeline
   *
   * @param timelineDiv - the timeline html element
   * @param timelineNotes - notes which have our timeline tags
   * @param timelineDates - dates we parsed from event data
   * @param el - the element to append the timeline to
   */
export async function buildHorizontalTimeline(
  timelineDiv: HTMLElement,
  timelineNotes: AllNotesData,
  timelineDates: string[],
  el: HTMLElement
) {
  // Create a DataSet
  const items = new DataSet( [] )

  if ( !timelineDates ) {
    logger( 'No dates found for the timeline' )
    return
  }

  timelineDates.forEach(( date ) => {
    // add all events at this date
    Object.values( timelineNotes[date] ).forEach(( event: CardContainer ) => {
      const noteCard = document.createElement( 'div' )
      noteCard.className = 'timeline-card'

      // add an image only if available
      if ( event.img ) {
        noteCard.createDiv({
          cls: 'thumb',
          attr: { style: `background-image: url(${event.img});` }
        })
      }

      let colorIsClass = false
      if ( event.color ) {
        colorIsClass = handleColor( event.color, noteCard, event.id )
      }

      createInternalLinkOnNoteCard( event, noteCard )
      noteCard.createEl( 'p', { text: event.body })

      const start = buildTimelineDate( event.startDate, parseInt( this.settings.maxDigits ))
      const end = buildTimelineDate( event.endDate, parseInt( this.settings.maxDigits ))

      if (
        start.toString() === 'Invalid Date' ||
          ( [ 'range', 'background' ].includes( event.type ) && end.toString() === 'Invalid Date' )
      ) {
        console.warn( 'Invalid start or end date - check for Month/Day values that are 0', { start, end, event })

        return
      }

      const eventItem: EventItem = {
        id: items.length + 1,
        content: event.title ?? '',
        start: start,
        className: colorIsClass ? event.color ?? 'gray' : `nid-${event.id}`,
        type: event.type,
        end: end ?? null,
        path: event.path,
        _event: event,
      }

      // Add Event data
      items.add( eventItem )
    })
  })

  // Configuration for the Timeline
  const options = {
    start: this.args.startDate,
    end: this.args.endDate,
    min: this.args.minDate,
    max: this.args.maxDate,
    minHeight: this.args.divHeight,
    showCurrentTime: false,
    showTooltips: false,
    zoomMin: this.args.zoomInLimit,
    zoomMax: this.args.zoomOutLimit,
    template: ( item: EventItem ) => {
      const eventContainer = document.createElement( this.settings.notePreviewOnHover ? 'a' : 'div' )
      if ( 'href' in eventContainer ) {
        eventContainer.addClass( 'internal-link' )
        eventContainer.href = item.path
      }

      eventContainer.setText( item.content )

      return eventContainer
    }
  }

  timelineDiv.setAttribute( 'class', 'timeline-vis' )
  const timeline = new Timeline( timelineDiv, items, options )

  // these are probably non-performant but it works so ¯\_(ツ)_/¯
  // dynamically add and remove a "special" class on hover
  // cannot use standard :hover styling due to the structure
  // of the timeline being so broken up across elements. This
  // ensures that all elements related to an event are highlighted.
  timeline.on( 'itemover', ( props ) => {
    const event = items.get( props.item ) as unknown as EventItem
    const newClass = event.className + ' runtime-hover'
    document.documentElement.style.setProperty( '--hoverHighlightColor', event._event?.color ?? 'white' )
    items.updateOnly( [{ ...event, className: newClass }] )

    return () => {
      timeline.off( 'itemover' )
    }
  })

  timeline.on( 'itemout', ( props ) => {
    const event = items.get( props.item ) as unknown as EventItem
    const newClass = event.className.split( ' runtime-hover' )[0]
    items.updateOnly( [{ ...event, className: newClass }] )

    return () => {
      timeline.off( 'itemout' )
    }
  })

  // Replace the selected tags with the timeline html
  el.appendChild( timelineDiv )
}
