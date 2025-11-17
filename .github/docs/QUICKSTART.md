# 🚀 SFTi-Pennies Trading Journal - Quick Start Guide

Welcome to your new automated trading journal! This guide will get you up and running in minutes.

## ✅ What's Been Built

Your trading journal is now a complete, production-ready system with:

### 🎨 Frontend Features
- **Dark Terminal Theme** - Professional trader aesthetic with animated background
- **Mobile-First Design** - Optimized for iPhone SE, iPhone 14, and Android
- **Responsive Navigation** - Hamburger menu with expandable sections
- **Trade Submission Form** - Auto-calculates P&L, Risk:Reward, and time-in-trade
- **Recent Trades Display** - Homepage shows 3 most recent trades with animation
- **Summary Statistics** - Win rate, total P&L, average P&L at a glance
- **All Trades Page** - Complete sortable list of all your trades
- **PWA Support** - Install as an app on mobile devices

### 🤖 Automation Features
- **GitHub Actions Workflow** - Automatically processes trades when you submit them
- **Trade Parser** - Extracts data from markdown files into JSON
- **Summary Generator** - Creates weekly, monthly, and yearly performance summaries
- **Chart Generator** - Equity curve and P&L distribution charts
- **Image Optimizer** - Automatically optimizes uploaded screenshots
- **Stats Calculator** - Win rate, drawdown, profit factor, and more

### 📊 Analytics
- **Equity Curve** - Visual representation of cumulative P&L
- **Performance Charts** - Trade distribution and patterns
- **Weekly Summaries** - Detailed breakdown by week
- **Monthly Summaries** - Monthly performance tracking
- **Yearly Summaries** - Long-term trends

### 🔐 Security
- **Dual Authentication** - OAuth (future) or Personal Access Token
- **Client-Side Only** - No backend servers, just GitHub API
- **Secure Storage** - Tokens in browser localStorage (with warnings)

## 📋 Setup Steps (5 Minutes)

### Step 1: Enable GitHub Pages

1. Go to your repository settings
2. Click "Pages" in the left sidebar
3. Under "Source", select:
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/ (root)`
4. Click "Save"
5. Wait 2-3 minutes for the site to build
6. Your site will be available at: `https://statikfintechllc.github.io/SFTi-Pennies/`

### Step 2: Configure GitHub Actions

1. Go to Settings → Actions → General
2. Under "Workflow permissions":
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
3. Click "Save"

### Step 3: Generate a Personal Access Token (PAT)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Trading Journal"
4. Select scope: **`repo`** (full control)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

⚠️ **Keep your PAT safe!** Don't share it or commit it to the repository.

## 🎯 Using Your Trading Journal

### Option 1: Adding Trades Manually

1. **Visit your site** at `https://statikfintechllc.github.io/SFTi-Pennies/index.directory/`
2. **Click "Login"** in the navigation
3. **Paste your PAT** when prompted
4. **Click "+ Add Trade"** in the menu
5. **Fill out the form**:
   - Trade number (sequential: 1, 2, 3...)
   - Ticker symbol (e.g., TSLA, AAPL)
   - Entry and exit date/time
   - Entry and exit prices
   - Position size (number of shares)
   - Direction (LONG or SHORT)
   - Stop loss and target prices
   - Strategy, setup, and session tags
   - Notes about the trade
6. **Upload screenshots** (optional but recommended)
7. **Click "Submit Trade"**

The form will automatically calculate:
- ✅ P&L in USD
- ✅ P&L as percentage
- ✅ Time in trade (hours and minutes)
- ✅ Risk:Reward ratio

### Option 2: Importing from Broker CSV

1. **Export trades from your broker**:
   - IBKR: Activity Statements → Trade Confirmation
   - Schwab: Export Transactions → CSV
   - Robinhood: Account → History → Export
   - Webull: Orders → Export CSV
2. **Navigate to Import page** (`/import.html`)
3. **Select your broker** from the dropdown
4. **Upload CSV file**
5. **Review detected trades** in the preview
6. **Click "Import Trades"**
7. **Trades are created automatically** in the correct week folders

