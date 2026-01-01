---
component: colors
updated: 2025-12-21T02:50:00Z
author: system
version: 1.0
primary_color: "#00ff88"
accent_color: "#ffd93d"
red_color: "#ff4757"
blue_color: "#00d4ff"
bg_primary: "#0a0e27"
bg_secondary: "#0f1429"
border_color: "#27272a"
text_primary: "#e4e4e7"
text_secondary: "#a1a1aa"
---

# Theme: Global Colors

Configuration for the global color palette used throughout the trading journal.

## Color Values

| Property | Value | CSS Variable | Description |
|----------|-------|--------------|-------------|
| Primary Color | #00ff88 | --accent-green | Main accent - buttons, links, positive indicators |
| Accent Color | #ffd93d | --accent-yellow | Secondary - highlights, warnings |
| Red Color | #ff4757 | --accent-red | Loss/error - negative indicators |
| Blue Color | #00d4ff | --accent-blue | Info - informational elements |
| BG Primary | #0a0e27 | --bg-primary | Main page background |
| BG Secondary | #0f1429 | --bg-secondary | Card/container background |
| Border Color | #27272a | --border-color | Default borders |
| Text Primary | #e4e4e7 | --text-primary | Main text color |
| Text Secondary | #a1a1aa | --text-secondary | Secondary/muted text |

## Usage Notes

- Colors must be valid CSS color values (hex, rgb, rgba, hsl, hsla)
- Ensure sufficient contrast for accessibility (WCAG AA: 4.5:1 minimum)
- Changes trigger rebuild of `all-trades.html` and `trades/*.html`

