---
component: glowbubble.notes
updated: 2025-12-21T02:50:00Z
author: system
version: 1.0
color: "rgba(147, 51, 234, 1)"
glow_intensity: 0.3
size: 44
border_width: 2
---

# Theme: Notes Bubble Glow Color

Configuration for the Notes navigation bubble glow effect.

## Bubble Values

| Property | Value | CSS Variable | Description |
|----------|-------|--------------|-------------|
| Color | rgba(147, 51, 234, 1) | --bubble-notes-color | Purple glow color |
| Glow Intensity | 0.3 | --bubble-notes-glow | Shadow/glow opacity (0-1) |
| Size | 44 | --bubble-notes-size | Bubble diameter in pixels |
| Border Width | 2 | --bubble-notes-border | Border thickness in pixels |

## Visual Effect

The notes bubble displays a purple glow effect for the notes/strategy section.

## CSS Application

```css
.glowing-bubble.notes {
  --bubble-color: rgba(147, 51, 234, 1);
  box-shadow: 0 0 15px rgba(147, 51, 234, 0.3);
  width: 44px;
  height: 44px;
  border-width: 2px;
}
```

## Usage Notes

- Color must be a valid CSS color value
- Glow intensity affects the box-shadow opacity
- Changes trigger rebuild of `all-trades.html` and `trades/*.html`

