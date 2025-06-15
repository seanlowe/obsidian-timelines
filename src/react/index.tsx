import { createRoot } from 'react-dom/client'
import { Timeline } from './final/timeline'
import { AllNotesData } from 'src/types'

export const buildReactTimeline = (
  timeline: HTMLElement,
  timelineNotes: AllNotesData,
  el: HTMLElement
) => {
  el.appendChild( timeline )
  const e = Array.from( Object.values( timelineNotes ).flat())
  const root = createRoot( timeline )
  root.render( <Timeline events={e} /> )
}
