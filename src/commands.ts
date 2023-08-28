import { Vault, MetadataCache, MarkdownView, Workspace } from 'obsidian'
import { TimelinesSettings } from './types'
import { confirmUserInEditor, getNumEventsInFile } from './utils'
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
    console.log( 'in handleStatusBarUpdates' )
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
    newEventElement.setAttribute( 'data-description', '' )
    newEventElement.setAttribute( 'data-class', '' )
    newEventElement.setAttribute( 'data-type', '' )
    newEventElement.setAttribute( 'data-start-date', '' )
    newEventElement.setAttribute( 'data-end-date', '' )
    newEventElement.setAttribute( 'data-era', '' )
    newEventElement.setAttribute( 'data-path', '' )
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

    // start a string variable that will hold the frontmatter
    let frontmatter = '---\n'
    frontmatter += 'title: \n'
    frontmatter += 'description: \n'
    frontmatter += 'class: \n'
    frontmatter += 'type: \n'
    frontmatter += 'start-date: \n'
    frontmatter += 'end-date: \n'
    frontmatter += 'era: \n'
    frontmatter += 'path: \n'
    frontmatter += '---\n\n'

    // insert the frontmatter at the beginning of the current note
    editor.replaceRange( frontmatter, { line: 0, ch: 0 })
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

    const numEvents = await getNumEventsInFile( file, this.appVault, this.metadataCache )

    return `Timeline: ${numEvents} ${numEvents === 1 ? 'event' : 'events'}`
  }
}
