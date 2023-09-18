import { EventCountData, developerSettings } from 'src/types'

/**
 * A custom logging wrapper that only logs if we're in DEBUG mode.
 *
 * @param message The message to display
 * @param object optional - an object to display alongside the message
 */
export const logger = ( message: string, object?: unknown ) => {
  if ( !developerSettings.debug ) return

  console.log( message, object ?? '' )
}

/**
 * A function to confirm what the combinedEventsAndFrontMatter array looks like
 *
 * @param combinedEventsAndFrontMatter An array that contains both the events and the front matter of a file
 */
export const confirmShapeOfCombinedEvents = ( combinedEventsAndFrontMatter: EventCountData ) => {
  if ( !developerSettings.debug ) return

  console.log( 'combinedEventsAndFrontMatter', combinedEventsAndFrontMatter )
  const events = combinedEventsAndFrontMatter.slice( 0, -1 )
  const frontMatter = combinedEventsAndFrontMatter.pop()
  console.log( 'timelineData', events )
  console.log( 'frontMatter', frontMatter )
}
