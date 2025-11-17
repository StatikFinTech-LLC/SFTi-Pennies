# SFTi-Pennies Trading Journal - Developer Documentation

## Overview

This is a comprehensive trading journal system built for GitHub Pages with automated processing via GitHub Actions. The system allows you to submit trades via a web form, which are then automatically processed, analyzed, and displayed on your trading journal website.

## Features

- 🎨 **Dark Terminal Theme**: Professional trading terminal aesthetic
- 📱 **Mobile-First Design**: Optimized for iPhone and Android devices
- 📊 **Auto-Calculations**: P&L, R:R, and time-in-trade calculated automatically
- 🔐 **Dual Auth**: OAuth/GitHub App or Personal Access Token
- 🖼️ **Image Management**: Automatic upload and optimization
- 📈 **Charts & Analytics**: Equity curves and performance metrics
- 🤖 **GitHub Actions**: Fully automated processing pipeline
- 📦 **PWA Ready**: Progressive Web App with offline capability
- 📚 **Books Library**: PDF viewer with navigation for trading books
- 📝 **Notes System**: Markdown renderer with GitHub styling for trading notes

## Architecture

### Frontend
- **HTML**: Static pages with semantic markup
- **CSS**: Custom styles with Tailwind CDN for utilities
- **JavaScript**: Vanilla JS for form handling and API calls
- **Fonts**: JetBrains Mono + Inter from Google Fonts
- **PDF.js**: PDF rendering for books
- **Marked.js**: Markdown parsing for notes
- **GitHub Markdown CSS**: Styling for rendered markdown

### Backend (GitHub Actions)
- **Python 3.11**: Data processing scripts
- **YAML**: Trade data in frontmatter format
- **JSON**: Generated data indices
- **Matplotlib**: Chart generation
- **GitHub API**: File uploads and commits

### Hosting
- **GitHub Pages**: Static site hosting
- **Jekyll**: Build system (minimal config)
- **Custom Domain**: Supported

## Setup Instructions

### 1. Repository Setup

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/statikfintechllc/SFTi-Pennies.git
   cd SFTi-Pennies
   ```

2. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or your default branch)
   - Folder: `/ (root)`
   - Save

3. **Configure GitHub Actions**
   - Go to Settings → Actions → General
   - Enable "Read and write permissions" for workflows
   - Enable "Allow GitHub Actions to create and approve pull requests"

### 2. Required Secrets

#### For Main Workflows (trade_pipeline.yml, import.yml)

No custom secrets are required for the main GitHub Actions workflows. These workflows use the built-in `GITHUB_TOKEN` which has sufficient permissions to:
- Read repository contents
- Write files to the repository

GitHub Pages builds and deploys automatically from the branch.

#### For Site Submit Workflow (site-submit.yml)

If you plan to use the site-submit workflow (for creating PRs from trade submissions), you need to create a repository secret:

1. **Create a Personal Access Token (PAT)**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "SFTi-Pennies Workflow")
   - Select scope: `repo` (full control of private repositories)
   - Generate token and copy it

2. **Add as Repository Secret**
   - Go to your repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `PAT_GITHUB`
   - Value: Paste your PAT
   - Click "Add secret"

**Why PAT_GITHUB is needed**: The `peter-evans/create-pull-request` action requires a PAT (not the built-in `GITHUB_TOKEN`) to create pull requests that can trigger other workflows.

### 3. Authentication Setup

#### Option A: Personal Access Token (PAT) - Recommended for Personal Use

1. **Generate a PAT**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "Trading Journal")
   - Select scope: `repo` (full control of private repositories)
   - Generate token and copy it (you won't see it again)

2. **Use the PAT in the web interface**
   - Open your trading journal site
   - Click "Login" button
   - Paste your PAT when prompted
   - The PAT will be stored in browser localStorage

⚠️ **Security Warning**: PATs stored in localStorage are vulnerable to XSS attacks. Only use this on trusted devices and browsers. Never commit your PAT to the repository.

#### Option B: OAuth/GitHub App - Recommended for Production

OAuth implementation is planned but not yet available. When implemented:
1. Create a GitHub OAuth App
2. Configure client ID and secret
3. Implement OAuth flow in `auth.js`
4. Users authenticate via GitHub OAuth

### 4. Local Development

#### Prerequisites
- Python 3.11+
- pip (Python package manager)
- Git

#### Install Dependencies
```bash
# Python packages
pip install pyyaml matplotlib

# Image optimization tools (optional)
# Ubuntu/Debian:
sudo apt-get install optipng jpegoptim

# macOS:
brew install optipng jpegoptim

