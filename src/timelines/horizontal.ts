import Arrow from 'timeline-arrows'
import { DataInterface, DataSet } from 'vis-data'
import { DataGroup, Timeline, TimelineGroupEditableOption, TimelineOptionsGroupHeightModeType } from 'vis-timeline/esnext'

import { makeArrowsArray } from '.'
import {
  CardContainer,
  CombinedTimelineEventData,
  EventItem,
  HorizontalTimelineInput,
  MinimalGroup
} from '../types'
import {
  buildCombinedTimelineDataObject,
  buildTimelineDate,
  createInternalLinkOnNoteCard,
  handleColor,
  logger,
} from '../utils'

/**
   * Build a horizontal timeline
   *
   * @param timelineDiv - the timeline html element
   * @param timelineNotes - notes which have our timeline tags
   * @param timelineDates - dates we parsed from event data
   * @param el - the element to append the timeline to
   */
export async function buildHorizontalTimeline(
  {
    args,
    div: timelineDiv,
    dates: timelineDates,
    el,
    notes: timelineNotes,
    settings,
  }: HorizontalTimelineInput
) {
  // Create a DataSet
  const items = new DataSet<CombinedTimelineEventData>( [] )

  if ( !timelineDates ) {
    logger( 'buildHorizontalTimeline | No dates found for the timeline' )
    return
  }

  const groups: MinimalGroup[] = [
    {
      // default group
      content: '',
      id: 1,
      value: 1,
    },
  ]

  timelineDates.forEach(( date ) => {
    // add all events at this date
    Object.values( timelineNotes[date] ).forEach(( event: CardContainer ) => {
      const noteCard = document.createElement( 'div' )
      noteCard.className = 'timeline-card ' + event.classes
      let colorIsClass = false
      let end: Date | null = null
      let type: string = event.type
      let typeOverride = false

      // add an image only if available
      if ( event.img ) {
        noteCard.createDiv({
          cls: 'thumb',
          attr: { style: `background-image: url(${event.img});` }
        })
      }

      if ( event.color ) {
        colorIsClass = handleColor( event.color, noteCard, event.id )
      }

      createInternalLinkOnNoteCard( event, noteCard )
      noteCard.createEl( 'p', { text: event.body })
      
      const start = buildTimelineDate( event.startDate.normalizedDateString, parseInt( settings.maxDigits ))
      if ( !start ) {
        console.warn(
          "buildHorizontalTimeline | Couldn't build the starting timeline date for the horizontal timeline",
          'buildHorizontalTimeline | Invalid start date - check for Month/Day values that are 0',
          { start, event }
        )
        return
      }

      if ( event.endDate.normalizedDateString && event.endDate.normalizedDateString !== '' ) {
        logger( 'buildHorizontalTimeline | there is an endDate for event:', event )
        end = buildTimelineDate( event.endDate.normalizedDateString, parseInt( settings.maxDigits ))
      } else {
        // if there is no end date, we cannot render as anything other than 'point'
        logger( 'buildHorizontalTimeline | NO endDate for event:', event )
        type = 'point'
        typeOverride = true
      }

      if ( end?.toString() === 'Invalid Date' ) {
        console.warn(
          'buildHorizontalTimeline | Invalid end date - check for Month/Day values that are 0',
          { end, event }
        )

        return
      }

      const initialClassName = colorIsClass ? event.color ?? 'gray' : `nid-${event.id}`
      const defaultGroup = groups[0]
      let foundGroup = groups.find(( group ) => {
        return group.content === event.group 
      })
      if ( !foundGroup && event.group ) {
        const newGroup: MinimalGroup = {
          content: event.group,
          id: groups.length + 1,
          value: groups.length + 1,
        }
        groups.push( newGroup )
        foundGroup = newGroup
      }

      const eventItem: EventItem = {
        id:        items.length + 1,
        content:   event.title ?? '',
        className: initialClassName + ' ' + event.classes,
        end:       end ?? undefined,
        group:     foundGroup?.id ?? defaultGroup.id,
        path:      event.path,
        start:     start,
        type:      typeOverride ? type : event.type,
        _event:    event,
      }

      const timelineItem: CombinedTimelineEventData = buildCombinedTimelineDataObject( eventItem )

      // Add Event data
      items.add( timelineItem )
    })
  })

  // Configuration for the Timeline
  const options = {
    end: args.endDate,
    min: args.minDate,
    minHeight: args.divHeight,
    max: args.maxDate,
    start: args.startDate,
    zoomMax: args.zoomOutLimit,
    zoomMin: args.zoomInLimit,

    // non-argument options
    showCurrentTime: false,
    showTooltips: false,
    groupEditable: {
      order: true,
    } as TimelineGroupEditableOption,
    groupHeightMode: 'fitItems' as TimelineOptionsGroupHeightModeType,
    groupOrder: ( a: MinimalGroup, b: MinimalGroup ): number => {
      return a.value - b.value
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    groupOrderSwap: ( a: MinimalGroup, b: MinimalGroup, groups: DataInterface<DataGroup, 'id'> ): void => {
      const temp = a.value
      a.value = b.value
      b.value = temp
    },
    template: ( item: EventItem ) => {
      const eventContainer = document.createElement( settings.notePreviewOnHover ? 'a' : 'div' )
      if ( 'href' in eventContainer ) {
        eventContainer.addClass( 'internal-link' )
        eventContainer.href = item.path
      }

      eventContainer.setText( item.content )

      return eventContainer
    }
  }

  timelineDiv.setAttribute( 'class', 'timeline-vis' )
  const timeline = new Timeline( timelineDiv, items, groups, options )

  const arrows = makeArrowsArray( items )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const myArrows = new Arrow( timeline, arrows )

  // these are probably non-performant but it works so ¯\_(ツ)_/¯
  // dynamically add and remove a "special" class on hover
  // cannot use standard :hover styling due to the structure
  // of the timeline being so broken up across elements. This
  // ensures that all elements related to an event are highlighted.
  timeline.on( 'itemover', ( props ) => {
    const event = items.get( props.item ) as unknown as EventItem
    const newClass = event.className + ' runtime-hover'
    document.documentElement.style.setProperty( '--hoverHighlightColor', event._event?.color ?? 'white' )
    const timelineItem = buildCombinedTimelineDataObject( event, { className: newClass })
    items.updateOnly( [timelineItem] )

    return () => {
      timeline.off( 'itemover' )
    }
  })

  timeline.on( 'itemout', ( props ) => {
    const event = items.get( props.item ) as unknown as EventItem
    const newClass = event.className.split( ' runtime-hover' )[0]
    const timelineItem = buildCombinedTimelineDataObject( event, { className: newClass })
    items.updateOnly( [timelineItem] )

    return () => {
      timeline.off( 'itemout' )
    }
  })

  // Replace the selected tags with the timeline html
  el.appendChild( timelineDiv )
}
