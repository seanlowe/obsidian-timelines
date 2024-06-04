import { FrontMatterCache, MetadataCache, Notice, TFile, Vault, normalizePath } from 'obsidian'
import {
  EventCountData,
  EventDataObject,
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

  const color          = retrieveEventValue( eventObject, 'color', '' )
  const endDate        = retrieveEventValue(
    eventObject, 'endDate', null, frontMatterKeys?.endDateKey
  )
  const era            = retrieveEventValue( eventObject, 'era', null )
  const eventImg       = retrieveEventValue( eventObject, 'img', null )
  const notePath       = retrieveEventValue( eventObject, 'path', '/' + normalizePath( file.path ))
  const noteTitle      = retrieveEventValue(
    eventObject, 'title', file.name.replace( '.md', '' ), frontMatterKeys?.titleKey
  )
  const noteBody       = retrieveEventValue( 
    eventObject, 'description', isHTMLElementType(eventObject) ? event.innerText : ''
  )
  const tags           = retrieveEventValue( eventObject, 'tags', '' )
  const type           = retrieveEventValue( eventObject, 'type', 'box' )
  const showOnTimeline = retrieveEventValue( eventObject, 'showOnTimeline', null )

  const eventData: EventDataObject = {
    color,
    endDate,
    era,
    eventImg,
    notePath,
    noteTitle,
    noteBody,
    showOnTimeline: !!showOnTimeline,
    startDate,
    tags,
    type
  }

  return eventData
}

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

const retrieveHTMLValue = (
  event: HTMLElement,
  datasetKey: string,
  defaultValue: string | null,
): string | null => {
  const result = event.dataset[datasetKey]

  return result ?? defaultValue
}

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
