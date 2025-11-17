# CSV Import Instructions

Complete guide for importing trades from broker CSV files into SFTi-Pennies.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Supported Brokers](#supported-brokers)
4. [Import Methods](#import-methods)
5. [Step-by-Step Guides](#step-by-step-guides)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Usage](#advanced-usage)

## Overview

The CSV import feature allows you to bulk-import your historical trades from broker CSV exports. The system:

- **Auto-detects** broker format from CSV structure
- **Validates** trade data before import
- **Matches** entry/exit pairs automatically
- **Prevents** duplicate imports
- **Integrates** with existing trade pipeline

## Quick Start

### Web Interface (Easiest)

1. Navigate to `https://yourusername.github.io/SFTi-Pennies/index.directory/import.html`
2. Click "Upload CSV File" and select your broker export
3. System auto-detects broker (or select manually)
4. Click "Validate Trades" to preview
5. Click "Import Trades" to complete

### Command Line (Advanced)

```bash
cd /path/to/SFTi-Pennies
python .github/scripts/import_csv.py path/to/broker-export.csv --dry-run
python .github/scripts/import_csv.py path/to/broker-export.csv
```

## Supported Brokers

### Interactive Brokers (IBKR)
- ✅ **Status**: Fully implemented
- **Formats**: Flex Query, Activity Statement, Trade Confirmations
- **Auto-detect**: Yes
- **Key fields**: Symbol, Date/Time, Quantity, T. Price, Proceeds, Realized P/L

### Charles Schwab / TD Ameritrade
- ✅ **Status**: Fully implemented
- **Formats**: Transaction History CSV, TDA Legacy
- **Auto-detect**: Yes
- **Key fields**: Date, Action, Symbol, Quantity, Price, Fees & Comm

### Robinhood
- ✅ **Status**: Fully implemented
- **Formats**: Account Statements, Activity History
- **Auto-detect**: Yes
- **Key fields**: Activity Date, Trans Code, Instrument, Quantity, Price

### Webull
- ✅ **Status**: Fully implemented
- **Formats**: Transaction History CSV
- **Auto-detect**: Yes
- **Key fields**: Time, Symbol, Side, Filled/Quantity, Filled Avg Price

## Import Methods

### Method 1: Web Interface

**Best for:** Most users, quick imports, visual preview

**Steps:**
1. Open import page in browser
2. Upload CSV file
3. Review preview
4. Confirm import

**Pros:**
- Easy to use
- Visual validation
- No technical knowledge needed
- Works on any device

**Cons:**
- Requires browser access
- Limited to single file at a time
- Need to download CSV first

### Method 2: Command Line

**Best for:** Bulk imports, automation, power users

**Steps:**
1. Download CSV from broker
2. Run import script with path to CSV
3. Review output
4. Commit changes

**Pros:**
- Fast for multiple files
- Scriptable/automatable
- Works offline
- Better error messages

**Cons:**
- Requires Python installed
- Command line knowledge needed
- Manual commit required

### Method 3: GitHub Workflow (Future)

**Best for:** Scheduled imports, automated workflows

**Steps:**
1. Upload CSV to `import/` directory
2. Commit and push
3. Workflow auto-processes
4. Check results in Actions

**Pros:**
- Fully automated
- No local setup needed
- Integrated with CI/CD

**Cons:**
- Not yet implemented
- Requires GitHub access

## Step-by-Step Guides

### Export from IBKR

1. **Login** to IBKR Account Management
2. **Navigate** to Reports → Flex Queries
3. **Create** or run existing query:
   - Include: Trades
   - Fields: Symbol, Date/Time, Quantity, Price, Proceeds, Commission, Realized P/L
   - Date range: Select your period
4. **Run** query
5. **Download** CSV
6. **Save** to your computer

**Alternative - Activity Statement:**
1. Go to Reports → Activity Statements
2. Select date range
3. Download as CSV
4. Extract trades section

### Export from Schwab

1. **Login** to Schwab.com
2. **Navigate** to Accounts → History
3. **Select** date range
4. **Filter** by "Stocks" or "All Transactions"
5. **Click** Export → CSV
6. **Save** file

### Export from Robinhood

1. **Login** to Robinhood
2. **Navigate** to Account (profile icon)
3. **Select** Statements & History
4. **Choose** Account Statements
5. **Download** monthly statement
6. **Extract** CSV from statement (if needed)

**Note:** Robinhood provides monthly statements. You may need to combine multiple months.

### Export from Webull

1. **Login** to Webull
2. **Navigate** to Me → Statements
3. **Select** Transaction History
4. **Choose** date range
5. **Download** CSV
6. **Save** file

### Import via Web Interface

1. **Open** browser and navigate to import page:
   ```
   https://yourusername.github.io/SFTi-Pennies/index.directory/import.html
   ```

2. **Upload CSV**:
   - Click "Upload CSV File" button
   - Select your broker export file
   - Wait for file to load

3. **Verify Auto-Detection**:
   - System displays detected broker
   - If wrong, manually select from dropdown
   - If not detected, check CSV format

4. **Validate Trades**:
   - Click "Validate Trades" button
   - Review preview table:
     - ✅ Valid trades (green)
     - ❌ Invalid trades (red with errors)
   - Check summary statistics:
     - Total trades found
     - Valid count
     - Invalid count
     - Total P&L

5. **Review & Edit** (if needed):
   - Invalid trades show error messages
   - Fix source CSV if needed
   - Re-upload corrected file

6. **Import**:
   - Click "Import Trades" button
   - System creates trade files
   - Updates trades index
   - Confirmation message appears

7. **Verify**:
   - Navigate to All Trades page
   - Check imported trades appear
   - Verify data accuracy
   - Review analytics update

### Import via Command Line

1. **Install Requirements**:
   ```bash
   cd /path/to/SFTi-Pennies
   pip install pyyaml
   ```

2. **Dry Run First** (recommended):
   ```bash
   python .github/scripts/import_csv.py \
     path/to/broker-export.csv \
     --dry-run
   ```

3. **Review Output**:
   ```
   ============================================================
   SFTi-Pennies CSV Importer
   ============================================================
   CSV File: path/to/broker-export.csv
   Broker: auto-detect
   Dry Run: True
   Output: index.directory/SFTi.Tradez
   ============================================================

   [Step 1/4] Parsing CSV file...
   Detected broker: ibkr
   Found 25 potential trade(s)

   [Step 2/4] Validating trades...
   Valid trades: 23
   Invalid trades: 2

   Invalid trades:
     1. TSLA: Missing required field: exit_price
     2. AAPL: Invalid date format

   [DRY RUN] Would import 23 trade(s)
   ```

4. **Fix Issues** (if any):
   - Check error messages
   - Edit CSV or add missing data
   - Re-run dry run

5. **Real Import**:
   ```bash
   python .github/scripts/import_csv.py \
     path/to/broker-export.csv
   ```

6. **Expected Output**:
   ```
   [Step 3/4] Creating trade markdown files...
   Created index.directory/SFTi.Tradez/week.2025.42/10:13:2025.1.md
   Created index.directory/SFTi.Tradez/week.2025.42/10:14:2025.1.md
   ...
   Created 23 trade file(s)

   [Step 4/4] Updating trades index...
   Updated trades index with 23 new trade(s)

   ============================================================
   Import complete!
   ============================================================
   Imported 23 trade(s)
   Created 23 file(s)

   Next steps:
   1. Run: python .github/scripts/parse_trades.py
   2. Run: python .github/scripts/generate_charts.py
   3. Commit and push changes to trigger full pipeline
   ```

7. **Regenerate Analytics**:
   ```bash
   python .github/scripts/parse_trades.py
   python .github/scripts/generate_analytics.py
   python .github/scripts/generate_charts.py
   ```

8. **Commit Changes**:
   ```bash
   git add index.directory/SFTi.Tradez/
   git add index.directory/trades-index.json
   git commit -m "Import trades from broker CSV"
   git push
   ```

9. **Verify on Site**:
   - Wait for GitHub Pages deployment
   - Navigate to your site
   - Check trades appear correctly

## Troubleshooting

### Issue: Broker Not Auto-Detected

**Symptoms:**
- "Could not auto-detect broker" message
- Broker dropdown shows "Unknown"

**Solutions:**
1. **Verify CSV format**:
   - Open CSV in text editor
   - Check first line has headers
   - No extra rows before headers

2. **Manual selection**:
   - Select broker from dropdown
   - Click Validate again

3. **Check CSV structure**:
   - Ensure it's from supported broker
   - Compare headers with examples
   - Download sample mapping for reference

4. **Clean CSV**:
   - Remove summary rows at bottom
   - Remove extra header rows at top
   - Save as UTF-8 encoding

### Issue: No Trades Found

**Symptoms:**
- "Found 0 potential trade(s)"
- Empty preview table

**Solutions:**
1. **Check CSV content**:
   - Ensure trades are in CSV (not just headers)
   - Verify transactions are marked as "Filled"
   - Check date range includes trades

2. **Verify format**:
   - CSV should have both BUY and SELL transactions
   - At least one complete trade (entry + exit)
   - Check ticker symbols are present

3. **Check broker format**:
   - Different report types have different structures
   - Use correct export format (Activity Statement vs Flex Query)
   - Consult broker's documentation

### Issue: Invalid Trades

**Symptoms:**
- Some trades marked as invalid
- Error messages in preview

**Common Errors:**

**"Missing required field: exit_price"**
- CSV only has entry transactions
- Need to export both buys and sells
- Or manually add exit data

**"Invalid date format"**
- Date not in expected format
- Solution: Edit CSV to use YYYY-MM-DD format
- Or contact support with sample

**"Negative position size"**
- Quantity field has wrong sign
- Usually fixed automatically
- Check if SHORT trades detected correctly

**"Entry date after exit date"**
- Transactions matched incorrectly
- May need manual trade entry
- Or fix transaction order in CSV

### Issue: Import Button Disabled

**Symptoms:**
- "Import Trades" button is greyed out
- Can't click to import

**Solutions:**
1. **Upload CSV first**:
   - Import button only works after file uploaded
   - Check file uploaded successfully

2. **Validate first**:
   - Must click "Validate Trades" before import
   - Wait for validation to complete

3. **Fix invalid trades**:
   - All trades must be valid to import
   - Fix errors in CSV
   - Re-upload and validate

### Issue: Duplicate Trades

**Symptoms:**
- Message: "Skipping duplicate trade"
- Fewer trades imported than expected

**Explanation:**
- System detects duplicates by date + ticker
- Prevents re-importing same trades
- This is normal behavior

**Solutions:**
1. **If intentional duplicate**:
   - Different trade number needed
   - Or different time of day
   - Manually edit one entry

2. **If actually different trade**:
   - Check dates are different
   - Or different entry/exit times
   - System may need more context

### Issue: Wrong Week Folder

**Symptoms:**
- Trades appear in wrong week directory
- Week number doesn't match calendar

**Explanation:**
- System uses ISO week numbering
- Week 1 = first week with 4+ days in new year
- Weeks start Monday

**Solutions:**
1. **Verify entry date**:
   - Double-check date in CSV
   - Correct date in CSV if wrong

2. **Accept ISO weeks**:
   - Week numbers may differ from calendar
   - This is correct behavior
   - Week.2025.01 = first ISO week of 2025

3. **Manual move** (if needed):
   ```bash
   mv index.directory/SFTi.Tradez/week.2025.42/*.md \
      index.directory/SFTi.Tradez/week.2025.43/
   ```
   Then regenerate indexes

## Advanced Usage

### Custom Field Mapping

Download and customize field mappings:

1. **Download sample mapping**:
   - Click "Download Sample Mapping" button
   - Save JSON file

2. **Edit mapping**:
   ```json
   {
     "broker": "Interactive Brokers (IBKR)",
     "fields": {
       "Symbol": "ticker",
       "Date/Time": "entry_date + entry_time",
       "Quantity": "position_size",
       "T. Price": "entry_price / exit_price"
     }
   }
   ```

3. **Use custom mapping** (future feature):
   - Upload alongside CSV
   - System uses custom mappings
   - Allows non-standard formats

### Batch Import Multiple Files

Import multiple CSV files at once:

```bash
for file in exports/*.csv; do
  echo "Processing $file..."
  python .github/scripts/import_csv.py "$file" --dry-run
done

# Review all outputs, then:
for file in exports/*.csv; do
  python .github/scripts/import_csv.py "$file"
done
```

### Export Current Trades

Export existing trades to CSV:

1. **Via web interface**:
   - Click "Export CSV" button
   - Downloads `sfti-pennies-trades-YYYY-MM-DD.csv`

2. **Via command line** (future):
   ```bash
   python .github/scripts/export_csv.py
   ```

### Automated Imports

Set up scheduled imports (future):

1. **Create cron job**:
   ```bash
   0 0 * * 0 cd /path/to/repo && \
     python .github/scripts/import_csv.py ~/Downloads/weekly-trades.csv && \
     git add . && git commit -m "Weekly trade import" && git push
   ```

2. **Or use GitHub Actions**:
   - Upload to `import/` directory
   - Workflow processes automatically
   - See `.github/workflows/import.yml`

## Best Practices

### Before Importing

1. ✅ **Backup** your repository
2. ✅ **Dry run** first to check for issues
3. ✅ **Review** preview carefully
4. ✅ **Verify** broker detection is correct
5. ✅ **Check** date range matches expectations

### After Importing

1. ✅ **Verify** trades appear on site
2. ✅ **Check** analytics updated correctly
3. ✅ **Review** a few random trades for accuracy
4. ✅ **Add** strategy/setup tags manually if needed
5. ✅ **Update** trade notes with additional context

### Data Quality

1. ✅ **Cross-reference** with broker statements
2. ✅ **Verify** P&L calculations match broker
3. ✅ **Account** for commissions and fees
4. ✅ **Check** for missing or partial fills
5. ✅ **Document** any manual corrections

## Getting Help

### Documentation

- [Importer Architecture](.github/scripts/importers/README.md)
- [Trade Pipeline](.github/docs/TRADE_PIPELINE.md)
- [Importing Guide](.github/docs/importing.md)

### Support Channels

1. **GitHub Issues**: [Open an issue](https://github.com/statikfintechllc/SFTi-Pennies/issues)
2. **Discussions**: [Ask in discussions](https://github.com/statikfintechllc/SFTi-Pennies/discussions)
3. **Documentation**: Check existing docs first

### When Opening an Issue

Include:
1. Broker name and export method
2. Error message (full text)
3. CSV structure (remove sensitive data):
   ```csv
   Symbol,Date/Time,Quantity,Price
   AAPL,2025-01-15 09:30:00,100,150.25
   ```
4. Steps to reproduce
5. Expected vs actual behavior
6. Screenshots if helpful

---

**Last Updated:** 2025-10-20  
**Version:** 1.0.0  
**Maintainer:** SFTi-Pennies Team
