# Trade Pipeline Documentation

## Overview

This document describes the complete trade submission workflow for the SFTi-Pennies trading journal system, from form submission through data processing and site deployment.

## Architecture

### Data Flow

```
User fills form → JavaScript validates → GitHub API uploads → 
Actions trigger → Python scripts parse → Generate JSON index → 
Generate charts → Update site → Commit changes → GitHub Pages auto-deploys
```

### Directory Structure

```
SFTi-Pennies/
├── SFTi.Tradez/                    # Main trade journal directory
│   ├── template/
│   │   └── **:**:****.*.md         # Template for new trades
│   ├── week.2025.01/               # Week 1 of 2025 trades
│   │   ├── 01:06:2025.1.md        # Trade 1 on Jan 6, 2025
│   │   ├── 01:06:2025.2.md        # Trade 2 on Jan 6, 2025
│   │   └── README.md               # Week summary
│   ├── week.2025.42/               # Week 42 of 2025 trades
│   └── ...
│
├── assets/
│   └── sfti.tradez.assets/        # Trade screenshots and images
│       ├── week.2025.01/
│       │   ├── 01:06:2025.1/      # Images for trade 1
│       │   │   ├── T.1.jpeg
│       │   │   └── Total.jpg
│       │   ├── 01:06:2025.2/      # Images for trade 2
│       │   └── ...
│       └── ...
│
├── .github/
│   ├── scripts/                    # Python processing scripts
│   │   ├── parse_trades.py        # Parse trades into JSON
│   │   ├── generate_summaries.py  # Generate weekly/monthly summaries
│   │   ├── generate_index.py      # Generate trade index pages
│   │   └── ...
│   └── workflows/
│       └── trade_pipeline.yml     # CI/CD automation
│
├── trades-index.json              # Generated JSON index
└── add-trade.html                 # Trade submission form
```

## File Naming Conventions

### Trade Markdown Files

**Format:** `MM:DD:YYYY.N.md`

- **MM**: Month (01-12)
- **DD**: Day (01-31)
- **YYYY**: Year (e.g., 2025)
- **N**: Trade number for that day (1, 2, 3, ...)

**Examples:**
- `10:13:2025.1.md` - First trade on October 13, 2025
- `10:13:2025.2.md` - Second trade on October 13, 2025
- `12:31:2025.1.md` - First trade on December 31, 2025

**Location:** `SFTi.Tradez/week.YYYY.WW/MM:DD:YYYY.N.md`

Where:
- `YYYY` is the 4-digit year (e.g., 2025)
- `WW` is the ISO week number, zero-padded (e.g., 01, 42, 52)

**Examples:**
- `SFTi.Tradez/week.2025.42/10:13:2025.1.md` - First trade on October 13, 2025 (week 42)
- `SFTi.Tradez/week.2025.01/01:06:2025.1.md` - First trade on January 6, 2025 (week 1)

### Image Files

**Location:** `assets/sfti.tradez.assets/week.YYYY.WW/MM:DD:YYYY.N/`

**Examples:**
- `assets/sfti.tradez.assets/week.2025.42/10:13:2025.1/T.1.jpeg`
- `assets/sfti.tradez.assets/week.2025.01/01:06:2025.1/Total.jpg`

**Naming:**
- Trade screenshots: `T.1.jpeg`, `T.2.jpeg`, etc.
- Daily summary: `Total.jpg`
- Custom names are also supported

## Week Number Calculation

The system uses ISO week numbering with year prefix:
- Format: `YYYY.WW` where YYYY is the 4-digit year and WW is the ISO week (01-53)
- Week 1 is the first week with at least 4 days in the new year
- Weeks start on Monday
- Calculated automatically by JavaScript based on entry date
- Example: October 13, 2025 falls in week 42, formatted as `2025.42`

## Frontend Submission Process

### 1. Form Validation

When the user fills out the form on `add-trade.html`:

1. Required fields are validated:
   - Trade number
   - Ticker symbol
   - Entry date/time
   - Exit date/time
   - Entry/exit prices
   - Position size
   - Direction (LONG/SHORT)
   - Broker

2. Auto-calculated fields:
   - P&L in USD: `(Exit - Entry) × Position Size` (for LONG)
   - P&L in %: `((Exit - Entry) / Entry) × 100`
   - Risk:Reward ratio: `|Target - Entry| / |Entry - Stop|`
   - Time in trade: Exit datetime - Entry datetime

### 2. File Path Generation

JavaScript calculates paths based on entry date:

