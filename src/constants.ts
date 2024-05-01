import { AcceptableEventElements, FrontMatterKeys, TimelinesSettings } from './types'

// THESE two constants go together

export const AVAILABLE_COLORS = ['orange', 'blue', 'green', 'red', 'purple', 'yellow', 'pink', 'gray']
export const TIMELINE_ELEMENT_TYPES = [ 'vis-background', 'vis-box', 'vis-point', 'vis-range', 'vis-line', 'vis-dot' ]

// STOP - did you remember to change the matching variables in variables.scss?

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
  sortDirection: true,
  timelineTag: 'timeline',
  maxDigits: '5',
}

export const RENDER_TIMELINE: RegExp = /<!--TIMELINE BEGIN tags=['"]([^"]*?)['"]-->([\s\S]*?)<!--TIMELINE END-->/i
