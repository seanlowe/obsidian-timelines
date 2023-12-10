import { developerSettings } from 'src/types'

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
