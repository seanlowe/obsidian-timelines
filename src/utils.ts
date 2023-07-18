import type { TFile, MetadataCache, DataAdapter } from 'obsidian'

import { getAllTags } from 'obsidian'

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
export function FilterMDFiles( file: TFile, tagList: string[], metadataCache: MetadataCache ): boolean {
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
      return fileTags.includes( val as string )
    })
  }

  return false
}

/**
 * Create date from passed string
 *
 * @param {String} date - string date in the format *YYYY-MM-DD-HH*
 * @returns {Date} newly created date object
 */
export function createDate( date: string ): Date {
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
