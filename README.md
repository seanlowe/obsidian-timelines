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

![new timespans in vertical timelines!](./docs/assets/images/vertical-time-spans.png)

![horizontal timeline](./docs/assets/images/horizontal_example.png)

## Release Notes

### v2.2.7

Bug fix for issue: `"YYYY" Format` [#81](https://github.com/seanlowe/obsidian-timelines/issues/81)

**Changes:**
- implemented some logic to determine what sections of the provided dates are missing originally and to not display a cleaned version of the normalized date but a "readable" date that should closer match what the user provides in the event.
- tweaked some logic in the nesting / sorting functionality on the vertical timeline. Events now sort the start and end of time ranges correctly (so far as I can tell).

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
