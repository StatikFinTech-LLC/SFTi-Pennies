# index.directory - Main Application Directory

**📁 Location:** `/index.directory`

<div align="center">

[![Live Site](https://img.shields.io/badge/🌐_View_Live-Trading_Journal-00ff88?style=for-the-badge)](https://statikfintechllc.github.io/SFTi-Pennies/)

</div>

## Overview

This is the **main application directory** containing all public-facing content, trading data, assets, and frontend code for the SFTi-Pennies trading journal. Everything in this directory is served via GitHub Pages and accessible on the live site.

## 📋 Directory Index

A comprehensive **[index.csv](./index.csv)** file catalogs all code files, classes, functions, and components in this directory:
- **195 entries** documenting the entire codebase
- Includes all JavaScript classes, methods, and functions
- Documents all HTML pages and CSS stylesheets
- Provides line number ranges for easy navigation
- Detailed descriptions for each component

Use the index.csv to quickly locate specific functionality or understand the codebase structure.

## 📂 Directory Structure

```
index.directory/
├── 📚 Informational.Bookz/   # PDF trading education library
├── 📝 SFTi.Notez/             # Trading frameworks and strategies
├── 📊 SFTi.Tradez/            # Live trading journal entries
├── 🎨 assets/                 # All visual and code assets
│   ├── charts/                # Performance charts (auto-generated)
│   ├── css/                   # Stylesheets
│   ├── icons/                 # PWA icons
│   ├── js/                    # JavaScript files
│   ├── sfti.notez.assets/     # Framework screenshots
│   └── sfti.tradez.assets/    # Trade screenshots
├── 🎨 styles/                 # Specialized CSS (PDF, Markdown viewers)
├── 📦 src/                    # JavaScript source for bundling
├── 🔧 render/                 # PDF and Markdown rendering modules
├── 🎯 HTML Pages              # Main web pages
│   ├── index.html             # Homepage
│   ├── add-trade.html         # Trade submission form
│   ├── all-trades.html        # Complete trade list
│   ├── books.html             # PDF book viewer
│   └── notes.html             # Markdown notes viewer
├── 📊 JSON Indices            # Auto-generated data indices
│   ├── trades-index.json      # All trades data
│   ├── books-index.json       # PDF library index
│   └── notes-index.json       # Notes framework index
└── ⚙️ Configuration
    ├── _config.yml            # Jekyll configuration (inside index.directory)
    └── manifest.json          # PWA manifest (in root)
```

## 🎯 Main Sections

### 📚 [Informational.Bookz](./Informational.Bookz/README.md)
**Trading Education PDF Library**

Complete library of trading education resources:
- 📖 10 Essential Patterns
- 📖 20 Trading Strategies
- 🧠 7-Figure Mindset
- 💰 Profit Protection
- 🎓 Complete Penny Stock Course
- 💼 Hedge Fund Strategies

**Access:** [books.html](https://statikfintechllc.github.io/SFTi-Pennies/books.html)

---

### 📝 [SFTi.Notez](./SFTi.Notez/README.md)
**Trading Frameworks & Strategies**

Actionable trading plans and methodologies:
- [🎯 7-Step Framework](./SFTi.Notez/7.Step.Frame.md) - Pattern lifecycle
- [🔄 GSTRWT Method](./SFTi.Notez/GSTRWT.md) - Daily workflow
- [📊 Penny Indicators](./SFTi.Notez/Penny.Indicators.md) - Technical analysis
- [📋 Trading Plan](./SFTi.Notez/Trade.Plan.md) - Complete strategy

**Access:** [notes.html](https://statikfintechllc.github.io/SFTi-Pennies/notes.html)

---

### 📊 [SFTi.Tradez](./SFTi.Tradez/README.md)
**Live Trading Journal**

Real trades with complete transparency:
- 📅 Weekly journals organized by date
- 💹 Detailed P&L tracking
- 📸 Chart screenshots
- 📖 Lessons learned
- 📈 Performance analytics

**Access:** [index.html](https://statikfintechllc.github.io/SFTi-Pennies/) (Recent trades)  
**All Trades:** [all-trades.html](https://statikfintechllc.github.io/SFTi-Pennies/all-trades.html)

---

### 🎨 [assets](./assets/README.md)
**Visual Assets & Frontend Code**

Complete asset directory:
- [📊 charts/](./assets/charts/README.md) - Auto-generated performance charts
- [🎨 css/](./assets/css/README.md) - Main stylesheet (dark terminal theme)
- [🖼️ icons/](./assets/icons/README.md) - PWA app icons
- [⚡ js/](./assets/js/README.md) - Client-side JavaScript
- [📸 sfti.notez.assets/](./assets/sfti.notez.assets/README.md) - Framework visuals
- [📊 sfti.tradez.assets/](./assets/sfti.tradez.assets/README.md) - Trade screenshots

---

### 🎨 [styles](./styles/README.md)
**Specialized Stylesheets**

Content-specific styling:
- `pdf-viewer.css` - PDF.js viewer styling
- `markdown.css` - GitHub-flavored Markdown styling

---

### 📦 [src](./src/README.md)
**JavaScript Source Files**

Bundle entry points:
- `main.js` - Imports and configures PDF.js, Marked.js, Highlight.js
- Bundled to `assets/js/bundle.min.js` via esbuild

---

### 🔧 [render](./render/README.md)
**Content Rendering Modules**

JavaScript rendering engines:
- `pdfRenderer.js` - PDF document viewer
- `markdownRenderer.js` - Markdown note renderer

---

## 🌐 Web Pages

### Core Pages

#### [index.html](https://statikfintechllc.github.io/SFTi-Pennies/)
**Homepage & Dashboard**
- Recent 3 trades display
- Performance summary
- Quick navigation
- Equity curve chart
- Mobile-optimized PWA

#### [add-trade.html](https://statikfintechllc.github.io/SFTi-Pennies/add-trade.html)
**Trade Submission Form**
- Web-based trade entry
- Automatic P&L calculation
- Risk:Reward calculation
- Image upload support
- GitHub API integration

#### [all-trades.html](https://statikfintechllc.github.io/SFTi-Pennies/all-trades.html)
**Complete Trade List**
- Sortable trade table
- Filter by date, ticker, P&L
- Paginated display
- Links to detail pages

#### [books.html](https://statikfintechllc.github.io/SFTi-Pennies/books.html)
**PDF Book Viewer**
- Browse trading education PDFs
- In-browser PDF viewing
- Navigation controls
- Search functionality

#### [notes.html](https://statikfintechllc.github.io/SFTi-Pennies/notes.html)
**Trading Notes Viewer**
- Browse trading frameworks
- Rendered markdown display
- Syntax-highlighted code
- Mobile-responsive

## 📊 Automated Data Files

### trades-index.json
**Master Trade Index**

Generated by: `.github/scripts/parse_trades.py`

Contains all trade data parsed from markdown files:
```json
{
  "trades": [
    {
      "trade_number": 1,
      "ticker": "AAPL",
      "entry_date": "2025-01-15",
      "pnl_usd": 125.50,
      "pnl_percent": 2.5,
      // ... more fields
    }
  ],
  "summary": {
    "total_trades": 10,
    "win_rate": 70.0,
    "total_pnl": 850.25
  }
}
```

**Used by:** Homepage, all-trades page, charts

---

### books-index.json
**PDF Library Index**

Generated by: `.github/scripts/generate_books_index.py`

Contains metadata for all PDF files:
```json
{
  "books": [
    {
      "filename": "10_Patterns.pdf",
      "title": "10 Essential Patterns",
      "path": "/index.directory/Informational.Bookz/10_Patterns.pdf",
      "size": "2.5MB",
      "pages": 45
    }
  ]
}
```

**Used by:** books.html viewer

---

### notes-index.json
**Trading Notes Index**

Generated by: `.github/scripts/generate_notes_index.py`

Contains metadata for all framework notes:
```json
{
  "notes": [
    {
      "filename": "7.Step.Frame.md",
      "title": "7-Step Framework",
      "path": "/index.directory/SFTi.Notez/7.Step.Frame.md",
      "excerpt": "Complete penny stock pattern lifecycle...",
      "related_assets": [...]
    }
  ]
}
```

**Used by:** notes.html viewer

---

## 🎨 Design System

### Visual Theme
**Dark Terminal Trading Aesthetic**

- **Primary Background:** `#0a0e27` (Deep navy)
- **Secondary Background:** `#151b3d` (Medium navy)
- **Accent Color:** `#00ff88` (Terminal green)
- **Error/Loss Color:** `#ff4757` (Alert red)
- **Text Primary:** `#e0e0e0` (Light gray)
- **Text Secondary:** `#a0a0a0` (Medium gray)

### Typography
- **Main:** 'Inter' - Clean, modern sans-serif
- **Mono:** 'JetBrains Mono' - Technical data display
- **Sizes:** Responsive (13px mobile to 16px desktop)

### Components
- Sparkling SVG card designs
- Smooth animations and transitions
- Mobile-first responsive layout
- Touch-friendly interactions
- PWA-ready interface

## 🚀 Progressive Web App (PWA)

### Features
- ✅ Installable on mobile and desktop
- ✅ Offline-capable (service worker planned)
- ✅ App-like experience
- ✅ Home screen icons
- ✅ Standalone display mode

### Configuration
**Manifest:** `/manifest.json` (symlinked from root)
```json
{
  "name": "SFTi-Pennies Trading Journal",
  "short_name": "SFTi-Pennies",
  "start_url": "/SFTi-Pennies/",
  "display": "standalone",
  "theme_color": "#00ff88"
}
```

## 🔗 Navigation Flow

```
Homepage (index.html)
    ├── View Recent Trades
    ├── Add New Trade → add-trade.html
    ├── View All Trades → all-trades.html
    ├── Browse Books → books.html
    ├── Read Notes → notes.html
    └── View Charts → Embedded in pages
```

## 🤖 Automated Processing

This directory is maintained automatically by GitHub Actions:

1. **Trade Submission** → Markdown files added to `SFTi.Tradez/`
2. **Workflow Trigger** → GitHub Actions detects changes
3. **Data Processing:**
   - Parse trades → `trades-index.json`
   - Index books → `books-index.json`
   - Index notes → `notes-index.json`
   - Generate charts → `assets/charts/`
4. **Optimization:**
   - Compress images
   - Bundle JavaScript
5. **Deployment** → Push to GitHub Pages

**Result:** Live site updates automatically ✨

## 📊 Performance

### Load Times
- **First Paint:** < 1 second
- **Interactive:** < 2 seconds
- **Full Load:** < 3 seconds

### Optimization Techniques
- Lazy loading images
- Minified JavaScript/CSS
- Compressed assets
- Efficient selectors
- Cached resources

## 🔧 Development

### Local Development
```bash
# Serve locally
python -m http.server 8000

# Open browser
open http://localhost:8000/index.directory/

# Or use Jekyll
bundle exec jekyll serve
```

### Building
```bash
# Bundle JavaScript
npm run build

# Optimize images
bash .github/scripts/optimize_images.sh

# Generate indices (happens automatically in CI)
python .github/scripts/parse_trades.py
python .github/scripts/generate_books_index.py
python .github/scripts/generate_notes_index.py
```

## 🌐 External Links

### SFTi Ecosystem
- **[Live Site](https://statikfintechllc.github.io/SFTi-Pennies/)** - This journal
- **[SFTi AI Platform](https://www.sfti-ai.org)** - AI trading tools
- **[Ascend Institute](https://www.sfti-ai.org/ascend-institute)** - Trading education

### Repository
- **[GitHub Repo](https://github.com/statikfintechllc/SFTi-Pennies)** - Source code
- **[Issues](https://github.com/statikfintechllc/SFTi-Pennies/issues)** - Bug reports
- **[Documentation](../.github/docs/README.md)** - Complete docs

## Quick Links

<table>
<tr>
<td width="50%">

### 📚 Content
- [📖 Books](./Informational.Bookz/README.md)
- [📝 Notes](./SFTi.Notez/README.md)
- [📊 Trades](./SFTi.Tradez/README.md)
- [🎨 Assets](./assets/README.md)

</td>
<td width="50%">

### 🛠️ Technical
- [🎨 CSS](./assets/css/README.md)
- [⚡ JavaScript](./assets/js/README.md)
- [📦 Source](./src/README.md)
- [🔧 Render](./render/README.md)

</td>
</tr>
</table>

---

**Last Updated:** October 2025  
**Purpose:** Main application directory for public-facing content  
**Hosted At:** [statikfintechllc.github.io/SFTi-Pennies](https://statikfintechllc.github.io/SFTi-Pennies/)  
**Maintained By:** StatikFintech LLC
