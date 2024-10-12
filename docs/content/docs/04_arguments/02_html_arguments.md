---
weight: 4002
title: HTML Event Arguments
icon: data_object
draft: false
toc: true
---

<br></br>

## Dates (`data-start-date` and `data-end-date`)

The most important and essential info for the timeline entry is the **date**. Timeline entries can be used for fantasy timelines, leading to a simplified set of rules for valid dates.

A valid date is specified as `YEAR-MONTH-DAY-HOUR`.

- All four segments must be present.
- Each segment can contain only numbers, but can be any length.
- The YEAR (first segment) can be negative: `-123-45-678-9` is a valid date.

Rightmost-segments containing only zeros will be omitted when the timeline is generated, for example: 

- `2300-02-00-00` will display as `2300-02`
- `2300-00-00-00` will display as `2300`

Any included Month/Day sections of a date must be non-zero (for the time being) in order for the date to properly parse and be included on the timeline. 

For example: `2300-02-00-00` **should be passed as**: `2300-02` if you don't care about the day, or `2300-02-01` if you mean that it began at the beginning of the month. The last section of a date (the time), however, can be zero if you want. Any section that is not passed in will be added internally with the valid minimal value (`01`)

> **NOTE:** When using the **default date format (YYYY-MM-DD-HH)**, for values you don't want rendered, you can *either* pass those values as `0` or you can omit them from your event's date string. 

Date normalization is handled according to the next section **Event Sorting**, so that dates -- even fantasy ones -- are sorted in the order specified. Although, there are some ... *intricacies*, when dealing with odd fantasy dates with the horizontal timeline simply due to the library used to generate the timeline. I'm looking into better solutions for this.

### Event Sorting

Event sorting is performed by padding all sections of the date with leading zeros so that all sections are the same length. The resulting string is compared directly against other strings. The length to which sections will be padded is controlled by the `Maximum padding on dates` value in the settings tab.

For example, for these two dates with a max padding value of `4`:
- `2300-02-01-00` would be padded and sorted as ` 2300-0002-0001-0000`, whereas
- `-234-02-01-00` would be padded and sorted as `-0234-0002-0001-0000`.

We can now see how simple it is to have any kind of calendar you want (fantasy or otherwise) and have it sort the way you'd like. Any missing sections will be automatically populated for you, with missing months and day values being set to `01` and the time value being set to `00`.

Here's what that looks like with a max padding of `4`:
- `9991-3-477-9817` would become `9991-0003-0477-9817`,
- `1984` would become `1984-0001-0001-0000`
- `-33-777` would become `-0033-0777-0001-0000`

For statically generated timelines, events that occur at the same time are grouped, and are either prepended or appended to a list based on your timeline sorting preference.

---

## Background Image (`data-img`)
  - Optional
  - If an image is not specified, no image will be shown (just text)
  - If an invalid url is given, an empty black section will be seen for that note card

Note: Currently only assets specified via `http` or `absolute local path` will render. Obsidian release `v0.10.13` blocked obsidian links for background images. 

## Classes (`data-classes`):
  - Optional
  - A list of classes to append to an event item's class list. There is no indication that these classes are added until you create an obsidian CSS snippet (or something similar) to define the styling rules for that class.
  - This works pretty much as expected on vertical timelines. On horizontal timelines, however, if you want your class to affect the text of the event, you need to make sure you have your class selector as such: `.your-fancy-new-class > div > div > a`. This is due to how `vis-timeline` creates its elements.

## Description (`data-description`)
- Optional
- Redundant; If a description is not specified, the `innerText` of the `div`/`span` will be used. If neither are populated, the body of the event will be empty.

## Era (`data-era`)
  - Optional
  - Adds this text to the date span in the timeline as an era designation. Useful for fictional calendars.
  - Applied after the date is formatted. So `2300` with the era set to `AB` would display `2300 AB`.

## Node Color (`data-color`)
  - Optional
  - Tells the timeline to color that entry in the color provided.
  - Supports hex color codes and color names, such as `blue`, `red`, `rebeccapurple`, `#96F613`, or `FF7F50`

Note: If a value is not supplied, events will be colored `white` (or `gray` for background events) on the timeline.

## Path (`data-path`)
  - Optional
  - An alternate path to link the title to (excluding `[[` and `]]`). Default to the note the event is defined in, but you can use this to specify other notes or link to headers or blocks internally within the note. For example, `data-path='My Note#Event Subhead'` would link directly to the `Event Subhead` header in `My Note`
  - If you use the "Page preview" plugin, this contents of this header will display when hovering over the title. Useful for quickly viewing expanded details without leaving the current timeline.

## Points To (`data-points-to`)
  - Optional
  - If a `data-points-to` attribute is provided, the timeline will create an arrow from the current event to the event specified by the value. Currently, the value must be equal to the desired event's `data-start-date` value.

## Tags (`data-tags`)
  - Optional
  - An override to the tags that the event should be counted with. Allows you to have a note with events on separate timelines. For example, 1 event has tag "A" and a second has tag "B". A combined timeline will display both, but now you can also have 2 separate timelines where only the applicable ("A" or "B") events will be displayed.
  - Values are a string of tags separated by semicolons, similar to the tags list on either of the codeblocks for displaying timelines. Ex: `data-tags="timeline-A;timeline-B"`

## Title (`data-title`)
- Optional
- If a title is not specified, the name of the note will be used

## Type (`data-type`)
  - Optional
  - Tells the timeline what type of event to display for this entry.

Note: Acceptable values for `data-type` are:
  - `background`, best used for time periods
  - `box`
  - `point`, which is exactly what it sounds like, and
  - `range`

