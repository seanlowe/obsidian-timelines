import { FrontMatterCache, MetadataCache, Notice, TFile, Vault, normalizePath } from 'obsidian'
import { DataItem, IdType } from 'vis-timeline'

import {
  EventCountData,
  EventDataObject,
  EventItem,
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

export const buildCombinedTimelineDataObject = ( event: EventItem, obj: object = {}) => {
  return {
    ...buildBaseDataItem(),
    ...event,
    ...obj
  }
}

const buildBaseDataItem = (): Omit<DataItem, 'id'> & { id: IdType } => {
  // export interface DataItem {
  //   className?: string;
  //   content: string;
  //   end?: Date | number | string;
  //   group?: any;
  //   id?: string | number;
  //   start: Date | number | string;
  //   style?: string;
  //   subgroup?: string | number;
  //   title?: string;
  //   type?: string;
  //   editable?: boolean | {
  //     remove?: boolean;
  //     updateGroup?: boolean;
  //     updateTime?: boolean;
  //   }
  //   selectable?: boolean;
  //   limitSize?: boolean;
  // }

  const baseDataItem: Omit<DataItem, 'id'> & { id: IdType } = {
    // skipped optional keys that will be provided by the event 
    // className: eventItem.className,
    // end: eventItem.end ?? '',

    content: '', // will be overwritten by the event content
    id:      '', // will be overwritten by the event id
    start:   '', // will be overwritten by the event start

    editable:  false,
    group: undefined,
    limitSize: false,
    selectable: true,
    style: undefined,
    title: undefined,
  }

  return baseDataItem
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
    logger( 'getNumEventsInFile | no eventData, getting events from file' )
    const { file, appVault, fileCache } = getFileData ?? {}
    combinedEventsAndFrontMatter = await getEventsInFile( file, appVault, fileCache )
  }

  // even though there should only ever be 1, we still filter so that we get back an array
  const frontMatter = combinedEventsAndFrontMatter?.filter( isFrontMatterCacheType )
  const events = combinedEventsAndFrontMatter?.filter( isHTMLElementType )

  logger( 'getNumEventsInFile | events & frontmatter', { events, frontMatter })
  const numFrontMatter = frontMatter?.length ?? 0
  const numEvents = events?.length ?? 0

  return { numEvents, numFrontMatter, totalEvents: numEvents + numFrontMatter }
}

export const getEventsInFile = async (
  file: TFile | null | undefined,
  appVault: Vault | null | undefined,
  fileCache: MetadataCache | null | undefined
): Promise<EventCountData | null> => {
  if ( !file || !appVault || !fileCache ) {
    return null
  }

  const fileEvents: EventCountData = []
  const doc = ( new DOMParser()).parseFromString( await appVault.cachedRead( file ), 'text/html' )
  const rawEvents = doc.getElementsByClassName( 'ob-timelines' )
  fileEvents.push( ...Array.from( rawEvents ).filter( isHTMLElementType ))

  const frontMatterData = fileCache.getFileCache( file )?.frontmatter
  if ( frontMatterData ) {
    fileEvents.push( frontMatterData )
  }

  logger( 'getEventsInFile | fileEvents', fileEvents )

  return fileEvents
}

export const getEventData = (
  eventObject: HTMLElement | FrontMatterCache,
  file: TFile,
  frontMatterKeys: FrontMatterKeys,
): EventDataObject | null => {
  logger( 'getEventData | function starting for eventObject:', eventObject )
  const startDate = retrieveEventValue(
    eventObject, 'startDate', '', frontMatterKeys?.startDateKey
  )
  if ( !startDate ) {
    new Notice( `No date found for ${file.name}` )
    return null
  }

  const defaultBody    = isHTMLElementType( eventObject ) ? eventObject.innerText : ''
  const classes        = retrieveEventValue( eventObject, 'classes', '' )
  const color          = retrieveEventValue( eventObject, 'color', '' )
  const endDate        = retrieveEventValue(
    eventObject, 'endDate', startDate, frontMatterKeys?.endDateKey
  )
  const era            = retrieveEventValue( eventObject, 'era', '' )
  const eventImg       = retrieveEventValue( eventObject, 'img', '' )
  const noteBody       = retrieveEventValue( eventObject, 'description', defaultBody )
  const notePath       = retrieveEventValue( eventObject, 'path', '/' + normalizePath( file.path ))
  const noteTitle      = retrieveEventValue(
    eventObject, 'title', file.name.replace( '.md', '' ), frontMatterKeys?.titleKey
  )
  const tags           = retrieveEventValue( eventObject, 'tags', '' ) ?? ''
  const type           = retrieveEventValue( eventObject, 'type', 'box' )
  const showOnTimeline = retrieveEventValue( eventObject, 'showOnTimeline', 'false' )

  const eventData: EventDataObject = {
    classes,
    color,
    endDate,
    era,
    eventImg,
    noteBody,
    notePath,
    noteTitle,
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
  defaultValue: string,
  frontMatterKeys?: string[] | null,
): string => {
  if ( isHTMLElementType( eventData )) {
    return retrieveHTMLValue( eventData, datasetKey, defaultValue )
  } else {
    return retrieveFrontMatterValue( eventData, datasetKey, defaultValue, frontMatterKeys )
  }
}

const retrieveHTMLValue = (
  event: HTMLElement,
  datasetKey: string,
  defaultValue: string = '',
): string => {
  logger( 'retrieveHTMLValue | datasetKey:', { key: datasetKey, value: event.dataset[datasetKey], defaultValue })
  const result = event.dataset[datasetKey]

  if ( !result || result === '' ) {
    return defaultValue
  }

  return result
}

const retrieveFrontMatterValue = (
  event: FrontMatterCache,
  datasetKey: string,
  defaultValue: string = '',
  frontMatterKeys?: string[] | null,
): string => {
  logger( 'retrieveFrontMatterValue | datasetKey:', datasetKey )
  const alternativeValue = frontMatterKeys && findMatchingFrontMatterKey( event, frontMatterKeys )
  const result = event[datasetKey]
    ?? alternativeValue

  if ( !result || result === '' ) {
    return defaultValue
  }

  return result
}
