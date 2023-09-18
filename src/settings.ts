import { AcceptableEventElements, developerSettings } from './types'
import { App, PluginSettingTab, Setting } from 'obsidian'
import TimelinesPlugin from './main'
import { logger } from './utils'

const enableDeveloperSettings = (): void => {
  logger( 'clicked on the h2' )
  developerSettings.counter += 1
  if ( developerSettings.counter >= 5 ) {
    developerSettings.debug = true
  }
}

export class TimelinesSettingTab extends PluginSettingTab {
  plugin: TimelinesPlugin

  constructor( app: App, plugin: TimelinesPlugin ) {
    super( app, plugin )
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()
    containerEl.createEl( 'h2', { text: 'Timelines (Revamped) Settings' }, () => {
      return enableDeveloperSettings()
    })

    if ( developerSettings.debug ) {
      new Setting( containerEl )
        .setName( 'Debug Mode' )
        .setDesc( 'This button only shows when debug mode is ON. Click to disable.' )
        .addButton(( button ) => {
          return button
            .setButtonText( 'Disable Debug Mode' )
            .onClick(( e ) => {
              e.preventDefault()
              developerSettings.debug = false
              developerSettings.counter = 0

              this.display()
            })
        })
    }

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
      .setName( 'Event Element Tag (HTML)' )
      .setDesc( `Default: div. Acceptable values are: ${acceptableValuesString}` )
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

    new Setting( containerEl )
      .setName( 'Show Event Counter' )
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
      .setName( 'Display Note Preview On Hover' )
      .setDesc( 'When enabled, linked notes will display as a pop up when hovering over an event in the timeline.' )
      .addToggle(( toggle ) => {
        toggle.setValue( this.plugin.settings.notePreviewOnHover )
        toggle.onChange( async ( value ) => {
          this.plugin.settings.notePreviewOnHover = value
          await this.plugin.saveSettings()
        })
      })

    containerEl.createEl( 'h5', { text: 'Customize Frontmatter Keys' }).appendChild(
      createEl( 'p', {
        text: `Specify the front matter keys used to extract start dates, end dates,
         and titles for the timeline notes. Defaults to 'start-date', 'end-date', and 'title'.`,
        cls: 'setting-item-description'
      })
    )

    new Setting( containerEl )
      .setName( 'Start Date Keys' )
      .setDesc( 'Comma-separated list of frontmatter keys for start date. Example: start-date,fc-date' )
      .addText( text => {
        return text
          .setPlaceholder( this.plugin.settings.frontMatterKeys.startDateKey.join( ',' ))
          .onChange( async ( value ) => {
            this.plugin.settings.frontMatterKeys.startDateKey = value.split( ',' )
            await this.plugin.saveSettings()
          })
      })

    new Setting( containerEl )
      .setName( 'End Date Keys' )
      .setDesc( 'Comma-separated list of frontmatter keys for end date.' )
      .addText( text => {
        return text
          .setPlaceholder( this.plugin.settings.frontMatterKeys.endDateKey.join( ',' ))
          .onChange( async ( value ) => {
            this.plugin.settings.frontMatterKeys.endDateKey = value.split( ',' )
            await this.plugin.saveSettings()
          })
      })

    new Setting( containerEl )
      .setName( 'Title Keys' )
      .setDesc( 'Comma-separated list of frontmatter keys for title.' )
      .addText( text => {
        return text
          .setPlaceholder( this.plugin.settings.frontMatterKeys.titleKey.join( ',' ))
          .onChange( async ( value ) => {
            this.plugin.settings.frontMatterKeys.titleKey = value.split( ',' )
            await this.plugin.saveSettings()
          })
      })
  }
}
