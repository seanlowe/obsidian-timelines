## Changelog

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