```javascript
// Calculate year-week number from entry date
const entryDate = new Date(formData.entry_date);
const yearWeek = getYearWeekNumber(entryDate);  // Returns "YYYY.WW"

// Format date as MM:DD:YYYY
const dateFormatted = formatDateForFilename(formData.entry_date);

// Generate paths
const weekFolder = `week.${yearWeek}`;
const filename = `${dateFormatted}.${tradeNum}.md`;
const tradePath = `SFTi.Tradez/${weekFolder}/${filename}`;
```

**Example:**
- Entry date: `2025-10-13`
- Trade number: `1`
- Year-Week: `2025.42`
- Result: `SFTi.Tradez/week.2025.42/10:13:2025.1.md`

### 3. Image Upload

Images are uploaded to:
```
assets/sfti.tradez.assets/week.YYYY.WW/{MM:DD:YYYY.N}/filename.jpg
```

**Example:**
```
assets/sfti.tradez.assets/week.2025.42/10:13:2025.1/T.1.jpeg
```

### 4. Markdown Generation

The system generates markdown using the template structure:

```yaml
---
trade_number: 1
ticker: AAPL
entry_date: 2025-10-13
entry_time: 09:30
exit_date: 2025-10-13
exit_time: 15:45
entry_price: 150.25
exit_price: 152.80
position_size: 100
direction: LONG
strategy: Momentum Breakout
stop_loss: 149.00
target_price: 155.00
risk_reward_ratio: 3.80
broker: Interactive Brokers
pnl_usd: 255.00
pnl_percent: 1.70
screenshots:
  - assets/sfti.tradez.assets/week.2025.42/10:13:2025.1/T.1.jpeg
---

# Trade #1 - AAPL
...
```

### 5. GitHub API Upload

The system uses the GitHub Contents API to:
1. Upload images to the assets directory
2. Upload the markdown file to the SFTi.Tradez directory
3. Commit with message: `auto: new trade added {date}/{ticker}`

## Backend Processing (GitHub Actions)

### Trigger Conditions

The workflow triggers automatically on push to:
- `trades/**` (legacy support)
- `SFTi.Tradez/**` (new structure)
- `assets/sfti.tradez.assets/**` (trade images)
- `.github/assets/**` (legacy images)

### Pipeline Steps

#### 1. Parse Trades (`parse_trades.py`)

Scans both directories:
- Legacy: `trades/*.md`
- New: `SFTi.Tradez/week.*/*.md` (supports both `week.XXX` and `week.YYYY.WW` formats)

Extracts YAML frontmatter and validates:
- Required fields present
- Numeric fields properly typed
- Date/time fields formatted correctly

Generates: `trades-index.json`

#### 2. Generate Books Index (`generate_books_index.py`)

Scans `Informational.Bookz/` for PDF files.

Generates: `books-index.json`

#### 3. Generate Notes Index (`generate_notes_index.py`)

Scans `SFTi.Notez/` for educational notes.

Generates: `notes-index.json`

#### 4. Generate Summaries (`generate_summaries.py`)

Groups trades by:
- Week
- Month
- Year

Calculates statistics:
- Win rate
- Total P&L
- Average gain/loss
- Largest win/loss
- Profit factor

Creates summary markdown files in `summaries/`.

#### 5. Generate Index (`generate_index.py`)

Creates consolidated trade index page: `all-trades.html`

#### 6. Generate Charts (`generate_charts.py`)

Creates visualization data:
- Equity curve (Chart.js JSON)
- Static chart images (matplotlib)

Saves to: `assets/charts/`

#### 7. Update Homepage (`update_homepage.py`)

Ensures `trades-index.json` is accessible for frontend.

#### 8. Optimize Images (`optimize_images.sh`)

Optimizes images using:
- `optipng` for PNG files
- `jpegoptim` for JPEG files

#### 9. Commit Changes

- Commits all generated files with message: `Auto-update: Process trades and generate charts [skip ci]`
- Pushes to repository
- GitHub Pages automatically builds and deploys from the branch

## Manual Operations

### Adding a Trade Manually

1. Create markdown file in correct location:
   ```bash
   # Calculate year-week number for your date
   # For example, October 13, 2025 is week 42 of 2025 = 2025.42
   
   # Create directory if needed
   mkdir -p SFTi.Tradez/week.2025.42
   
   # Create file
   touch SFTi.Tradez/week.2025.42/10:13:2025.1.md
   ```

2. Copy template from `SFTi.Tradez/template/**:**:****.*.md`

3. Fill in all YAML frontmatter fields

4. Add trade notes and details in markdown body

