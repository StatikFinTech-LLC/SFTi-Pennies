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

### Adding Your First Trade

1. **Visit your site** at `https://statikfintechllc.github.io/SFTi-Pennies/`
2. **Click "Login"** in the navigation
3. **Paste your PAT** when prompted
4. **Click "+ Add Trade"**
5. **Fill out the form**:
   - Trade number (sequential: 1, 2, 3...)
   - Ticker symbol (e.g., TSLA, AAPL)
   - Entry and exit date/time
   - Entry and exit prices
   - Position size (number of shares)
   - Direction (LONG or SHORT)
   - Stop loss and target prices
   - Strategy name
   - Notes about the trade
6. **Upload screenshots** (optional but recommended)
7. **Click "Submit Trade"**

The form will automatically calculate:
- ✅ P&L in USD
- ✅ P&L as percentage
- ✅ Time in trade (hours and minutes)
- ✅ Risk:Reward ratio

### What Happens Next?

1. **Your trade is saved** to the `trades/` directory as a markdown file
2. **GitHub Actions automatically runs** (watch the Actions tab)
3. **Processing pipeline executes**:
   - Parses all trades into JSON
   - Generates weekly/monthly/yearly summaries
   - Creates equity curve chart
   - Updates homepage with recent trades
   - Optimizes any uploaded images
4. **Site is redeployed** with your new trade!
5. **Visit homepage** to see your trade appear

## 📁 What's Where

```
Your Repository
├── index.html              # Homepage (3 recent trades + stats)
├── add-trade.html         # Trade submission form
├── all-trades.html        # List of all trades (auto-generated)
├── trades-index.json      # Trade data (auto-generated)
│
├── trades/                # Your trade markdown files
│   ├── trade-001.md      # Trade #1
│   ├── trade-002.md      # Trade #2
│   └── ...
│
├── summaries/             # Auto-generated summaries
│   ├── weekly-*.md
│   ├── monthly-*.md
│   └── yearly-*.md
│
├── assets/
│   ├── css/              # Styles
│   ├── js/               # JavaScript
│   ├── images/           # Optimized images (served)
│   └── charts/           # Generated charts
│
└── .github/
    ├── assets/           # Original images (uploaded)
    ├── scripts/          # Python processing scripts
    ├── workflows/        # GitHub Actions
    └── templates/        # Trade templates
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

### Homepage
- **Recent Trades**: 3 most recent with animation
- **Summary Stats**: Win rate, total P&L, average P&L
- **Equity Curve**: Cumulative P&L over time

### All Trades Page
Visit `/all-trades.html` for a complete table of all trades

### Summaries
Check the `summaries/` folder for:
- `weekly-YYYY-Www.md` - Weekly breakdowns
- `monthly-YYYY-MM.md` - Monthly analysis
- `yearly-YYYY.md` - Yearly overview

### Charts
Static chart images are generated in `assets/charts/`:
- `equity-curve.png` - Your equity curve
- `trade-distribution.png` - P&L by trade

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
