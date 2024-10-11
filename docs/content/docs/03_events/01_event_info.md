---
weight: 3001
title: Event Info
icon: article
draft: false
---

<br></br>

> **Note:** If there are *any* HTML events included in a note, those events will take precedence and be included in the list of events. 

Otherwise, the timeline will default to gathering data from the frontmatter. See [Getting Started: Adding Events](../02_guides/01_getting_started/02_adding_events.md) for more information on how to create events. 

This section is for overarching information on how a note is considered valid.

"Events" within a note can be specified in one of two ways:
  - a `div` or a `span` HTML element, or
  - keys in the front matter (in this case, the entire file will be used as an "event")

In order for events to be considered "valid", it must contain the following: 
1) at least a valid start date, in `YEAR-MONTH-DAY-HOUR` format, and
    - for front matter events, the default key is `startDate`
    - for HTML events, the default key is `data-start-date`
2) a valid class, specifically `ob-timelines` must be specified.

All other fields are optional.

Invalid timeline events will be skipped, usually with a warning printed in to the console.
