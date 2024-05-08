import { Color } from 'chroma-js'
import { FrontMatterCache, MetadataCache, TFile, Vault } from 'obsidian'

/* ------------------------------ */
/*              Enums             */
/* ------------------------------ */

export enum AcceptableEventElements {
  div = 'div',
  span = 'span',
}

export const developerSettings = {
  debug: false,
}

/* ------------------------------ */
/*           Interfaces           */
/* ------------------------------ */

export interface AddColorInput {
  color: Color,
  selector: string,
  addon?: string,
  alpha?: number
}

export interface CardContainer {
  id: string,
  className?: string,
  endDate: string,
  era: string,
  img: string,
  innerText: string,
  path: string,
  startDate: string,
  styles: EventStylesObject,
  title: string,
  type: string,
}

export interface ColorHexes {
  backgroundColor: string,
  borderColor: string,
  fontColor?: string,
}

export interface EventDataObject {
  endDate: string,
  era: string,
  eventImg: string,
  notePath: string,
  noteTitle: string,
  showOnTimeline: boolean | null,
  startDate: string,
  styles: EventStylesObject,
  tags: string,
  type: string,
}

// type that gets pushed into the vis-timeline items DataSet
export interface EventItem {
  id: number,
  className?: string,
  content: string,
  end: Date,
  path: string,
  start: Date,
  style?: string,
  type: string,
  // _event?: Partial<EventDataObject>,
  _colors?: ColorHexes
}

export interface EventStylesObject {
  fontColor: string | null,
  backgroundColor: string,
  borderColor: string | null,
  customClass?: string
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

export interface InternalTimelineArgs {
  divHeight: number,
  endDate: Date,
  maxDate: Date,
  minDate: Date,
  startDate: Date,
  tags: string[],
  type: string | null,
  zoomInLimit: number,
  zoomOutLimit: number,
}

export interface PreparedStyles {
  styleString: string,
  newStyles: VerifiedColorsObject
}

export interface TimelinesSettings {
  eventElement: AcceptableEventElements,
  frontMatterKeys: FrontMatterKeys,
  notePreviewOnHover: boolean,
  showEventCounter: boolean,
  sortDirection: boolean,
  timelineTag: string,
  maxDigits: string,
}

export interface VerifiedColorsObject {
  backgroundColor?: chroma.Color,
  borderColor?: chroma.Color,
  fontColor?: chroma.Color,
}

/* ------------------------------ */
/*              Types             */
/* ------------------------------ */

export type AllNotesData = NoteData[]

export type EventCountData = ( HTMLElement | FrontMatterCache | null )[]

export type NoteData = CardContainer[]
