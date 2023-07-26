import type { TimelinesSettings, TimelineArgs, AllNotesData, CardContainer, EventItem } from './types'
import type { TFile, MetadataCache, Vault, Workspace } from 'obsidian'
import { MarkdownView } from 'obsidian'

import { RENDER_TIMELINE } from './settings'
import {
  filterMDFiles,
  buildTimelineDate,
  createDateArgument,
  getEventsInFile,
  getImgUrl,
  getNumEventsInFile,
  parseTag,
} from './utils'

// Horizontal (Vis-Timeline) specific imports
import { Timeline } from 'vis-timeline/esnext'
import { DataSet } from 'vis-data'
import 'vis-timeline/styles/vis-timeline-graph2d.css'

export class TimelineProcessor {
  appVault: Vault
  args: TimelineArgs
  files: TFile[]
  metadataCache: MetadataCache
  settings: TimelinesSettings

  constructor( settings: TimelinesSettings, metadataCache: MetadataCache, appVault: Vault ) {
    this.appVault = appVault
    this.files = this.appVault.getMarkdownFiles()
    this.metadataCache = metadataCache
    this.settings = settings
    this.args = {
      tags: '',
      divHeight: '400',
      startDate: '-1000',
      endDate: '3000',
      minDate: '-3000',
      maxDate: '3000'
    }
  }

  /**
   * Insert the statically generated timeline into the current note
   *
   * @param sourceView
   * @param vaultFiles
   * @param fileCache
   * @param appVault
   */
  async insertTimelineIntoCurrentNote(
    sourceView: MarkdownView,
  ) {
    const editor = sourceView.editor

    if ( !editor ) return

    const source = editor.getValue()
    const match = RENDER_TIMELINE.exec( source )

    if ( !match || match.length === 1 ) return

    const tagList = match[1]

    const div = document.createElement( 'div' )
    const rendered = document.createElement( 'div' )
    rendered.addClass( 'timeline-rendered' )
    rendered.setText( new Date().toString())

    div.appendChild( document.createComment( `TIMELINE BEGIN tags='${match[1]}'` ))
    await this.run( tagList, div, false )

    div.appendChild( rendered )
    div.appendChild( document.createComment( 'TIMELINE END' ))

    editor.setValue( source.replace( match[0], div.innerHTML ))
  }

