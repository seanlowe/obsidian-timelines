import type { TimelinesSettings, TimelineArgs, AllNotesData, EventItem } from './types'
import type { TFile, MetadataCache, Vault } from 'obsidian'
import { MarkdownView } from 'obsidian'

import { RENDER_TIMELINE } from './constants'
import {
  filterMDFiles,
  buildTimelineDate,
  createDateArgument,
  getEventsInFile,
  getImgUrl,
  parseTag,
  logger,
  createInternalLinkOnNoteCard,
  getEventData,
} from './utils'

// Horizontal (Vis-Timeline) specific imports
import { Timeline } from 'vis-timeline/esnext'
import { DataSet } from 'vis-data'
import 'vis-timeline/styles/vis-timeline-graph2d.css'

export class TimelineProcessor {
  appVault: Vault
  args: TimelineArgs
  currentFileList: TFile[]
  files: TFile[]
  metadataCache: MetadataCache
  settings: TimelinesSettings

  constructor( settings: TimelinesSettings, metadataCache: MetadataCache, appVault: Vault ) {
    this.appVault = appVault
    this.files = this.appVault.getMarkdownFiles()
    this.metadataCache = metadataCache
    this.settings = settings
    this.args = {
      tags: [],
      divHeight: '400',
      startDate: '-1000',
      endDate: '3000',
      minDate: '-3000',
      maxDate: '3000'
    }
  }

  createTagList( tagString: string ): string[] {
    const tagList: string[] = []
    tagString.split( ';' ).forEach(( tag: string ) => {
      return parseTag( tag, tagList )
    })
    tagList.push( this.settings.timelineTag )

    return tagList
  }

  /**
   * Insert the statically generated timeline into the current note
   *
   * @param sourceView
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

  /**
   * Read the arguments from the codeblock
   *
   * @param visTimeline - whether or not we're rendering a vis-timeline
   * @param source - the codeblock source string
   */
  async readArguments( visTimeline: boolean, source: string ) {
    if ( !visTimeline ) {
      // Parse the tags to search for the proper files
      this.args.tags = this.createTagList( source.trim())

      return
    }

    source.split( '\n' ).map(( entry ) => {
      if ( !entry ) return

      entry = entry.trim()
      const [ tag, rawValue ] = entry.split( '=' )
      const value = rawValue.trim()
      if ( tag === 'tags' ) {
        this.args[tag] = this.createTagList( value )
      } else {
        this.args[tag] = value
      }

    })
  }

  /**
   * Parse the list of files from the vault and extract the timeline data
   *
   * @param timelineNotes - notes which have our timeline tags
   * @param timelineDates - dates we parse from event data
   */
  async parseFiles(
    timelineNotes: AllNotesData,
    timelineDates: number[]
  ) {
    for ( const file of this.currentFileList ) {
      const [timelineData, frontMatter] = await getEventsInFile( file, this.appVault, this.metadataCache )

      for ( const event of timelineData as unknown as HTMLElement[] ) {
        if ( !( event instanceof HTMLElement )) continue

        const eventData = getEventData( event, file, frontMatter, this.settings.frontMatterKeys )
        const {
          startDate,
          noteTitle,
          noteClass,
          notePath,
          type,
          endDate,
          eventImg,
          era,
          tags: overrideTags = '',
        } = eventData

        if ( overrideTags ) {
          logger( 'this note contains override tags' )
          const noteTags = overrideTags?.split( ';' )

          logger( 'noteTags:', noteTags )
          logger( 'this.args.tags:', this.args.tags )

          let overrideTagsAreContainedInTagList = false
          for ( const tag of noteTags ) {
            logger( 'examining tag:', tag )
            // loop over all the override tags and if any of them are in the tag list, add it
            if ( this.args.tags.includes( tag )) {
              logger( 'Override tags overlap with tag list, adding note' )
              overrideTagsAreContainedInTagList = true
              continue
            }
          }

          // if the override tags do not overlap with the tag list, do not display this note
          if ( !overrideTagsAreContainedInTagList ) {
            logger( 'Override tags do not overlap with tag list, skipping note' )
            continue
          }
        }

        // check if a valid date is specified
        const noteId = ( startDate?.charAt( 0 ) === '-' )
          ? -parseInt( startDate.substring( 1 ).split( '-' ).join( '' ))
          : parseInt( startDate.split( '-' ).join( '' ))

        if ( !Number.isInteger( noteId )) continue

        const imgUrl = getImgUrl( this.appVault.adapter, eventImg )
          ?? getImgUrl( this.appVault.adapter, frontMatter?.img )

        const note = {
          startDate,
          title: noteTitle,
          img: imgUrl,
          innerHTML: event.innerHTML ?? frontMatter?.html ?? '',
          path: notePath,
          class: noteClass,
          type,
          endDate,
          era,
        }

        if ( !timelineNotes[noteId] ) {
          timelineNotes[noteId] = [note]
          timelineDates.push( noteId )
        } else {
          // if note_id already present prepend or append to it
          timelineNotes[noteId][this.settings.sortDirection ? 'unshift' : 'push']( note )

          logger( 'Repeat date: %o', timelineNotes[noteId] )
        }
      }
    }
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

        // TODO: Stop Propagation: don't close timeline-card when clicked.
        // `vis-timeline-graph2d.js` contains a method called `_updateContents` that makes the display
        // attribute disappear on click via line 7426: `element.innerHTML = '';`
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

        createInternalLinkOnNoteCard( eventAtDate, noteCard )
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
      logger( 'No dates found for the timeline' )
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

        createInternalLinkOnNoteCard( event, noteCard )
        noteCard.createEl( 'p', { text: event.innerHTML })

        const start = buildTimelineDate( event.startDate )
        const end = buildTimelineDate( event.endDate )

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
          title: noteCard.outerHTML as string,
          start: start,
          className: event.class ?? '',
          type: event.type,
          end: end ?? null,
          path: event.path,
        }

        // Add Event data
        items.add( eventItem )
      })
    })

    // Configuration for the Timeline
    const options = {
      start: createDateArgument( String( this.args.startDate )),
      end: createDateArgument( String( this.args.endDate )),
      min: createDateArgument( String( this.args.minDate )),
      max: createDateArgument( String( this.args.maxDate )),
      minHeight: Number( this.args.divHeight ),
      showCurrentTime: false,
      showTooltips: false,
      template: ( item: EventItem ) => {
        const eventContainer = document.createElement( this.settings.notePreviewOnHover ? 'a' : 'div' )
        if ( 'href' in eventContainer ) {
          eventContainer.addClass( 'internal-link' )
          eventContainer.href = item.path
        }

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

  async showEmptyTimelineMessage( el: HTMLElement, tagList: string[] ) {
    const timelineDiv = document.createElement( 'div' )
    timelineDiv.setAttribute( 'class', 'empty-timeline' )
    const message = `No events found for tags: [ '${tagList.join( "', '" )}' ]`

    timelineDiv.createEl( 'p', { text: message })
    el.appendChild( timelineDiv )
  }

  async run(
    source: string,
    el: HTMLElement,
    visTimeline: boolean
  ) {
    // read arguments
    await this.readArguments( visTimeline, source )

    logger( 'this.args', this.args )

    // Filter all markdown files to only those containing the tag list
    this.currentFileList = this.files.filter(( file ) => {
      return filterMDFiles( file, Array.from( this.args.tags ), this.metadataCache )
    })

    if ( !this.currentFileList || this.currentFileList.length === 0 ) {
      logger( 'No files found for the timeline' )
      await this.showEmptyTimelineMessage( el, Array.from( this.args.tags ))
      return
    }

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
