# Theme Commits Directory

**📁 Location:** `/index.directory/theme.c/`

## Overview

This directory contains theme customization markdown files that define visual styling for the trading journal. These files follow the same commit-based pattern as trade entries in `SFTi.Tradez/`, allowing theme changes to be version-controlled and processed by the Python build scripts.

## Purpose

The theme commit system enables:
- **Persistence**: Theme settings stored as markdown files with YAML front matter
- **Version Control**: All theme changes tracked in Git history
- **Build Integration**: Python scripts read these files when generating HTML pages
- **Consistency**: Single source of truth for theme values across all generated pages

## Directory Structure

```
theme.c/
├── README.md                          # This file
├── theme.header.md                    # Header/navbar theme settings
├── theme.colors.md                    # Global color palette
├── theme.glass.md                     # Glassmorphism effect settings
├── theme.typography.md                # Font and text settings
├── theme.glowbubble.profile.color.md  # Profile bubble glow color
├── theme.glowbubble.add.color.md      # Add bubble glow color
├── theme.glowbubble.books.color.md    # Books bubble glow color
├── theme.glowbubble.notes.color.md    # Notes bubble glow color
├── theme.glowbubble.trades.color.md   # Trades bubble glow color
└── theme.glowbubble.mentors.color.md  # Mentors bubble glow color
```

## File Format

Each theme file uses YAML front matter (like trade markdown files):

```markdown
---
component: colors
updated: 2025-12-21T02:50:00Z
author: user
version: 1.0
---

# Theme: Colors

Configuration for the global color palette.

## Values

- **Primary Color**: #00ff88
- **Accent Color**: #ffd93d
```

## Usage

### Reading Theme Values (Python)

```python
from theme_parser import load_theme_config

# Load all theme settings
theme = load_theme_config()

# Access specific values
primary_color = theme.get('colors', {}).get('primary_color', '#00ff88')
```

### Applying to HTML Generation

Theme values are automatically applied when running:
- `generate_trade_pages.py` - Individual trade detail pages
- `generate_all_trades.py` - All trades listing page (if exists)

The build workflow reads theme files and injects CSS variables into generated HTML.

## Integration with Build System

The theme system integrates with the existing build pipeline:

1. **User commits** theme markdown file changes
2. **GitHub Actions** triggers on changes to `theme.c/` directory
3. **Python scripts** parse theme files and extract values
4. **HTML generation** applies theme values to generated pages
5. **Deployment** updates live site with new theme

## Customization Categories

### Colors (`theme.colors.md`)
- `primary_color` - Main accent color (default: #00ff88)
- `accent_color` - Secondary accent (default: #ffd93d)
- `red_color` - Loss/error color (default: #ff4757)
- `blue_color` - Info color (default: #00d4ff)
- `bg_primary` - Main background (default: #0a0e27)
- `bg_secondary` - Card background (default: #0f1429)

### Glass Effects (`theme.glass.md`)
- `opacity` - Glass transparency (default: 0.55)
- `blur` - Blur intensity in pixels (default: 45)

### Glowing Bubbles (`theme.glowbubble.*.color.md`)
Individual glow colors for each navigation bubble:
- Profile (purple): rgba(147, 51, 234, 1)
- Add (green): rgba(0, 255, 136, 1)
- Books (turquoise): rgba(100, 255, 218, 1)
- Notes (purple): rgba(147, 51, 234, 1)
- Trades (yellow): rgba(251, 191, 36, 1)
- Mentors (pink): rgba(236, 72, 153, 1)

## Related Documentation

- [UsrC.Miles.md](../../.github/docs/UsrC.Miles.md) - Full customization milestone docs
- [customization-usage-examples.md](../../.github/docs/customization-usage-examples.md) - API examples
- [account-config.json](../account-config.json) - Runtime customization storage

---

**Last Updated:** December 2025  
**Purpose:** Theme persistence via markdown commit system  
**Processed By:** `.github/scripts/theme_parser.py`
