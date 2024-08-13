---
weight: 403
title: Optional vs. Required Tags
description: How to use optional Tags on a Timelines
icon: data_object
draft: false
toc: false
---

<br></br>

## Optional Tags

The way **Timelines (Revamped)** works (from inception to release 2.2.7) is to look for events which match **all** provided tags. 

Say I have these three notes with timeline events. All three have the `required` tag. Only the two files have the `optionalA` and `optionalB` tags, however.

![Notes used in optional tags example](/images/optional_tags_notes.png)

As it is right now, if given the codeblock:

````markdown
```ob-timeline
tags=required;optionalA
```
````

A timeline will be rendered with events that have **both** the `required` tag AND the `optionalA` tag, like so:

![Required plus optionalA old functionality timeline](/images/required_plus_optionalA.png)

---

**New functionality** added in release 2.3.0 changes this. It is now possible to provide a list of required or optional tags to reach more events. This works by marking any tags separated by the `|` character as "either/or" rather than required.

If I wanted a timeline of events that had the `required` tag, but also had *either* the `optionalA` or `optionalB` tags, I would write my codeblock like so:

````markdown
```ob-timeline
tags=required;optionalA|optionalB
```
````

Which would give us a timeline that looks like this:

![Timeline with optional tags](/images/optA_and_optB_timeline.png)

This new method of handling tags also gives us the opportunity to make a timeline that matches on *any* of the supplied tags. By passing a list of only optional tags, like so:

````markdown
```ob-timeline
tags=required|optionalA|optionalB
```
````

the rendered timeline would display any events with at least one of the `required`, `optionalA`, or `optionalB` tags.

![Timeline with only optional tags](/images/all_optional_tags_timeline.png)
