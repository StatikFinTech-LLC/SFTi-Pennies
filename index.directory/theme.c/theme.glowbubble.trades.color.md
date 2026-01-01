---
component: glowbubble.trades
updated: 2025-12-21T02:50:00Z
author: system
version: 1.0
color: "rgba(251, 191, 36, 1)"
glow_intensity: 0.3
size: 44
border_width: 2
---

# Theme: Trades Bubble Glow Color

Configuration for the Trades navigation bubble glow effect.

## Bubble Values

| Property | Value | CSS Variable | Description |
|----------|-------|--------------|-------------|
| Color | rgba(251, 191, 36, 1) | --bubble-trades-color | Yellow/amber glow color |
| Glow Intensity | 0.3 | --bubble-trades-glow | Shadow/glow opacity (0-1) |
| Size | 44 | --bubble-trades-size | Bubble diameter in pixels |
| Border Width | 2 | --bubble-trades-border | Border thickness in pixels |

## Visual Effect

The trades bubble displays a yellow/amber glow effect for the trading section.

## CSS Application

```css
.glowing-bubble.trades {
  --bubble-color: rgba(251, 191, 36, 1);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
  width: 44px;
  height: 44px;
  border-width: 2px;
}
```

## Usage Notes

- Color must be a valid CSS color value
- Glow intensity affects the box-shadow opacity
- Changes trigger rebuild of `all-trades.html` and `trades/*.html`

