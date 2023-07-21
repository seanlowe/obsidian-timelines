import { AcceptableEventElements, TimelinesSettings } from './types'

import { App, PluginSettingTab, Setting } from 'obsidian'
import TimelinesPlugin from './main'

export const DEFAULT_SETTINGS: TimelinesSettings = {
  timelineTag: 'timeline',
  sortDirection: true,
  eventElement: AcceptableEventElements.div,
  showRibbonCommand: true,
}

export const RENDER_TIMELINE: RegExp = /<!--TIMELINE BEGIN tags=['"]([^"]*?)['"]-->([\s\S]*?)<!--TIMELINE END-->/i

export class TimelinesSettingTab extends PluginSettingTab {
  plugin: TimelinesPlugin

  constructor( app: App, plugin: TimelinesPlugin ) {
    super( app, plugin )
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()
    containerEl.createEl( 'h2', { text: 'Timelines (Revamped) Settings' })

    new Setting( containerEl )
      .setName( 'Default timeline tag' )
      .setDesc( 'Tag to specify which notes to include in created timelines e.g. timeline for #timeline tag' )
      .addText(( text ) => {
        return text
          .setPlaceholder( this.plugin.settings.timelineTag )
          .onChange( async ( value: string ) => {
            this.plugin.settings.timelineTag = value
            await this.plugin.saveSettings()
          })
      })

    new Setting( containerEl )
      .setName( 'Chronological Direction' )
      .setDesc( 'Default sorting is OLD -> NEW. Turn this setting off for NEW -> OLD' )
      .addToggle(( toggle ) => {
        toggle.setValue( this.plugin.settings.sortDirection )
        toggle.onChange( async ( value: boolean ) => {
          this.plugin.settings.sortDirection = value
          await this.plugin.saveSettings()
        })
      })

    new Setting( containerEl )
      .setName( 'Event Element Tag (HTML)' )
      .setDesc( 'Default: div. Right now the two acceptable values are: div, and span.' )
      .addText(( text ) => {
        return text
          .setPlaceholder( this.plugin.settings.eventElement )
          .onChange( async ( value: AcceptableEventElements ) => {
            this.plugin.settings.eventElement = value
            await this.plugin.saveSettings()
          })
      })

    const fragment = document.createDocumentFragment()
    const div = document.createElement( 'div' )
    div.innerHTML = `Default: on. Turn this setting on to show a button on the ribbon to quickly insert new events.
        <br></br><strong>NOTE:</strong> Requires an app restart for changes to take effect.`
    fragment.appendChild( div )

    new Setting( containerEl )
      .setName( 'Show Ribbon Button' )
      .setDesc( fragment )
      .addToggle(( toggle ) => {
        toggle.setValue( this.plugin.settings.showRibbonCommand )
        toggle.onChange( async ( value: boolean ) => {
          this.plugin.settings.showRibbonCommand = value
          await this.plugin.saveSettings()
        })
      })
  }
}
