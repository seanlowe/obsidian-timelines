import type { TimelinesSettings, TimelineArgs, AllNotesData, EventItem, CardContainer } from './types'
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
  isFrontMatterCacheType,
  isHTMLElementType,
  setDefaultArgs,
  getNumEventsInFile,
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
    this.args = setDefaultArgs()
  }

  setup() {
    this.args = setDefaultArgs()
    this.files = this.appVault.getMarkdownFiles()
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

    const tagList = `tags=${match[1]}`
    logger( 'taglist', tagList )

    const div = document.createElement( 'div' )
    const rendered = document.createElement( 'div' )
    rendered.addClass( 'timeline-rendered' )
    rendered.setText( new Date().toString())

    div.appendChild( document.createComment( `TIMELINE BEGIN tags='${match[1]}'` ))
    await this.run( tagList, div )

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
  async readArguments( source: string ) {
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
      const combinedEventsAndFrontMatter = await getEventsInFile( file, this.appVault, this.metadataCache )
      const { numEvents } = await getNumEventsInFile( null, combinedEventsAndFrontMatter )

      combinedEventsAndFrontMatter.forEach(( event ) => {
        let eventData = null
        if ( isFrontMatterCacheType( event )) {
          logger( "we're handling a frontmatter event entry, w/ event: ", event )
          eventData = getEventData( event, file, this.settings.frontMatterKeys, true )

          if ( numEvents && eventData?.showOnTimeline !== true ) {
            console.warn(
              `Both HTML and Frontmatter exist in file: ${file.name}.
              The key showOnTimeline is not true, skipping frontmatter event`
            )
            return
          }
        }

        if ( isHTMLElementType( event )) {
          logger( "we're handling an HTML event entry, w/ event: ", event )
          eventData = getEventData( event, file, this.settings.frontMatterKeys, false )
        }

        logger( 'eventData', eventData )
        const {
          color: initialColor,
          endDate,
          era,
          eventImg,
          notePath,
          noteTitle,
          startDate,
          tags,
          type,
        } = eventData

        const color = initialColor === 'grey' ? 'gray' : initialColor

        if ( tags ) {
          logger( 'this note contains override tags' )
          // frontmatter tags come through as an array,
          // HTML override tags are a semi-colon separated string
          const noteTags = typeof tags === 'string' ? tags?.split( ';' ) : tags

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
            return
          }
        }

        // check if a valid date is specified
        const noteId = ( startDate?.charAt( 0 ) === '-' )
          ? -parseInt( startDate.substring( 1 ).split( '-' ).join( '' ))
          : parseInt( startDate.split( '-' ).join( '' ))

        if ( !Number.isInteger( noteId )) return

        const imgUrl = getImgUrl( this.appVault.adapter, eventImg )

        const note: CardContainer = {
          color,
          endDate,
          era,
          img: imgUrl,
          innerHTML: event.data?.innerHTML ?? '',
          path: notePath,
          startDate,
          title: noteTitle,
          type,
        }

        if ( !timelineNotes[noteId] ) {
          timelineNotes[noteId] = [note]
          timelineDates.push( noteId )
        } else {
          // if note_id already present prepend or append to it
          timelineNotes[noteId][this.settings.sortDirection ? 'unshift' : 'push']( note )

          logger( 'Repeat date: %o', timelineNotes[noteId] )
        }
      })
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

        // note from https://github.com/Darakah/obsidian-timelines/pull/58
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

        if ( eventAtDate.color ) {
          // todo : add more support for other custom classes
          noteCard.addClass( eventAtDate.color )
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

        if ( event.color ) {
          noteCard.addClass( event.color )
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
          title: String( noteCard.outerHTML ),
          start: start,
          className: event.color ?? 'gray',
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

        // click event to open the popover
        // todo : allow overflow from vis-center and re-position timeline-card
        // eventContainer.addEventListener( 'click', ( event ) => {
        //   event.preventDefault()
        //
        //   const el = eventContainer.getElementsByClassName( 'timeline-card' )[0] as HTMLElement
        //   el.style.setProperty( 'display', 'block' )
        //   el.style.setProperty( 'top', `-${el.clientHeight + 10}px` )
        // })

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
  ) {
    this.setup()

    // read arguments
    await this.readArguments( source )
    logger( 'this.args', this.args )

    logger( '# of files and tags', { fileCount: this.files.length, tags: this.args.tags })
    // Filter all markdown files to only those containing the tag list
    this.currentFileList = this.files.filter(( file ) => {
      return filterMDFiles( file, Array.from( this.args.tags ), this.metadataCache )
    })

    logger( 'this.currentFileList', this.currentFileList )

    if ( !this.currentFileList || this.currentFileList.length === 0 ) {
      logger( 'No files found for the timeline' )
      await this.showEmptyTimelineMessage( el, Array.from( this.args.tags ))
      return
    }

    // Keep only the files that have the time info
    const timelineNotes: AllNotesData = []
    let timelineDates: number[] = []

    await this.parseFiles( timelineNotes, timelineDates )

    // Sort events based on setting
    timelineDates = timelineDates.sort(( d1, d2 ) => {
      return this.settings.sortDirection ? d1 - d2 : d2 - d1
    })

    const timelineDiv = document.createElement( 'div' )
    timelineDiv.setAttribute( 'class', 'timeline' )

    switch ( this.args.type ) {
    case 'flat':
      await this.buildHorizontalTimeline( timelineDiv, timelineNotes, timelineDates, el )
      return
    default:
      await this.buildVerticalTimeline( timelineDiv, timelineNotes, timelineDates, el )
      return
    }
  }
}
