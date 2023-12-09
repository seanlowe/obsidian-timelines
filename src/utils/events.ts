import { FrontMatterCache, MetadataCache, Notice, TFile, Vault } from 'obsidian'
import { ElementType, EventCountData, EventDataObject, FrontMatterCacheType, FrontMatterKeys } from 'src/types'
import { findMatchingFrontMatterKey } from './frontmatter'
import { logger } from './debug'

export async function getNumEventsInFile( file: TFile, appVault: Vault, fileCache: MetadataCache ): Promise<number> {
  const combinedEventsAndFrontMatter = await getEventsInFile( file, appVault, fileCache )
  const events = combinedEventsAndFrontMatter.filter(( event ) => {
    event.type === 'Element'
  })

  // don't need to do a filter on the frontmatter. Should only ever be 1
  const frontMatter = combinedEventsAndFrontMatter.find(( event ) => {
    event.type === 'FrontMatterCache'
  })

  logger( 'events & frontmatter', { events, frontMatter })
  const eventLength = events?.length ?? 0

  // if frontmatter exists, and the "showOnTimeline" key is present,
  // treat the note as an event separate from any HTML events within the note
  if ( frontMatter && Object.keys( frontMatter.data ).includes( 'showOnTimeline' )) {
    return eventLength + 1
  }

  // if there are no HTML events but there is frontmatter, return 1
  if ( !eventLength && frontMatter ) {
    return 1
  }

  return eventLength
}

export const getEventsInFile = async (
  file: TFile,
  appVault: Vault,
  fileCache: MetadataCache
): Promise<EventCountData | null> => {
  if ( !file ) {
    return null
  }

  const doc = new DOMParser().parseFromString( await appVault.cachedRead( file ), 'text/html' )
  const rawEvents = doc.getElementsByClassName( 'ob-timelines' )
  const events: ElementType[] = Array.from( rawEvents ).map(( event: Element ) => {
    return { type: 'Element', data: event as HTMLElement }
  })

  const fileEvents: EventCountData = [...events]

  const frontMatterData = fileCache.getFileCache( file ).frontmatter
  if ( frontMatterData ) {
    fileEvents.push({ type: 'FrontMatterCache', data: frontMatterData })
  }

  logger( 'fileEvents', fileEvents )

  return fileEvents
}

export const getEventData = (
  eventObject: ElementType | FrontMatterCacheType | null,
  file: TFile,
  frontMatterKeys: FrontMatterKeys,
  isFrontMatterCacheType: boolean
): EventDataObject => {

  const startDate = retrieveEventValue(
    eventObject, 'startDate', null, isFrontMatterCacheType, frontMatterKeys?.startDateKey
  )
  if ( !startDate ) {
    new Notice( `No date found for ${file.name}` )
    return {} as EventDataObject
  }

  const color          = retrieveEventValue( eventObject, 'color', '', isFrontMatterCacheType )
  const endDate        = retrieveEventValue(
    eventObject, 'endDate', null, isFrontMatterCacheType, frontMatterKeys?.endDateKey
  )
  const era            = retrieveEventValue( eventObject, 'era', null, isFrontMatterCacheType )
  const eventImg       = retrieveEventValue( eventObject, 'img', null, isFrontMatterCacheType )
  const notePath       = retrieveEventValue( eventObject, 'path', '/' + file.path, isFrontMatterCacheType )
  const noteTitle      = retrieveEventValue(
    eventObject, 'title', file.name.replace( '.md', '' ), isFrontMatterCacheType, frontMatterKeys?.titleKey
  )
  const tags           = retrieveEventValue( eventObject, 'tags', '', isFrontMatterCacheType )
  const type           = retrieveEventValue( eventObject, 'type', 'box', isFrontMatterCacheType )
  const showOnTimeline = retrieveEventValue( eventObject, 'showOnTimeline', null, isFrontMatterCacheType )

  const eventData: EventDataObject = {
    color,
    endDate,
    era,
    eventImg,
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
  eventObject: ElementType | FrontMatterCacheType | null,
  datasetKey: string,
  defaultValue: string | null,
  isFrontMatterCacheType: boolean,
  frontMatterKeys?: string[] | null,
): string | null => {
  switch ( isFrontMatterCacheType ) {
  case true:
    return retrieveFrontMatterValue( eventObject.data as FrontMatterCache, datasetKey, defaultValue, frontMatterKeys )
  case false:
  default:
    return retrieveHTMLValue( eventObject.data as HTMLElement, datasetKey, defaultValue )
  }
}

const retrieveHTMLValue = (
  event: HTMLElement | null,
  datasetKey: string,
  defaultValue: string | null,
): string | null => {
  const result = event.dataset[datasetKey]

  return result ?? defaultValue
}

const retrieveFrontMatterValue = (
  event: FrontMatterCache | null,
  datasetKey: string,
  defaultValue: string | null,
  frontMatterKeys?: string[] | null,
): string | null => {
  logger( 'in retrieveFrontMatterValue w/ datasetKet', datasetKey )
  const result = event[datasetKey]
    ?? findMatchingFrontMatterKey( event, frontMatterKeys )

  return result ?? defaultValue
}
