---
weight: 231
title: Intro to Event Types
description: An overview of available event types for horizontal timelines and a closer look at the box type.
icon: check_box_outline_blank
draft: false
toc: false
---

<br></br>

There are a couple different types of events that can be rendered on a horizontal timeline. They are:
- box (default)
- point
- range
- background


Taking the horizontal timeline we just created in the previous note, let's change our event to each type, one at a time.

Currently, our event looks like so:

```html
<div class="ob-timelines"
  data-title="Our First Event"
  data-start-date="2024-5-24"
>
  Event Number One
</div>
```

When the event parameter `data-type` is not passed in, we automatically default it to `box`. For reference, such an event looks like so:

![box event on horizontal timeline](/images/guides/simple_horizontal/timeline.png)

---

Click on **Point Events** to see what those look like and how to specify events as the `point` type.
