# Automation Scripts

**📁 Location:** `/.github/scripts`

## Overview

This directory contains the automation scripts that power the SFTi-Pennies trading journal system. These Python and shell scripts process trade data, generate analytics, create visualizations, and optimize assets as part of the automated GitHub Actions pipeline.

## Scripts Inventory

### Core Processing Scripts

#### 1. `parse_trades.py`
**Purpose:** Extract and parse trade data from markdown files into JSON index

**What it does:**
- Scans `trades/` and `SFTi.Tradez/week.*/` directories for markdown files
- Extracts YAML frontmatter containing trade details
- Validates required fields (ticker, dates, prices, etc.)
- Calculates derived metrics (P&L, R:R ratio, time-in-trade)
- Generates `trades-index.json` with all trade data

**Input:** Markdown files with YAML frontmatter  
**Output:** `trades-index.json`  
**Dependencies:** `pyyaml`

**Example usage:**
```bash
python .github/scripts/parse_trades.py
```

#### 2. `generate_summaries.py`
**Purpose:** Create weekly, monthly, and yearly performance summaries

**What it does:**
- Reads trade data from `trades-index.json`
- Groups trades by time period (week/month/year)
- Calculates statistics for each period:
  - Total P&L and average P&L
  - Win rate and profit factor
  - Best and worst trades
  - Total trades and position sizes
- Generates markdown summary files in `index.directory/summaries/` directory

**Input:** `trades-index.json`  
**Output:** `index.directory/summaries/weekly-*.md`, `index.directory/summaries/monthly-*.md`, `index.directory/summaries/yearly-*.md`  
**Dependencies:** `pyyaml`

**Example usage:**
```bash
python .github/scripts/generate_summaries.py
```

#### 3. `generate_index.py`
**Purpose:** Create master trade index and all-trades.html page

**What it does:**
- Consolidates all trade data from JSON index
- Generates comprehensive HTML page with sortable trade table
- Creates navigation and filtering interface
- Ensures all trades are accessible via web interface

**Input:** `trades-index.json`  
**Output:** `all-trades.html`  
**Dependencies:** None

**Example usage:**
```bash
python .github/scripts/generate_index.py
```

#### 4. `generate_charts.py`
**Purpose:** Create equity curves and performance visualizations

**What it does:**
- Reads trade data from `trades-index.json`
- Generates equity curve data for Chart.js (JSON format)
- Creates static chart images using matplotlib:
  - Cumulative P&L curve
  - Trade distribution chart
  - Win/loss visualization
- Saves charts to `assets/charts/` directory

**Input:** `trades-index.json`  
**Output:** 
- `assets/charts/equity-curve-data.json`
- `assets/charts/equity-curve.png`
- `assets/charts/trade-distribution.png`

**Dependencies:** `matplotlib`, `pyyaml`

**Example usage:**
```bash
python .github/scripts/generate_charts.py
```

#### 5. `update_homepage.py`
**Purpose:** Ensure homepage has access to latest trade data

**What it does:**
- Verifies `trades-index.json` exists and is accessible
- Updates any necessary data references
- Ensures homepage can load recent trades dynamically
- Validates data integrity

**Input:** `trades-index.json`  
**Output:** Updated `index.html` metadata (if needed)  
**Dependencies:** None

**Example usage:**
```bash
python .github/scripts/update_homepage.py
```

### Content Indexing Scripts

#### 6. `generate_books_index.py`
**Purpose:** Create searchable index of trading education PDFs

**What it does:**
- Scans `index.directory/Informational.Bookz/` for PDF files
- Extracts metadata (file name, size, date modified)
- Generates JSON index with book information
- Creates `books-index.json` for the books viewer

**Input:** PDF files in `Informational.Bookz/`  
**Output:** `books-index.json`  
**Dependencies:** None

**Example usage:**
```bash
python .github/scripts/generate_books_index.py
```

#### 7. `generate_notes_index.py`
**Purpose:** Create searchable index of trading notes and frameworks

**What it does:**
- Scans `index.directory/SFTi.Notez/` for markdown files
- Extracts titles, frontmatter, and excerpts
- Identifies related assets (images, diagrams)
- Generates JSON index with note metadata
- Creates `notes-index.json` for the notes viewer

**Input:** Markdown files in `SFTi.Notez/`  
**Output:** `notes-index.json`  
**Dependencies:** None

**Example usage:**
```bash
python .github/scripts/generate_notes_index.py
```

### Optimization Scripts

#### 8. `optimize_images.sh`
**Purpose:** Optimize uploaded images for web delivery

**What it does:**
- Finds images in `.github/assets/` and `assets/sfti.tradez.assets/`
- Optimizes PNG files using `optipng`
- Optimizes JPEG files using `jpegoptim`
- Moves optimized images to public `assets/images/` directory
- Reduces file sizes while maintaining quality

