## Changelog

### v2.1.4

Added support for changing the maximum and minimum zoom levels on the horizontal timeline.

**Changes:**
- renamed `TimelineArgs` to `InternalTimelineArgs` and updated to be more specific for each possible argument.
- added support for `zoomInLimit` and `zoomOutLimit`
- updated the README with information on how to use the new arguments
- updated the horizontal codeblock example image with the new arguments
- extracted some logic dealing with arguments from `utils/index.ts` to its own file

### v2.1.3

Some more small changes requested by the Obsidian staff in order to get the plugin published to the community list.

**Changes:**
- updated the titles of commands to be sentence-case
- removed the toggle switch setting to show/hide ribbon icons. End users have the ability to individually toggle icons on their own, so there's no need for a setting for it.
- updated the license name / year, still using the MIT License
- updated callout at top of README to use tlm2021's name instead of his username along with some QOL updates to the README

### v2.1.2

Small tweaks to packages for better build quality (that was released in v2.1.1 but I forgot to make a changelog for that so here it is now).

**Changes:**
- updated the Readme regarding date parsing change that happened in version [2.1.0](./changelog.md#v210)
- added callouts to big contributors of the original plugin
- added a notice to the top of the readme with a link to the changelog for version [2.0.0](./changelog.md#v200) since there were breaking changes in that update.

### v2.1.0

Fairly sizeable changes in preparation for official publishing!

**Biggest changes (TL;DR):**
- reworked date parsing
- made debug mode accessible at all times

**Change directly related to publishing:**
- changed strings in title case to sentence case
- removed the word 'settings' from settings page
- confirmed no default hotkeys
- removed all references to innerHTML and almost all to outerHTML. Only reference to outerHTML has no user input and therefore should be safe from injection attacks
  - rewrote insertTimelineIntoCurrentNote to use XMLSerializer and DomParser
- changed main.ts's callback's to checkCallback's for added safety
- added normalizePath() anywhere a path is actually being handled or finalized. Any places where *.path is used without a call to normalizePath() has already been normalized by that point.
- removed references to vaultAdapter and changed implementation accordingly in getImgUrl()
- removed generic header at beginning of settings page

**Other changes:**
- renamed some classes to be more concise
- reworked date parsing. No longer are dates cast to an int. Dates will be padded according to the new setting "maxDigits" and compared equally that way. Wrote new function normalizeDate() to handle this
- added type checking on settings page so saving bad entries is harder
- small optimization to getEventData and getEventsInFile by removing unnecessary type and data encapsulation
- edited the way we load / overwrite loaded settings by loading the defaults first, and then overwriting with anything saved. This should enable safe loading of settings whenever a new setting is introduced and a user may not have saved it yet
- turned off annoying eslint rule
- tweaked debug mode and add toggle for it

### v2.0.0 

Substantial change that vastly affects the functionality of **Timelines (Revamped)**: Merged PR from upstream repository - `Support frontmatter to add timeline entries` [#58](https://github.com/Darakah/obsidian-timelines/pull/58)

Their notes about the change:
- added functionality to use frontmatter to add a note to the timeline
- added functionality to customize the frontmatter keys for better compatibility with other plugins
- added a hover preview setting for viewing notes within a timeline without having to click on the header to open them. 

**BREAKING CHANGES:**
- changed `data-class` to `data-color` for clarity. You'll have to update your HTML events to use the new tag to retain your old color choices.
- Consolidated timeline codeblocks. Any horizontal timelines will need to be changed from type `ob-timelines-flat` to just `ob-timelines` and a new line `type=flat` added. Any vertical timelines will need to have their list of tags pre-pended by `tags=` in order to properly parse.

Additional notes:
- added some additional types and type checking
- tweaked scss mixin `add-color` to make it easier to add additional color states depending on element state (selected, hover, etc.)
- added an error message that displays in place of the timeline when there are no files that match the timeline's parameters
- added `pink` and `gray` to list of available colors
- added functionality to show frontmatter events alongside HTML events (`showOnTimeline` key)
- added a notice in the top right corner for notes that matched the tags provided but had no events to display. Usually, this is if you have frontmatter without the new `showOnTimeline` key set to `true`
- added a new command for inserting event frontmatter keys
- corrected logic in the event counting functionality. Now it correctly counts frontmatter and HTML events
- disabled the popover that appears on click if `Display Note Preview on Hover` is turned off

### v1.2.0
Added functionality to override tags for a particular event. This allows you to have a note with events on separate timelines. Resolves github feature request: `[New Feature] Override tags defined on the page with a new attribute tags` [#12](https://github.com/seanlowe/obsidian-timelines/issues/12)

Additional changes:
- reworked how tags are parsed from code bock arguments
- added some utility functionality for debugging

### v1.1.1
Added an item to the editor status bar to indicate how many events are in the current file.

- add status bar item and logic to populate content in it
- utilize new logic in other places that do the same thing
- add new setting to toggle status bar element on/off

### v1.1.0
Merged PR from upstream repository - `Added 'Era' suffix; Remove '.md' from titles; Enable alternative path` [#20](https://github.com/Darakah/obsidian-timelines/pull/20)

His notes about the change:
> - Added optional span attribute 'era', allowing an era suffix to be displayed on the timeline.
> - Removes the `.md` extension when auto-filling the title
> - Ability to specify an alternative path to link the event to.

Additional notes:
- updated README to cover new changes to data attributes
- created new changelog file for historical records of release notes

### v1.0.2
Added 2 new ways to insert events.

- add new settings and command
  - new command: "Insert Timeline Event" - inserts an empty timeline [div/span] at current mouse position in current note.
  - new ribbon button for "Insert Timeline Event" command
  - new setting: show/hide Ribbon button
  - new setting: default HTML tag for creating new events

More technical stuff:
- set up workflows and protection for the `main` branch
- created build and version scripts
- add NPM commands for easy bumping versions (patch/minor/major)

### v1.0.1
Added more colors to the horizontal timeline!

More technical stuff:
- refactored styling to use SCSS instead of CSS
- created a mixin / function combo that will allow me to easily add support for new colors in the future.
- added functionality to use color on background style events.
- replaced the asset in the README with an updated version that shows off the new colors we can use.

### v1.0.0 (legacy v0.3.3)
- refactored most of the plugin. 
  - Introduced additional type checking and assertions. 
  - Broke up functionality into smaller functions for better readability and maintenance.
- updated readme to include better examples and instructions for creating and rendering a timeline.
- audited and updated package dependencies for security vulnerabilities
- updated to latest obsidian package
