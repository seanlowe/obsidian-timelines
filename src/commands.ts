import { Vault, MetadataCache, MarkdownView, Workspace, WorkspaceLeaf } from 'obsidian'

import { RENDER_TIMELINE } from './constants'
import TimelinesPlugin from './main'
import { TimelinesSettings } from './types'
import { confirmUserInEditor, getNumEventsInFile, logger } from './utils'

// link to dataview code:
// https://github.com/blacksmithgu/obsidian-dataview/blob/15b8d527e3d5822c5ef9bfd23f528a64769d545b/src/main.ts#L126C8-L139

// credit: blacksmithgu/obsidian-dataview, main.ts lines 126-128 (as of 7/4/24)
interface WorkspaceLeafRebuild extends WorkspaceLeaf {
  rebuildView(): void;
}

export class TimelineCommandProcessor {
  appVault: Vault
  metadataCache: MetadataCache
  plugin: TimelinesPlugin
  run: ( tagList: string, div: HTMLDivElement ) => Promise<void>
  settings: TimelinesSettings

  constructor(
    mainPluginInstance: TimelinesPlugin,
    runFunction: ( tagList: string, div: HTMLDivElement ) => Promise<void>
  ) {
    this.plugin = mainPluginInstance
    this.appVault = this.plugin.app.vault
    this.metadataCache = this.plugin.app.metadataCache
    this.settings = this.plugin.settings
    this.run = runFunction
  }

  handleStatusBarUpdates = async ( plugin: TimelinesPlugin ) => {
    logger( 'handleStatusBarUpdates | ' )
    if ( !this.settings.showEventCounter ) {
      // ensure the status bar item is removed
      if ( plugin.statusBarItem ) {
        plugin.statusBarItem.remove()
      }

      return
    }

    // if the status bar item has not been created yet, create it
    if ( !plugin.statusBarItem ) {
      this.createStatusBar( plugin )

      return
    }

    this.updateStatusBarText( plugin )
  }

  createStatusBar = async ( plugin: TimelinesPlugin ) => {
    plugin.statusBarItem = plugin.addStatusBarItem()
    plugin.statusBarItem.createEl( 'span', { text: '', })
    this.updateStatusBarText( plugin )
    plugin.registerEvent(
      plugin.app.workspace.on( 'file-open', plugin.onFileOpen.bind( this ))
    )
  }

  /**
   * Get the number of events to build the "Timeline: X event(s)" span in the status bar
   *
   * @param workspace
   */
  getStatusBarText = async ( workspace: Workspace ): Promise<string> => {
    const file = workspace.getActiveViewOfType( MarkdownView )?.file

    if ( !file ) {
      return ''
    }

    const { totalEvents } = await getNumEventsInFile({ file, appVault: this.appVault, fileCache: this.metadataCache }, null )

    switch ( totalEvents ) {
    case 0:
      return 'Timeline: No events'
    case 1:
      return 'Timeline: 1 event'
    default:
      return `Timeline: ${totalEvents} events`
    }
  }

  updateStatusBarText = async ( plugin: TimelinesPlugin ) => {
    const text = await this.getStatusBarText( plugin.app.workspace )
    if ( text === '' ) {
      return
    }

    plugin.statusBarItem.setText( text )
  }

  /**
   * Create an empty timeline event in the current note
   *
   * @param sourceView
   */
  createTimelineEventInCurrentNote = async () => {
    const editor = confirmUserInEditor( this.plugin.app.workspace )

    // create a div element with the correct data attributes
    const newEventElement = document.createElement( this.settings.eventElement )
    newEventElement.setAttribute( 'class', 'ob-timelines' )
    newEventElement.setAttribute( 'data-title', '' )
    newEventElement.setAttribute( 'data-description', '' )
    newEventElement.setAttribute( 'data-classes', '' )
    newEventElement.setAttribute( 'data-color', '' )
    newEventElement.setAttribute( 'data-type', '' )
    newEventElement.setAttribute( 'data-start-date', '' )
    newEventElement.setAttribute( 'data-end-date', '' )
    newEventElement.setAttribute( 'data-era', '' )
    newEventElement.setAttribute( 'data-path', '' )
    newEventElement.setAttribute( 'data-tags', '' )
    newEventElement.setAttribute( 'data-points-to', '' )
    newEventElement.setText( 'New Event' )

    // add a newline and a tab after each data attribute
    let newElHtml = newEventElement.outerHTML.replace( /" /g, '"\n\t' )

    const regex = new RegExp( `>(\\s*.*?)\\s*</(${this.settings.eventElement})>`, 'g' )

    // put the new element's content text on it's own line and indent it, then add a newline
    newElHtml = newElHtml.replace( regex, `>\n\t$1\n</${this.settings.eventElement}>\n` )

    // insert the new element at the cursor position
    editor.replaceRange( newElHtml, editor.getCursor())

    // update the status bar item to reflect the new event
    await this.handleStatusBarUpdates( this.plugin )
  }

  createTimelineEventFrontMatterInCurrentNote = async () => {
    const editor = confirmUserInEditor( this.plugin.app.workspace )

    const frontmatterJson = {
      title: '',
      description: '',
      classes: '',
      color: '',
      type: '',
      startDate: '',
      endDate: '',
      era: '',
      path: '',
      tags: [],
      pointsTo: '',
      showOnTimeline: true
    }

    // start a string variable that will hold the frontmatter
    let frontmatter = '---\n'
    frontmatter += JSON.stringify( frontmatterJson ) + '\n'
    frontmatter += '---\n\n'

    // insert the frontmatter at the beginning of the current note
    editor.replaceRange( frontmatter, { line: 0, ch: 0 })

    await this.handleStatusBarUpdates( this.plugin )
  }

  /**
   * Insert the statically generated timeline into the current note
   *
   * @param sourceView
   */
  insertTimelineIntoCurrentNote = async (
    sourceView: MarkdownView,
  ) => {
    const editor = sourceView.editor
    if ( !editor ) return

    const source = editor.getValue()
    const match = RENDER_TIMELINE.exec( source )
    if ( !match || match.length === 1 ) return

    const tagList = `tags=${match[1]}`
    logger( 'insertTimelineIntoCurrentNote | taglist', tagList )

    const div = document.createElement( 'div' )
    await this.run( tagList, div )

    const renderedString = `<div class="timeline-rendered">${new Date().toString()}</div>`
    const rendered = ( new DOMParser()).parseFromString( renderedString, 'text/html' ).body.firstChild
    if ( !rendered ) {
      throw new Error( 'Could not generate the statically rendered timeline' )
    }
    div.appendChild( rendered )

    const firstCommentEndIndex = source.indexOf( '-->' )
    const lastCommentStartIndex = source.lastIndexOf( '<!--' )

    editor.replaceRange(
      ( new XMLSerializer()).serializeToString( div ),
      { ch: firstCommentEndIndex + 2, line: 1 },
      { ch: lastCommentStartIndex - 1, line: 1 },
      source
    )
  }

  /**
   * Reload the current note without having to reload the entire application.
   *
   * @param {MarkdownView} view - the current view (the note, it's just the note.)
   */
  reloadNote = ( view: MarkdownView ) => {
    // credit: blacksmithgu/obsidian-dataview, main.ts lines 135-137 (as of 7/4/24)
    if ( view ) {
      ( view.leaf as WorkspaceLeafRebuild ).rebuildView()
    }
  }
}
