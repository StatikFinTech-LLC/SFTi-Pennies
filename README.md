<h1>📈 SFTi-Pennies Trading Journal<h1></h1>

**Automated penny stock trading journal with professional analytics • Mobile-first PWA • GitHub-powered**

<div align="center">
    
[![Live Journal](https://img.shields.io/badge/🌐_Live_Site-Visit-00ff88?style=for-the-badge)](https://statikfintech-llc.github.io/SFTi-Pennies/)

</div>

-----

## 🎯 What Is This?

A complete trading journal system built by a mechanic learning to trade. Zero backend servers—everything runs on GitHub Actions and deploys to GitHub Pages. Track trades, analyze performance, review weekly progress, all from your phone.

**Built in 20 days, part-time, on an iPhone 16 Pro.**

### Core Features

- **21 Analytics Metrics** - Total Return, Expectancy, Profit Factor, Sharpe Ratio, R-Multiples, Max Drawdown, Kelly Criterion
- **12+ Interactive Charts** - Equity curves, strategy breakdowns, drawdown analysis, performance by ticker/day/time
- **Multi-Timeframe Analysis** - Day/Week/Month/Quarter/Year/5-Year views
- **CSV Import** - IBKR, Schwab, Robinhood, Webull
- **Mobile-First PWA** - Install on iOS, works offline
- **Automated Pipeline** - Commit trade → GitHub Actions process → Deploy
- **Dark Terminal UI** - Glass morphism effects, sparkling animations

-----

## 📊 Analytics Engine

### Dashboard (`index.html`)

**Quick Stats (Modal Cards):**

- Portfolio Value
- Total Return %
- Total Trades
- Win Rate %
- Trade P&L ($)
- Average P&L ($)

**Interactive Modals:**

- **Portfolio Value** → Multi-timeframe chart + deposit/withdrawal tracking
- **Total Return** → Multi-timeframe % returns + deposit entry
- **Trade P&L** → Monthly calendar heatmap + best/worst/avg month stats
- **Avg P&L** → Win/loss breakdown + W/L ratio

**Performance Section:**
11 embedded charts from analytics engine + 3 most recent trades carousel

### Analytics Hub (`analytics.html`)

**10 Core Metrics:**

1. Total Return
1. Avg Return/Trade
1. Expectancy
1. Profit Factor
1. Avg Risk %
1. Avg Position Size
1. Max Drawdown
1. Sharpe Ratio
1. Avg R-Multiple
1. Median R-Multiple

**13 Charts:**

1. Strategy Breakdown (Grid)
1. W/L Ratio by Strategy
1. R-Multiple Distribution
1. Performance by Strategy
1. Performance by Setup
1. Win Rate Analysis
1. Drawdown Over Time
1. Performance by Day of Week
1. Performance by Ticker
1. Time of Day Performance
1. Equity Curve
1. Portfolio Value (6 timeframes)
1. Total Return (6 timeframes)

-----

## 🧭 Navigation

### Dual-Navbar System

**Top Bar:** Logo • Title • Home  
**Bottom Bar (Mobile) / Top Bar (Desktop):** 5 floating bubble menus

1. **Profile** (Purple) - GitHub auth, PWA refresh
1. **Add** (Green +) - Quick trade entry → `add-trade.html`
1. **Books** (Turquoise) - Library viewer + uploader → `books.html`, `add-book.html`
1. **Notes** (Purple Paper) - Strategy notes + creator → `notes.html`, `add-note.html`
1. **Trades** (Yellow Graph) - Trade hub with popup:

- `all-trades.html` - Complete list
- `all-weeks.html` - Weekly summaries
- `analytics.html` - Full metrics
- `import.html` - CSV importer
- `review.html` - Weekly review tool

1. **Mentors** (Pink) - Links to Tim Sykes, Tim Bohen

> **Platform:** iOS & Desktop only

-----

## 🗂️ Repository Structure

```
SFTi-Pennies/
├── index.html                    # Main dashboard
├── manifest.json                 # PWA config
│
├── index.directory/              # Frontend application
│   ├── Informational.Bookz/      # Trading education PDFs
│   ├── SFTi.Notez/               # Strategy frameworks (markdown)
│   ├── SFTi.Tradez/              # Live trades journal
│   │   ├── template/             # Trade entry template
│   │   └── week.YYYY.WW/         # Weekly folders
│   │       ├── MM:DD:YYYY.N.md   # Individual trades
│   │       └── master.trade.md   # Week aggregation
│   │
│   ├── assets/
│   │   ├── charts/               # Generated chart JSON
│   │   ├── css/                  # Dark terminal theme
│   │   ├── js/                   # Client-side logic
│   │   └── sfti.tradez.assets/   # Trade screenshots
│   │
│   ├── summaries/                # Auto-generated summaries
│   ├── trades/                   # Individual trade HTML pages
│   ├── render/                   # MD/PDF renderers
│   └── [app pages].html          # add-trade, analytics, etc.
│
└── .github/
    ├── scripts/                  # Python/Node processing
    │   ├── generate_analytics.js # Calculate 21 metrics
    │   ├── generate_charts.js    # Create chart data
    │   ├── parse_trades.js       # Process markdown
    │   └── importers/            # Broker CSV parsers
    │
    ├── workflows/                # GitHub Actions pipelines
    │   ├── trade_pipeline.js     # Main automation
    │   └── site_submit_workflow.js
    │
    └── templates/                # Content templates
```

-----

## 🚀 Quick Start

### For Visitors

1. Visit [live site](https://statikfintech-llc.github.io/SFTi-Pennies/)
1. Browse recent trades on homepage
1. Check analytics dashboard
1. Review weekly summaries

### For Traders (Use System)

1. **Fork** this repo
1. **Configure** `index.directory/account-config.json` (starting capital, timezone)
1. **Enable** GitHub Actions + Pages in repo settings
1. **Add trades** via web form or commit markdown files
1. **Import** broker CSV via import page
1. **Review** weekly performance via review tool

### For Developers (Clone & Customize)

1. `git clone https://github.com/statikfintechllc/SFTi-Pennies.git`
1. `npm install`
1. Study `.github/scripts/` for processing logic
1. Modify templates in `.github/templates/`
1. Customize charts in `assets/js/chartConfig.js`

-----

## 🔄 How It Works

```
Trade Entry (markdown) → Commit to GitHub
  ↓
GitHub Actions Trigger
  ↓
Scripts Process (.github/scripts/)
  • Parse trade markdown
  • Calculate analytics
  • Generate charts JSON
  • Create summaries
  • Build HTML pages
  ↓
Deploy to GitHub Pages
  ↓
Live Update on Site
```

**Zero manual work.** Add trade, push commit, wait 3 minutes, see results.

-----

## 📚 Learning Resources

**Frameworks:**

- [7-Step Pattern Framework](./index.directory/SFTi.Notez/7.Step.Frame.md) - Core recognition system
- [GSTRWT Method](./index.directory/SFTi.Notez/GSTRWT.md) - Daily workflow
- [Penny Indicators](./index.directory/SFTi.Notez/Penny.Indicators.md) - Top 5 tools
- [Dip & Rip Pattern](./index.directory/SFTi.Notez/Dip.n.Rip.md) - Breakout timing

**Books:** [Library](./index.directory/Informational.Bookz/README.md) includes 10 Patterns, 20 Strategies, 7-Figure Mindset, Profit Protection, Complete Penny Course

**Live Examples:** [Trade Journal](./index.directory/SFTi.Tradez/README.md) - Real trades with screenshots

-----

## 🛠️ Tech Stack

**Frontend:** HTML5, CSS3, Vanilla JS, Chart.js, PDF.js, Marked.js  
**Processing:** Python 3.11, Node.js 16+, GitHub Actions  
**Hosting:** GitHub Pages (Jekyll)  
**Storage:** Markdown files, JSON indices, LocalForage (client)

-----

## 📊 Trading Philosophy

✅ Cut losses quickly (Rule #1)  
✅ Pattern recognition over prediction  
✅ Risk management: position sizing + stop losses  
✅ Full transparency: log every trade  
✅ Weekly reviews for continuous improvement

**Goal:** 18 months to freedom 🚀

-----

<div align="center">
  <a href="https://github.com/sponsors/statikfintechllc">
    <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/L.W.badge.svg" alt="Like my work?" />
  </a>
</div>
<div align="center">
<a href="https://github.com/sponsors/statikfintechllc">
  <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/git.sponsor.svg">
</a><br>
<a href="https://ko-fi.com/statikfintech_llc">
  <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/kofi.sponsor.svg">
</a><br>
<a href="https://patreon.com/StatikFinTech_LLC">
  <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/patreon.sponsor.svg">
</a>
</div>

-----

## 🔗 Links

- [**Live Journal:**](https://statikfintech-llc.github.io/SFTi-Pennies/)
- [**Ascend Institute**](https://statikfintechllc.github.io/Ascend-Institute/)
- **Mentors:** [Timothy Sykes](https://timothysykes.com) • [Tim Bohen](https://www.leadtrader.com)

-----

## 📄 License

Custom License - See [LICENSE](./LICENSE)  
**Author:** StatikFintech LLC  
**Last Updated:** November 2025

[![GitHub stars](https://img.shields.io/github/stars/statikfintechllc/Personal-Pennies?style=social)](https://github.com/statikfintechllc/Personal-Pennies)