5. Upload images to:
   ```bash
   mkdir -p assets/sfti.tradez.assets/week.2025.42/10:13:2025.1/
   cp screenshot.jpg assets/sfti.tradez.assets/week.2025.42/10:13:2025.1/T.1.jpeg
   ```

6. Commit and push:
   ```bash
   git add SFTi.Tradez/week.2025.42/10:13:2025.1.md
   git add assets/sfti.tradez.assets/week.2025.42/10:13:2025.1/
   git commit -m "auto: new trade added 10:13:2025/TICKER"
   git push
   ```

7. GitHub Actions will automatically process the trade

### Regenerating Indexes Manually

If you need to regenerate the indexes without making changes:

```bash
# Run locally
cd /path/to/SFTi-Pennies

# Install dependencies
pip install pyyaml matplotlib

# Run scripts
python .github/scripts/parse_trades.py
python .github/scripts/generate_summaries.py
python .github/scripts/generate_index.py
python .github/scripts/generate_charts.py

# Or trigger workflow manually via GitHub UI
# Go to Actions → Trade Pipeline → Run workflow
```

## Authentication

The frontend uses GitHub Personal Access Token (PAT) for API authentication:

1. User provides PAT via login form
2. Token stored in browser localStorage (warning: security risk)
3. Token used for all GitHub API calls
4. Recommended: Use only on trusted devices for personal use

**Future:** OAuth/GitHub App implementation for enhanced security.

## Troubleshooting

### Workflow Fails

1. Check GitHub Actions logs in the Actions tab
2. Look for error messages in each step
3. Common issues:
   - Missing required fields in YAML
   - Invalid date formats
   - Numeric fields with non-numeric values
   - Missing Python dependencies

### Trade Not Showing Up

1. Check if file was committed to repository
2. Verify file is in correct directory: `SFTi.Tradez/week.YYYY.WW/` (e.g., `week.2025.42`)
3. Check workflow ran successfully
4. Verify `trades-index.json` was updated
5. Hard refresh browser (Ctrl+F5) to clear cache

### Images Not Loading

1. Verify images were uploaded to correct path
2. Check image paths in markdown frontmatter
3. Ensure image optimization step completed
4. Verify GitHub Pages deployment succeeded

### Week Number Issues

If trades appear in wrong week folder:
1. Verify entry date is correct
2. Check ISO week calculation
3. Manually move file to correct week folder if needed
4. Re-run workflow to update indexes

## Performance Considerations

### Workflow Execution Time

Average execution time: 2-5 minutes
- Parse trades: 10-30 seconds
- Generate summaries: 10-30 seconds
- Generate charts: 30-60 seconds
- Image optimization: 1-2 minutes (depends on number of images)
- Commit changes: 10-30 seconds

Note: GitHub Pages builds and deploys automatically after changes are committed (typically 1-3 minutes).

### API Rate Limits

GitHub API rate limits:
- Authenticated: 5,000 requests/hour
- Each trade submission uses ~2-5 requests (markdown + images)
- Workflow uses ~10-20 requests per run

### Storage Considerations

- Markdown files: ~1-5 KB each
- Screenshot images: ~100-500 KB each (optimized)
- Total repository size should stay under 1 GB for free tier

## Future Enhancements

1. **OAuth Authentication**: Replace PAT with GitHub OAuth flow
2. **Trade Validation**: Client-side validation before submission
3. **Auto Trade Numbering**: Automatically determine next trade number for date
4. **Duplicate Detection**: Prevent duplicate trade submissions
5. **Bulk Import**: Import multiple trades from CSV
6. **Advanced Analytics**: More charts and statistics
7. **Mobile App**: Native mobile app using PWA
8. **Real-time Sync**: WebSocket integration for live updates
9. **Trade Templates**: Save and reuse strategy templates
10. **Broker Integration**: Import trades directly from broker APIs

## Related Documentation

- [Developer Documentation](../../README-DEV.md)
- [Repository Structure](.github/docs/STRUCTURE.md)
- [GitHub Copilot Instructions](.github/copilot-instructions.md)
- [Trade Template](../../SFTi.Tradez/template/**:**:****.*.md)
- [Assets Organization](../../assets/sfti.tradez.assets/README.md)

## Support

For issues or questions:
1. Check existing [Issues](https://github.com/statikfintechllc/SFTi-Pennies/issues)
2. Review [GitHub Actions logs](https://github.com/statikfintechllc/SFTi-Pennies/actions)
3. Open a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Relevant log output

---

**Last Updated:** 2025-10-13
**Version:** 1.0
