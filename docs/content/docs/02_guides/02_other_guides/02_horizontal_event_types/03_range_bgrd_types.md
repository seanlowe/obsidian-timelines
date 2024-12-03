---
weight: 2223
title: Range and Background Events
icon: stack
draft: false
toc: false
---

<br></br>

The last two horizontal event types (`range` and `background`) require our event to have an end date. So let's add one, and change it to the `range` type at the same time.


```html
<div class="ob-timelines"
  data-title="Our First Event"
  data-start-date="2024-5-24"
  data-end-date="2024-10-24"
  data-type="range"
>
  Event Number One
</div>
```

We'll see that represented on our timeline when we navigate back to it:

![tiny range event on large scale horizontal timeline](/images/guides/horiz_event_types/tiny_range_event.png)

But wait, why is it so small? Well, we didn't give our codeblock any restrictions to where it should start and stop. While we can use the scroll wheel to zoom in on the event, that's a bit annoying, so let's jump back to our codeblock and add some params there.

````
```ob-timeline
tags=now;test
type=flat
startDate=2024
endDate=2025
```
````

<br></br>

That should do it. Let's take a look at our timeline now.

![a readable range event on horizontal timeline](/images/guides/horiz_event_types/readable_range_event.png)

For background events, since our event already has an end date, let's just switch the type to `background` and see how that looks.

![background event on horizontal timeline](/images/guides/horiz_event_types/background_event.png)

That's all available types of events for a horizontal timeline.