### Viewing Your Performance

- **Homepage** (`/index.html`) - Recent trades and summary stats
- **All Trades** (`/all-trades.html`) - Complete sortable/filterable list
- **All Weeks** (`/all-weeks.html`) - Weekly performance at a glance
- **Analytics** (`/analytics.html`) - Deep dive into metrics:
  - Expectancy and profit factor
  - Kelly Criterion for position sizing
  - Win/loss streaks
  - Per-strategy breakdowns
  - Drawdown analysis
- **Books** (`/books.html`) - Browse trading education PDFs
- **Notes** (`/notes.html`) - Review strategies and frameworks

### Weekly Review Process

1. **Navigate to Review page** (`/review.html`)
2. **Select the week** you want to review
3. **Review all trades** from that week
4. **Add weekly notes**:
   - What went well
   - What needs improvement
   - Lessons learned
5. **Set goals** for next week
6. **Submit** to generate weekly summary
7. **View in All Weeks** page

### Managing Your Library

#### Adding Books
1. Navigate to `/add-pdf.html`
2. Enter book title and description
3. Upload PDF file
4. Submit to add to library

#### Adding Notes
1. Navigate to `/add-note.html`
2. Enter note title
3. Write content in Markdown
4. Upload related images (optional)
5. Submit to save

### Exporting Data

1. Navigate to `/import.html`
2. Click "Export CSV" button
3. Optionally filter by date range or strategy
4. Download CSV for external analysis

### What Happens Next?

1. **Your trade is saved** to `SFTi.Tradez/week.YYYY.WW/` directory
2. **GitHub Actions automatically runs** (watch the Actions tab)
3. **Processing pipeline executes**:
   - Parses all trades into JSON indices
   - Generates weekly/monthly/yearly summaries
   - Calculates advanced analytics (expectancy, Kelly, profit factor)
   - Creates equity curves and performance charts
   - Generates weekly master.trade.md summaries
   - Updates all-weeks.html overview
   - Updates homepage with recent trades
   - Optimizes any uploaded images
4. **Site is redeployed** with your new data!
5. **Visit any page** to see your updated trades and analytics

## 📁 What's Where

```
SFTi-Pennies Repository Structure
│
└── index.directory/           # Main application directory
    ├── index.html              # Homepage (3 recent trades + stats)
├── add-trade.html         # Trade submission form
├── all-trades.html        # List of all trades (sortable/filterable)
├── all-weeks.html         # Weekly performance overview
├── analytics.html         # Advanced metrics dashboard
├── review.html            # Weekly review workflow
├── import.html            # CSV import/export
├── books.html             # PDF library viewer
├── notes.html             # Strategy notes viewer
├── add-pdf.html           # Upload books
├── add-note.html          # Create notes
│
├── trades-index.json      # Trade data (auto-generated)
├── books-index.json       # Books data (auto-generated)
├── notes-index.json       # Notes data (auto-generated)
│
├── SFTi.Tradez/           # Your trade journal
│   ├── week.2025.01/      # Week 1 of 2025
│   │   ├── 01:06:2025.1.md      # Individual trades
│   │   └── master.trade.md      # Week summary (auto-generated)
│   ├── week.2025.42/      # Week 42 of 2025
│   └── ...
│
├── SFTi.Notez/            # Trading strategies and notes
│   ├── 7.Step.Frame.md
│   ├── GSTRWT.md
│   └── ...
│
├── Informational.Bookz/    # PDF education library
│   ├── 10_Patterns.pdf
│   ├── Penny_Course.pdf
│   └── ...
│
├── summaries/             # Auto-generated summaries
│   ├── weekly-*.md
│   ├── monthly-*.md
│   └── yearly-*.md
│
├── assets/
│   ├── css/               # Styles
│   ├── js/                # JavaScript
│   ├── charts/            # Generated charts
│   ├── sfti.tradez.assets/    # Trade screenshots
│   └── sfti.notez.assets/     # Framework images
│
└── trades/                # Legacy trade entries (still supported)
    └── trade-*.md
```

## 🎨 Customization

### Change Colors

Edit `assets/css/main.css` and modify the CSS variables:

