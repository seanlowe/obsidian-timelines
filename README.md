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
