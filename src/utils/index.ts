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
import { parseTag } from './arguments'

export * from './debug'
export * from './events'
export * from './frontmatter'
export * from './arguments'
export * from './colors'

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
  // 2 sections: YYYY-MM (add 01-00 at the end)
  // 1 section: YYYY (add 01-01-00 at the end)

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
 * @param {string} rawDate - string from of date in format "YYYY-MM-DD-HH"
 * @returns {Date | null}
 */
export const buildTimelineDate = ( rawDate: string ): Date | null => {
  let cleanedDate = rawDate?.replace( /(.*)-\d{4}$/g, '$1' )
  if ( !cleanedDate ) {
    return null
  }

  let isNegative: boolean = false
  if ( cleanedDate[0] === '-' ) {
    isNegative = true
    cleanedDate = cleanedDate.slice( 1 )
  }

  const parts = cleanedDate.split( '-' )
  const year = parseInt( parts[0] ) * ( isNegative ? -1 : 1 )
  const month = parseInt( parts[1] ?? '1' ) - 1 // Month is 0-indexed, so subtract 1
  const day = parseInt( parts[2] ?? '1' )
  const hour = parseInt( parts[3] ?? '1' )

  const date = new Date( year, month, day, hour )
  return date
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
