# SFTi-Pennies Repository Structure

Complete updated structure including all new features from the analytics fix and reactive state management implementation.

## 📁 Root Directory

```txt
SFTi-Pennies/
│
├── index.html              # Homepage with portfolio stats
├── add-trade.html          # Trade submission form
├── all-trades.html         # Complete trade listing
├── analytics.html          # Analytics dashboard (updated with new metrics)
├── all-weeks.html          # Weekly summaries
├── books.html              # PDF library browser
├── notes.html              # Trading notes viewer
├── import.html             # CSV import interface
├── review.html             # Weekly review tool
├── manifest.json           # PWA manifest with app shortcuts
├── sw.js                   # Service worker for offline support
├── README.md               # Main documentation
├── LICENSE                 # MIT License
│
├── docs/                   # Additional documentation
│   ├── EVENT_BUS_GUIDE.md          # Event bus integration guide
│   └── IMPLEMENTATION_SUMMARY.md   # Implementation summary
│
└── index.directory/        # GitHub Pages root
    ├── _config.yml         # Jekyll configuration
    ├── account-config.json # Account balance and deposits (NEW)
    ├── trades-index.json   # Generated trade index
    ├── books-index.json    # Generated books index
    ├── notes-index.json    # Generated notes index
    │
    ├── Informational.Bookz/    # Trading education PDFs
    │   ├── 10_Patterns.pdf
    │   ├── 20_Strategies.pdf
    │   ├── 7_Figure_MindSet.pdf
    │   ├── American_Hedge_Fund.pdf
    │   ├── Penny_Corse.pdf
    │   ├── Protect_Profit.pdf
    │   └── README.md
    │
    ├── SFTi.Notez/            # Trading strategies and frameworks
    │   ├── 7.Step.Frame.md
    │   ├── GSTRWT.md
    │   ├── Penny.Indicators.md
    │   ├── Dip.n.Rip.md
    │   ├── Trade.Plan.md
    │   └── README.md
    │
    ├── SFTi.Tradez/           # Trade journal entries
    │   ├── week.001/
    │   ├── week.002/
    │   ├── template/
    │   └── README.md
    │
    ├── assets/                # Web assets
    │   ├── charts/            # Generated charts and analytics
    │   │   ├── analytics-data.json    # Generated analytics with account metrics (UPDATED)
    │   │   ├── equity-curve-data.json
    │   │   ├── equity-curve.png
    │   │   └── trade-distribution.png
    │   │
    │   ├── css/              # Stylesheets
    │   │   └── main.css      # Main dark theme styles
    │   │
    │   ├── icons/            # PWA icons
    │   │   ├── icon-192.png
    │   │   └── icon-512.png
    │   │
    │   ├── js/               # JavaScript modules
    │   │   ├── accountManager.js   # Account balance & deposit management (NEW)
    │   │   ├── analytics.js        # Analytics page logic (UPDATED)
    │   │   ├── app.js              # Homepage logic (UPDATED)
    │   │   ├── auth.js             # GitHub authentication
    │   │   ├── background.js       # Background animations
    │   │   ├── eventBus.js         # Reactive event system (NEW)
    │   │   ├── import.js           # CSV import logic (UPDATED)
    │   │   └── [other modules]
    │   │
    │   ├── sfti.notez.assets/     # Strategy framework images
    │   │   ├── 7.step.framework.assets/
    │   │   │   ├── Step.1.png through Step.7.png
    │   │   │   └── README.md
    │   │   └── trade.plan.assets/
    │   │       ├── Trade_Plan.png
    │   │       └── README.md
    │   │
    │   └── sfti.tradez.assets/    # Trade chart screenshots
    │       ├── week.001/
    │       ├── week.002/
    │       └── README.md
    │
    ├── summaries/            # Generated weekly summaries
    │   └── README.md
    │
    ├── trades/               # Generated individual trade pages
    │   └── [auto-generated]
    │
    └── render/               # Rendering utilities
        └── README.md
```

