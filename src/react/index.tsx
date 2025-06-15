import { renderToStaticMarkup } from 'react-dom/server'
// import { ExampleTimelineV1 } from './v1'
// import { ExampleTimelineV2 } from './v2'
// import { ExampleTimelineV3 } from './v3'
import { ExampleTimelineV4 } from './v4'

export const buildReactTimeline = ( el: HTMLElement ) => {
  const timelineDiv = document.createElement( 'div' )
  timelineDiv.setAttribute( 'class', 'timeline-react' )

  // v1
  // timelineDiv.innerHTML = renderToStaticMarkup( ExampleTimelineV1())

  // v2
  // timelineDiv.innerHTML = renderToStaticMarkup( ExampleTimelineV2())
  
  // v3
  // timelineDiv.innerHTML = renderToStaticMarkup( ExampleTimelineV3())

  // v4
  timelineDiv.innerHTML = renderToStaticMarkup( ExampleTimelineV4())

  el.appendChild( timelineDiv )
}
