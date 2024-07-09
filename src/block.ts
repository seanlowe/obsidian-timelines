import type { TFile, MetadataCache, Vault } from 'obsidian'

import { buildHorizontalTimeline, buildVerticalTimeline, showEmptyTimelineMessage } from './timelines'
import {
  AllNotesData,
  CardContainer,
  EventDataObject,
  HorizontalTimelineInput,
  InternalTimelineArgs,
  TimelinesSettings
} from './types'
import {
  buildTimelineDate,
  createTagList,
  convertEntryToMilliseconds,
  filterMDFiles,
  getEventData,
  getEventsInFile,
  getImgUrl,
  getNumEventsInFile,
  isHTMLElementType,
  logger,
  normalizeDate,
  setDefaultArgs,
  sortTimelineDates,
  cleanDate,
} from './utils'

export class TimelineBlockProcessor {
  appVault: Vault
  args: InternalTimelineArgs
  currentFileList: TFile[]
  files: TFile[]
  metadataCache: MetadataCache
  settings: TimelinesSettings

  constructor( settings: TimelinesSettings, metadataCache: MetadataCache, appVault: Vault ) {
    this.appVault = appVault
    this.metadataCache = metadataCache
    this.settings = settings
    this.setup()
  }

  setup() {
    this.args = setDefaultArgs()
    this.files = this.appVault.getMarkdownFiles()
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

      if ( tag.includes( 'Date' )) {
        // startDate, endDate, minDate, maxDate
        const result = buildTimelineDate( value, parseInt( this.settings.maxDigits ))
        this.args[tag] = result
        return
      }

      switch ( tag ) {
      case 'tags':
        this.args[tag] = createTagList( value, this.settings.timelineTag )
        break
      case 'zoomInLimit':
        this.args[tag] = convertEntryToMilliseconds( value )
        break
      case 'zoomOutLimit':
      case 'divHeight':
        this.args[tag] = parseInt( value )
        break
      default:
        this.args[tag] = value
        break
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
    timelineDates: string[]
  ): Promise<void> {
    for ( const file of this.currentFileList ) {
      const combinedEventsAndFrontMatter = await getEventsInFile( file, this.appVault, this.metadataCache )
      const { numEvents } = await getNumEventsInFile( null, combinedEventsAndFrontMatter )

      combinedEventsAndFrontMatter.forEach(( event ) => {
        let eventData: EventDataObject | null = null

        if ( !isHTMLElementType( event ) && Object.keys( event ).length < 3 ) {
          console.warn(
            'parseFiles | event has fewer than 3 keys. Required keys for Frontmatter events are:',
            [ 'startDate', 'endDate', 'showOnTimeline' ]
          )      

          return
        }

        eventData = getEventData( event, file, this.settings.frontMatterKeys )
        if ( !eventData ) {
          console.warn( `malformed eventData, skipping event in file: ${file.name}`, { event, eventData })
          return
        }

        logger( 'parseFiles | eventData', eventData )

        if ( numEvents && !isHTMLElementType( event ) && eventData?.showOnTimeline !== true ) {
          console.warn(
            `Both HTML and Frontmatter exist in file: ${file.name}.
            The key showOnTimeline is not true, skipping frontmatter event`
          )
          return
        }

        const {
          classes,
          color: initialColor,
          endDate,
          era,
          eventImg,
          noteBody,
          notePath,
          noteTitle,
          startDate,
          tags,
          type,
        } = eventData

        const color = initialColor === 'grey' ? 'gray' : initialColor

        if ( tags ) {
          logger( 'parseFiles | this note contains override tags' )
          // frontmatter tags come through as an array,
          // HTML override tags are a semi-colon separated string
          const noteTags = typeof tags === 'string' ? tags?.split( ';' ) : tags

          logger( 'parseFiles | noteTags:', noteTags )
          logger( 'parseFiles | this.args.tags:', this.args.tags )

          let overrideTagsAreContainedInTagList = false
          for ( const rawTag of noteTags ) {
            const tag = rawTag.trim().replace( '#', '' )
            logger( 'parseFiles | examining tag:', tag )
            // loop over all the override tags and if any of them are in the tag list, add it
            if ( this.args.tags.includes( tag )) {
              logger( 'parseFiles | Override tags overlap with tag list, adding note' )
              overrideTagsAreContainedInTagList = true
              continue
            }
          }

          // if the override tags do not overlap with the tag list, do not display this note
          if ( !overrideTagsAreContainedInTagList ) {
            logger( 'parseFiles | Override tags do not overlap with tag list, skipping note' )
            return
          }
        }

        // check if a valid date is specified
        const noteId = normalizeDate( startDate, parseInt( this.settings.maxDigits ))
        logger( 'parseFiles | noteId', noteId )

        const imgUrl = getImgUrl( this.appVault, eventImg )

        const { cleanedDateString: cleanedStartDate } = cleanDate( normalizeDate( startDate ))
        const { cleanedDateString:  cleanedEndDate  } = cleanDate( normalizeDate(  endDate  ))

        const note: CardContainer = {
          id: noteId,
          classes,
          color,
          endDate: cleanedEndDate,
          era,
          img: imgUrl,
          body: noteBody,
          path: notePath,
          startDate: cleanedStartDate,
          title: noteTitle,
          type,
        }

        if ( !timelineNotes[noteId] ) {
          timelineNotes[noteId] = [note]
          timelineDates.push( noteId )
        } else {
          // if note_id already present prepend or append to it
          timelineNotes[noteId][this.settings.sortDirection ? 'unshift' : 'push']( note )

          logger( 'parseFiles | Repeat date: %o', timelineNotes[noteId] )
        }
      })
    }
  }

  async run(
    source: string,
    el: HTMLElement,
  ): Promise<void> {
    this.setup()

    // read arguments
    await this.readArguments( source )
    logger( 'run | this.args', this.args )

    logger( 'run | # of files and tags', { fileCount: this.files.length, tags: this.args.tags })
    // Filter all markdown files to only those containing the tag list
    this.currentFileList = this.files.filter(( file ) => {
      return filterMDFiles( file, Array.from( this.args.tags ), this.metadataCache )
    })

    logger( 'run | this.currentFileList', this.currentFileList )

    if ( !this.currentFileList || this.currentFileList.length === 0 ) {
      logger( 'run | No files found for the timeline' )
      await showEmptyTimelineMessage( el, Array.from( this.args.tags ))
      return
    }

    // Keep only the files that have the time info
    const timelineNotes: AllNotesData = []
    const timelineDates: string[] = []

    await this.parseFiles( timelineNotes, timelineDates )

    // Sort events based on setting
    const sortedTimelineDates = sortTimelineDates( timelineDates, this.settings.sortDirection )

    const timelineDiv = document.createElement( 'div' )
    timelineDiv.setAttribute( 'class', 'timeline' )

    switch ( this.args.type ) {
    case 'flat': {
      const requiredData: HorizontalTimelineInput = {
        args: this.args,
        dates: sortedTimelineDates,
        div: timelineDiv,
        el,
        notes: timelineNotes,
        settings: this.settings,
      }

      await buildHorizontalTimeline( requiredData )
      return
    }
    default:
      await buildVerticalTimeline( timelineDiv, timelineNotes, sortedTimelineDates, el )
      return
    }
  }
}