## ⚙️ .github Directory

```txt
.github/
│
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── FUNDING.yml
├── PULL_REQUEST_TEMPLATE.md
├── SECURITY.md
├── copilot-instructions.md
│
├── ISSUE_TEMPLATE/
│   ├── bug-report.md
│   ├── feature-request.md
│   └── ibkr-integration.md
│
├── UI-SS/                  # UI screenshots
│   ├── App-Presentation.01.demo.png
│   ├── App-Presentation.02.demo.png
│   ├── App-Presentation.03.demo.png
│   ├── App-Icon.demo.png
│   └── README.md
│
├── docs/                   # Comprehensive documentation
│   ├── ANALYTICS.md                      # Analytics system documentation
│   ├── BOOKS-NOTES-IMPLEMENTATION.md     # Books/notes feature docs
│   ├── IMPLEMENTATION.md                 # Implementation guide
│   ├── QUICKSTART.md                     # Quick start guide
│   ├── README-DEV.md                     # Developer documentation
│   ├── README.md                         # Docs index
│   ├── STRUCTURE.md                      # This file
│   ├── SYSTEM-MERMAID.md                 # Complete system diagrams (NEW)
│   ├── TRADE_PIPELINE.md                 # Trade pipeline documentation
│   └── importing.md                      # CSV import guide
│
├── icons/
│   └── icon.png
│
├── scripts/                # Automation scripts
│   ├── generate_analytics.py       # Analytics generator (FIXED: max drawdown, uses account-config)
│   ├── generate_books_index.py     # Books index generator
│   ├── generate_charts.py          # Chart generator
│   ├── generate_index.py           # Main index generator
│   ├── generate_notes_index.py     # Notes index generator
│   ├── generate_summaries.py       # Trade summaries generator
│   ├── generate_trade_pages.py     # Individual trade page generator
│   ├── generate_week_summaries.py  # Weekly summary generator
│   ├── parse_trades.py             # Trade parser (FIXED: max drawdown calculation)
│   ├── update_homepage.py          # Homepage updater
│   ├── attach_media.py             # Media attachment utility
│   ├── normalize_schema.py         # Schema normalization
│   ├── navbar_template.py          # Navigation bar template
│   ├── optimize_images.sh          # Image optimization
│   ├── build.mjs                   # Build script
│   ├── export_csv.py               # CSV export
│   ├── import_csv.py               # CSV import
│   ├── README.md                   # Scripts documentation
│   │
│   └── importers/          # Broker import modules
│       ├── ibkr_importer.py
│       ├── schwab_importer.py
│       ├── robinhood_importer.py
│       ├── webull_importer.py
│       └── README.md
│
├── templates/              # Content templates
│   ├── trade.md.template
│   ├── weekly-summary.md.template
│   └── README.md
│
└── workflows/              # GitHub Actions workflows
    ├── trade_pipeline.yml          # Main processing pipeline (UPDATED: watches account-config.json)
    └── README.md
```

## 📊 Key Files Added/Updated in Analytics Fix

### New Files
1. **`index.directory/account-config.json`** - Stores starting balance and deposit history
2. **`index.directory/assets/js/accountManager.js`** - Manages account balance and deposits
3. **`index.directory/assets/js/eventBus.js`** - Reactive event system for real-time updates
4. **`sw.js`** - Service worker for offline PWA functionality
5. **`docs/EVENT_BUS_GUIDE.md`** - Integration guide for event system
6. **`docs/IMPLEMENTATION_SUMMARY.md`** - Summary of implementation
7. **`.github/docs/SYSTEM-MERMAID.md`** - Complete system architecture diagrams

### Updated Files
1. **`.github/scripts/generate_analytics.py`**
   - Fixed max drawdown calculation (peak starts at 0)
   - Added `load_account_config()` function
   - Added `calculate_returns_metrics()` for percentage-based analytics
   - Uses account-config.json for starting balance and deposits

