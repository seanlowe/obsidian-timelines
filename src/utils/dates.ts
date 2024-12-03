import { DateTime as LuxonDateTime } from 'luxon'

import { logger } from './debug'
import { DEFAULT_SETTINGS } from '../constants'
import { CleanedDateResultObject } from '../types'

/**
 * Create a Datetime Object for sorting or for use as an argument to the vis-timeline constructor
 *
 * @param {string} rawDate - string from of date in format "YYYY-MM-DD-HH"
 *
 * @returns {Date | null}
 */
export const buildTimelineDate = (
  rawDate: string | null,
  maxDigits?: number
): Date | null => {
  if ( !rawDate ) {
    return null
  }

  const normalizedAndCleanedDateObject = cleanDate( rawDate, maxDigits )
  if ( !normalizedAndCleanedDateObject ) {
    return null
  }

  const { cleanedDateString, year, month, day, hour, normalizedDateString } = normalizedAndCleanedDateObject

  // native JS Date handles negative years and recent dates pretty decent
  // so if year is negative, or if the year is recent (past 1900)
  // we can just use the JS Date directly with no workarounds
  let returnDate: Date
  let luxonDateTime: LuxonDateTime | null = null
  let luxonDateString: string | null = null
  if ( year < 0 || year > 1900 ) {
    returnDate = new Date( year, month, day, hour )
  } else {
    // but if date is positive, well, then we need to make sure we're actually getting
    // the date that we want. JS Date will change "0001-00-01" to "Jan 1st 1970"
    luxonDateTime = LuxonDateTime.fromFormat( cleanedDateString, 'y-M-d-H' )
    luxonDateString = luxonDateTime.toISO()

    if ( !luxonDateString ) {
      console.error( "buildTimelineDate | Couldn't create a luxon date string!" )
      return null
    }

    returnDate = new Date( luxonDateString )
  }

  logger( 'buildTimelineDate | date variables', {
    rawDate,
    cleanedDateString,
    normalizedAndCleanedDateObject,
    normalizedDateString,
    luxonDateTime,
    luxonDateString,
    returnDate
  })

  return returnDate
}

const buildNumPartsArray = ( dateString: string, isNegative: boolean ): number[] => {
  const parts = isNegative ? dateString.slice( 1 ).split( '-' ) : dateString.toString().split( '-' )
  const numParts: number[] = parts.map(( part ) => {
    return parseInt( part, 10 )
  })

  return numParts
}

/**
 * Take a raw date, normalize it, and clean it of leading zeros, the return all the various
 * parts needed for buildTimelineDate
 * 
 * @param {string} rawDate
 * @param {number | undefined} maxDigits
 * 
 * @returns {CleanedDateResultObject}
 */
export const cleanDate = (
  rawDate: string,
  maxDigits: number = parseInt( DEFAULT_SETTINGS.maxDigits ),
  formatString: string = DEFAULT_SETTINGS.verticalTimelineDateDisplayFormat
): CleanedDateResultObject | null => {
  const normalizedDateString = normalizeDate( rawDate, maxDigits )
  if ( normalizedDateString === null ) {
    return null
  }

  const isNegative = normalizedDateString[0] === '-'
  const normalizedParts = buildNumPartsArray( normalizedDateString, isNegative )
  const originalParts = buildNumPartsArray( rawDate, isNegative )
  
  const fullCleanedDateString = ( isNegative ? '-' : '' ) + normalizedParts.join( '-' )
  const cleanedDateStringFromOriginalParts = ( isNegative ? '-' : '' ) + originalParts.join( '-' )

  const useUserFormattedString = formatString !== DEFAULT_SETTINGS.verticalTimelineDateDisplayFormat
  const minimizedDateString = minimizeDateString( cleanedDateStringFromOriginalParts )
  const formattedDateString = formatDate( minimizedDateString, formatString )

  const year  = normalizedParts[0] * ( isNegative ? -1 : 1 )
  const month = ( normalizedParts[1] ?? 1 ) - ( normalizedParts[0] !== 0 ? 1 : 0 )
  const day   = normalizedParts[2]
  const hour  = normalizedParts[3] ?? 1

  const resultObject: CleanedDateResultObject = {
    cleanedDateString: fullCleanedDateString,
    normalizedDateString,
    originalDateString: rawDate,
    readableDateString: useUserFormattedString ? formattedDateString : minimizedDateString,
    year,
    month,
    day,
    hour
  }

  logger( 'cleanDate | resultObject', resultObject )
  
  return resultObject
}

