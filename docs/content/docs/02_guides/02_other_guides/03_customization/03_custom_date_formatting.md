---
weight: 2233
title: Adding custom formatting to the dates on timeline events
description: The `dateFormat` argument allows for custom formatting of the dates on vertical timelines
icon: palette
draft: false
toc: false
---

<br></br>

Added in release v2.4.0, there is now an argument `dateFormat` that can be added to the codeblock for passing along a custom date format onto the events on the timeline.

There is **no** default format set automatically which means you can pass in any format you want (using the correct tokens, that is). For example, if you wanted to display the date in the format `DD-MM-YYYY`, you could pass `dateFormat='DD-MM-YYYY'` in the codeblock.

For more information on available tokens, see the [codeblock arguments documentation](../../../04_arguments/01_codeblock_arguments).

Some examples, with values year (`2024`), month (`1`), day (`10`), and hour (`12`):
- `dateFormat=DD-MM-YYYY` would display `10-1-2023`
- `dateFormat=DD-MM` would display `10-1`
- `dateFormat=DD-MM-YYYY-HH` would display `10-2-2024-12`
- `dateFormat=DDDD, MMM D YYYY` would display `Wednesday, January 10th 2024`
- `dateFormat=DD/MM/YY @ H` would display `10/01/24 @ 12:00`
- `dateFormat=The D day of MMM in the year YYYY` would display `The 10th day of January in the year 2024`

> Note: For users who do not set a `dateFormat` argument, the value specified in the settings tab (by default an empty string `""`) will be used. You can change this setting to be, realistically, anything you want. Leaving the default value empty will persist existing functionality of being able to pass date sections in as 0.

Please note, it is difficult to do validation on missing sections of a date format. If the section is supplied in the date format string but not supplied in the event date, it will usually throw an error and quit but can sometimes still display a malformed date on the timeline.

Example:
- `dateFormat=DD/MM/YY @ H` but without a value for hour would display: `10/01/24 @`

In addition to that, passing a value for `era` on an event will display after the formatted date which, depending on how you have formatted your date, may or may not look strange.

Example:
- `dateFormat=DD/MM/YY @ H` with an `era` of `ABC` on the event would display: `10/01/24 @ 12:00 ABC`
- `dateFormat=DD/MM/YY @ H` with an `era` of `ABC` but *without an hour* on the event would display: `10/01/24 @ ABC`
