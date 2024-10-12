![Fork GitHub Release](https://img.shields.io/github/v/release/seanlowe/obsidian-timelines)
![Fork GitHub Downloads Count](https://img.shields.io/github/downloads/seanlowe/obsidian-timelines/total)
![Legacy GitHub Release](https://img.shields.io/github/v/release/Darakah/obsidian-timelines?label=Last%20Legacy%20Release&color=red)
![Legacy GitHub Issues Count](https://img.shields.io/github/issues/Darakah/obsidian-timelines?label=Legacy%20Issues)

# Timelines (Revamped)

Generate a chronological timeline in which all "events" are notes that include a specific tag or set of tags.

See the changelog from the last major update to view any breaking changes [here](./changelog.md#v200).

> First time users may find this [video tutorial](https://www.youtube.com/watch?v=4SQWnjniQAE) helpful.

You can check out the docs for **Timelines (Revamped)** [here](https://seanlowe.github.io/obsidian-timelines). If there are any problems, don't hesitate to create a new issue and point it out. Thanks!

![new timespans in vertical timelines!](./docs/assets/images/vertical-time-spans.png)

![horizontal timeline](./docs/assets/images/horizontal_example.png)

## Release Notes

### v2.4.0

Implement Issues:
- `[Feature - Vertical] Allow custom date formatting` [#87](https://github.com/seanlowe/obsidian-timelines/issues/87)
- `[Feature - Horizontal] Implement Timeline-arrow as a way of connecting events` [#44](https://github.com/seanlowe/obsidian-timelines/issues/44)

**Changes:**
- custom date formatting:
  - added a new setting to allow users to specify a custom date format for the vertical timeline
  - wrote new function `formatDate` to handle the custom date format
  - updated the docs to reflect the new functionality
- timeline-arrow integration:
  - added a new event property `pointsTo` to allow users to specify a target event to link to
  - wrote new function `makeArrowsArray` to handle finding links and creating the array of arrows to attach to the timeline
  - updated Insert commands to add the new property
  - updated the docs to reflect the new functionality

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
