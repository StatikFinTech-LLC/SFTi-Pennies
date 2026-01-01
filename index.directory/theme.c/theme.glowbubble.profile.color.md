---
component: glowbubble.profile
updated: 2025-12-21T02:50:00Z
author: system
version: 1.0
color: "rgba(147, 51, 234, 1)"
glow_intensity: 0.3
size: 44
border_width: 2
---

# Theme: Profile Bubble Glow Color

Configuration for the Profile navigation bubble glow effect.

## Bubble Values

| Property | Value | CSS Variable | Description |
|----------|-------|--------------|-------------|
| Color | rgba(147, 51, 234, 1) | --bubble-profile-color | Purple glow color |
| Glow Intensity | 0.3 | --bubble-profile-glow | Shadow/glow opacity (0-1) |
| Size | 44 | --bubble-profile-size | Bubble diameter in pixels |
| Border Width | 2 | --bubble-profile-border | Border thickness in pixels |

## Visual Effect

The profile bubble displays a purple glow effect when visible on mobile navigation.

## CSS Application

```css
.glowing-bubble.profile {
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

