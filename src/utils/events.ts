import { FrontMatterCache, MetadataCache, Notice, TFile, Vault, normalizePath } from 'obsidian'
import {
  EventCountData,
  EventDataObject,
  EventStylesObject,
  EventTypeNumbers,
  FrontMatterKeys,
  GetFileDataInput
} from '../types'
import { findMatchingFrontMatterKey } from './frontmatter'
import { logger } from './debug'

// todo: figure out more deterministic way of checking whether an object is of type FrontMatterCache
export const isFrontMatterCacheType = ( value: unknown ): value is FrontMatterCache => {
  return !( value instanceof HTMLElement )
}

export const isHTMLElementType = ( value: unknown ): value is HTMLElement => {
  return value instanceof HTMLElement
}

/**
 * Gets the number of events (HTML or Frontmatter) in a file.
 *
 * @param {GetFileDataInput} getFileData - an object containing the file to get the events from,
 *   the Obsidian vault object, and the Obsidian fileCache
 * @param {EventCountData} eventData - (optional) if provided, will use this instead of getting the events from the file
 *
 * @returns
 */
export async function getNumEventsInFile(
  getFileData: GetFileDataInput | null,
  eventData: EventCountData | null = null
): Promise<EventTypeNumbers> {
  let combinedEventsAndFrontMatter = eventData
  if ( !combinedEventsAndFrontMatter ) {
    logger( 'no eventData, getting events from file' )
    const { file, appVault, fileCache } = getFileData ?? {}
    combinedEventsAndFrontMatter = await getEventsInFile( file, appVault, fileCache )
  }

  // even though there should only ever be 1, we still filter so that we get back an array
  const frontMatter = combinedEventsAndFrontMatter.filter( isFrontMatterCacheType )
  const events = combinedEventsAndFrontMatter.filter( isHTMLElementType )

  logger( 'events & frontmatter', { events, frontMatter })
  const numFrontMatter = frontMatter.length
  const numEvents = events.length

  return { numEvents, numFrontMatter, totalEvents: numEvents + numFrontMatter }
}

/**
 * Get all events in a specified file.
 *
 * @param {TFile} file - the file to get the events from
 * @param {Vault} appVault - a handle to information in and about the current vault
 * @param {MetadataCache} fileCache - internal metadata cache
 *
 * @returns {EventCountData | null}
 */
export const getEventsInFile = async (
  file: TFile,
  appVault: Vault,
  fileCache: MetadataCache
): Promise<EventCountData | null> => {
  if ( !file ) {
    return null
  }

  const fileEvents: EventCountData = []
  const doc = ( new DOMParser()).parseFromString( await appVault.cachedRead( file ), 'text/html' )
  const rawEvents = doc.getElementsByClassName( 'ob-timelines' )
  fileEvents.push( ...Array.from( rawEvents ).filter( isHTMLElementType ))

  const frontMatterData = fileCache.getFileCache( file ).frontmatter
  if ( frontMatterData ) {
    fileEvents.push( frontMatterData )
  }

  logger( 'fileEvents', fileEvents )

  return fileEvents
}

/**
 * Gets the event data from an event object (HTML or Frontmatter).
 *
 * @param {HTMLElement | FrontMatterCache} eventObject - the event object to get the data from. Could be HTML or frontmatter
 * @param {TFile} file - the file the event is in
 * @param {FrontMatterKeys} frontMatterKeys - the alternative frontmatter keys (user-specified) to search for
 *
 * @returns {EventDataObject | null}
 */
export const getEventData = (
  eventObject: HTMLElement | FrontMatterCache,
  file: TFile,
  frontMatterKeys: FrontMatterKeys,
): EventDataObject | null => {
  const startDate = retrieveEventValue(
    eventObject, 'startDate', null, frontMatterKeys?.startDateKey
  )

  if ( !startDate ) {
    new Notice( `No date found for ${file.name}` )

    return null
  }

  const styles: EventStylesObject = {
    backgroundColor: retrieveEventValue( eventObject, 'color',       null ),
    borderColor:     retrieveEventValue( eventObject, 'borderColor', null ),
    fontColor:       retrieveEventValue( eventObject, 'fontColor',   null ),
  }

  const endDate        = retrieveEventValue(
    eventObject, 'endDate', null, frontMatterKeys?.endDateKey
  )
  const era            = retrieveEventValue( eventObject, 'era', null )
  const eventImg       = retrieveEventValue( eventObject, 'img', null )
  const notePath       = retrieveEventValue( eventObject, 'path', '/' + normalizePath( file.path ))
  const noteTitle      = retrieveEventValue(
    eventObject, 'title', file.name.replace( '.md', '' ), frontMatterKeys?.titleKey
  )
  const tags           = retrieveEventValue( eventObject, 'tags', '' )
  const type           = retrieveEventValue( eventObject, 'type', 'box' )
  const showOnTimeline = retrieveEventValue( eventObject, 'showOnTimeline', null )

  const eventData: EventDataObject = {
    endDate,
    era,
    eventImg,
    notePath,
    noteTitle,
    showOnTimeline: !!showOnTimeline,
    startDate,
    styles,
    tags,
    type
  }

  return eventData
}

/**
 * @param {HTMLElement | FrontMatterCache} eventData - the event data to retrieve the value from
 * @param {string} datasetKey - the key to retrieve the value with
 * @param {string | null} defaultValue - the default value to return if the value is not found
 * @param {string[] | null} frontMatterKeys - (optional) the equivalent keys to search for in the frontmatter
 *
 * @returns {string | null}
 */
const retrieveEventValue = (
  eventData: HTMLElement | FrontMatterCache,
  datasetKey: string,
  defaultValue: string | null,
  frontMatterKeys?: string[] | null,
): string | null => {
  if ( isHTMLElementType( eventData )) {
    return retrieveHTMLValue( eventData, datasetKey, defaultValue )
  } else {
    return retrieveFrontMatterValue( eventData, datasetKey, defaultValue, frontMatterKeys )
  }
}

/**
 * @param {HTMLElement} event - the HTML div/span event to retrieve the value from
 * @param {string} datasetKey - the key to retrieve the value with
 * @param {string | null} defaultValue - the default value to return if the value is not found
 *
 * @returns {string | null}
 */
const retrieveHTMLValue = (
  event: HTMLElement,
  datasetKey: string,
  defaultValue: string | null,
): string | null => {
  const result = event.dataset[datasetKey]

  return result ?? defaultValue
}

/**
 * @param {FrontMatterCache} event - the frontmatter event to retrieve the value from
 * @param {string} datasetKey - the key to retrieve the value with
 * @param {string | null} defaultValue - the default value to return if the value is not found
 * @param {string[] | null } frontMatterKeys - (optional) the equivalent keys to search for in the frontmatter
 *
 * @returns {string | null}
 */
const retrieveFrontMatterValue = (
  event: FrontMatterCache,
  datasetKey: string,
  defaultValue: string | null,
  frontMatterKeys?: string[] | null,
): string | null => {
  logger( 'in retrieveFrontMatterValue w/ datasetKet', datasetKey )
  const result = event[datasetKey]
    ?? findMatchingFrontMatterKey( event, frontMatterKeys )

  if ( !result || result === '' ) {
    return defaultValue
  }

  return result
}
