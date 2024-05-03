import { isNaN } from 'lodash'
import { InternalTimelineArgs } from '../types'

export function setDefaultArgs(): InternalTimelineArgs {
  return {
    tags: [] as string[],
    divHeight: 400,
    startDate: createYearArgument( '-1000' ),
    endDate: createYearArgument( '3000' ),
    minDate: createYearArgument( '-3000' ),
    maxDate: createYearArgument( '3000' ),
    type: null,

    // have to put it to one more than the default max so that min actually works
    zoomOutLimit: 315360000000001,
    zoomInLimit: 10,
  }
}

export const createTagList = ( tagString: string, timelineTag: string ): string[] => {
  const tagList: string[] = []
  tagString.split( ';' ).forEach(( tag: string ) => {
    return parseTag( tag, tagList )
  })
  tagList.push( timelineTag )

  return tagList
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
 * Create date from passed string
 *
 * @param {String} date - string date in the format *YYYY*
 * @returns {Date} newly created date object
 */
export function createYearArgument( date: string ): Date {
  const dateComp = date.split( ',' )
  // cannot simply replace '-' as need to support negative years
  return new Date( +( dateComp[0] ?? 0 ), +( dateComp[1] ?? 0 ), +( dateComp[2] ?? 0 ), +( dateComp[3] ?? 0 ))
}

/**
 * Convert a timeframe string to milliseconds
 *
 * @param {string} timeframe - timeframe string to convert
 *
 * @returns {number} milliseconds
 */
export const convertEntryToMilliseconds = ( timeframe: string ): number => {
  let msNumber: number = 10

  const userTimeframe = parseInt( timeframe )
  if ( !isNaN( userTimeframe )) {
    // the user knows exactly what they want
    return userTimeframe
  }

  switch ( timeframe ) {
  case 'day':
    // shows hours
    msNumber = 1000 * 60 * 60 * 24 // 86400000
    break
  case 'week':
    // shows days, about a week at a time
    msNumber = 1000 * 60 * 60 * 24 * 7 // 604800000
    break
  case 'month-detail':
    // shows days, about a month at a time
    msNumber = 1000 * 60 * 60 * 24 * 31 // 2678400000
    break
  case 'month-vague':
    // shows months, about a month at a time
    msNumber = 1000 * 60 * 60 * 24 * 32 // 2764800000
    break
  case 'year':
    // shows months, about a year at a time
    msNumber = 1000 * 60 * 60 * 24 * 31 * 12 // 32140800000
    break
  default:
    console.error( `Invalid timeframe: ${timeframe}` )
    break
  }

  return msNumber
}
