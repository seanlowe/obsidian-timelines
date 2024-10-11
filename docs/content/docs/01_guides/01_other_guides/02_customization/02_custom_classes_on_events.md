---
weight: 242
title: Adding custom classes to timeline events
description: The `classes` attribute allows for custom classes on timeline events
icon: palette
draft: false
toc: false
---

Added in release v2.2.5, there is now an attribute `data-classes` that can be added to HTML events for passing along CSS class names onto the events on the timeline. For frontmatter events, the key is just `classes` and it's just a single string with spaces inbetween values, should you have multiple classes you want to add.

Without doing anything else, adding the `classes` attribute will have no impact on your timeline or its events. Because the plugin has no knowledge of what these classes might possibly be, it is up to the user to create an Obsidian snippet and define the rules you wish to place on that CSS class manually.

For vertical timelines, it's as simple as just adding your class directly, like so:
```css
.your-fancy-new-class {
  text-decoration: unset;
  color: rebeccapurple;
}
```

However, for horizontal timelines, due to the way the library used generates the timeline, you must tweak the snippet like so:
```css
.your-fancy-new-class > div > div > a {
  text-decoration: unset !important;
  color: rebeccapurple !important;
}
```

It is generally frowned upon to use `!important` in CSS rules but without it, your new styles will just get overridden.

For the most complete setup, you can use this as a starting point for your CSS snippet:
```css
.your-fancy-new-class,
.your-fancy-new-class > div > div > a {
  /* put your rules here */
}
```
