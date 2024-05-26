import { Vault, MetadataCache, MarkdownView, Workspace } from 'obsidian'
import { TimelinesSettings } from './types'
import { confirmUserInEditor, getNumEventsInFile, logger } from './utils'
import TimelinesPlugin from './main'

export class TimelineCommandProcessor {
  plugin: TimelinesPlugin
  appVault: Vault
  metadataCache: MetadataCache
  settings: TimelinesSettings

  constructor( mainPluginInstance: TimelinesPlugin ) {
    this.plugin = mainPluginInstance
    this.appVault = this.plugin.app.vault
    this.metadataCache = this.plugin.app.metadataCache
    this.settings = this.plugin.settings
  }

  handleStatusBarUpdates = async ( plugin: TimelinesPlugin ) => {
    logger( 'in handleStatusBarUpdates' )
    if ( !this.settings.showEventCounter ) {
      // ensure the status bar item is removed
      if ( plugin.statusBarItem ) {
        plugin.statusBarItem.remove()
        plugin.statusBarItem = null
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

  updateStatusBarText = async ( plugin: TimelinesPlugin ) => {
    const text = await this.getStatusBarText( plugin.app.workspace )
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
    newEventElement.setAttribute( 'data-color', '' )
    newEventElement.setAttribute( 'data-type', '' )
    newEventElement.setAttribute( 'data-start-date', '' )
    newEventElement.setAttribute( 'data-end-date', '' )
    newEventElement.setAttribute( 'data-era', '' )
    newEventElement.setAttribute( 'data-path', '' )
    newEventElement.setAttribute( 'data-tags', '' )
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
      color: '',
      type: '',
      startDate: '',
      endDate: '',
      era: '',
      path: '',
      tags: [],
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
   * Get the number of events to build the "Timeline: X event(s)" span in the status bar
   *
   * @param workspace
   */
  getStatusBarText = async ( workspace: Workspace ): Promise<string | null> => {
    const file = workspace.getActiveViewOfType( MarkdownView )?.file

    if ( !file ) {
      return null
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
}
