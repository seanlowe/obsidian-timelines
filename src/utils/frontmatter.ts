import { FrontMatterCache } from 'obsidian'
import { logger } from './debug'

export const findMatchingFrontMatterKey = ( frontMatter: FrontMatterCache | null, keys: string[] ): string | null => {
  logger( 'keys', keys )
  if ( keys?.length === 1 ) {
    return frontMatter?.[keys[0]]
  }

  if ( !keys ) {
    return null
  }

  for ( const key of keys ) {
    if ( frontMatter && frontMatter[key] ) {
      return frontMatter[key]
    }
  }

  logger( `No matching key found for ${keys}` )
  return null
}
