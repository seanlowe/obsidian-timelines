---
weight: 5002
title: Vertical Timelines
description: Additional information on Vertical Timelines
icon: height
draft: false
toc: false
---

You can use some HTML code in order to render a statically generated vertical timeline.

Insert the following HTML comment where you would like a statically rendered timeline to be inserted:

```html
<!--TIMELINE BEGIN tags='test;now'-->

<!--TIMELINE END-->
```

Thne, use the `Timelines (Revamped): Render static timeline` command to generate a static timeline. The command will generate HTML and populate it between the HTML comments (BEGIN/END).

Running the command again will replace everything in between the comments with a freshly rendered timeline.

Timeline event changes will not be detected using this method, but as it is creating static HTML, the generated content will be readable without Obsidian (on GitHub, via Obsidian publish, etc.).
