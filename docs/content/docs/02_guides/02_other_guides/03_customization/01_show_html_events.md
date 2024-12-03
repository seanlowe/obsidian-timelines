---
weight: 2231
title: Showing the (previously) hidden HTML events in notes
description: An obsidian CSS snippet so that HTML events are still visible in Reading or Live Preview modes. 
icon: palette
draft: false
toc: false
---

<br></br>

Timeline span and div entries (.ob-timelines class) are hidden in preview by default, however, if you wish to display content, try adding (in your Obsidian settings) a CSS snippet like this: 

```css
/* Render the ob-timelines span or div elements as inline blocks that use an italic font */
.ob-timelines {
  display: inline-block !important;
  font-style: italic;
}

/* Use the before pseudo element to display attributes of the span or div */
.ob-timelines::before {
  content: "🔖 " attr(data-start-date) ": " attr(data-title) ".";
  color: lilac;
  font-weight: 500;
}
```

Using the above snippet, a span like this: 

```html
<div
  class='ob-timelines'
  data-start-date='1499-03-28-00'
  data-title="An example">
</div>
```

would be rendered (in Live Preview mode) as: 

![styled span example](./images/styled-event-span.png)

> **Note:** It is *highly* recommended to use `div` elements for HTML events rather than `span` elements.

I've noticed that using a `span` in Reading Mode or when viewing a `span` event in an Popover tends to render incorrectly. If proper rendering is a must-have, I recommend using a `div` for your events.
