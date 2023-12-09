import { AcceptableEventElements, FrontMatterKeys, TimelinesSettings } from './types'

export const DEFAULT_FRONTMATTER_KEYS: FrontMatterKeys = {
  endDateKey: ['endDate', 'end-date'],
  startDateKey: ['startDate', 'start-date'],
  titleKey: ['title'],
}

export const DEFAULT_SETTINGS: TimelinesSettings = {
  eventElement: AcceptableEventElements.div,
  frontMatterKeys: DEFAULT_FRONTMATTER_KEYS,
  notePreviewOnHover: true,
  showEventCounter: false,
  showRibbonCommand: false,
  sortDirection: true,
  timelineTag: 'timeline',
}

export const RENDER_TIMELINE: RegExp = /<!--TIMELINE BEGIN tags=['"]([^"]*?)['"]-->([\s\S]*?)<!--TIMELINE END-->/i
