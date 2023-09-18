import type { TimelinesSettings } from './types'

import { TimelineProcessor } from './block'
import { DEFAULT_SETTINGS } from './constants'
import { Plugin, MarkdownView } from 'obsidian'
import { TimelinesSettingTab } from './settings'
import { TimelineCommandProcessor } from './commands'
import { logger } from './utils'

export default class TimelinesPlugin extends Plugin {
  pluginName: string = 'Timelines (Revamped)'
  settings: TimelinesSettings
  statusBarItem: HTMLElement
  blockProc: TimelineProcessor
  commandProc: TimelineCommandProcessor

  initialize = async () => {
    console.log( `Initializing Plugin: ${this.pluginName}` )
    this.settings = Object.assign({}, DEFAULT_SETTINGS, this.loadData())
    this.blockProc = new TimelineProcessor( this.settings, this.app.metadataCache, this.app.vault )
    this.commandProc = new TimelineCommandProcessor( this )
  }

  onload = async () => {
    await this.initialize()
    console.log( `Loaded Plugin: ${this.pluginName}` )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.registerMarkdownCodeBlockProcessor( 'ob-timeline', async ( source, el, ctx ) => {
      await this.blockProc.run( source, el, false )
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.registerMarkdownCodeBlockProcessor( 'ob-timeline-flat', async ( source, el, ctx ) => {
      await this.blockProc.run( source, el, true )
    })

    this.addCommand({
      id: 'render-static-timeline',
      name: 'Render Static Timeline',
      callback: async () => {
        const view = this.app.workspace.getActiveViewOfType( MarkdownView )
        if ( view ) {
          await this.blockProc.insertTimelineIntoCurrentNote( view )
        }
      }
    })

    this.addCommand({
      id: 'insert-timeline-event',
      name: 'Insert Timeline Event',
      callback: async () => {
        return await this.commandProc.createTimelineEventInCurrentNote()
      }
    })

    this.addRibbonIcon( 'list-plus', 'Insert Timeline Event (Frontmatter)', async () => {
      await this.commandProc.createTimelineEventFrontMatterInCurrentNote()
    })

    this.addSettingTab( new TimelinesSettingTab( this.app, this ))

    /* --- setting specific checks --- */

    if ( this.settings.showRibbonCommand ) {
      this.addRibbonIcon( 'code-2', 'Insert Timeline Event', async () => {
        await this.commandProc.createTimelineEventInCurrentNote()
      })
    }

    if ( this.settings.showEventCounter ) {
      this.commandProc.createStatusBar( this )
    }
  }

  onFileOpen = async () => {
    if ( !this.commandProc ) {
      logger( 'Command processor was not initialized' )

      await this.initialize()
    }

    this.commandProc.handleStatusBarUpdates( this )
  }

  onunload = () => {
    console.log( `Unloaded Plugin: ${this.pluginName}` )
  }

  saveSettings = async () => {
    this.commandProc.handleStatusBarUpdates( this )

    await this.saveData( this.settings )
  }
}
