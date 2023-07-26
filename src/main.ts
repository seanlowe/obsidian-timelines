import type { TimelinesSettings } from './types'

import { TimelinesSettingTab, DEFAULT_SETTINGS } from './settings'
import { TimelineProcessor } from './block'
import { Plugin, MarkdownView } from 'obsidian'

export default class TimelinesPlugin extends Plugin {
  settings: TimelinesSettings
  statusBarItem: HTMLElement
  proc: TimelineProcessor

  async onload() {
    await this.loadSettings()
    console.log( 'Loaded Plugin: Timelines (Revamped)' )
    this.proc = new TimelineProcessor( this.settings, this.app.metadataCache, this.app.vault )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.registerMarkdownCodeBlockProcessor( 'ob-timeline', async ( source, el, ctx ) => {
      await this.proc.run( source, el, false )
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.registerMarkdownCodeBlockProcessor( 'ob-timeline-flat', async ( source, el, ctx ) => {
      await this.proc.run( source, el, true )
    })

    this.addCommand({
      id: 'render-static-timeline',
      name: 'Render Static Timeline',
      callback: async () => {
        const view = this.app.workspace.getActiveViewOfType( MarkdownView )
        if ( view ) {
          await this.proc.insertTimelineIntoCurrentNote( view )
        }
      }
    })

    if ( this.settings.showRibbonCommand ) {
      this.addRibbonIcon( 'code-2', 'Insert Timeline Event', async () => {
        await this.addTimelineEvent( this.proc )
      })
    }

    this.addCommand({
      id: 'insert-timeline-event',
      name: 'Insert Timeline Event',
      callback: async () => {
        return await this.addTimelineEvent( this.proc )
      }
    })

    if ( this.settings.showEventCounter ) {
      this.createStatusBar()
    }

    this.addSettingTab( new TimelinesSettingTab( this.app, this ))
  }

  async onFileOpen() {
    this.handleStatusBarUpdates()
  }

  onunload() {
    console.log( 'Unloaded Plugin: Timelines (Revamped)' )
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    this.handleStatusBarUpdates()

    await this.saveData( this.settings )
  }

  /* ----------------- */

  async addTimelineEvent( proc: TimelineProcessor ) {
    const view = this.app.workspace.getActiveViewOfType( MarkdownView )
    if ( view ) {
      await proc.createTimelineEventInCurrentNote( view )
    }
  }

  async handleStatusBarUpdates() {
    if ( !this.settings.showEventCounter ) {
      // ensure the status bar item is removed
      if ( this.statusBarItem ) {
        this.statusBarItem.remove()
        this.statusBarItem = null
      }

      return
    }

    // if the status bar item has not been created yet, create it
    if ( !this.statusBarItem ) {
      this.createStatusBar()

      return
    }

    this.updateStatusBarText()
  }

  async createStatusBar() {
    this.statusBarItem = this.addStatusBarItem()
    this.statusBarItem.createEl( 'span', { text: '', })
    this.updateStatusBarText()
    this.registerEvent(
      this.app.workspace.on( 'file-open', this.onFileOpen.bind( this ))
    )
  }

  async updateStatusBarText() {
    const text = await this.proc.getStatusBarText( this.app.workspace )
    this.statusBarItem.setText( text )
  }
}
