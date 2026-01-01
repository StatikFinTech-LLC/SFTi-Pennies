---
component: glowbubble.add
updated: 2025-12-21T02:50:00Z
author: system
version: 1.0
color: "rgba(0, 255, 136, 1)"
glow_intensity: 0.3
size: 56
border_width: 2
---

# Theme: Add Bubble Glow Color

Configuration for the Add (+) navigation bubble glow effect.

## Bubble Values

| Property | Value | CSS Variable | Description |
|----------|-------|--------------|-------------|
| Color | rgba(0, 255, 136, 1) | --bubble-add-color | Green glow color |
| Glow Intensity | 0.3 | --bubble-add-glow | Shadow/glow opacity (0-1) |
| Size | 56 | --bubble-add-size | Bubble diameter in pixels (larger than others) |
| Border Width | 2 | --bubble-add-border | Border thickness in pixels |

## Visual Effect

The add bubble displays a green glow effect, matching the primary accent color. This bubble is larger than others to draw attention for the primary action.

## CSS Application

```css
.glowing-bubble.add {
  --bubble-color: rgba(0, 255, 136, 1);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
  width: 56px;
  height: 56px;
  border-width: 2px;
}
```

## Usage Notes

- Color must be a valid CSS color value
- Glow intensity affects the box-shadow opacity
- Changes trigger rebuild of `all-trades.html` and `trades/*.html`

