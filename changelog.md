## Changelog

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