  async createTimelineEventInCurrentNote(
    sourceView: MarkdownView
  ) {
    const editor = sourceView.editor

    if ( !editor ) return

    // create a div element with the correct data attributes
    const newEventElement = document.createElement( this.settings.eventElement )
    newEventElement.setAttribute( 'class', 'ob-timelines' )
    newEventElement.setAttribute( 'data-title', '' )
    newEventElement.setAttribute( 'data-description', '' )
    newEventElement.setAttribute( 'data-class', '' )
    newEventElement.setAttribute( 'data-type', '' )
    newEventElement.setAttribute( 'data-start-date', '' )
    newEventElement.setAttribute( 'data-end-date', '' )
    newEventElement.setAttribute( 'data-era', '' )
    newEventElement.setAttribute( 'data-path', '' )
    newEventElement.setText( 'New Event' )

    // add a newline and a tab after each data attribute
    let newElHtml = newEventElement.outerHTML.replace( /" /g, '"\n\t' )

    const regex = new RegExp( `>(\\s*.*?)\\s*</(${this.settings.eventElement})>`, 'g' )

    // put the new element's content text on it's own line and indent it, then add a newline
    newElHtml = newElHtml.replace( regex, `>\n\t$1\n</${this.settings.eventElement}>\n` )

    // insert the new element at the cursor position
    editor.replaceRange( newElHtml, editor.getCursor())
  }

  async getStatusBarText( workspace: Workspace ): Promise<string | null> {
    const file = workspace.getActiveViewOfType( MarkdownView ).file

    if ( !file ) {
      return null
    }

    const numEvents = await getNumEventsInFile( file, this.appVault )

    return `Timeline: ${numEvents} ${numEvents === 1 ? 'event' : 'events'}`
  }

  /**
   * Read the arguments from the codeblock
   *
   * @param visTimeline - whether or not we're rendering a vis-timeline
   * @param source - the codeblock source string
   */
  async readArguments( visTimeline: boolean, source: string ) {
    if ( !visTimeline ) {
      // Parse the tags to search for the proper files
      const lines = source.trim()
      this.args.tags = lines

      return
    }

    source.split( '\n' ).map(( entry ) => {
      if ( !entry ) return

      entry = entry.trim()
      const [ tag, value ] = entry.split( '=' )
      this.args[tag] = value.trim()
    })
  }

  /**
   * Parse the list of files from the vault and extract the timeline data
   *
   * @param fileList
   * @param appVault
   * @param timelineNotes - notes which have our timeline tags
   * @param timelineDates - dates we parse from event data
   */
  async parseFiles(
    timelineNotes: AllNotesData,
    timelineDates: number[]
  ) {
    for ( const file of this.files ) {
      const timelineData = await getEventsInFile( file, this.appVault )

      for ( const event of timelineData as unknown as HTMLElement[] ) {
        if ( !( event instanceof HTMLElement )) continue

        const {
          dataset: {
            startDate,
            // if no title is specified, use the note's name
            title: noteTitle = file.name.replace( '.md', '' ),
            class: noteClass = '',
            type = 'box',
            endDate = null,
            img: eventImg = null,
            path,
            era,
          }
        } = event
        const notePath = path ?? '/' + file.path

        // check if a valid date is specified
        const noteId = ( startDate[0] === '-' )
          ? -parseInt( startDate.substring( 1 ).split( '-' ).join( '' ))
          : parseInt( startDate.split( '-' ).join( '' ))

        if ( !Number.isInteger( noteId )) continue

        const defaultNoteData = {
          startDate,
          title: noteTitle,
          img: getImgUrl( this.appVault.adapter, eventImg ),
          innerHTML: event.innerHTML,
          path: notePath,
          class: noteClass,
          type,
          endDate,
          era,
        }

        if ( !timelineNotes[noteId] ) {
          timelineNotes[noteId] = []
          timelineNotes[noteId][0] = defaultNoteData

          timelineDates.push( noteId )
        } else {
          const note = defaultNoteData

          // if note_id already present prepend or append to it
          timelineNotes[noteId][this.settings.sortDirection ? 'unshift' : 'push']( note )

          console.log( 'Repeat date: %o', timelineNotes[noteId] )
        }
      }
    }
  }

  /**
   * Create an internal link on the a timeline's event "note" card
   *
   * @param event
   * @param noteCard
   */
  createInternalLinkOnNoteCard( event: CardContainer, noteCard: HTMLElement ) {
    noteCard
      .createEl( 'article' )
      .createEl( 'h3' )
      .createEl( 'a', {
        cls: 'internal-link',
        attr: { href: `${event.path}` },
        text: event.title
      })
  }

  /**
   * Build a vertical timeline
   *
   * @param timelineDiv - the timeline html element
   * @param timelineNotes - notes which have our timeline tags
   * @param timelineDates - dates we parsed from event data
   * @param el - the element to append the timeline to
   */
  async buildVerticalTimeline(
    timelineDiv:HTMLElement,
    timelineNotes: AllNotesData,
    timelineDates: number[],
    el: HTMLElement
  ) {
    let eventCount = 0
    // Build the timeline html element
    for ( const date of timelineDates ) {
      const noteContainer = timelineDiv.createDiv({ cls: 'timeline-container' })
      const eventContainer = noteContainer.createDiv({
        cls: 'timeline-event-list',
        attr: { 'style': 'display: block' }
      })
      let dateText = timelineNotes[date][0].startDate.replace( /-0*$/g, '' ).replace( /-0*$/g, '' ).replace( /-0*$/g, '' )
      if ( timelineNotes[date][0].era ) {
        dateText += ` ${timelineNotes[date][0].era}`
      }
      const noteHeader = noteContainer.createEl( 'h2', { text: dateText })

      noteContainer.addEventListener( 'click', ( event ) => {
        event.preventDefault()
        const currentStyle = eventContainer.style
        if ( currentStyle.getPropertyValue( 'display' ) === 'none' ) {
          currentStyle.setProperty( 'display', 'block' )
          return
        }

        currentStyle.setProperty( 'display', 'none' )
      })

      const alignment = eventCount % 2 === 0 ? 'left' : 'right'
      noteContainer.addClass( `timeline-${alignment}` )
      noteHeader.setAttribute( 'style', `text-align: ${alignment};` )

      if ( !timelineNotes[date] ) continue

      for ( const eventAtDate of timelineNotes[date] ) {
        const noteCard = eventContainer.createDiv({ cls: 'timeline-card' })
        // add an image only if available
        if ( eventAtDate.img ) {
          noteCard.createDiv({
            cls: 'thumb',
            attr: { style: `background-image: url(${eventAtDate.img});` }
          })
        }

        if ( eventAtDate.class ) {
          noteCard.addClass( eventAtDate.class )
        }

        this.createInternalLinkOnNoteCard( eventAtDate, noteCard )
        noteCard.createEl( 'p', { text: eventAtDate.innerHTML.trim() })
      }
      eventCount++
    }

    // Replace the selected tags with the timeline html
    el.appendChild( timelineDiv )
    return
  }

  /**
   * Build a horizontal timeline
   *
   * @param timelineDiv - the timeline html element
   * @param timelineNotes - notes which have our timeline tags
   * @param timelineDates - dates we parsed from event data
   * @param el - the element to append the timeline to
   */
  async buildHorizontalTimeline(
    timelineDiv: HTMLElement,
    timelineNotes: AllNotesData,
    timelineDates: number[],
    el: HTMLElement
  ) {
    // Create a DataSet
    const items = new DataSet( [] )

    if ( !timelineDates ) {
      console.log( 'No dates found for the timeline' )
      return
    }

    timelineDates.forEach(( date ) => {
      // add all events at this date
      Object.values( timelineNotes[date] ).forEach(( event ) => {
        const noteCard = document.createElement( 'div' )
        noteCard.className = 'timeline-card'

        // add an image only if available
        if ( event.img ) {
          noteCard.createDiv({
            cls: 'thumb',
            attr: { style: `background-image: url(${event.img});` }
          })
        }

        if ( event.class ) {
          noteCard.addClass( event.class )
        }

        this.createInternalLinkOnNoteCard( event, noteCard )
        noteCard.createEl( 'p', { text: event.innerHTML })

        const start = buildTimelineDate( event.startDate )
        const end = buildTimelineDate( event.endDate )

        if (
          start.toString() === 'Invalid Date' ||
          ( [ 'range', 'background' ].includes( event.type ) && end.toString() === 'Invalid Date' )
        ) {
          console.warn( 'Invalid start or end date', { start, end })

          return
        }

        // Add Event data
        items.add({
          id: items.length + 1,
          content: event.title ?? '',
          title: noteCard.outerHTML as string,
          start: start,
          className: event.class ?? '',
          type: event.type,
          end: end ?? null
        })
      })
    })

    // Configuration for the Timeline
    const options = {
      start: createDateArgument( this.args.startDate ),
      end: createDateArgument( this.args.endDate ),
      min: createDateArgument( this.args.minDate ),
      max: createDateArgument( this.args.maxDate ),
      minHeight: Number( this.args.divHeight ),
      showCurrentTime: false,
      showTooltips: false,
      template: function ( item: EventItem ) {
        const eventContainer = document.createElement( 'div' )
        eventContainer.setText( item.content )

        const eventCard = eventContainer.createDiv()
        eventCard.outerHTML = item.title

        eventContainer.addEventListener( 'click', ( event ) => {
          event.preventDefault()

          const el = eventContainer.getElementsByClassName( 'timeline-card' )[0] as HTMLElement
          el.style.setProperty( 'display', 'block' )
          el.style.setProperty( 'top', `-${el.clientHeight + 10}px` )
        })

        return eventContainer
      }
    }

    // Create a Timeline
    timelineDiv.setAttribute( 'class', 'timeline-vis' )
    new Timeline( timelineDiv, items, options )

    // Replace the selected tags with the timeline html
    el.appendChild( timelineDiv )
  }

  async run(
    source: string,
    el: HTMLElement,
    visTimeline: boolean
  ) {
    // read arguments
    await this.readArguments( visTimeline, source )

    const tagList: string[] = []
    this.args.tags.split( ';' ).forEach(( tag: string ) => {
      return parseTag( tag, tagList )
    })
    tagList.push( this.settings.timelineTag )

    // Filter all markdown files to only those containing the tag list
    const fileList = this.files.filter(( file ) => {
      return filterMDFiles( file, tagList, this.metadataCache )
    })

    if ( !fileList ) return

    // Keep only the files that have the time info
    const timelineNotes = [] as AllNotesData
    let timelineDates = [] as number[]

    await this.parseFiles( timelineNotes, timelineDates )

    // Sort events based on setting
    timelineDates = timelineDates.sort(( d1, d2 ) => {
      return this.settings.sortDirection ? d1 - d2 : d2 - d1
    })

    const timelineDiv = document.createElement( 'div' )
    timelineDiv.setAttribute( 'class', 'timeline' )

    if ( !visTimeline ) {
      await this.buildVerticalTimeline( timelineDiv, timelineNotes, timelineDates, el )
      return
    }

    await this.buildHorizontalTimeline( timelineDiv, timelineNotes, timelineDates, el )
    return
  }
}
