import {
  getAllTags,
  MetadataCache,
  MarkdownView,
  TFile,
  Workspace,
  Vault,
  normalizePath
} from 'obsidian'
import { CardContainer } from '../types'
import { logger } from './debug'

export * from './debug'
export * from './events'
export * from './frontmatter'

export function setDefaultArgs() {
  return {
    tags: [],
    divHeight: '400',
    startDate: '-1000',
    endDate: '3000',
    minDate: '-3000',
    maxDate: '3000',
    type: null,
  }
}

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

  const rawTags = getAllTags( metadataCache.getFileCache( file ))
  logger( `rawTags from file: ${file.name}:`, rawTags )

  const tags = rawTags.map(( e ) => {
    return e.slice( 1 )
  })
  logger( `getAllTags from file: ${file.name}:`, tags )

  if ( !tags.length ) {
    return false
  }

  const fileTags: string[] = []
  tags.forEach(( tag ) => {
    return parseTag( tag, fileTags )
  })

  return tagList.every(( val ) => {
    logger( `testing val: ${val}`, fileTags.includes( String( val )))
    return fileTags.includes( String( val ))
  })
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
 * @param {Vault} vault - See Obsidian's {@link Vault}
 *
 * @returns {string|null} URL for image
 */
export function getImgUrl( vault: Vault, path: string ): string {
  if ( !path ) {
    return null
  }

  if ( path.includes( 'https://' )) {
    return path
  }

  const file = vault.getAbstractFileByPath( normalizePath( path ))
  if ( file instanceof TFile ) {
    return vault.getResourcePath( file )
  }
}

/**
 * Takes a date string and normalizes it so there are always 4 sections, each the length specified by maxDigits
 * If there are missing sections, they will be inserted with a value of 01 (except for hours, which will be 00)
 *
 * @param date - a date string of some nebulous format
 * @param maxDigits - the number of digits to pad each section to
 *
 * @returns {string}
 */
export const normalizeDate = ( date: string, maxDigits: number ): string => {
  // todo: handle sections of arbitrary length
  let isNegativeYear = false
  if ( date[0] === '-' ) {
    isNegativeYear = true
    date = date.substring( 1 )
  }

  const sections = date.split( '-' )

  // cases:
  // 4 sections: YYYY-MM-DD-HH (perfect, send it off as is)
  // 3 sections: YYYY-MM-DD (add 00 at the end)
  // 2 sections: YYYY-MM (add 00-00 at the end)
  // 1 section: YYYY (add 00-00-00 at the end)

  switch ( sections.length ) {
  case 1:
    sections.push( '01' ) // MM
  case 2:
    sections.push( '01' ) // DD
  case 3:
    sections.push( '00' ) // HH
    break
  }

  const paddedSections = sections.map(( section ) => {
    return section.padStart( maxDigits, '0' )
  })

  if ( isNegativeYear ) {
    paddedSections[0] = `-${paddedSections[0]}`
  }

  return paddedSections.join( '-' )
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
      attr: { href: `${normalizePath( event.path )}` },
      text: event.title
    })
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
