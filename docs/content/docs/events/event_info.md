---
weight: 999
title: Event Info
draft: true
---

If HTML tags are included in the note, they will be used. Otherwise, the timeline will default to gathering data from the frontmatter. See [Timeline Entries](#timeline-entries) for more information on how to create events. This section is for overarching information on how a note is considered valid.

1. "events" within a note, which can be specified by:
    - a `div` or a `span` HTML element, or
    - keys in the front matter to use the entire file as an "event", and
2. a `ob-timeline` code block or a timeline HTML comment in the note you wish to display the timeline in.
