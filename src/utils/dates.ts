import { DateTime } from 'luxon'

import { logger } from './debug'
import { DEFAULT_SETTINGS } from '../constants'
import { CleanedDateResultObject } from '../types'

const makeSureDateSectionIsNotZero = ( section: string, sectionValue: number, defaultValue: number ): number => {
  if ( section !== 'year' && sectionValue === 0 ) {
    return defaultValue
  }

  switch (section) {
    case 'year'
  }

  // const year  = numParts[0] * ( isNegative ? -1 : 1 )
  // const month = ( numParts[1] ?? 1 ) - ( numParts[0] !== 0 ? 1 : 0 )
  // const day   = numParts[2]
  // const hour  = numParts[3] ?? 1
}

/**
 * Take a normalizedDate and clean it of leading zeros, the return all the various
 * parts needed for buildTimelineDate
 * 
 * @param {string} normalizedDate
 * 
 * @returns {CleanedDateResultObject}
 */
export const cleanDate = ( normalizedDate: string ): CleanedDateResultObject | null => {
  if ( normalizedDate === null ) {
    return null
  }
  const isNegative = normalizedDate[0] === '-'
  const parts = normalizedDate.slice( 1 ).split( '-' )

  const numParts: number[] = parts.map(( part ) => {
    return parseInt( part, 10 )
  })
  
  const cleanedDateString = isNegative ? '-' + numParts.join( '-' ) : numParts.join( '-' )
  const year  = numParts[0] * ( isNegative ? -1 : 1 )
  const month = ( numParts[1] ?? 1 ) - ( numParts[0] !== 0 ? 1 : 0 )
  const day   = numParts[2]
  const hour  = numParts[3] ?? 1

  const resultObject: CleanedDateResultObject = {
    cleanedDateString,
    year,
    month,
    day,
    hour
  }
  
  return resultObject
}

interface NormalizeAndCleanDateOutput extends CleanedDateResultObject {
  normalizedDate: string
}

export const normalizeAndCleanDate = (
  date: string | null,
  maxDigits: number = parseInt( DEFAULT_SETTINGS.maxDigits )
): NormalizeAndCleanDateOutput | null => {
  const normalizedDate = normalizeDate( date, maxDigits )
  if ( !normalizedDate ) {
    return null
  }
  
  const cleanedDateObject = cleanDate( normalizedDate )
  if ( !cleanedDateObject ) {
    return null
  }

  return {
    ...cleanedDateObject,
    normalizedDate
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
export const normalizeDate = (
  date: string | null,
  maxDigits: number = parseInt( DEFAULT_SETTINGS.maxDigits )
): string | null => {
  if ( !date ) {
    return null 
  }

  // todo: handle sections of arbitrary length
  let isNegativeYear = false
  if ( date[0] === '-' ) {
    isNegativeYear = true
    date = date.substring( 1 )
  }

  console.log( 'normalizeDate', { date })
  const sections = date.split( '-' )

  sections.forEach((section, index) => {
    if (parseInt(section) === 0) {
      // sections.splice(index, 1) // doesn't work because could cause sections to get out of order
    }
  })

  // cases:
  // 4 sections: YYYY-MM-DD-HH (perfect, send it off as is)
  // 3 sections: YYYY-MM-DD (add 01 at the end)
  // 2 sections: YYYY-MM (add 01-01 at the end)
  // 1 section: YYYY (add 01-01-01 at the end)

  switch ( sections.length ) {
  case 1:
    sections.push( '01' ) // MM
  case 2:
    sections.push( '01' ) // DD
  case 3:
    sections.push( '01' ) // HH
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
export const buildTimelineDate = (
  rawDate: string | null,
  maxDigits?: number
): Date | null => {
  // const normalizedDate = normalizeDate( rawDate, maxDigits ?? parseInt( DEFAULT_SETTINGS.maxDigits ))
  // if ( !normalizedDate ) {
  //   return null
  // }
  
  // const cleanedDateObject = cleanDate( normalizedDate )
  const normalizedAndCleanedDateObject = normalizeAndCleanDate( rawDate, maxDigits )
  if ( !normalizedAndCleanedDateObject ) {
    return null
  }
  const { cleanedDateString, year, month, day, hour, normalizedDate } = normalizedAndCleanedDateObject

  // native JS Date handles negative years and recent dates pretty decent
  // so if year is negative, or if the year is recent (past 1900)
  // we can just use the JS Date directly with no workarounds
  let returnDate: Date
  let luxonDateTime: DateTime | null = null
  let luxonDateString: string | null = null
  if ( year < 0 || year > 1900 ) {
    returnDate = new Date( year, month, day, hour )
  } else {
    // but if date is positive, well, then we need to make sure we're actually getting
    // the date that we want. JS Date will change "0001-00-01" to "Jan 1st 1970"
    luxonDateTime = DateTime.fromFormat( cleanedDateString, 'y-M-d-H' )
    luxonDateString = luxonDateTime.toISO()

    if ( !luxonDateString ) {
      console.error( "Couldn't create a luxon date string!" )
      return null
    }

    returnDate = new Date( luxonDateString )
  }

  logger( 'buildTimelineDate | date variables', {
    rawDate,
    cleanedDateString,
    normalizedAndCleanedDateObject,
    normalizedDate,
    luxonDateTime,
    luxonDateString,
    returnDate
  })

  return returnDate
}

/**
 * Correctly sort our timeline dates, taking heed of negative dates
 *
 * @param {string[]} timelineDates the array of normalized noteId's (event start dates) for the timeline
 * @param {boolean} sortDirection false for descending, true for ascending
 */
export const sortTimelineDates = ( timelineDates: string[], sortDirection: boolean ): string[] => {
  const filterFunc = ( dateStr: string ) => {
    return dateStr[0] === '-' 
  }

  const negativeDatesUnsorted = timelineDates.filter( filterFunc )
  const positiveDates = timelineDates.filter(( date ) => {
    return !filterFunc( date ) 
  }).sort()

  const strippedNegativeDates = negativeDatesUnsorted.map(( date ) => {
    return date.slice( 1 ) 
  }).sort().reverse()
  
  let sortedTimelineDates: string[] = []
  if ( sortDirection ) {
    const negativeDates = strippedNegativeDates.map(( date ) => {
      return `-${date}` 
    }) ?? []

    sortedTimelineDates = [...negativeDates, ...positiveDates]
  } else {
    const negativeDates = strippedNegativeDates.reverse().map(( date ) => {
      return `-${date}` 
    }) ?? []

    sortedTimelineDates = [...positiveDates.reverse(), ...negativeDates]
  }
  
  return sortedTimelineDates
}
