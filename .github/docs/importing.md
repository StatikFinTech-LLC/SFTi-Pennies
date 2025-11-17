# Importing Trades from Broker CSVs

This guide explains how to import trades from your broker's CSV export files into SFTi-Pennies.

## Supported Brokers

SFTi-Pennies supports CSV imports from the following brokers:

### 1. Interactive Brokers (IBKR)
- **Export Method**: Activity > Flex Queries or Activity Statements
- **CSV Format**: Flex Query CSV or Activity Statement CSV
- **Auto-Detection**: ✅ Supported
- **Status**: ✅ Fully Implemented

**Typical Fields:**
- Symbol
- Date/Time
- Quantity
- T. Price (Trade Price)
- Proceeds
- Comm/Fee
- Realized P/L

### 2. Charles Schwab / TD Ameritrade
- **Export Method**: Accounts > History > Export
- **CSV Format**: Transaction History CSV
- **Auto-Detection**: ✅ Supported
- **Status**: ✅ Fully Implemented

**Typical Fields:**
- Date
- Action (Buy/Sell)
- Symbol
- Description
- Quantity
- Price
- Fees & Comm
- Amount

### 3. Robinhood
- **Export Method**: Account > Statements & History
- **CSV Format**: Account Statements CSV
- **Auto-Detection**: ✅ Supported
- **Status**: ✅ Fully Implemented

**Typical Fields:**
- Activity Date
- Process Date
- Settle Date
- Instrument
- Description
- Trans Code (Buy/Sell)
- Quantity
- Price
- Amount

### 4. Webull
- **Export Method**: Me > Statements
- **CSV Format**: Transaction History CSV
- **Auto-Detection**: ✅ Supported
- **Status**: ✅ Fully Implemented

**Typical Fields:**
- Time
- Symbol
- Side (Buy/Sell)
- Filled/Quantity
- Filled Avg Price
- Total
- Status

## How to Import

### Method 1: Web Interface

1. **Navigate to Import Page**
   - Go to your deployed site: `https://yourusername.github.io/SFTi-Pennies/import.html`

2. **Upload CSV File**
   - Click "Upload CSV" and select your broker's export file
   - The system will attempt to auto-detect the broker

3. **Select Broker (if needed)**
   - If auto-detection fails, manually select your broker from the dropdown

4. **Preview Trades**
   - Click "Validate Trades" to preview the parsed data
   - Review for accuracy and completeness

5. **Import**
   - Click "Import Trades" to add them to your journal
   - The system will create trade files and update your journal

### Method 2: Command Line

1. **Place CSV in import directory**
   ```bash
   mkdir -p import
   cp ~/Downloads/broker-export.csv import/
   ```

2. **Commit and push**
   ```bash
   git add import/
   git commit -m "Add trades for import"
   git push
   ```

3. **Workflow triggers automatically**
   - The import.yml workflow detects the CSV and creates trade files
   - Files are created in: `index.directory/SFTi.Tradez/week.YYYY.WW/MM:DD:YYYY.N.md`
   - This triggers the trade_pipeline.yml workflow automatically
   - Trades are parsed, charts regenerated, and analytics updated
   - Site is deployed with new trades

### Method 3: Manual Script Execution

1. **Run import script locally**
   ```bash
   python .github/scripts/import_csv.py path/to/broker-export.csv --broker ibkr
   ```

2. **Options:**
   - `--broker`: Specify broker (auto-detect if omitted)
   - `--dry-run`: Validate without creating files
   - `--output-dir`: Base directory (default: index.directory/SFTi.Tradez)

3. **Output:**
   - Creates files in week-based structure: `index.directory/SFTi.Tradez/week.YYYY.WW/MM:DD:YYYY.N.md`
   - Uses existing trade template format from `.github/templates/trade.md.template`
   - Integrates with existing parse_trades.py script

## Broker-Specific Export Instructions

### Interactive Brokers (IBKR)

1. Log in to IBKR Account Management
2. Go to **Reports** > **Flex Queries**
3. Create a new Flex Query or use existing
4. Include these fields:
   - Trades
   - Symbol
   - Date/Time
   - Quantity
   - Price
   - Proceeds
   - Commission
5. Run query and download CSV

**Alternative:** Use Activity Statements
1. Go to **Reports** > **Activity Statements**
2. Select date range
3. Download as CSV
4. Extract trades section

### Charles Schwab

1. Log in to Schwab.com
2. Go to **Accounts** > **History**
3. Select date range
4. Filter by "Stocks" transactions
5. Click **Export** > **CSV**

### TD Ameritrade (Legacy)

1. Log in to TD Ameritrade
2. Go to **My Account** > **History & Statements**
3. Select **Transaction History**
4. Choose date range
5. Export to CSV

### Robinhood

1. Log in to Robinhood
2. Go to **Account** (profile icon)
3. Select **Statements & History**
4. Choose **Account Statements**
5. Download monthly statement
6. Extract CSV from statement

### Webull

1. Log in to Webull
2. Go to **Me** > **Statements**
3. Select **Transaction History**
4. Choose date range
5. Download CSV

## Field Mapping

