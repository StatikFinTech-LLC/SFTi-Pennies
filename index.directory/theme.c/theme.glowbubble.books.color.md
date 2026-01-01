---
component: glowbubble.books
updated: 2025-12-21T02:50:00Z
author: system
version: 1.0
color: "rgba(100, 255, 218, 1)"
glow_intensity: 0.3
size: 44
border_width: 2
---

# Theme: Books Bubble Glow Color

Configuration for the Books navigation bubble glow effect.

## Bubble Values

| Property | Value | CSS Variable | Description |
|----------|-------|--------------|-------------|
| Color | rgba(100, 255, 218, 1) | --bubble-books-color | Turquoise glow color |
| Glow Intensity | 0.3 | --bubble-books-glow | Shadow/glow opacity (0-1) |
| Size | 44 | --bubble-books-size | Bubble diameter in pixels |
| Border Width | 2 | --bubble-books-border | Border thickness in pixels |

## Visual Effect

The books bubble displays a turquoise glow effect for the library section.

## CSS Application

```css
.glowing-bubble.books {
  --bubble-color: rgba(100, 255, 218, 1);
  box-shadow: 0 0 15px rgba(100, 255, 218, 0.3);
  width: 44px;
  height: 44px;
  border-width: 2px;
}
```

## Usage Notes

- Color must be a valid CSS color value
- Glow intensity affects the box-shadow opacity
- Changes trigger rebuild of `all-trades.html` and `trades/*.html`

