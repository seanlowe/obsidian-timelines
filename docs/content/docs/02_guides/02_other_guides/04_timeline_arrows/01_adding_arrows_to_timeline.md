---
weight: 2241
title: Adding arrows to your horizontal timeline
description: Integration with a new package allows you to connect events on your timeline with an arrow. 
icon: moving
draft: false
---

<br></br>

If you ever wanted to add some kind of continuity or flow to your timeline, you can do so by adding arrows to your timeline. This is accomplished by using the [Timeline Arrows](https://github.com/javdome/timeline-arrows) package by [javdome](https://github.com/javdome/).

The works via a new argument on events: `data-points-to` (for HTML), `pointsTo` (for frontmatter). This argument takes the same string value as the `data-start-date` argument on the item you wish the arrow to point to.

You can read more about the `data-points-to` argument [here](../../../04_arguments/02_html_arguments#points-to-data-points-to).

As an example, here are the events for "Event 1" and "Event 2", shown in the picture below:

```html
<div class="ob-timelines"
	data-title="Event 1"
	data-color="red"
	data-points-to="2024-1-15-1"
	data-start-date="2024-1-1-1"
>
	New Event
</div>

<div class="ob-timelines"
	data-title="Event 2"
	data-color="red"
	data-points-to="2024-1-30-1"
	data-start-date="2024-1-15-1"
>
	New Event
</div>
```

![timeline with arrows](/images/timeline-arrows-example.png)
