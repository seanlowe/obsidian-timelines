---
weight: 212
title: Adding Events
description: Let's create some events to show on our timeline
icon: calendar_add_on
draft: false
toc: false
---

<br></br>

There are 2 ways to include a note in a timeline:
- **Frontmatter** or 
- **HTML tags**. 

We're going to use HTML, as it's a little simpler.

> Read more about events [here](../../../02_events/)

There's a handy little command for inserting an HTML command into a note of our choice.

Go ahead and create a note anywhere, hit `Ctrl + P` to open Obsidian's Command Palette, and type `insert`

We'll see something like the following:

![Obsidian Command Palette](/images/guides/simple_vertical/insert_event_command_palette.png)

Select the option titled `Timelines (Revamped): Insert timeline event`. We'll explore those other commands later. 

In our note, we should see something like this:

```html
<div class="ob-timelines"
	data-title=""
	data-description=""
	data-color=""
	data-type=""
	data-start-date=""
	data-end-date=""
	data-era=""
	data-path=""
	data-tags="">
	New Event
</div>
```

We'll keep it simple. Update your event to hold the following data:

```html
<div class="ob-timelines"
  data-title="Our First Event"
  data-start-date="2024-5-24"
>
  Event Number One
</div>
```

If you click off, don't be alarmed. By default, HTML elements with the `ob-timelines` class are hidden in Reading and Live Preview modes. It's still there, you just can't see it. We'll go over how to show a small indicator in a different note.

You've just created your first event.

Click on **Tagging a note for a Timeline** to learn how to make sure our event gets rendered on our timeline.
