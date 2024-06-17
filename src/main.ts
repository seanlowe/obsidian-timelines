import type { TimelinesSettings } from './types'

import { TimelineBlockProcessor } from './block'
import { DEFAULT_SETTINGS } from './constants'
import { Plugin, MarkdownView } from 'obsidian'
import { TimelinesSettingTab } from './settings'
import { TimelineCommandProcessor } from './commands'
import { logger } from './utils'

export default class TimelinesPlugin extends Plugin {
  pluginName: string = this.manifest.name
  settings: TimelinesSettings
  statusBarItem: HTMLElement
  blocks: TimelineBlockProcessor
  commands: TimelineCommandProcessor

  initialize = async () => {
    console.log( `Initializing Plugin: ${this.pluginName}` )

    const loaded = await this.loadData()
    this.settings = { ...DEFAULT_SETTINGS, ...loaded }
    this.blocks = new TimelineBlockProcessor( this.settings, this.app.metadataCache, this.app.vault )
    this.commands = new TimelineCommandProcessor( this, this.blocks.run.bind( this.blocks ))
  }

  onload = async () => {
    await this.initialize()
    console.log( `Loaded Plugin: ${this.pluginName}` )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.registerMarkdownCodeBlockProcessor( 'ob-timeline', async ( source, el, ctx ) => {
      await this.blocks.run( source, el )
    })

    this.addCommand({
      id: 'render-static-timeline',
      name: 'Render static timeline',
      checkCallback: ( checking: boolean ) => {
        const markdownView = this.app.workspace.getActiveViewOfType( MarkdownView )
        if ( markdownView ) {
          // If checking is true, we're simply "checking" if the command can be run.
          // If checking is false, then we want to actually perform the operation.
          if ( !checking ) {
            this.commands.insertTimelineIntoCurrentNote( markdownView )
          }

          return true
        }
      }
    })

    this.addCommand({
      id: 'insert-timeline-event',
      name: 'Insert timeline event',
      checkCallback: ( checking: boolean ) => {
        const markdownView = this.app.workspace.getActiveViewOfType( MarkdownView )
        if ( markdownView ) {
          if ( !checking ) {
            this.commands.createTimelineEventInCurrentNote()
          }

          return true
        }
      }
    })

    this.addCommand({
      id: 'insert-timeline-event-frontmatter',
      name: 'Insert timeline event (frontmatter)',
      checkCallback: ( checking: boolean ) => {
        const markdownView = this.app.workspace.getActiveViewOfType( MarkdownView )
        if ( markdownView ) {
          if ( !checking ) {
            this.commands.createTimelineEventFrontMatterInCurrentNote()
          }

          return true
        }
      }
    })

    this.addSettingTab( new TimelinesSettingTab( this.app, this ))

    this.addRibbonIcon( 'code-2', 'Insert Timeline Event', async () => {
      await this.commands.createTimelineEventInCurrentNote()
    })

    this.addRibbonIcon( 'list-plus', 'Insert Timeline Event (Frontmatter)', async () => {
      await this.commands.createTimelineEventFrontMatterInCurrentNote()
    })

    if ( this.settings.showEventCounter ) {
      this.commands.createStatusBar( this )
    }
  }

  onFileOpen = async () => {
    if ( !this.commands ) {
      logger( 'Command processor was not initialized' )

      await this.initialize()
    }

    this.commands.handleStatusBarUpdates( this )
  }

  onunload = () => {
    console.log( `Unloaded Plugin: ${this.pluginName}` )
  }

  saveSettings = async () => {
    this.commands.handleStatusBarUpdates( this )

    await this.saveData( this.settings )
  }
}
