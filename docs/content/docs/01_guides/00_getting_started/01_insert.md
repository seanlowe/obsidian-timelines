---
weight: 211
title: Inserting a Timeline
description: What is needed in order to insert a timeline into a note.
icon: view_timeline
draft: false
toc: false
---

<br></br>

Inserting a timeline into a note can be done a couple of different ways, each with their own moving parts. **Timelines (Revamped)** provides two different ways you can use to insert a timeline:
- using a codeblock for dynamic timelines, and
- using HTML for static timelines (vertical only).

In this guide, we'll be using the first. First, we'll need to write a codeblock with the `ob-timeline` specifier.

> The `ob-timeline` specifier was intentionally chosen so as to not interfere or conflict with other timeline plugins, most notably George-debug's Timeline [plugin](https://github.com/George-debug/obsidian-timeline).

---

Codeblocks can be used to make both **vertical** and **horizontal** timelines. Horizontal timelines will be explored further in a different note.

<br></br>

For now, we'll focus on adding a vertical timeline. Add the following codeblock in the note where you'd like to render a timeline:

````
```ob-timeline
tags=now;test
```
````

<br></br>

The render block takes a single line which is the _list of tags_ (separated by semicolons) by which to filter timeline-tagged notes. For example, in the above example block, **<u>only notes with all</u>** three tags (`now`, `test` and `timeline`) will be rendered.

> Read more about available arguments [here](../../../03_arguments/). 

(Don't worry, we'll come back this later when we look at horizontal timelines.)

As you move the cursor away from the codeblock, you should see this:

![No Events Found Error Message](/images/guides/simple_vertical/no_events_found.png)

Well, that makes sense. Click on **Adding Events** to learn how to create events for our timeline. 
