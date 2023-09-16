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
  [key: string]: string | string[],
}

export interface CardContainer {
  class: string,
  endDate: string,
  era: string,
  img: string,
  innerHTML: string,
  path: string,
  startDate: string,
  title: string,
  type: string,
}

export interface EventDataObject {
  endDate: string,
  era: string,
  eventImg: string,
  noteClass: string,
  notePath: string,
  noteTitle: string,
  startDate: string,
  type: string,
}

export interface EventItem {
  id: number,
  className: string,
  content: string,
  end: Date,
  path: string,
  start: Date,
  title: string,
  type: string,
}

export interface FrontMatterKeys {
  endDateKey: string[],
  startDateKey: string[],
  titleKey: string[],
}

export interface TimelinesSettings {
  eventElement: AcceptableEventElements,
  frontMatterKeys: FrontMatterKeys,
  notePreviewOnHover: boolean,
  showEventCounter: boolean,
  showRibbonCommand: boolean,
  sortDirection: boolean,
  timelineTag: string,
}

/* ------------------------------ */
/*              Types             */
/* ------------------------------ */

export type AllNotesData = NoteData[]
export type NoteData = CardContainer[]
