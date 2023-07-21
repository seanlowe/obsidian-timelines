import type { TimelinesSettings } from './types'

import { TimelinesSettingTab, DEFAULT_SETTINGS } from './settings'
import { TimelineProcessor } from './block'
import { Plugin, MarkdownView } from 'obsidian'

export default class TimelinesPlugin extends Plugin {
  settings: TimelinesSettings

  async onload() {
    await this.loadSettings()
    console.log( 'Loaded Plugin: Timelines (Revamped)' )
    const proc = new TimelineProcessor( this.settings )
    const files = this.app.vault.getMarkdownFiles()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.registerMarkdownCodeBlockProcessor( 'ob-timeline', async ( source, el, ctx ) => {
      await proc.run( source, el, files, this.app.metadataCache, this.app.vault, false )
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.registerMarkdownCodeBlockProcessor( 'ob-timeline-flat', async ( source, el, ctx ) => {
      await proc.run( source, el, files, this.app.metadataCache, this.app.vault, true )
    })

    this.addCommand({
      id: 'render-static-timeline',
      name: 'Render Static Timeline',
      callback: async () => {
        const view = this.app.workspace.getActiveViewOfType( MarkdownView )
        if ( view ) {
          await proc.insertTimelineIntoCurrentNote(
            view,
            files,
            this.app.metadataCache,
            this.app.vault
          )
        }
      }
    })

    if ( this.settings.showRibbonCommand ) {
      this.addRibbonIcon( 'code-2', 'Insert Timeline Event', async () => {
        await this.addTimelineEvent( proc )
      })
    }

    this.addCommand({
      id: 'insert-timeline-event',
      name: 'Insert Timeline Event',
      callback: async () => {
        return await this.addTimelineEvent( proc )
      }
    })

    this.addSettingTab( new TimelinesSettingTab( this.app, this ))
  }

  onunload() {
    console.log( 'Unloaded Plugin: Timelines (Revamped)' )
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData( this.settings )
  }

  async addTimelineEvent( proc: TimelineProcessor ) {
    const view = this.app.workspace.getActiveViewOfType( MarkdownView )
    if ( view ) {
      await proc.createTimelineEventInCurrentNote( view )
    }
  }
}
