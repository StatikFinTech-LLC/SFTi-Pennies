---
component: glowbubble.mentors
updated: 2025-12-21T02:50:00Z
author: system
version: 1.0
color: "rgba(236, 72, 153, 1)"
glow_intensity: 0.3
size: 44
border_width: 2
---

# Theme: Mentors Bubble Glow Color

Configuration for the Mentors navigation bubble glow effect.

## Bubble Values

| Property | Value | CSS Variable | Description |
|----------|-------|--------------|-------------|
| Color | rgba(236, 72, 153, 1) | --bubble-mentors-color | Pink glow color |
| Glow Intensity | 0.3 | --bubble-mentors-glow | Shadow/glow opacity (0-1) |
| Size | 44 | --bubble-mentors-size | Bubble diameter in pixels |
| Border Width | 2 | --bubble-mentors-border | Border thickness in pixels |

## Visual Effect

The mentors bubble displays a pink glow effect for the mentors/resources section.

## CSS Application

```css
.glowing-bubble.mentors {
  --bubble-color: rgba(236, 72, 153, 1);
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.3);
  width: 44px;
  height: 44px;
  border-width: 2px;
}
```

## Usage Notes

- Color must be a valid CSS color value
- Glow intensity affects the box-shadow opacity
- Changes trigger rebuild of `all-trades.html` and `trades/*.html`

