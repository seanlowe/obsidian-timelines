---
weight: 302
title: Frontmatter Events
icon: data_object
draft: false
---

Example of a Frontmatter event:
```
---
start-date: 2010-06-34
end-date: 2020-01-12
title: A Time Range
type: range
color: blue
tags: [timeline, history]
---
```

<br></br>

Things to note:
  - if a `title` key is not provided, it will use the name of the note by default.
  - `color` supports the same values as the **Node Color (`data-color`)** argument for HTML events.
  - `type` supports the same values as the **Type (`data-type`)** argument for HTML events.
  - `start-date`, `end-date`, and `title` may all be customized to match other installed plugins that use tags such as **FC-Calendar** or **Digital Garden** within settings. It will default to the keys listed but will search in order of specification should the user wish to add values. Multiple values are also accepted when comma-separated. 

You can easily insert a frontmatter event using the Command Palette (`Ctrl + P`) and selecting the command: `Timelines (Revamped): Insert timeline event (frontmatter)`.

Check [HTML Arguments](../03_arguments/01_html_arguments.md) for more information on `type` and `color`.
