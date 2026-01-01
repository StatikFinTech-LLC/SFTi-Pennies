---
component: glass
updated: 2025-12-21T02:50:00Z
author: system
version: 1.0
opacity: 0.55
blur: 45
border_opacity: 0.12
shadow_opacity: 0.25
---

# Theme: Glass Effects

Configuration for glassmorphism visual effects used on cards and containers.

## Glass Values

| Property | Value | CSS Variable | Range | Description |
|----------|-------|--------------|-------|-------------|
| Opacity | 0.55 | --glass-opacity-light | 0.1 - 0.9 | Glass transparency level |
| Blur | 45 | --glass-blur-medium | 5 - 100 | Blur intensity in pixels |
| Border Opacity | 0.12 | --glass-border-opacity | 0.05 - 0.5 | Glass border transparency |
| Shadow Opacity | 0.25 | --glass-shadow-opacity | 0.1 - 0.5 | Glass shadow intensity |

## Visual Guide

### Opacity Levels
- **0.1 - 0.3**: Very transparent, content behind clearly visible
- **0.4 - 0.6**: Balanced transparency (recommended)
- **0.7 - 0.9**: Nearly opaque, minimal see-through effect

### Blur Levels
- **5 - 20px**: Subtle frosted effect
- **25 - 50px**: Standard glass effect (recommended)
- **55 - 100px**: Heavy blur, more dramatic effect

## Usage Notes

- Higher opacity values reduce see-through effect
- Blur affects performance on older devices; keep under 50px for best compatibility
- Changes trigger rebuild of `all-trades.html` and `trades/*.html`

