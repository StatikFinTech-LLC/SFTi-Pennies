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

The theme system integrates with the existing build pipeline through automated GitHub Actions workflows:

### Workflow: `theme_update.yml`

**Triggers:**
- Push to `index.directory/theme.c/` directory
- Changes to `.github/scripts/theme_parser.py`
- Manual workflow dispatch

**Steps:**
1. **User commits** theme markdown file changes (e.g., update colors in `theme.colors.md`)
2. **GitHub Actions** automatically triggers `theme_update.yml` workflow
3. **Theme parser** loads and validates all theme configuration files
4. **HTML generation** regenerates Python-generated pages with new theme:
   - `index.directory/all-trades.html` - Main trades listing
   - `index.directory/trades/*.html` - Individual trade detail pages
5. **Theme injection** updates all static HTML pages with new theme:
   - `index.html` - Homepage
   - `index.directory/analytics.html` - Analytics page
   - `index.directory/add-trade.html` - Add trade form
   - `index.directory/add-note.html` - Add note form
   - `index.directory/add-pdf.html` - Add PDF form
   - `index.directory/books.html` - Books index
   - `index.directory/notes.html` - Notes index
   - `index.directory/review.html` - Review page
   - `index.directory/import.html` - Import page
   - `index.directory/customization.html` - Customization page
   - `index.directory/all-weeks.html` - Weekly summaries
6. **Auto-commit** pushes all updated HTML files back to the repository
7. **Deployment** GitHub Pages serves updated pages with new theme

**Example Usage:**
```bash
# Update a theme color
cd index.directory/theme.c
vim theme.colors.md  # Change primary_color to #ff00ff
git add theme.colors.md
git commit -m "Update primary color to pink"
git push

# Workflow automatically runs and updates ALL HTML pages
# No manual intervention needed!
```

**Workflow File:** `.github/workflows/theme_update.yml`

### Affected HTML Files

When theme files change, **ALL HTML pages** are automatically updated with new theme CSS variables:

**Python-Generated Pages** (regenerated from scratch):
- `index.directory/all-trades.html` - Main trades listing
- `index.directory/trades/*.html` - Individual trade detail pages

**Static HTML Pages** (theme CSS injected):
- `index.html` - Homepage
- `index.directory/analytics.html` - Analytics dashboard
- `index.directory/add-trade.html` - Trade entry form
- `index.directory/add-note.html` - Note entry form
- `index.directory/add-pdf.html` - PDF upload form
- `index.directory/books.html` - Books library
- `index.directory/notes.html` - Notes library
- `index.directory/review.html` - Trade review interface
- `index.directory/import.html` - Data import interface
- `index.directory/customization.html` - Theme customization UI
- `index.directory/all-weeks.html` - Weekly performance summaries

All pages use the same theme configuration from `theme.c/` markdown files, ensuring **uniform styling** across the entire application.

The `trade_pipeline.yml` workflow also uses theme integration for its regular page generation.

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
