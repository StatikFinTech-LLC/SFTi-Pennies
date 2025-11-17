# SFTi-Pennies Trading Journal - Copilot Instructions

This document describes the data structures, formulas, templates, and architecture of the SFTi-Pennies trading journal system.

## System Architecture

### Overview
The system consists of:
1. **Static Frontend**: HTML/CSS/JS pages served via GitHub Pages
2. **Client-Side Submission**: JavaScript-based trade submission with GitHub API
3. **GitHub Actions Pipeline**: Automated processing of trades and generation of analytics
4. **Data Storage**: Markdown files with YAML frontmatter in `trades/` directory

### Data Flow
```
User fills form → JavaScript validates → GitHub API uploads markdown → 
Actions trigger → Python scripts parse → Generate JSON index → 
Generate charts → Update site → Deploy to Pages
```

## Trade Data Structure

### YAML Frontmatter Schema
Each trade is stored as a markdown file with YAML frontmatter containing:

```yaml
trade_number: integer       # Sequential trade identifier
ticker: string             # Stock symbol (e.g., "AAPL")
entry_date: date           # ISO format: YYYY-MM-DD
entry_time: time           # 24-hour format: HH:MM
exit_date: date            # ISO format: YYYY-MM-DD
exit_time: time            # 24-hour format: HH:MM
entry_price: decimal       # Entry price in USD (4 decimal places)
exit_price: decimal        # Exit price in USD (4 decimal places)
position_size: integer     # Number of shares
direction: enum            # "LONG" or "SHORT"
strategy: string           # Strategy name (e.g., "Breakout Play")
stop_loss: decimal         # Stop loss price
target_price: decimal      # Target price
risk_reward_ratio: decimal # Calculated R:R ratio
broker: string             # Broker name
pnl_usd: decimal          # Profit/Loss in USD (calculated)
pnl_percent: decimal      # Profit/Loss as percentage (calculated)
screenshots: array         # List of screenshot file paths
```

## Calculation Formulas

### P&L Calculations

#### For LONG positions:
```
P&L (USD) = (Exit Price - Entry Price) × Position Size
P&L (%) = ((Exit Price - Entry Price) / Entry Price) × 100
```

#### For SHORT positions:
```
P&L (USD) = (Entry Price - Exit Price) × Position Size
P&L (%) = ((Entry Price - Exit Price) / Entry Price) × 100
```

### Risk-Reward Ratio
```
Risk = |Entry Price - Stop Loss|
Reward = |Target Price - Entry Price|
R:R = Reward / Risk
```
Displayed as "1:X" where X is the calculated ratio.

### Time in Trade
```
Time = Exit DateTime - Entry DateTime
```
Displayed in hours and minutes (e.g., "2h 30m").

### Statistics Formulas

#### Win Rate
```
Win Rate = (Number of Winning Trades / Total Trades) × 100
```

#### Average P&L
```
Average P&L = Total P&L / Total Trades
```

#### Max Drawdown
```
For each point in cumulative P&L curve:
  Drawdown = Peak - Current Value
Max Drawdown = Maximum of all drawdowns
```

#### Profit Factor
```
Profit Factor = |Average Winner| / |Average Loser|
```

## File Structure

```
/
├── index.html                 # Homepage with recent trades
├── add-trade.html            # Trade submission form
├── all-trades.html           # Generated list of all trades
├── trades-index.json         # Generated trade data index
├── manifest.json             # PWA manifest
├── index.directory/
│   ├── _config.yml           # Jekyll configuration (main config)
│   ├── assets/
│   ├── css/
│   │   └── main.css         # Main stylesheet
│   ├── js/
│   │   ├── app.js           # Main application logic
│   │   ├── auth.js          # Authentication module
│   │   └── background.js    # Animated background
│   ├── icons/               # PWA icons
│   ├── images/              # Optimized images (served)
│   └── charts/              # Generated charts
├── trades/                   # Trade markdown files
│   └── trade-{N}.md
├── summaries/               # Generated summaries
│   ├── weekly-*.md
│   ├── monthly-*.md
│   └── yearly-*.md
├── .github/
│   ├── assets/              # Original uploaded images
│   │   └── trade-{N}/
│   ├── templates/
│   │   ├── trade.md.template
│   │   └── weekly-summary.md.template
│   ├── scripts/
│   │   ├── parse_trades.py
│   │   ├── generate_summaries.py
│   │   ├── generate_index.py
│   │   ├── generate_charts.py
│   │   ├── update_homepage.py
│   │   └── optimize_images.sh
│   └── workflows/
│       └── trade_pipeline.yml
```

## GitHub Actions Workflow

### Trigger Conditions
- Push to `trades/**`
- Push to `.github/assets/**`
- Manual trigger via workflow_dispatch

