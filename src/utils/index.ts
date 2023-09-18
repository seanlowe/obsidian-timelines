import {
  DataAdapter,
  FrontMatterCache,
  getAllTags,
  MetadataCache,
  MarkdownView,
  TFile,
  Workspace
} from 'obsidian'
import {
  CardContainer,
} from '../types'

export * from './debug'
export * from './events'
export * from './frontmatter'

/**
 * Parse a tag and all its subtags into a list.
 *
 * @param {String} tag - tag to parse
 * @param {String[]} tagList - list of tags to add to
 * @returns
 */
export function parseTag( tag: string, tagList: string[] ): void {
  tag = tag.trim()

  // Skip empty tags
  if ( tag.length === 0 ) {
    return
  }

  // Parse all subtags out of the given tag.
  // I.e., #hello/i/am would yield [#hello/i/am, #hello/i, #hello]. */
  tagList.push( tag )
  while ( tag.contains( '/' )) {
    tag = tag.substring( 0, tag.lastIndexOf( '/' ))
    tagList.push( tag )
  }
}

/**
 * Filter markdown files by tag
 *
 * @param {TFile} file - file to filter, see Obsidian's {@link TFile}
 * @param {String[]} tagList - list of tags to filter by
 * @param {MetadataCache} metadataCache - See Obsidian's {@link MetadataCache}
 * @returns {boolean} true if file contains all tags in tagList, false otherwise
 */
export function filterMDFiles( file: TFile, tagList: string[], metadataCache: MetadataCache ): boolean {
  if ( !tagList || tagList.length === 0 ) {
    return true
  }

  const tags = getAllTags( metadataCache.getFileCache( file )).map(( e ) => {
    return e.slice( 1 )
  })

  if ( tags && tags.length > 0 ) {
    const fileTags: string[] = []
    tags.forEach(( tag ) => {
      return parseTag( tag, fileTags )
    })
    return tagList.every(( val ) => {
      return fileTags.includes( String( val ))
    })
  }

  return false
}

/**
 * Create date from passed string
 *
 * @param {String} date - string date in the format *YYYY*
 * @returns {Date} newly created date object
 */
export function createDateArgument( date: string ): Date {
  const dateComp = date.split( ',' )
  // cannot simply replace '-' as need to support negative years
  return new Date( +( dateComp[0] ?? 0 ), +( dateComp[1] ?? 0 ), +( dateComp[2] ?? 0 ), +( dateComp[3] ?? 0 ))
}

/**
 * Return URL for specified image path
 *
 * @param {String} path - image path
 * @param {DataAdapter} vaultAdaptor - See Obsidian's {@link DataAdapter}
 * @returns {string|null} URL for image
 */
export function getImgUrl( vaultAdaptor: DataAdapter, path: string ): string {
  if ( !path ) {
    return null
  }

  if ( path.includes( 'https://' )) {
    return path
  }

  return vaultAdaptor.getResourcePath( path )
}

/**
 * Format an event date for display
 *
 * @param {string} rawDate - string from of date in format "YYYY-MM-DD"
 * @returns {Date | null}
 */
export const buildTimelineDate = ( rawDate: string ): Date|null => {
  const cleanedDate = rawDate?.replace( /(.*)-\d*$/g, '$1' )
  if ( !cleanedDate ) {
    return null
  }

  if ( cleanedDate[0] === '-' ) {
    // handle negative year
    const comps = cleanedDate.substring( 1, cleanedDate.length ).split( '-' )
    return new Date( +`-${comps[0]}`, +comps[1], +comps[2] )
  }

  return new Date( cleanedDate )
}

/**
 * Create an internal link on the a timeline's event "note" card
 *
 * @param event
 * @param noteCard
 */
export const createInternalLinkOnNoteCard = ( event: CardContainer, noteCard: HTMLElement ) => {
  noteCard
    .createEl( 'article' )
    .createEl( 'h3' )
    .createEl( 'a', {
      cls: 'internal-link',
      attr: { href: `${event.path}` },
      text: event.title
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isFrontMatterCacheType = ( value: any ): value is FrontMatterCache => {
  return value?.type === 'FrontMatterCache'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isHTMLElementType = ( value: any ): value is HTMLElement => {
  return value?.type === 'Element'
}

export const confirmUserInEditor = ( workspace: Workspace ) => {
  const view = workspace.getActiveViewOfType( MarkdownView )
  if ( !view ) {
    throw new Error( 'No active MarkdownView' )
  }

  const editor = view.editor
  if ( !editor ) {
    throw new Error( 'Could not retrieve editor' )
  }

  return editor
}