# Windows:
# Download from respective websites
```

#### Run Scripts Locally
```bash
# Parse trades
python .github/scripts/parse_trades.py

# Generate summaries
python .github/scripts/generate_summaries.py

# Generate charts
python .github/scripts/generate_charts.py

# Generate index
python .github/scripts/generate_index.py

# Optimize images
bash .github/scripts/optimize_images.sh
```

#### Test Locally
```bash
# Option 1: Python simple server
python -m http.server 8000

# Option 2: Node.js http-server
npx http-server -p 8000

# Option 3: PHP built-in server
php -S localhost:8000

# Then visit: http://localhost:8000
```

## Usage Guide

### Adding a New Trade

#### Via Web Form (Recommended)
1. Navigate to `/add-trade.html`
2. Fill in all required fields (marked with *)
3. The form will auto-calculate:
   - P&L in USD and percentage
   - Time in trade (hours and minutes)
   - Risk:Reward ratio
4. Upload screenshots (optional but recommended)
5. Add notes about the trade
6. Click "Submit Trade"
7. The trade will be committed to GitHub in the format:
   - Path: `SFTi.Tradez/week.YYYY.WW/MM:DD:YYYY.N.md`
   - Example: `SFTi.Tradez/week.2025.42/10:13:2025.1.md`
8. GitHub Actions will automatically process it

#### Via Manual File Creation
1. Determine the year-week number for your trade date (ISO week with year)
2. Create the directory structure if needed:
   ```bash
   # For October 13, 2025 (week 42 of 2025), trade #1
   mkdir -p SFTi.Tradez/week.2025.42
   ```

3. Create the markdown file with proper naming:
   ```bash
   # Format: MM:DD:YYYY.N.md
   touch SFTi.Tradez/week.2025.42/10:13:2025.1.md
   ```

4. Use the template from `SFTi.Tradez/template/**:**:****.*.md`

5. Fill in all YAML frontmatter fields

6. Commit and push:
   ```bash
   git add SFTi.Tradez/week.2025.42/10:13:2025.1.md
   git commit -m "auto: new trade added 10:13:2025/TICKER"
   git push
   ```

**Note:** Legacy `trades/trade-{N}.md` format is still supported for backward compatibility.

For complete details on the trade pipeline, see [Trade Pipeline Documentation](.github/docs/TRADE_PIPELINE.md).

### Uploading Screenshots

Screenshots should be uploaded via the web form. They will be:
1. Uploaded to `assets/sfti.tradez.assets/week.YYYY.WW/MM:DD:YYYY.N/`
2. Example: `assets/sfti.tradez.assets/week.2025.42/10:13:2025.1/T.1.jpeg`
3. Automatically optimized by the workflow
4. Referenced in the trade markdown

**Legacy support:** Images in `.github/assets/trade-{N}/` are still processed and copied to `assets/images/trade-{N}/` for backward compatibility.

### Viewing Your Journal

- **Homepage**: Shows 3 most recent trades and summary stats
- **All Trades**: `/all-trades.html` for complete list
- **Summaries**: `/summaries/` for weekly/monthly/yearly reports
- **Charts**: Equity curve on homepage

## GitHub Actions Workflow

### Trigger Conditions
The workflow runs automatically when you:
- Push changes to `trades/` directory (legacy)
- Push changes to `SFTi.Tradez/` directory (new format)
- Upload images to `assets/sfti.tradez.assets/` (new format)
- Upload images to `.github/assets/` (legacy)
- Modify workflow or scripts
- Manually trigger via Actions tab

### Workflow Steps

1. **Parse Trades** (parse_trades.py)
   - Reads all markdown files in `trades/` (legacy) and `SFTi.Tradez/week.*/` (supports both `week.XXX` and `week.YYYY.WW`)
   - Extracts YAML frontmatter
   - Validates required fields
   - Generates `trades-index.json`

2. **Generate Books Index** (generate_books_index.py)
   - Scans `Informational.Bookz/` for PDF files
   - Extracts metadata and file info
   - Generates `books-index.json`

3. **Generate Notes Index** (generate_notes_index.py)
   - Scans `SFTi.Notez/` for markdown files
   - Extracts titles, excerpts, and thumbnails
   - Generates `notes-index.json`

4. **Generate Summaries** (generate_summaries.py)
   - Groups trades by week/month/year
   - Calculates statistics for each period
   - Creates markdown summaries in `summaries/`

5. **Generate Index** (generate_index.py)
   - Creates consolidated trade index
   - Generates `all-trades.html` page

6. **Generate Charts** (generate_charts.py)
   - Creates equity curve data (Chart.js format)
   - Generates static chart images with matplotlib
   - Saves to `assets/charts/`

7. **Update Homepage** (update_homepage.py)
   - Ensures trades-index.json is accessible
   - Homepage loads data dynamically via JavaScript

8. **Optimize Images** (optimize_images.sh)
   - Moves images from `.github/assets/` to `assets/images/`
   - Optimizes PNGs with optipng
   - Optimizes JPEGs with jpegoptim
   - Reduces file sizes for faster loading

9. **Commit and Push**
   - Commits all generated files to repository
   - Pushes changes to remote branch
   - GitHub Pages automatically builds and deploys from the branch

### Monitoring Workflow

- Go to Actions tab in GitHub
- Click on latest workflow run
- View logs for each step
- Check for errors or warnings

## Customization

### Styling
- Edit `assets/css/main.css` for visual changes
- Modify CSS variables at the top of the file:
  ```css
  :root {
    --bg-primary: #0a0e27;
    --accent-green: #00ff88;
    /* etc... */
  }
  ```

### Trade Fields
To add new fields:
1. Update `trade.md.template`
2. Add field to `add-trade.html` form
3. Update `app.js` to collect the field
4. Update `parse_trades.py` to parse it
5. Update display components as needed

### Charts
Modify `generate_charts.py` to:
- Change chart styles
- Add new chart types
- Modify matplotlib styling

### Navigation
Edit the nav menu in:
- `index.html`
- `add-trade.html`
- Any other pages

## Troubleshooting

### Workflow Fails

**Problem**: Actions workflow fails with Python error
- **Solution**: Check Python script logs in Actions tab
- Common causes: Missing fields in trade markdown, invalid YAML

**Problem**: Image optimization fails
- **Solution**: Check if optipng/jpegoptim are installed in workflow
- Fallback: Images will be copied without optimization

### Authentication Issues

**Problem**: "Authentication failed" error
- **Solution**: 
  - Verify your PAT has `repo` scope
  - Check if PAT has expired
  - Generate a new PAT if needed

**Problem**: Files not uploading to GitHub
- **Solution**:
  - Check network connectivity
  - Verify repository permissions
  - Check browser console for errors

### Display Issues

**Problem**: Recent trades not showing
- **Solution**:
  - Check if `trades-index.json` exists
  - Verify GitHub Actions completed successfully
  - Clear browser cache
  - Check browser console for errors

**Problem**: Images not loading
- **Solution**:
  - Verify images are in `assets/images/`
  - Check image paths in markdown
  - Ensure GitHub Pages is serving `assets/` directory

## File Structure Reference

```
/
├── index.html                 # Homepage
├── add-trade.html            # Trade submission form  
├── all-trades.html           # All trades list (generated)
├── trades-index.json         # Trade data index (generated)
├── manifest.json             # PWA manifest
├── .gitignore               # Git ignore rules
├── index.directory/
│   ├── _config.yml           # Jekyll config (main configuration)
│
├── assets/
│   ├── css/
│   │   └── main.css         # Main stylesheet
│   ├── js/
│   │   ├── app.js           # Main app logic
│   │   ├── auth.js          # Authentication
│   │   └── background.js    # Animated bg
│   ├── icons/               # PWA icons
│   ├── images/              # Optimized images (public)
│   └── charts/              # Generated charts
│
├── trades/                   # Trade markdown files
│   └── trade-*.md
│
├── summaries/               # Generated summaries
│   ├── weekly-*.md
│   ├── monthly-*.md
│   └── yearly-*.md
│
└── .github/
    ├── assets/              # Original images
    │   └── trade-*/
    ├── templates/
    │   ├── trade.md.template
    │   └── weekly-summary.md.template
    ├── scripts/
    │   ├── parse_trades.py
    │   ├── generate_summaries.py
    │   ├── generate_index.py
    │   ├── generate_charts.py
    │   ├── update_homepage.py
    │   └── optimize_images.sh
    ├── workflows/
    │   └── trade_pipeline.yml
    └── copilot-instructions.md
```

## Best Practices

1. **Trade Numbering**: Use sequential numbers starting from 1
2. **Screenshots**: Always include entry and exit charts
3. **Notes**: Document reasoning and lessons learned
4. **Consistency**: Fill out all fields for accurate analytics
5. **Backups**: Repository is your backup; commit regularly
6. **Review**: Use weekly summaries for performance review
7. **Security**: Never commit PATs or sensitive data

## Support & Contributing

- **Issues**: Open an issue on GitHub for bugs or features
- **Contributions**: Pull requests welcome
- **Documentation**: Keep this file updated with changes

## License

MIT License - See LICENSE file for details

---

**Version**: 1.0  
**Last Updated**: 2025-10-13  
**Maintainer**: statikfintechllc
