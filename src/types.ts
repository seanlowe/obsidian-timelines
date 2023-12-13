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
  counter: 0,
}

/* ------------------------------ */
/*           Interfaces           */
/* ------------------------------ */

export interface TimelineArgs {
  [key: string]: string | string[] | null,
}

export interface CardContainer {
  color: string,
  endDate: string,
  era: string,
  img: string,
  innerText: string,
  path: string,
  startDate: string,
  title: string,
  type: string,
}

export interface EventDataObject {
  color: string,
  endDate: string,
  era: string,
  eventImg: string,
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
  end: Date,
  path: string,
  start: Date,
  type: string,
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

export interface TimelinesSettings {
  eventElement: AcceptableEventElements,
  frontMatterKeys: FrontMatterKeys,
  notePreviewOnHover: boolean,
  showEventCounter: boolean,
  showRibbonCommands: boolean,
  sortDirection: boolean,
  timelineTag: string,
  maxDigits: string,
}

/* ------------------------------ */
/*              Types             */
/* ------------------------------ */

export type NoteData = CardContainer[]
export type AllNotesData = NoteData[]
export type EventCountData = ( HTMLElement | FrontMatterCache | null )[]
