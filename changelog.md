## Changelog

### v2.2.3

Implement issue: `[Feature] A Hotkey or command to redraw the timeline after edit` [#74](https://github.com/seanlowe/obsidian-timelines/issues/74)

**Changes:**
- added a new command: `Reload current note`. Thanks to [dataview](https://github.com/blacksmithgu/obsidian-dataview) for adding this functionality initially and I just yoinked it for this plugin. Woot Woot MIT licensure!

### v2.2.2

Fix issue: `[Bug - Horizontal] Perfectly functional timelines, but countless notifications of "no date found for ___.md" (for each event), everytime I open the timeline note.` [#68](https://github.com/seanlowe/obsidian-timelines/issues/68)

**Changes:**
- add check to make sure a frontmatter "event" makes sense before trying to retrieve event data from it

Also includes some improvements to debugging logs so that it's easier to find the information needed.

### v2.2.1

Fix issue: `Flat timeline doesn't render.` [#60](https://github.com/seanlowe/obsidian-timelines/issues/60)

**Changes:**
- pass additional parameters to `buildHorizontalTimeline` that are now required due to being in its own file
- create interface type for the input to `buildHorizontalTimeline`

### v2.2.0

Implement Issue: `Feature suggestion, time spans in vertical timelines` [#52](https://github.com/seanlowe/obsidian-timelines/issues/52): Added support for time spanning events in vertical timelines

**HUGE** Shoutout to [enigmartyr](https://github.com/enigmartyr) who did a lot of the heavy lifting for this feature!

**Changes**:
- overhauled `buildVerticalTimeline()`
  - changed `endDate` to default to the same as start date rather than null
  - fixed issue where dates with leading zeros would not render correctly on vertical timeline by making sure all dates for notes are properly cleaned before saving
  - move `insertTimelineIntoCurrentNote` to `commands.ts`
  - move `handleColor` to `colors.ts` and removed `handleDynamicColor` as an export (no longer needed)
  - move `buildVerticalTimeline` to new file `timelines/vertical.ts`
  - move `buildHorizontalTimeline` to new file `timelines/horizontal.ts`
  - move `showEmptyTimelineMessage` to new file `timelines/index.ts`
  - adjust `TimelineCommandProcessor` constructor to accept a new param that enables `insertTimelineIntoCurrentNote` to run correctly
- maintenance changes:
  - added `DOM.Iterable` to `tsconfig.json`
  - rolled unnecessary `NoteData` type into `AllNotesData`
  - extracted type `HTMLDivElement & { calcLength?: () => void }` from vertical.ts into type `DivWithCalcFunc` and replaced references
  - moved constant `developerSettings` into constants.ts and renamed to `DEVELOPER_SETTINGS`. Replaced all references
  - added arrow-parens rule to eslint config and fixed errors
styling:
- overhauled `vertical-timeline.scss`
  - made sure anything that was calculating something used calc(...)
  - use sass-migrator to handle the deprecated use of '/' as division operator in scss
  - make single nodes same color as vault accent color
  - make span nodes invert of the vault accent color

This release also contains PR: `Fixed dead links in Docs` [#58](https://github.com/seanlowe/obsidian-timelines/pull/58), and fixes issue: `a little problem` [#56](https://github.com/seanlowe/obsidian-timelines/issues/56) (bad link to docs in README)

### v2.1.13

Fix issue: `Timelines with negative dates render in the wrong order` [#22](https://github.com/seanlowe/obsidian-timelines/issues/22), and some other miscellaneous changes.

**Changes**:
- write new function for sorting the unique timeline date ID's
- overhaul function `buildTimelineDates` to accurately handle use cases where the built-in JS `Date` object fell short
- write new function `cleanDate` to take a normalized date and return one where all leading zeros have been removed
- changed `normalizeDate` to append a `01` instead of `00` for missing hour sections
- small docs change
- added a contributors section on the README
- updated LICENSE to 2024
- deleted unnecessary copy of README from before docs overhaul

### v2.1.12

Fix issue: `Refined Horizontal Timeline View` [#49](https://github.com/seanlowe/obsidian-timelines/issues/49)

**Changes**:
- removed incorrect function `createYearArgument` in favour of using `buildTimelineDate` everywhere a Date is needed
- move `normalizeDate` and `buildTimelineDate` from `utils/index.ts` to own file `dates.ts` to avoid a circular dependency
- updated docs with some extra info regarding this change

### v2.1.11

Fix issue: `No body in timeline event created via frontmatter` [#48](https://github.com/seanlowe/obsidian-timelines/issues/48)

**Changes**:
- made it possible to specify the textual body of an event defined via frontmatter by way of the 'description' property
- edited style rules so that whitespace within the description property (line breaks, esp.) is respected and not discarded
- reinstated the 'description' property for HTML defined events (albeit redundant) 
- updated documentation to reflect changes

### v2.1.10

Maintenance update

**Changes**:
- updated all dependencies to latest versions
- removed dependence on package `rollup-plugin-styles` as it has not been updated in 2 years and was preventing me from updating other packages
- imported vis-timeline specific styling in the SCSS rather than in the TS

### v2.1.9 / v2.1.8

Documentation overhaul!

**Changes:**
- 2.1.9:
  - fix hugo docs deployment workflow
  - add npm commands for running the documentation site locally
  - bump version to next patch (so it creates a new release correctly)
- 2.1.8:
  - created a brand new Hugo documentation site, deployable via GitHub Actions to GitHub Pages
  - removed the old documentation from the top-level README, as it's (obviously) no longer needed.

### v2.1.7

Implements issue [seanlowe/obsidian-timelines#34](https://github.com/seanlowe/obsidian-timelines/issues/34)

**Changes:**
- added event listeners onto timeline events to run some logic when items are being hovered on
  - adds a custom CSS class `.runtime-hover` on mouse enter, and removes it when the mouse leaves the event
  - adds some logic to set a CSS variable with the particular event's background color
- added styling rules for CSS class `.runtime-hover` that takes into account the current background color (that was pushed into a CSS variable by the event listeners)
- allowed for timeline event objects to have a copy of the data from the user-created events (HTML/FM)

### v2.1.6

Bug fix for Issue [seanlowe/obsidian-timelines#39](https://github.com/seanlowe/obsidian-timelines/issues/39)

**Changes:**
- fixed incorrect rendering of events with hours specified. Hours will now shift the event as expected
- fixed an issue where notes would not be added to the timeline due to tags not having `#` removed

### v2.1.5

Revamped event color functionality.

**Changes:**
- added support to pass essentially any color as a value in the color field on events (HTML or Frontmatter)
- updated the `Node Color` section in the README to cover the new functionality
- wrote functions to handle dynamically adding the stylesheets for custom colors in `utils/colors.ts`
- added function to `block.ts` to handle whether or not the color provided was one of the built-ins or if it requires the dynamic logic

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
