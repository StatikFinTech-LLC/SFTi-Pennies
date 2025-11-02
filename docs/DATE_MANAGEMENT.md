# Date Management in SFTi-Pennies

## Overview

The SFTi-Pennies trading journal now features **thoughtful date management** that ensures all charts, graphs, and analytics are properly aligned with the actual dates of your trading activity. This means your charts will always show accurate, user-friendly date labels that make sense as time passes.

## Key Features

### 1. Account Opening Date Tracking

Your account opening date is automatically tracked and used as the starting point for all time-series charts. This ensures:

- **Weekly charts** start on the actual day you opened your account (e.g., Tuesday), not a fixed day like Monday
- **Monthly charts** show dates starting from when you actually began trading
- **Yearly charts** display months relative to when you started

### 2. Date-Aware Chart Labels

Instead of generic labels like "Mon", "Tue", "Start", charts now display:

- **Actual dates**: "Tue 10/29" instead of just "Tue"
- **Chronological order**: Labels follow your actual trading timeline
- **Context-appropriate formatting**: Different timeframes show appropriate detail
  - Day: Time labels (09:30, 10:00, etc.)
  - Week: Day + Date (Tue 10/29, Wed 10/30)
  - Month: Dates (10/29, 10/30)
  - Year: Month names (Oct, Nov, Dec)
  - 5-Year: Year + Quarter (2024 Q4, 2025 Q1)

### 3. Automatic Detection

The system automatically determines your account opening date using:

1. **Explicit setting**: If you set `account_opening_date` in account-config.json
2. **First trade date**: Falls back to your first trade's entry date if no explicit date is set
3. **Current date**: Uses today's date if no trades exist yet

## How It Works

### Chart Generation Process

When generating charts, the system:

1. Loads your account configuration including `account_opening_date`
2. Determines the start date (account opening or first trade)
3. Groups trades by appropriate time periods
4. Creates labels that show actual dates, not generic day names
5. Ensures chronological order is maintained

### Example Scenario

Let's say you open an account on **Tuesday, October 29, 2024** with $140:

**Day 1 (Tuesday)**: No trades, portfolio value = $140
**Day 2 (Wednesday)**: Profitable trade (+$25), portfolio value = $165
**Day 3 (Thursday)**: Losing trade (-$15), portfolio value = $150
**Day 4 (Friday)**: Profitable trade (+$50), portfolio value = $200

**Weekly Chart Labels (Before):**
- Start
- Mon
- Tue
- Wed

**Weekly Chart Labels (After - Date Aware):**
- Tue 10/29
- Wed 10/30
- Thu 10/31
- Fri 11/01

This clearly shows:
- Your account started on Tuesday (not Monday)
- The actual dates of your trades
- The progression through the week

## Configuration

### Setting Account Opening Date

You can explicitly set your account opening date in `account-config.json`:

```json
{
  "starting_balance": 140.00,
  "deposits": [],
  "withdrawals": [],
  "account_opening_date": "2024-10-29",
  "notes": "Account opening date is used for chart date alignment",
  "version": "1.0"
}
```

**Format**: ISO 8601 date string (`YYYY-MM-DD`)

### Backward Compatibility

If `account_opening_date` is not set or is `null`:
- The system automatically uses your first trade's entry date
- Existing users don't need to update their config
- Charts will still be date-aware based on actual trading activity

## Affected Charts

The following charts now use date-aware labels:

### Portfolio Value Charts
- `portfolio-value-day.json`
- `portfolio-value-week.json`
- `portfolio-value-month.json`
- `portfolio-value-quarter.json`
- `portfolio-value-year.json`
- `portfolio-value-5year.json`

### Total Return Charts
- `total-return-day.json`
- `total-return-week.json`
- `total-return-month.json`
- `total-return-quarter.json`
- `total-return-year.json`
- `total-return-5year.json`

## Benefits

### For New Users

- Charts immediately make sense from day 1
- See progression starting from your actual account opening
- No confusion about generic "Start" labels

### For Active Traders

- Weekly/monthly views align with your actual trading schedule
- Easy to correlate chart data with calendar events
- Better understanding of time-based patterns in your trading

### As Time Passes

- Charts remain accurate and don't become stale
- Date labels update automatically with new trades
- No need to manually adjust time periods

## Technical Details

### Chart Generation Script

The date management logic is implemented in `.github/scripts/generate_charts.py`:

- `generate_portfolio_value_charts()`: Generates portfolio value charts with date-aware labels
- `generate_total_return_charts()`: Generates total return charts with date-aware labels

Both functions:
1. Load `account_opening_date` from account configuration
2. Determine actual start date
3. Aggregate trades by timeframe
4. Create labels with actual dates
5. Handle edge cases (same-day trades, gaps in trading)

### Frontend Integration

The frontend automatically loads and displays these date-aware charts:

- **StateManager**: Tracks account opening date in application state
- **EventBus**: Emits events when account config changes
- **AccountManager**: Manages account opening date (future enhancement)

### Data Flow

```
User Opens Account / Makes First Trade
    ↓
account_opening_date set (explicit or automatic)
    ↓
Trade Pipeline triggered
    ↓
generate_charts.py runs
    ↓
Date-aware chart JSONs generated
    ↓
Frontend loads charts
    ↓
Charts display with actual dates
```

## Future Enhancements

Potential improvements for date management:

1. **UI for setting account opening date**: Allow users to set/edit opening date via web interface
2. **Time zone support**: Handle different time zones for international traders
3. **Custom date ranges**: Allow users to select specific date ranges for analysis
4. **Gap detection**: Highlight trading gaps in charts
5. **Trading calendar**: Show trading days vs. non-trading days

## Testing

The date management feature has been validated with:

- Unit tests for chart generation with various scenarios
- Edge case handling (same-day trades, account opening with no trades)
- Backward compatibility testing
- Visual validation of chart outputs

## Troubleshooting

### Charts still show generic labels

**Cause**: Account config may not have account_opening_date set, or trades index is outdated

**Solution**:
1. Check `index.directory/account-config.json` - ensure it has `account_opening_date`
2. Re-run trade pipeline: `python .github/scripts/generate_charts.py`
3. Hard refresh browser (Ctrl+F5) to clear cache

### Account opening date is wrong

**Cause**: Manually set date is incorrect

**Solution**:
1. Edit `index.directory/account-config.json`
2. Set `account_opening_date` to correct date in YYYY-MM-DD format
3. Commit changes to trigger pipeline
4. Wait for charts to regenerate (1-5 minutes)

### Duplicate labels on same day

**Cause**: Should not occur with current logic, but if it does:

**Solution**:
1. Ensure using latest version of generate_charts.py
2. Check for multiple trades with identical timestamps
3. Report issue if problem persists

## Related Documentation

- [Trade Pipeline Documentation](../.github/docs/TRADE_PIPELINE.md)
- [Event Bus Integration Guide](./EVENT_BUS_GUIDE.md)
- [Analytics Documentation](../.github/docs/ANALYTICS.md)

## Support

For issues or questions about date management:
1. Check existing [Issues](https://github.com/statikfintechllc/SFTi-Pennies/issues)
2. Review [GitHub Actions logs](https://github.com/statikfintechllc/SFTi-Pennies/actions)
3. Open a new issue with:
   - Description of the problem
   - Screenshots of affected charts
   - Content of account-config.json
   - Browser console output

---

**Last Updated:** 2024-11-02
**Version:** 1.0
**Feature Status:** ✅ Production Ready
