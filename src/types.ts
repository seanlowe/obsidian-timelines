export interface TimelinesSettings {
  eventElement: AcceptableEventElements,
  showEventCounter: boolean,
  showRibbonCommand: boolean,
  sortDirection: boolean,
  timelineTag: string,
}

export const developerSettings = {
  debug: false,
  counter: 0,
}

export interface TimelineArgs {
  [key: string]: string | string[],
}

export interface CardContainer {
  startDate: string,
  title: string,
  img: string,
  innerHTML: string,
  path: string,
  endDate: string,
  type: string,
  class: string,
  era: string
}

export interface EventItem {
  id: number,
  content: string,
  title: string,
  start: Date,
  className: string,
  type: string,
  end: Date
}

export type NoteData = CardContainer[]
export type AllNotesData = NoteData[]

export enum AcceptableEventElements {
  div = 'div',
  span = 'span',
}
