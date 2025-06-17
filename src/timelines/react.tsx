import { createRoot } from 'react-dom/client'
import { Timeline } from '../react/timeline'
import { AllNotesData } from 'src/types'

/**
 * Build the vertical timeline (React version)
 *
 * @param timeline - the timeline html element
 * @param timelineNotes - notes which have our timeline tags
 * @param el - the element to append the timeline to
 */
export const buildReactTimeline = (
  timeline: HTMLElement,
  timelineNotes: AllNotesData,
  el: HTMLElement
) => {
  el.appendChild( timeline )

  // map from array of arrays to array of objects
  // [ [ {} ], [ {} ] ] to [ {}, {} ]
  const e = Array.from( Object.values( timelineNotes ).flat())
  const root = createRoot( timeline )

  // actually render the timeline
  root.render( <Timeline events={e} /> )
}