2. **`.github/scripts/parse_trades.py`**
   - Fixed max drawdown formula from `peak - value` to `value - peak`
   - Peak now starts at 0 instead of first trade value

3. **`.github/workflows/trade_pipeline.yml`**
   - Added `index.directory/account-config.json` to watch paths
   - Triggers workflow when account config is updated

4. **`index.directory/assets/js/app.js`**
   - Integrated with event bus for reactive updates
   - Displays portfolio value and total return %
   - Listens for account balance updates

5. **`index.directory/assets/js/analytics.js`**
   - Integrated with event bus
   - Displays new percentage-based metrics
   - Auto-refreshes on data changes

6. **`index.directory/assets/js/import.js`**
   - Emits CSV download events
   - Integrated with event bus

7. **`index.html`**
   - Added account balance editor (click to edit)
   - Added deposit modal
   - Added portfolio value stat card
   - Added total return % display
   - Service worker registration

8. **`index.directory/analytics.html`**
   - Expanded to 10 key metrics
   - Color-coded values
   - Shows both $ and % for drawdown
   - Percentage-based returns metrics

9. **`manifest.json`**
   - Updated description with all features
   - Added app shortcuts (Add Trade, Analytics, All Trades, Import CSV)
   - Added proper PWA scope

10. **`README.md`**
    - Updated with new features
    - Added links to new documentation

## 📈 Data Flow

### Trade Submission Flow
```
User fills form → Validates → Commits .md file via API
  → Push triggers workflow → parse_trades.py processes
  → generate_analytics.py calculates → Charts generated
  → Results committed → UI fetches updates → Event bus notifies
  → All pages refresh automatically
```

### Account Balance Update Flow
```
User edits balance → Saves to localStorage → Instant UI update
  → Commits account-config.json via API → Push triggers workflow
  → generate_analytics.py loads config → Recalculates with new baseline
  → Results committed → UI fetches updates → Event bus notifies
  → All pages refresh with new percentages
```

### Event-Driven Updates
```
accountManager.updateBalance()
  → emit('account:balance-updated')
    → app.js refreshes stats
    → analytics.js reloads charts
    → No page reload needed!
```

## 🎯 Key Features by Directory

### `/` (Root)
- PWA manifest and service worker
- Main HTML pages
- Mobile-first responsive design

### `index.directory/`
- GitHub Pages deployment root
- Account configuration
- Generated JSON data files

### `index.directory/assets/js/`
- **accountManager.js**: Balance/deposit management, auto-commit via GitHub API
- **eventBus.js**: Central event system for reactive updates
- **auth.js**: GitHub PAT authentication
- **app.js**: Homepage logic with portfolio tracking
- **analytics.js**: Advanced analytics dashboard

### `.github/scripts/`
- **generate_analytics.py**: Core analytics with fixed calculations
- **parse_trades.py**: Trade parser with corrected max drawdown
- All automation for processing trades and generating content

### `.github/workflows/`
- **trade_pipeline.yml**: Automated processing on push or workflow_dispatch
- Watches trade files AND account-config.json

## 📝 Summary

This structure supports:
- ✅ **Corrected analytics** (Max Drawdown, Kelly, Expectancy)
- ✅ **Account tracking** (Balance, deposits, portfolio value)
- ✅ **Percentage metrics** (Total return %, Avg return %, Max DD %, etc.)
- ✅ **Reactive updates** (Real-time UI without page reload)
- ✅ **PWA offline support** (Service worker caching)
- ✅ **Auto-commit** (Balance/deposit changes via GitHub API)
- ✅ **Mobile-first** (Optimized for mobile trading)
- ✅ **Zero-cost** (GitHub Pages hosting)

The system is **production-ready** with **comprehensive documentation** and **complete system diagrams**.