**Input:** Images in asset directories  
**Output:** Optimized images in `assets/images/`  
**Dependencies:** `optipng`, `jpegoptim` (system packages)

**Example usage:**
```bash
bash .github/scripts/optimize_images.sh
```

### Build Scripts

#### 9. `build.mjs`
**Purpose:** Bundle JavaScript dependencies for the web interface

**What it does:**
- Uses esbuild to bundle PDF.js and marked libraries
- Creates optimized JavaScript bundles
- Generates `bundle.min.js` for PDF and markdown rendering
- Manages dependencies for the frontend

**Input:** Node.js dependencies  
**Output:** `index.directory/assets/js/bundle.min.js`  
**Dependencies:** `esbuild`, `marked`, `pdfjs-dist`, `highlight.js`

**Example usage:**
```bash
node .github/scripts/build.mjs
# or
npm run build
```

### Testing Scripts

#### 10. `test_path_resolution.js`
**Purpose:** Test and debug path resolution in the application

**What it does:**
- Tests file path resolution logic
- Validates asset path construction
- Helps debug path-related issues
- Useful for development and troubleshooting

**Input:** Test paths  
**Output:** Console output with test results  
**Dependencies:** Node.js

**Example usage:**
```bash
node .github/scripts/test_path_resolution.js
```

#### 18. `test_imports.py`
**Purpose:** Validate that all Python files are properly wired with global awareness and accessibility

**What it does:**
- Tests import accessibility for all Python modules
- Verifies that functions are callable and classes are instantiable
- Checks for silent failures in imports
- Validates cross-module imports
- Tests utils.py functions (load_trades_index, load_account_config)
- Tests importers package (registry, get_importer, list_brokers)
- Tests BaseImporter class and all broker importers
- Provides comprehensive test report

**Input:** All Python files in .github/scripts directory  
**Output:** Test report with pass/fail status for each module  
**Dependencies:** Standard library only (importlib, sys, os, pathlib)

**Example usage:**
```bash
# Run comprehensive import tests
python .github/scripts/test_imports.py

# Run from any directory
cd /path/to/repo
python .github/scripts/test_imports.py
```

**Test Coverage:**
- 22 Python files tested
- Import validation
- Function accessibility
- Class instantiation
- Cross-module imports
- Broker registry validation

**Exit Codes:**
- 0: All tests passed
- 1: One or more tests failed

**When to run:**
- After making changes to Python files
- Before committing import-related changes
- When adding new Python modules
- As part of CI/CD pipeline
- When troubleshooting import issues

## Dependencies

### Python Dependencies
All Python scripts use standard library plus:
- `pyyaml` - YAML parsing for frontmatter
- `matplotlib` - Chart generation
- `datetime` - Date/time handling
- `json` - JSON data processing
- `os` - File system operations

### System Dependencies
- `optipng` - PNG optimization
- `jpegoptim` - JPEG optimization
- Node.js - For build scripts

### Installation
```bash
# Python packages
pip install pyyaml matplotlib

# System packages (Ubuntu/Debian)
sudo apt-get install optipng jpegoptim

# Node.js packages
npm install
```

## Script Execution Order

In the GitHub Actions workflow, scripts execute in this order:

1. `parse_trades.py` - Create JSON index from markdown
2. `generate_books_index.py` - Index PDF library
3. `generate_notes_index.py` - Index trading notes
4. `generate_summaries.py` - Generate period summaries
5. `generate_index.py` - Create master index page
6. `generate_charts.py` - Generate visualizations
7. `update_homepage.py` - Ensure data accessibility
8. `optimize_images.sh` - Optimize and move images

This order ensures dependencies are met (e.g., JSON index exists before summaries are generated).

## Development

### Running Locally

Test individual scripts during development:

```bash
# From repository root
cd /path/to/SFTi-Pennies

# Run parse trades
python .github/scripts/parse_trades.py

# Run summaries
python .github/scripts/generate_summaries.py

# Run charts (requires trades-index.json)
python .github/scripts/generate_charts.py

# Build JS bundles
npm run build

# Optimize images
bash .github/scripts/optimize_images.sh
```

### Adding New Scripts

When adding new automation scripts:

1. **Create the script** in this directory
2. **Add executable permissions** (for .sh files): `chmod +x script.sh`
3. **Document the script** in this README
4. **Add to workflow** in `.github/workflows/trade_pipeline.yml`
5. **Test locally** before committing
6. **Update dependencies** if new packages are required

### Script Guidelines

- Use clear, descriptive names
- Add comprehensive docstrings/comments
- Handle errors gracefully
- Log progress and results
- Validate inputs before processing
- Use relative paths from repository root
- Follow existing code style
- Include usage examples in comments

## Troubleshooting

### Common Issues

