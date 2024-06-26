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

export * from './arguments'
export * from './colors'
export * from './dates'
export * from './debug'
export * from './events'
export * from './frontmatter'

/**
 * Filter markdown files by tag
 *
 * @param {TFile} file - file to filter, see Obsidian's {@link TFile}
 * @param {String[]} tagList - list of tags to filter by
 * @param {MetadataCache} metadataCache - See Obsidian's {@link MetadataCache}
 * @returns {boolean} true if file contains all tags in tagList, false otherwise
 */
export function filterMDFiles( file: TFile, tagList: string[], metadataCache: MetadataCache ): boolean {
  logger( 'filterMDFiles | -----------------' )
  if ( !tagList || tagList.length === 0 ) {
    return true
  }

  const rawTags = getAllTags( metadataCache.getFileCache( file ))
  logger( `filterMDFiles | rawTags from file: ${file.name}:`, rawTags )

  const tags = rawTags.map(( e ) => {
    return e.slice( 1 )
  })
  logger( `filterMDFiles | getAllTags from file: ${file.name}:`, tags )

  if ( !tags.length ) {
    return false
  }

  const fileTags: string[] = []
  tags.forEach(( tag ) => {
    return parseTag( tag, fileTags )
  })

  return tagList.every(( val ) => {
    logger( `filterMDFiles | testing val: ${val}`, fileTags.includes( String( val )))
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
