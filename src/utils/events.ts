import { FrontMatterCache, MetadataCache, Notice, TFile, Vault, normalizePath } from 'obsidian'
import { DataItem, IdType } from 'vis-timeline'

import {
  CardContainer,
  CardContainerWithChildren,
  EventCountData,
  EventDataObject,
  EventItem,
  EventTypeNumbers,
  FrontMatterKeys,
  GetFileDataInput
} from '../types'
import { findMatchingFrontMatterKey } from './frontmatter'
import { logger } from './debug'
import { isDateInRange } from './dates'

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
    group:    1, // can be overwritten by the event group
    id:      '', // will be overwritten by the event id
    start:   '', // will be overwritten by the event start

    editable:   false,
    limitSize:  false,
    selectable: true,
    style:      undefined,
    title:      undefined,
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

  // defaults
  const defaultBody    = isHTMLElementType( eventObject ) ? eventObject.innerText : ''

  // event parameters
  const classes        = retrieveEventValue( eventObject, 'classes', '' )
  const color          = retrieveEventValue( eventObject, 'color', '' )
  const endDate        = retrieveEventValue(
    eventObject, 'endDate', startDate, frontMatterKeys?.endDateKey
  )
  const era            = retrieveEventValue( eventObject, 'era', '' )
  const eventImg       = retrieveEventValue( eventObject, 'img', '' )
  const group          = retrieveEventValue( eventObject, 'group', '' )
  const noteBody       = retrieveEventValue( eventObject, 'description', defaultBody )
  const notePath       = retrieveEventValue( eventObject, 'path', '/' + normalizePath( file.path ))
  const noteTitle      = retrieveEventValue(
    eventObject, 'title', file.name.replace( '.md', '' ), frontMatterKeys?.titleKey
  )
  const pointsTo       = retrieveEventValue( eventObject, 'pointsTo', '' )
  const tags           = retrieveEventValue( eventObject, 'tags', '' ) ?? ''
  const type           = retrieveEventValue( eventObject, 'type', 'box' )
  const showOnTimeline = retrieveEventValue( eventObject, 'showOnTimeline', 'false' )

  const eventData: EventDataObject = {
    classes,
    color,
    endDate,
    era,
    eventImg,
    group,
    noteBody,
    notePath,
    noteTitle,
    pointsTo,
    showOnTimeline: !!showOnTimeline,
    startDate,
    tags,
    type
  }

  logger( 'getEventData | full event:', { eventData })
  return eventData
}

/**
 * Iterate through the list of events and nest events under the child
 * tag of events which would contain them. Do this recursively until
 * there are no more child events.
 * 
 * @param {CardContainer[]} events - the list of events to nest
 * 
 * @returns {CardContainerWithChildren[]}
 */
export const nestEvents = (
  events: CardContainer[]
): CardContainerWithChildren[] => {
  const sortedEvents = [...events].sort(( a, b ) => {
    return a.startDate.normalizedDateString.localeCompare( b.startDate.normalizedDateString ) 
  })

  const rootEvents: CardContainerWithChildren[] = []
  const stack: CardContainerWithChildren[] = []

  for ( const event of sortedEvents ) {
    const eventWithChildren = { ...event, children: [] }

    // Clean up the stack if event doesn't belong to top range
    while (
      stack.length > 0 &&
      !isDateInRange( event.startDate, stack[stack.length - 1].startDate, stack[stack.length - 1].endDate )
    ) {
      stack.pop()
    }

    // If there's a parent on the stack, add to its children
    if ( stack.length > 0 ) {
      stack[stack.length - 1].children.push( eventWithChildren )
    } else {
      rootEvents.push( eventWithChildren )
    }

    // If this is a range, it can have children — push to stack
    if ( event.type === 'range' ) {
      stack.push( eventWithChildren )
    }
  }

  return rootEvents
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

// --------------------------------------------------------

type TimelineAction =
  | { kind: 'HEAD',  event: CardContainer, indent: number }
  | { kind: 'TAIL',  event: CardContainer, indent: number }
  | { kind: 'EVENT', event: CardContainer, indent: number }


/**
 * Check if an event date (start or finish) is after or equal to the end date of the latest unpaired tail
 *
 * @param {string} eventDateToCheck 
 * @param {TimelineAction[]} unpairedTails
 *
 * @returns {boolean}
 */
const checkAgainstLatestTail = ( eventDateToCheck: string, unpairedTails: TimelineAction[] ): boolean => {
  if ( unpairedTails.length === 0 ) {
    console.log( 'no unpaired tails' )
    return false
  }

  if ( unpairedTails.length !== 0 ) {
    const latestTail = unpairedTails[unpairedTails.length - 1]
    if ( eventDateToCheck >= latestTail.event.endDate.normalizedDateString ) {
      return true
    }
  }

  return false
}

export const createTimelineActions = ( events: CardContainer[] ): TimelineAction[] => {
  // events should already be sorted by startDate
  const actions: TimelineAction[] = []
  const unpairedTails: TimelineAction[] = []
  let currentIndent = 0

  for ( const event of events ) {
    const currentActions: TimelineAction[] = []

    // if there are any unpaired tails, check if the current event starts before or after the latest unpaired tail
    // if it starts before the first tail's end date, do not push the tail to actions array (the range hasn't ended yet)
    // if it starts after the first tail's end date, push the tail to actions array
    if ( checkAgainstLatestTail( event.startDate.normalizedDateString, unpairedTails )) {
      actions.push( unpairedTails.pop()! )
      currentIndent--
    }

    // check what type the event is
    // if event is type range or background, create a head and tail element
    // if the event is anything else, create an event
    if ( event.type === 'range' || event.type === 'background' ) {
      currentActions.push({ kind: 'HEAD', event, indent: currentIndent })
      currentActions.push({ kind: 'TAIL', event, indent: currentIndent })
    } else {
      currentActions.push({ kind: 'EVENT', event, indent: currentIndent })
    }

    console.log({ c: [...currentActions] })

    // will be either the head or the event
    const firstAction = currentActions.shift()
    if ( !firstAction ) {
      console.log( 'firstAction is null' )
      continue
    } else {
      console.log({ firstAction })
    }

    actions.push( firstAction )

    // if there are any more actions, increase the indent
    // and add the tail to the unpairedTails array
    if ( currentActions.length !== 0 ) {
      currentIndent += 1
      const tailAction = currentActions.shift()
      if ( !tailAction ) {
        console.log( 'tailAction is null' )
        continue
      }

      // check if the end date (tail) of the current event is before or after the end date (tail) of the latest unpaired tail
      // if it is current tail ends AFTER the latest unpaired tail, 
      if ( checkAgainstLatestTail( event.endDate.normalizedDateString, unpairedTails )) {
        actions.push( unpairedTails.pop()! )
        currentIndent--
      }

      unpairedTails.push( tailAction )
    }
  }

  // if there are any additional unpaired tails, push them to the actions array end to beginning order
  while ( unpairedTails.length > 0 ) {
    actions.push( unpairedTails.pop()! )
  }

  return actions
}