**Script not found:**
```bash
# Ensure you're running from repo root
pwd  # Should be /path/to/SFTi-Pennies
```

**Python import errors:**
```bash
# Install missing dependencies
pip install pyyaml matplotlib
```

**Image optimization fails:**
```bash
# Install system packages
sudo apt-get install optipng jpegoptim
```

**Permission denied (shell scripts):**
```bash
# Add executable permission
chmod +x .github/scripts/optimize_images.sh
```

### Debugging

Enable verbose output:
```python
# Add to Python scripts
import logging
logging.basicConfig(level=logging.DEBUG)
```

Check script output:
```bash
# Run with output capture
python script.py > output.log 2>&1
cat output.log
```

## Performance

### Script Execution Times
- `parse_trades.py`: ~1-2 seconds (for 100 trades)
- `generate_summaries.py`: ~1-2 seconds
- `generate_charts.py`: ~5-10 seconds (matplotlib rendering)
- `generate_index.py`: ~1 second
- `optimize_images.sh`: ~1-2 seconds per image
- `build.mjs`: ~2-3 seconds

### Optimization Tips
- Scripts run in parallel where possible in GitHub Actions
- Large image optimization can be slow (consider pre-optimizing)
- Chart generation with matplotlib takes the longest
- JSON parsing is fast for reasonable dataset sizes (<1000 trades)

## Related Documentation

- [GitHub Actions Workflow](../workflows/README.md)
- [Trade Pipeline Documentation](../docs/TRADE_PIPELINE.md)
- [Developer Guide](../docs/README-DEV.md)
- [Templates](../templates/README.md)

---

**Last Updated:** November 2025  
**Script Count:** 18 (10 core + 8 new)  
**Purpose:** Automated data processing and content generation

## New Scripts (Phase 2)

The following scripts were added to support CSV imports, advanced analytics, and export functionality:

### Advanced Analytics

#### 11. `generate_analytics.py`
**Purpose:** Compute advanced trading metrics and per-tag performance

**What it does:**
- Calculates expectancy (average P&L per trade)
- Computes profit factor (gross profit / gross loss)
- Determines max win/loss streaks
- Calculates Kelly Criterion for position sizing
- Generates drawdown series over time
- Aggregates statistics by strategy, setup, session tags
- Outputs comprehensive analytics JSON

**Input:** `trades-index.json`  
**Output:** `assets/charts/analytics-data.json`  
**Dependencies:** `json`, `datetime`

**Example usage:**
```bash
python .github/scripts/generate_analytics.py
```

### Import/Export Tools

#### 12. `export_csv.py`
**Purpose:** Export trades from JSON to CSV format

**What it does:**
- Loads all trades from trades-index.json
- Filters by strategy, date range (optional)
- Exports to standard CSV format compatible with Excel/Google Sheets
- Supports customizable field selection

**Input:** `trades-index.json`  
**Output:** CSV file (default: `trades-export.csv`)  
**Dependencies:** `csv`, `json`

**Example usage:**
```bash
# Export all trades
python .github/scripts/export_csv.py

# Export with filters
python .github/scripts/export_csv.py --output my-trades.csv --filter-strategy "Breakout"
```

**Options:**
- `--output` / `-o`: Output file path
- `--filter-strategy`: Filter by strategy name
- `--filter-date-from`: Start date (YYYY-MM-DD)
- `--filter-date-to`: End date (YYYY-MM-DD)

#### 13. `normalize_schema.py`
**Purpose:** Migrate trade data schema between versions

**What it does:**
- Detects current schema version
- Migrates trade data to newer schema versions
- Validates trade data against schema requirements
- Ensures backward compatibility
- Handles schema evolution (v1.0 → v1.1 → future versions)

**Input:** `trades-index.json`  
**Output:** Updated `trades-index.json` with migrated schema  
**Dependencies:** `json`, `datetime`

**Example usage:**
```bash
# Migrate to current schema
python .github/scripts/normalize_schema.py

# Validate without migrating
python .github/scripts/normalize_schema.py --validate-only

# Dry run to preview changes
python .github/scripts/normalize_schema.py --dry-run
```

**Schema Versions:**
- v1.0: Initial schema with basic trade fields
- v1.1: Added tags (strategy, setup, session, market_condition) and notes

### Trade Detail Pages

#### 14. `generate_trade_pages.py`
**Purpose:** Create individual HTML pages for each trade

**What it does:**
- Generates a dedicated page for each trade
- Includes complete trade metadata
- Integrates screenshot galleries with GLightbox
- Links related trades
- Shows performance metrics specific to that trade

**Input:** `trades-index.json`  
**Output:** `index.directory/trades/trade-{num}-{ticker}.html`  
**Dependencies:** `json`, `pathlib`

**Example usage:**
```bash
python .github/scripts/generate_trade_pages.py
```