/** 
 * Take a date string and return a minimized version of it. Example: 2022-01-01-00 becomes 2022-01-01
 *
 * @param dateString
 * 
 * @returns {string}
 */
const minimizeDateString = ( dateString: string ): string => {
  const chars = Array.from( dateString )

  let isNegative = false
  if ( chars[0] === '-' ) {
    isNegative = true
  }

  let sections: string[] = []
  if ( isNegative ) {
    sections = chars.slice( 1, chars.length ).join( '' ).split( '-' )
  } else {
    sections = chars.join( '' ).split( '-' )
  }

  if ( !sections.length ) {
    throw new Error( 'could not get the different sections of the event date' )
  }

  logger( 'minimizeDateString | before', { sections })

  // we always at least have the year
  const remainingSections: string[] = [ (( isNegative ? '-' : '' ) + sections[0] ) ]
  for ( let i = 1; i < 4; i++ ) {
    // if whatever section we're looking at is invalid, skip
    if ( [0, -1].includes( parseInt( sections[i] ))) {
      continue
    }

    // if we're looking at hour but day is not set, skip
    // todo: if hour is not set, but day is, don't show it
    if ( i === 3 && parseInt( sections[i - 1] ) < 1 ) {
      continue
    }

    if ( sections[i] ) {
      remainingSections.push( sections[i] )
    }
  }

  logger( 'minimizeDateString | remaining', { remainingSections })

  return remainingSections.join( '-' )
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
const normalizeDate = (
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

  const sections = date.toString().split( '-' )

  // cases:
  // 4 sections: YYYY-MM-DD-HH (perfect, send it off as is)
  // 3 sections: YYYY-MM-DD    (add 01 at the end)
  // 2 sections: YYYY-MM       (add 01-01 at the end)
  // 1 section:  YYYY          (add 01-01-01 at the end)

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

function mapMonthValueToName( month: string, abbreviate: boolean = false ): string {
  let name = month
  switch ( month ) {
  case '1':
    name = 'January'
    break
  case '2':
    name = 'February'
    break
  case '3':
    name = 'March'
    break
  case '4':
    name = 'April'
    break
  case '5':
    name = 'May'
    break
  case '6':
    name = 'June'
    break
  case '7':
    name = 'July'
    break
  case '8':
    name = 'August'
    break
  case '9':
    name = 'September'
    break
  case '10':
    name = 'October'
    break
  case '11':
    name = 'November'
    break
  case '12':
    name = 'December'
    break
  default:
    break
  }

  return abbreviate ? name.slice( 0, 3 ) : name
}

function mapDayToWeekdayName( year: string, month: string, day: string, abbreviate: boolean = false ): string {
  const date = new Date( parseInt( year ), parseInt( month ) - 1, parseInt( day ))
  const dayOfWeek = mapDayOfWeekToName( date.getDay() + 1 )

  return abbreviate ? dayOfWeek.slice( 0, 3 ) : dayOfWeek
}

function mapDayOfWeekToName( dayOfWeek: number ): string {
  switch ( `${dayOfWeek}` ) {
  case '1':
    return 'Sunday'
  case '2':
    return 'Monday'
  case '3':
    return 'Tuesday'
  case '4':
    return 'Wednesday'
  case '5':
    return 'Thursday'
  case '6':
    return 'Friday'
  case '7':
    return 'Saturday'
  default:
    return `the ${mapDayToDecoratedNum( dayOfWeek.toString())} day of the week`
  }
}

function mapDayToDecoratedNum( day: string ): string {
  let modifier = 'th'
  switch ( day ) {
  case '1':
  case '21':
  case '31':
    modifier = 'st'
    break
  case '2':
  case '22':
    modifier = 'nd'
    break
  case '3':
  case '23':
    modifier = 'rd'
    break
  default:
    break
  }

  return `${day}${modifier}`
}

function cascadeDeleteBasedOnMissingPredecessor( dateParts: Record<string, string | undefined> ) {
  const yearVariants = ['YY']
  const monthVariants = ['MM', 'MMM']
  const dayVariants = ['DD', 'DDD', 'DDDD']
  const hourVariants = ['HH']

  const toDelete: string[] = []
  if ( !dateParts.YYYY ) {
    // if missing years, add everything except years to the delete array
    toDelete.push( ...yearVariants, 'M', ...monthVariants, 'D', ...dayVariants, 'H', ...hourVariants )
  } else  if ( !dateParts.M ) {
    // if missing months, add all potential month variants and day and hour parts to the delete array
    toDelete.push( ...monthVariants, 'D', ...dayVariants, 'H', ...hourVariants )
  } else if ( !dateParts.D ) {
    // if missing days, add all potential day variants and hour parts to the delete array
    toDelete.push( ...dayVariants, 'H', ...hourVariants )
  } else if ( !dateParts.H ) {
    // if missing hours, add all potential hour variants to the delete array
    toDelete.push( ...hourVariants )
  }

  // loop through dateParts and delete any keys that are in the delete array
  for ( const key in dateParts ) {
    if ( toDelete.includes( key )) {
      delete dateParts[key]
    }
  }
}

/**
 * Take a minified date string and format it according to the settings supplied
 * 
 * @param {string} dateString - the date to format
 * @param {string} formatString - the string format to use for the date
 * 
 * @returns {string}
 */
export function formatDate( dateString: string, formatString: string ): string {
  const dateRegex = /^(-?\d+)(?:-(-?\d+)(?:-(-?\d+)(?:-(-?\d+))?)?)?$/
  const match = dateString.match( dateRegex )

  if ( !match ) {
    throw new Error( 'Invalid date format. Expected format: YYYY or YYYY-MM or YYYY-MM-DD or YYYY-MM-DD-HH' )
  }

  const [, year, month, day, hour] = match
  const dateParts: Record<string, string | undefined> = {
    YYYY: year, // unfiltered
    MM: month,  // unfiltered
    DD: day,    // unfiltered
    HH: hour,   // unfiltered

    YY:   year  ? year.slice( -2 )                              : undefined, // last 2 digits of year
    M:    month ? mapMonthValueToName( month, true )            : undefined, // abbr month
    MMM:  month ? mapMonthValueToName( month )                  : undefined, // full month
    D:    day   ? mapDayToDecoratedNum( day )                   : undefined, // 1st, 2nd, 3rd, etc.
    DDD:  day   ? mapDayToWeekdayName( year, month, day, true ) : undefined, // Sun, Mon, Tue, etc.
    DDDD: day   ? mapDayToWeekdayName( year, month, day )       : undefined, // Sunday, Monday, Tuesday, etc.
    H:    hour  ? hour + ':00'                                  : undefined,
  }

  logger( 'formatDate | dateparts before cascade delete', dateParts )
  cascadeDeleteBasedOnMissingPredecessor( dateParts )
  logger( 'formatDate | dateparts after cascade delete', dateParts )

  // Validate that all tokens in formatString exist in dateParts
  const requiredTokens = formatString.match( /\b(H|D{1,4}|M{1,3}|Y{2,4})\b/g ) || []
  for ( const token of requiredTokens ) {
    if ( !( token in dateParts )) {
      throw new Error( `Invalid format: ${token} is missing in the date string.` )
    }
  }

  // Replace each token in the format string by calling its associated function
  return formatString.replace( /\b(H{1,2}|D{1,4}|M{1,3}|Y{2,4})\b/g, ( token ) => {
    logger( `formatDate | replacing token: ${token}` )
    return dateParts[token] ?? '' // Replace with formatted part or empty string
  })
}
