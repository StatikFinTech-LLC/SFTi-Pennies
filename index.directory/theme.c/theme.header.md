---
component: header
updated: 2025-12-21T02:50:00Z
author: system
version: 1.0
background_color: "rgba(10, 14, 39, 0.55)"
border_color: "rgba(255, 255, 255, 0.12)"
text_color: "#e4e4e7"
logo_color: "#00ff88"
height: "60px"
blur: 20
---

# Theme: Header/Navbar

Configuration for the top navigation bar appearance.

## Header Values

| Property | Value | CSS Variable | Description |
|----------|-------|--------------|-------------|
| Background Color | rgba(10, 14, 39, 0.55) | --header-bg-color | Navbar background with transparency |
| Border Color | rgba(255, 255, 255, 0.12) | --header-border-color | Bottom border color |
| Text Color | #e4e4e7 | --header-text-color | Navigation link text color |
| Logo Color | #00ff88 | --header-logo-color | Logo/brand text color |
| Height | 60px | --header-height | Navbar height |
| Blur | 20 | --header-blur | Background blur intensity |

## CSS Application

These values are applied to navbar components:

```css
.nav-container {
  background: var(--header-bg-color);
  border-bottom: 1px solid var(--header-border-color);
  backdrop-filter: blur(var(--header-blur));
  height: var(--header-height);
}

.nav-link {
  color: var(--header-text-color);
}

.nav-logo {
  color: var(--header-logo-color);
}
```

## Usage Notes

- Background uses rgba for glass effect transparency
- Text color should contrast well against the background
- Changes trigger rebuild of `all-trades.html` and `trades/*.html`

