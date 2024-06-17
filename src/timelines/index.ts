export * from './horizontal'
export * from './vertical'

export async function showEmptyTimelineMessage( el: HTMLElement, tagList: string[] ) {
  const timelineDiv = document.createElement( 'div' )
  timelineDiv.setAttribute( 'class', 'empty-timeline' )
  const message = `No events found for tags: [ '${tagList.join( "', '" )}' ]`

  timelineDiv.createEl( 'p', { text: message })
  el.appendChild( timelineDiv )
}
