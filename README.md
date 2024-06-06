![Fork GitHub Release](https://img.shields.io/github/v/release/seanlowe/obsidian-timelines)
<!-- ![Fork GitHub Downloads Count](https://img.shields.io/github/downloads/seanlowe/obsidian-timelines/total) -->

![Legacy GitHub Release](https://img.shields.io/github/v/release/Darakah/obsidian-timelines?label=Last%20Legacy%20Release&color=red)
![Legacy GitHub Downloads Count](https://img.shields.io/github/downloads/Darakah/obsidian-timelines/total?label=Legacy%20Downloads&color=blue)
![Legacy GitHub Issues Count](https://img.shields.io/github/issues/Darakah/obsidian-timelines?label=Legacy%20Issues)

# Timelines (Revamped)

Generate a chronological timeline in which all "events" are notes that include a specific tag or set of tags.

See the changelog from the last major update to view any breaking changes [here](./changelog.md#v200).

Documentation has moved!

I've written a brand new GitHub Pages docs site for **Timelines (Revamped)** at [https://seanlowe.github.io](https://seanlowe.github.io). Go check it out! If there are any problems, don't hesitate to create a new issue and point it out. Thanks!

## Release Notes

### v2.1.12

Fix issue: `Refined Horizontal Timeline View` [#49](https://github.com/seanlowe/obsidian-timelines/issues/49)

**Changes**:
- removed incorrect function `createYearArgument` in favour of using `buildTimelineDate` everywhere a Date is needed
- move `normalizeDate` and `buildTimelineDate` from `utils/index.ts` to own file `dates.ts` to avoid a circular dependency
- updated docs with some extra info regarding this change

See the [changelog](./changelog.md) for more details on previous releases.

## License

Licensed under the MIT License.

## Support

Please feel free to open issues for any bugs or requests for additional functionality. Pull Requests are always welcome!
