![Fork GitHub Release](https://img.shields.io/github/v/release/seanlowe/obsidian-timelines)
<!-- ![Fork GitHub Downloads Count](https://img.shields.io/github/downloads/seanlowe/obsidian-timelines/total) -->

![Legacy GitHub Release](https://img.shields.io/github/v/release/Darakah/obsidian-timelines?label=Last%20Legacy%20Release&color=red)
![Legacy GitHub Downloads Count](https://img.shields.io/github/downloads/Darakah/obsidian-timelines/total?label=Legacy%20Downloads&color=blue)
![Legacy GitHub Issues Count](https://img.shields.io/github/issues/Darakah/obsidian-timelines?label=Legacy%20Issues)

# Timelines (Revamped)

Generate a chronological timeline in which all "events" are notes that include a specific tag or set of tags.

See the changelog from the last major update to view any breaking changes [here](./changelog.md#v200).

Documentation has moved!

I've written a brand new GitHub Pages docs site for **Timelines (Revamped)** at [https://seanlowe.github.io/obsidian-timelines](https://seanlowe.github.io/obsidian-timelines). Go check it out! If there are any problems, don't hesitate to create a new issue and point it out. Thanks!

## Release Notes

![new timespans in vertical timelines!](./docs/assets/images/vertical-time-spans.png)

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

See the [changelog](./changelog.md) for more details on previous releases.

## Contributors

Thanks to all the contributors so far, on this iteration and the original:

<a href="https://github.com/seanlowe/obsidian-timelines/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=seanlowe/obsidian-timelines" />
</a>

## License

Licensed under the MIT License.

## Support

Please feel free to open issues for any bugs or requests for additional functionality. Pull Requests are always welcome!
