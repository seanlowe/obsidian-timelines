import { FrontMatterCache, MetadataCache, TFile, Vault } from 'obsidian'
import { DataItem } from 'vis-timeline'

/* ------------------------------ */
/*              Enums             */
/* ------------------------------ */

export enum AcceptableEventElements {
  div = 'div',
  span = 'span',
}

/* ------------------------------ */
/*           Interfaces           */
/* ------------------------------ */

export interface CleanedDateResultObject {
  // full items
  cleanedDateString: string,
  minimizedDateString: string,
  normalizedDateString: string,
  originalDateString: string,

  // parts
  day: number,
  hour: number,
  month: number,
  year: number
}

export interface CardContainer {
  id: string,
  body: string,
  classes: string,
  color: string,
  endDate: CleanedDateResultObject,
  era: string,
  img: string,
  path: string,
  startDate: CleanedDateResultObject,
  title: string,
  type: string,
}

export interface EventDataObject {
  classes: string,
  color: string,
  endDate: string,
  era: string,
  eventImg: string,
  noteBody: string,
  notePath: string,
  noteTitle: string,
  showOnTimeline: boolean | null,
  startDate: string,
  tags: string,
  type: string,
}

export interface EventItem {
  id: number,
  className: string,
  content: string,
  end: Date | undefined,
  path: string,
  start: Date,
  type: string,
  _event?: Partial<CardContainer>,
}

export interface EventTypeNumbers {
  numEvents: number,
  numFrontMatter: number,
  totalEvents: number,
}

export interface FrontMatterKeys {
  endDateKey: string[],
  startDateKey: string[],
  titleKey: string[],
}

export interface GetFileDataInput {
  file: TFile | null,
  appVault: Vault | null,
  fileCache: MetadataCache | null,
}

export interface HorizontalTimelineInput {
  args: InternalTimelineArgs,
  dates: string[],
  div: HTMLElement,
  el: HTMLElement,
  notes: AllNotesData,
  settings: TimelinesSettings,
}

export interface InternalTimelineArgs {
  divHeight: number,
  endDate: Date,
  maxDate: Date,
  minDate: Date,
  startDate: Date,
  tags: ParsedTagObject,
  type: string | null,
  zoomInLimit: number,
  zoomOutLimit: number,
}

export interface ParsedTagObject {
  tagList: string[],
  optionalTags: string[],
}

export interface TimelinesSettings {
  eventElement: AcceptableEventElements,
  frontMatterKeys: FrontMatterKeys,
  notePreviewOnHover: boolean,
  showEventCounter: boolean,
  sortDirection: boolean,
  timelineTag: string,
  maxDigits: string,
  verticalTimelineDateDisplayFormat: string,
}

/* ------------------------------ */
/*              Types             */
/* ------------------------------ */

export type AllNotesData = ( CardContainer[] )[]
export type CombinedTimelineEventData = EventItem & DataItem
export type DivWithCalcFunc = HTMLDivElement & { calcLength?: () => void }
export type EventCountData = ( HTMLElement | FrontMatterCache | null )[]
