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
