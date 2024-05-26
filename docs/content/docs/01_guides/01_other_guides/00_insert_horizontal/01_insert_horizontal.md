---
weight: 221
title: Inserting a Horizontal Timeline
icon: "view_timeline"
draft: false
toc: false
---

<br></br>

As we focused on vertical timelines in the previous guide "[**Getting Started**](../00_getting_started)", here we'll add a simple horizontal timeline.

The codeblock for horizontal timelines is more involved. We have a total of **eight** possible parameters, although only **two** are actually required.

For now, we'll focus on the two required parameters and explore the other parameters in more detail in another note.

We'll take the same codeblock we used in the previous guide as a starting point:

````
```ob-timeline
tags=now;test
```
````

<br></br>

And we'll add the other required parameter for horizontal timelines: `type=flat`. Only codeblocks with this parameter will be rendered as a horizontal timeline. Our codeblock should now look like this:

````
```ob-timeline
tags=now;test
type=flat
```
````

<br></br>

Now if we click away from the codeblock and let it render, we should see a horizontal timeline!

![a simple horizontal timeline](/images/guides/simple_horizontal/timeline.png)

It's that simple.

Click on **Intro to Event Types** to learn about what kind of other events can be rendered on a horizontal timeline. 
