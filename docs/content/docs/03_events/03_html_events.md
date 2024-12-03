---
weight: 3003
title: HTML Events
icon: code
draft: false
toc: false
---

<br></br>

Examples of HTML events:
```html
<span
  class='ob-timelines'
  data-start-date='2000-10-10-00'
  data-end-date='2000-10-20-00'
  data-title='Time Period Event'
  data-color='orange'
  data-img='absolute/path/to/image.png'
  data-type='background'
>
  Some Time Period that only lasted 10 days
</span>

<div
  class='ob-timelines'
  data-start-date='2000-10-11-00'
  data-end-date='2000-10-12-00'
  data-title='Another Event'
  data-type='range'
>
  A minimal event
</div>
```

<br></br>

A timeline entry can be created using `span` or `div` HTML elements (`div` is the default), with the following attributes: 

```html
<div class="ob-timelines"
  data-title=""
  data-classes=""
  data-color=""
  data-type=""
  data-start-date=""
  data-end-date=""
  data-era=""
  data-path=""
  data-tags=""
> some content </div>
```

There are multiple ways to insert an HTML event. I mean, you *could* do it manually, but who wants to do that? 

There's two faster ways for inserting an event into your note at your current mouse position:
  1. Click the `</>` button on the ribbon, or
  2. Open the command palette and run the `Insert timeline event`.

Both of these will insert a new event `div` or `span` (it uses whichever value you've set in Settings but defaults to `div`) with all `data-*` attributes present but empty. Delete what you don't need, fill in what you want. 

Check out [HTML Arguments](../04_arguments/02_html_arguments.md) for information on all the various arguments listed above.