```css
:root {
  --bg-primary: #0a0e27;      /* Main background */
  --accent-green: #00ff88;     /* Success/profit color */
  --accent-red: #ff4757;       /* Loss color */
  /* ... more colors ... */
}
```

### Add More Fields

1. Update `trade.md.template`
2. Add field to `add-trade.html` form
3. Update `app.js` to collect the field
4. Update `parse_trades.py` to parse it

### Modify Navigation

Edit the `<nav>` section in:
- `index.html`
- `add-trade.html`

## 📊 Viewing Your Performance

### Homepage Dashboard
- **Recent 3 trades** with animated cards
- **Summary statistics**: Total P&L, win rate, average P/L
- **Equity curve chart**: Cumulative performance over time
- **Quick navigation** to all sections

### Analytics Page (`/analytics.html`)
Deep dive into your trading performance:
- **Overall Performance**: Win rate, profit factor, expectancy
- **Kelly Criterion**: Optimal position sizing calculation
- **Win/Loss Streaks**: Current and maximum streaks
- **Drawdown Analysis**: Peak-to-trough performance
- **Per-Strategy Metrics**: Breakdown by strategy, setup, session
- **Interactive Charts**: Visual performance analysis

### All Trades Page (`/all-trades.html`)
- **Complete trade list** with all details
- **Sortable columns**: Click headers to sort
- **Filterable**: Search by ticker, strategy, date
- **Export option**: Download as CSV

### All Weeks Page (`/all-weeks.html`)
- **Weekly summaries** at a glance
- **Week-over-week performance**
- **Total trades and P&L per week**
- **Click through** to individual week details

### Books Library (`/books.html`)
- **Browse all trading books** in your library
- **PDF viewer** with zoom and page navigation
- **Search and filter** by title
- **Upload new books** via add-pdf.html

### Notes Viewer (`/notes.html`)
- **View all trading strategies** and frameworks
- **Markdown rendering** with GitHub styling
- **Linked images** and charts
- **Create new notes** via add-note.html

## 🔧 Troubleshooting

### Site Not Updating?
1. Check the **Actions** tab for workflow status
2. Look for any errors in the workflow logs
3. Make sure GitHub Actions has write permissions

### Authentication Failed?
1. Verify your PAT has `repo` scope
2. Check if PAT has expired
3. Generate a new PAT if needed

### Charts Not Showing?
1. Wait for GitHub Actions to complete
2. Clear your browser cache
3. Check browser console for errors

### Images Not Loading?
1. Make sure images are in `assets/images/`
2. Check GitHub Actions optimized them
3. Verify paths in markdown match

## 📱 Mobile Usage

Your trading journal works great on mobile!

1. **Visit the site** on your iPhone or Android
2. **Add to Home Screen**:
   - iOS: Tap share → "Add to Home Screen"
   - Android: Tap menu → "Add to Home Screen"
3. **Use like a native app**!

The form is optimized for mobile input, including:
- Large touch targets
- Mobile-friendly date/time pickers
- Easy image upload from camera or gallery

## 🎓 Learning Resources

- **README-DEV.md** - Complete developer documentation
- **.github/copilot-instructions.md** - Data structures and formulas
- **Inline comments** - All code is well-documented

## 🐛 Known Limitations

1. **OAuth not yet implemented** - Use PAT for now
2. **No offline editing** - Requires internet connection
3. **Manual PAT management** - Store securely

## 💡 Tips for Success

1. **Be consistent** - Fill out all fields for every trade
2. **Take screenshots** - Chart analysis is crucial
3. **Review weekly** - Use summaries for improvement
4. **Add notes** - Document your reasoning
5. **Track everything** - Even small trades matter

## 🎉 You're Ready!

Your trading journal is fully operational. Start adding trades and watch your analytics build automatically!

**Questions?** Check README-DEV.md for detailed documentation.

**Good luck on your trading journey!** 📈🚀

---

**Built with**: HTML, CSS, JavaScript, Python, GitHub Actions, Chart.js, GLightbox  
**Theme**: Dark Terminal Trader  
**License**: MIT
