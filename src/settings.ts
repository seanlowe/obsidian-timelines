import { App, PluginSettingTab, Setting } from 'obsidian'

import TimelinesPlugin from './main'
import { DEVELOPER_SETTINGS } from './constants'
import { AcceptableEventElements } from './types'

export class TimelinesSettingTab extends PluginSettingTab {
  plugin: TimelinesPlugin

  constructor( app: App, plugin: TimelinesPlugin ) {
    super( app, plugin )
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

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
      .setName( 'Chronological direction' )
      .setDesc( 'When enabled, events will be sorted from old to new. Turn this setting off to sort from new to old.' )
      .addToggle(( toggle ) => {
        toggle.setValue( this.plugin.settings.sortDirection )
        toggle.onChange( async ( value: boolean ) => {
          this.plugin.settings.sortDirection = value
          await this.plugin.saveSettings()
        })
      })

    const acceptableValuesString = Object.values( AcceptableEventElements ).join( ', ' )
    new Setting( containerEl )
      .setName( 'Event element tag (HTML)' )
      .setDesc( `Default: div. Acceptable values are: ${acceptableValuesString}` )
      .addText(( text ) => {
        return text
          .setPlaceholder( this.plugin.settings.eventElement )
          .onChange( async ( value: AcceptableEventElements ) => {
            if ( Object.values( AcceptableEventElements ).includes( value )) {
              this.plugin.settings.eventElement = value
              await this.plugin.saveSettings()
            }
          })
      })

    let maxDigitDescription = 'Default: 5. Sorting of dates are handled by padding each section'
    maxDigitDescription += ' with zeros until they are all the same length. This number will'
    maxDigitDescription += ' be the max amount of digits a section of a date can have.'
    new Setting( containerEl )
      .setName( 'Maximum padding on dates' )
      .setDesc( maxDigitDescription )
      .addText(( text ) => {
        return text
          .setPlaceholder( this.plugin.settings.maxDigits )
          .onChange( async ( value: string ) => {
            const parsed = parseInt( value )
            if ( parsed ) {
              this.plugin.settings.maxDigits = parsed.toString()
              await this.plugin.saveSettings()
            }
          })
      })

    new Setting( containerEl )
      .setName( 'Show event counter' )
      .setDesc(
        `Default: on. Adds an element to the editor status bar showing the total number
        of events in the current file. Helpful for vaults with lots of events.`
      )
      .addToggle(( toggle ) => {
        toggle.setValue( this.plugin.settings.showEventCounter )
        toggle.onChange( async ( value: boolean ) => {
          this.plugin.settings.showEventCounter = value
          await this.plugin.saveSettings()
        })
      })

    new Setting( containerEl )
      .setName( 'Display note preview on hover' )
      .setDesc( 'When enabled, linked notes will display as a pop up when hovering over an event in the timeline.' )
      .addToggle(( toggle ) => {
        toggle.setValue( this.plugin.settings.notePreviewOnHover )
        toggle.onChange( async ( value ) => {
          this.plugin.settings.notePreviewOnHover = value
          await this.plugin.saveSettings()
        })
      })

    new Setting( containerEl )
      .setName( 'Vertical Timeline Date Display Format' )
      .setDesc( 
        `Specify the format for the date displayed in the vertical timeline. Check the docs
        for information on acceptable formatting tokens. Defaults to "YYYY-MM-DD-HH".`
      )
      .addText(( text ) => {
        return text
          .setPlaceholder( '' )
          .onChange( async ( value ) => {
            this.plugin.settings.verticalTimelineDateDisplayFormat = value
            await this.plugin.saveSettings()
          })
      })

    containerEl.createEl( 'h6', { text: 'Customize frontmatter keys' }).appendChild(
      createEl( 'p', {
        text: `Specify the front matter keys used to extract start dates, end dates,
         and titles for the timeline notes. Defaults to 'start-date', 'end-date', and 'title'.`,
        cls: 'setting-item-description'
      })
    )

    new Setting( containerEl )
      .setName( 'Start date keys' )
      .setDesc( 'Comma-separated list of frontmatter keys for start date. Example: start-date,fc-date' )
      .addText(( text ) => {
        return text
          .setPlaceholder( this.plugin.settings.frontMatterKeys.startDateKey.join( ',' ))
          .onChange( async ( value ) => {
            this.plugin.settings.frontMatterKeys.startDateKey = value.split( ',' )
            await this.plugin.saveSettings()
          })
      })

    new Setting( containerEl )
      .setName( 'End date keys' )
      .setDesc( 'Comma-separated list of frontmatter keys for end date.' )
      .addText(( text ) => {
        return text
          .setPlaceholder( this.plugin.settings.frontMatterKeys.endDateKey.join( ',' ))
          .onChange( async ( value ) => {
            this.plugin.settings.frontMatterKeys.endDateKey = value.split( ',' )
            await this.plugin.saveSettings()
          })
      })

    new Setting( containerEl )
      .setName( 'Title keys' )
      .setDesc( 'Comma-separated list of frontmatter keys for title.' )
      .addText(( text ) => {
        return text
          .setPlaceholder( this.plugin.settings.frontMatterKeys.titleKey.join( ',' ))
          .onChange( async ( value ) => {
            this.plugin.settings.frontMatterKeys.titleKey = value.split( ',' )
            await this.plugin.saveSettings()
          })
      })

    containerEl.createEl( 'h6', { text: 'Developer tools' })
    new Setting( containerEl )
      .setName( 'Debug mode' )
      .setDesc(
        `If you are having an issue or have been asked to look at the logs, turn this on to see logs in the console.
        Debug mode will default to off on plugin load and the current value will not be saved.`
      )
      .addToggle(( toggle ) => {
        toggle.setValue( DEVELOPER_SETTINGS.debug )
        toggle.onChange(( value ) => {
          DEVELOPER_SETTINGS.debug = value
        })
      })
  }
}
