import { renderToStaticMarkup } from 'react-dom/server'
import { ExampleTimelineV4 } from './final'

export const buildReactTimeline = ( el: HTMLElement ) => {
  const timelineDiv = document.createElement( 'div' )
  timelineDiv.setAttribute( 'class', 'timeline-react' )

  timelineDiv.innerHTML = renderToStaticMarkup( ExampleTimelineV4())

  el.appendChild( timelineDiv )
}
