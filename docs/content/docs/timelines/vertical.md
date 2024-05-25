---
weight: 999
title: Vertical Timelines
description: Additional information on Vertical Timelines
draft: true
toc: true
---

Using an HTML code block for static rendering

Insert the following HTML comment where a statically rendered timeline should be inserted:

```html
<!--TIMELINE BEGIN tags='test;now'-->

<!--TIMELINE END-->
```

Use the `Render static timeline` command to generate a static timeline. The command will generate static HTML and populate it between the HTML comments (BEGIN/END).

Running the command again will replace everything in between the comments with a freshly rendered timeline.

Timeline event changes will not be detected using this method, but as it is creating static HTML, the generated content will be readable without Obsidian (on GitHub, via Obsidian publish, etc.).