The importer maps broker-specific fields to SFTi-Pennies standard format:

### Standard Trade Format

```json
{
  "trade_number": 1,
  "ticker": "AAPL",
  "entry_date": "2025-01-15",
  "entry_time": "09:30:00",
  "entry_price": 150.25,
  "exit_date": "2025-01-16",
  "exit_time": "14:30:00",
  "exit_price": 152.50,
  "position_size": 100,
  "direction": "LONG",
  "broker": "Interactive Brokers",
  "pnl_usd": 225.00,
  "pnl_percent": 1.50,
  "strategy": "Breakout",
  "notes": "Clean breakout with volume"
}
```

### Download Sample Mapping

You can download a sample field mapping for your broker:
1. Go to import.html
2. Select your broker
3. Click "Download Sample Mapping"
4. Review the JSON file to understand field mappings

## Handling Entry/Exit Pairs

Most broker CSVs export individual BUY and SELL transactions separately. The importer intelligently matches these into complete trades:

1. **FIFO Matching** (First In, First Out)
   - Buys are matched with subsequent sells
   - Same ticker and quantity

2. **Manual Verification**
   - Preview shows matched pairs
   - Invalid matches are flagged
   - You can manually edit if needed

3. **Partial Fills**
   - TODO: Support for partial position exits
   - Currently requires manual entry

## Duplicate Detection

The importer checks for duplicates using:
- Trade date + ticker combination
- Trade number (if already imported)

Duplicates are:
- **Skipped** by default
- **Flagged** in the preview
- **Optional**: Update existing trades

## Validation Rules

All imported trades must pass validation:

✅ **Required Fields**
- Ticker symbol
- Entry date and price
- Exit date and price
- Position size
- Direction (LONG/SHORT)

✅ **Data Integrity**
- Valid dates (entry before exit)
- Positive prices and quantities
- Reasonable P&L calculations

⚠️ **Warnings** (not errors)
- Missing commission data
- No strategy/setup tags
- Unusual time-in-trade (< 1 min or > 1 year)

## Troubleshooting

### Auto-Detection Fails

**Problem:** Broker is not detected automatically

**Solution:**
1. Manually select broker from dropdown
2. Verify CSV format matches broker export
3. Check for extra header rows or footers
4. Download sample mapping to compare

### Import Shows 0 Trades

**Problem:** CSV parses but no trades found

**Solution:**
1. Check CSV contains Buy AND Sell transactions
2. Ensure transactions are within date range
3. Verify Status = "Filled" (not Cancelled)
4. Check for sufficient data in required columns

### Trades Don't Match

**Problem:** Buys and sells aren't pairing correctly

**Solution:**
1. Ensure same ticker symbol
2. Check for stock splits (adjust quantities)
3. Verify FIFO matching logic
4. Consider manual entry for complex trades

### Missing Data After Import

**Problem:** Some fields are blank in imported trades

**Solution:**
1. CSV may not include all fields (e.g., strategy)
2. Manually edit trade files to add missing data
3. Use tags to categorize after import
4. Update trades-index.json and regenerate

## Manual Cleanup

After importing, you may want to:

1. **Add Strategy Tags**
   - Edit trade markdown files
   - Add strategy, setup, session tags

2. **Add Notes**
   - Include trade rationale
   - Lessons learned
   - Screenshots

3. **Verify P&L**
   - Cross-check with broker statements
   - Account for commissions
   - Validate calculations

4. **Regenerate Analytics**
   ```bash
   python .github/scripts/parse_trades.py
   python .github/scripts/generate_analytics.py
   python .github/scripts/generate_charts.py
   ```

## Future Enhancements

Planned features for future development:

- [ ] API-based imports (no CSV needed)
- [ ] Automatic commission handling
- [ ] Multi-leg option trades
- [ ] Cryptocurrency support
- [ ] More brokers (E*TRADE, Fidelity, etc.)
- [ ] Bulk tagging interface
- [ ] Import scheduling (auto-import weekly)

## Implementation Status

✅ **Core Features Completed:**
- Broker auto-detection for IBKR, Schwab, Robinhood, Webull
- CSV parsing with broker-specific field mappings
- Entry/exit transaction matching (FIFO algorithm)
- Trade validation with error reporting
- Duplicate detection by date + ticker
- Command-line interface with dry-run support
- Web interface with file upload and preview
- CSV export functionality

📝 **Documentation:**
- Importer architecture: [.github/scripts/importers/README.md](../../.github/scripts/importers/README.md)
- User guide: [.github/instructions/csv-import-guide.md](../../.github/instructions/csv-import-guide.md)
- Integration with trade pipeline: [TRADE_PIPELINE.md](TRADE_PIPELINE.md)

## Getting Help

If you encounter issues:

1. **Check Logs**: Workflow runs show detailed errors
2. **Validate Manually**: Run import script with `--dry-run`
3. **Open Issue**: [GitHub Issues](https://github.com/statikfintechllc/SFTi-Pennies/issues)
4. **Review Docs**: [Main Documentation](README.md)

---

**Last Updated:** 2025-10-20  
**Version:** 1.0 - Fully Implemented  
**Status:** Production Ready