### Pipeline Steps
1. **Parse Trades** (`parse_trades.py`)
   - Read all markdown files from `trades/`
   - Extract YAML frontmatter
   - Validate required fields
   - Generate `trades-index.json`

2. **Generate Summaries** (`generate_summaries.py`)
   - Group trades by week/month/year
   - Calculate period statistics
   - Create summary markdown files

3. **Generate Index** (`generate_index.py`)
   - Consolidate trade data
   - Create `all-trades.html` page

4. **Generate Charts** (`generate_charts.py`)
   - Create equity curve data (Chart.js format)
   - Generate static chart images (matplotlib)
   - Save to `assets/charts/`

5. **Update Homepage** (`update_homepage.py`)
   - Ensure `trades-index.json` is accessible
   - Frontend dynamically loads 3 most recent trades

6. **Optimize Images** (`optimize_images.sh`)
   - Move images from `.github/assets/` to `assets/images/`
   - Optimize with optipng/jpegoptim
   - Serve optimized versions on GitHub Pages

## Authentication

### Dual Auth Flow

#### Option 1: OAuth/GitHub App (Recommended)
- OAuth flow for secure authentication
- No token storage required
- Future implementation

#### Option 2: Personal Access Token (Fallback)
- User provides PAT manually
- Stored in browser localStorage
- Required scopes: `repo`
- Security warning displayed to user

### Security Considerations
- Tokens never hardcoded in source
- localStorage usage documented as security risk
- Recommended for personal use only on trusted devices
- OAuth preferred for production use

## API Integration

### GitHub API Endpoints Used

#### Authentication
```
GET /user
```

#### File Operations
```
PUT /repos/{owner}/{repo}/contents/{path}
GET /repos/{owner}/{repo}/contents/{path}
```

#### Branch Operations
```
GET /repos/{owner}/{repo}/git/refs/heads/{branch}
POST /repos/{owner}/{repo}/git/refs
```

## Chart.js Integration

### Equity Curve Data Format
```json
{
  "labels": ["2025-01-01", "2025-01-02", ...],
  "datasets": [{
    "label": "Equity Curve",
    "data": [0, 100, 250, ...],
    "borderColor": "#00ff88",
    "backgroundColor": "rgba(0, 255, 136, 0.1)",
    "fill": true,
    "tension": 0.4
  }]
}
```

## Responsive Design

### Breakpoints
- Mobile (< 768px): Single column layout
- iPhone SE (375px): Optimized font size (13px)
- iPhone 14 (390-430px): Optimized font size (15px)
- Tablet (768-1024px): Two column layout
- Desktop (> 1024px): Full multi-column layout

### Mobile Features
- Hamburger navigation
- Touch-friendly form inputs
- Swipe-friendly trade cards
- Optimized for iPhone Safari

## PWA Features

### manifest.json
- App name and short name
- Theme colors matching design
- Icons (192x192, 512x512)
- Display mode: standalone
- Orientation: portrait-primary

### Offline Support
- Service worker (future enhancement)
- Cached assets for offline viewing

## Development Guidelines

### Adding New Fields
1. Update YAML schema in this document
2. Update `trade.md.template`
3. Update `parse_trades.py` field validation
4. Update form in `add-trade.html`
5. Update `app.js` form data collection
6. Update display in trade cards

### Modifying Calculations
1. Update formulas in this document
2. Update client-side calculations in `app.js`
3. Update server-side calculations in `parse_trades.py`
4. Test with sample data

### Adding New Charts
1. Update `generate_charts.py`
2. Add Chart.js configuration in frontend
3. Update GitHub Actions workflow if needed

## Testing

### Manual Testing Checklist
- [ ] Form validation (required fields)
- [ ] P&L calculations (LONG positions)
- [ ] P&L calculations (SHORT positions)
- [ ] Risk:Reward calculation
- [ ] Time-in-trade calculation
- [ ] Image upload (single and multiple)
- [ ] Mobile responsiveness (iPhone SE, 14)
- [ ] Authentication flow
- [ ] Trade submission to GitHub
- [ ] Actions workflow execution
- [ ] Chart generation
- [ ] Homepage update with recent trades

### Test Data
Create test trades with:
- Winning LONG trade
- Losing LONG trade
- Winning SHORT trade
- Losing SHORT trade
- Multiple screenshots
- Various time frames (minutes, hours, days)

## Maintenance

### Regular Tasks
- Review and archive old trades
- Optimize image storage
- Monitor GitHub Actions usage
- Update dependencies
- Review authentication security

### Backup Strategy
- Git version control for all trades
- Exported JSON index
- Image backups in `.github/assets/`

## Future Enhancements
- OAuth/GitHub App implementation
- Service worker for offline support
- Advanced filtering and search
- Trade tagging system
- Performance comparison charts
- Mobile app (PWA installation)
- Trade alerts and reminders
- Integration with broker APIs