**Status:** 🚧 Scaffolded - full template needs implementation

### Media Management

#### 15. `attach_media.py`
**Purpose:** Validate and reconcile trade image attachments

**What it does:**
- Scans `assets/trade-images/` for screenshots
- Validates image file references in trade metadata
- Detects orphaned images (not linked to trades)
- Reports missing images
- Verifies file paths and accessibility

**Input:** `assets/trade-images/`, `trades-index.json`  
**Output:** Validation report  
**Dependencies:** `os`, `json`, `glob`

**Example usage:**
```bash
python .github/scripts/attach_media.py
```

**Expected Structure:**
```
assets/trade-images/
├── trade-001/
│   ├── entry-chart.png
│   └── exit-chart.png
├── trade-002/
│   └── screenshot.png
```

### CSV Importers

#### 16. `import_csv.py`
**Purpose:** Import trades from broker CSV files

**What it does:**
- Auto-detects broker from CSV format
- Parses CSV using broker-specific importer
- Validates parsed trades
- Creates trade markdown files
- Updates trades-index.json
- Generates weekly folders automatically

**Input:** Broker CSV file  
**Output:** Trade markdown files in `SFTi.Tradez/week.*/`  
**Dependencies:** `importers/` modules, `json`, `argparse`

**Example usage:**
```bash
# Auto-detect broker
python .github/scripts/import_csv.py path/to/trades.csv

# Specify broker
python .github/scripts/import_csv.py path/to/trades.csv --broker ibkr

# Dry run (validate only)
python .github/scripts/import_csv.py path/to/trades.csv --dry-run
```

**Options:**
- `--broker`: Broker name (ibkr, schwab, robinhood, webull)
- `--dry-run`: Validate without creating files
- `--output-dir`: Custom output directory

**Status:** 🚧 Scaffolded - broker parsers need implementation

#### 17. `importers/` Module
**Purpose:** Broker-specific CSV parsing logic

**Structure:**
```
importers/
├── __init__.py           # Registry of available importers
├── base_importer.py      # Abstract base class
├── ibkr.py               # Interactive Brokers parser
├── schwab.py             # Schwab/TD Ameritrade parser
├── robinhood.py          # Robinhood parser
└── webull.py             # Webull parser
```

**What it does:**
- Provides abstract interface for all importers
- Implements broker-specific field mapping
- Handles entry/exit pair matching
- Validates trade data
- Calculates P&L if not in CSV

**Status:** 🚧 Scaffolded - full parsing logic needed

**Example (adding new broker):**
```python
from .base_importer import BaseImporter

class MyBrokerImporter(BaseImporter):
    def __init__(self):
        super().__init__()
        self.broker_name = "MyBroker"
    
    def detect_format(self, csv_content):
        # Implement detection logic
        pass
    
    def parse_csv(self, csv_content):
        # Implement parsing logic
        pass
    
    def validate_trade(self, trade):
        # Implement validation
        pass
```

## Updated Script Execution Order

With Phase 2 additions, the workflow now runs:

1. `parse_trades.py` - Create JSON index from markdown
2. `generate_books_index.py` - Index PDF library
3. `generate_notes_index.py` - Index trading notes
4. `generate_summaries.py` - Generate period summaries
5. `generate_index.py` - Create master index page
6. `generate_charts.py` - Generate visualizations
7. **`generate_analytics.py`** - ✨ Advanced analytics (expectancy, Kelly, profit factor)
8. **`generate_trade_pages.py`** - ✨ Trade detail pages with galleries
9. **`generate_week_summaries.py`** - ✨ NEW: Week master.trade.md files
10. `update_homepage.py` - Ensure data accessibility
11. `optimize_images.sh` - Optimize and move images

## New Dependencies

Phase 2 scripts use:
- `csv` - CSV export/import
- `argparse` - CLI argument parsing
- `pathlib` - Modern path handling
- `glob` - File pattern matching

All are part of Python standard library - no additional pip installs required beyond Phase 1 dependencies.

## Related Documentation

- [Importing Guide](../docs/importing.md) - CSV import instructions
- [Quick Start Guide](../docs/QUICKSTART.md) - Setup guide
- [GitHub Actions Workflow](../workflows/README.md)
- [Trade Pipeline Documentation](../docs/TRADE_PIPELINE.md)
- [Developer Guide](../docs/README-DEV.md)

---

**Phase 1:** October 13, 2025 (10 scripts)  
**Phase 2:** October 18, 2025 (+7 scripts)  
**Phase 3:** October 19, 2025 (+1 script - week summaries, all-weeks.html page)  
**Phase 4:** November 3, 2025 (+1 script - test_imports.py for validation)  
**Total Scripts:** 19  
**Status:** ✅ Core functional, ✅ Week summaries added, ✅ Import testing added
