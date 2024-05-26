---
weight: 213
title: Tagging Notes with Events
description: Help our timeline find our events
icon: sell
draft: false
toc: false
---

<br></br>

If we were to go back to the note where we added our `ob-timeline` codeblock, we'd still see the same error. This is because we added an event, but we didn't add anything to the note to make it visible to our timeline.

Notes are only visible to timelines if the following is true:
- The `timeline` tag must be included in that note. You can put the tags in your front matter, or in a `#tag` somewhere in the note body.

![Possible Tagging Methods](/images/guides/simple_vertical/possible_tagging_methods.png)

<br></br>

- The note must have **all the specified tags** to be included in the search. We could specify `test` or `now` on a timeline codeblock but without both of them (and `timeline`) in a note, any events in that note will be ignored.

- The note must contain either the appropriate frontmatter keys and/or *at least* one timeline HTML element containing the event information.


When generating a timeline, a note will be ignored in the following cases:
1. The note does not have the `timeline` tag (the tag specified in plugin settings)
2. The note does not contain all the tags from the search list
3. The note does not contain any valid timeline HTML elements

---

Pick one of the methods of tagging in the picture above and do so in your note. Click **Timeline Functional!** to see your timeline in action and get links to additional information.
