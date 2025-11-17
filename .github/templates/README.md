# Content Templates

**📁 Location:** `/.github/templates`

## Overview

This directory contains templates used for generating content in the SFTi-Pennies trading journal. These templates ensure consistency in trade entries, summaries, and other generated content.

## Available Templates

### 1. `trade.md.template`
**Purpose:** Standard template for individual trade entries

**Structure:**
```yaml
---
# YAML Frontmatter
trade_number: [sequential number]
ticker: [stock symbol]
entry_date: [YYYY-MM-DD]
entry_time: [HH:MM]
exit_date: [YYYY-MM-DD]
exit_time: [HH:MM]
entry_price: [decimal]
exit_price: [decimal]
position_size: [integer shares]
direction: [LONG/SHORT]
strategy: [strategy name]
stop_loss: [price]
target_price: [price]
risk_reward_ratio: [calculated]
broker: [broker name]
pnl_usd: [calculated]
pnl_percent: [calculated]
screenshots: [list of image paths]
---

# Trade #{trade_number} - {TICKER}

## Trade Details
[Trade information rendered here]

## Analysis
[Analysis notes]

## Lessons Learned
[Key takeaways]
```

**Used by:**
- Web form submission (`add-trade.html`)
- Manual trade creation
- Trade import scripts

**Fields:**

Required fields (marked with *):
- `trade_number`* - Sequential identifier
- `ticker`* - Stock symbol
- `entry_date`* - Trade entry date (ISO format)
- `entry_time`* - Trade entry time (24-hour)
- `exit_date`* - Trade exit date (ISO format)
- `exit_time`* - Trade exit time (24-hour)
- `entry_price`* - Entry price (4 decimals)
- `exit_price`* - Exit price (4 decimals)
- `position_size`* - Number of shares
- `direction`* - LONG or SHORT

Optional fields:
- `strategy` - Strategy name
- `stop_loss` - Stop loss price
- `target_price` - Target price
- `risk_reward_ratio` - R:R ratio
- `broker` - Broker name
- `screenshots` - Array of image paths
- `notes` - Trade notes

Calculated fields (auto-filled):
- `pnl_usd` - Profit/Loss in dollars
- `pnl_percent` - Profit/Loss as percentage
- `time_in_trade` - Duration of trade

### 2. `weekly-summary.md.template`
**Purpose:** Template for automated weekly performance summaries

**Structure:**
```markdown
# Weekly Summary - Week {week_number}, {year}

## Period: {start_date} to {end_date}

### Performance Overview
- **Total Trades:** {count}
- **Win Rate:** {percentage}%
- **Total P&L:** ${amount}
- **Average P&L:** ${amount}

### Best Trade
- {ticker} - ${pnl}

### Worst Trade
- {ticker} - ${pnl}

### Strategies Used
[Strategy breakdown]

### Key Insights
[Auto-generated or manual insights]
```

**Used by:**
- `generate_summaries.py` script
- Automated weekly report generation

**Variables:**
- `{week_number}` - ISO week number
- `{year}` - Year
- `{start_date}` - Week start date
- `{end_date}` - Week end date
- `{count}` - Number of trades
- `{percentage}` - Win rate
- `{amount}` - Dollar amounts
- `{ticker}` - Stock symbols
- `{pnl}` - P&L values

## Using Templates

### For Manual Trade Creation

1. **Copy the template:**
   ```bash
   cp .github/templates/trade.md.template trades/trade-XXX.md
   ```

2. **Fill in the YAML frontmatter:**
   - Replace all `[placeholders]` with actual values
   - Ensure dates are in ISO format (YYYY-MM-DD)
   - Use 24-hour time format (HH:MM)
   - Calculate P&L fields or let scripts calculate

3. **Add trade notes:**
   - Write analysis in the markdown body
   - Add screenshots using relative paths
   - Document lessons learned

4. **Commit and push:**
   ```bash
   git add trades/trade-XXX.md
   git commit -m "Add trade XXX"
   git push
   ```

### For Automated Trade Creation

The web form (`add-trade.html`) uses these templates automatically:

1. User fills out form
2. JavaScript validates input
3. Template is populated with form data
4. Calculations are performed (P&L, R:R)
5. Markdown file is created via GitHub API
6. File is committed to repository

### For Script Generation

Scripts use templates programmatically:

```python
# Example from generate_summaries.py
template = load_template('weekly-summary.md.template')
summary = template.format(
    week_number=week_num,
    year=year,
    start_date=start,
    end_date=end,
    # ... more variables
)
write_file(f'summaries/weekly-{year}-W{week_num}.md', summary)
```

## Template Structure

### YAML Frontmatter
All trade templates use YAML frontmatter for structured data:

```yaml
---
key: value
list:
  - item1
  - item2
---
```

**Benefits:**
- Machine-readable metadata
- Easy parsing with PyYAML
- Consistent data structure
- Supports complex data types

### Markdown Body
Below the frontmatter, standard markdown for human-readable content:

```markdown
# Heading

## Subheading

- Bullet points
- Lists

**Bold text** and *italic text*

[Links](url) and ![images](path)
```

## Template Variables

### Date/Time Format Standards

**Dates:** ISO 8601 format
```yaml
entry_date: 2025-10-13
```

**Times:** 24-hour format
```yaml
entry_time: 14:30
```

**DateTimes:** Combined
```yaml
datetime: 2025-10-13T14:30:00
```

### Price Format Standards

**Decimal places:**
```yaml
entry_price: 2.5600    # 4 decimals for penny stocks
exit_price: 2.6200     # 4 decimals for penny stocks
```

**Currency:**
```yaml
pnl_usd: 250.00        # 2 decimals for dollars
```

### Percentage Format

```yaml
pnl_percent: 2.34      # Percentage as decimal
win_rate: 66.67        # Percentage as decimal
```

## Adding New Templates

### Steps to Create a New Template

1. **Identify the need:**
   - What content needs to be generated?
   - What data is required?
   - Who/what will use the template?

2. **Design the structure:**
   - Define YAML frontmatter fields
   - Plan markdown body layout
   - Identify calculated vs input fields

3. **Create the template file:**
   ```bash
   touch .github/templates/new-template.md.template
   ```

4. **Document the template:**
   - Add to this README
   - Describe purpose and usage
   - List all variables
   - Provide examples

5. **Implement in scripts:**
   - Update relevant Python scripts
   - Add template loading logic
   - Test template rendering

6. **Test thoroughly:**
   - Validate all variables populate
   - Check formatting
   - Verify output matches expectations

### Template Naming Convention

```
{content-type}.md.template
```

Examples:
- `trade.md.template`
- `weekly-summary.md.template`
- `monthly-report.md.template`
- `yearly-review.md.template`

## Template Validation

### Required Fields Check

Ensure all required fields are present:
```python
required_fields = ['trade_number', 'ticker', 'entry_date', ...]
for field in required_fields:
    if field not in data:
        raise ValueError(f"Missing required field: {field}")
```

### Data Type Validation

Ensure correct data types:
```python
# Dates should be date objects
assert isinstance(data['entry_date'], date)

# Prices should be decimal or float
assert isinstance(data['entry_price'], (Decimal, float))

# Direction should be LONG or SHORT
assert data['direction'] in ['LONG', 'SHORT']
```

### Format Validation

Ensure correct formats:
```python
# Date format: YYYY-MM-DD
import re
date_pattern = r'^\d{4}-\d{2}-\d{2}$'
assert re.match(date_pattern, data['entry_date'])

# Time format: HH:MM
time_pattern = r'^\d{2}:\d{2}$'
assert re.match(time_pattern, data['entry_time'])
```

## Best Practices

### Template Design
- Keep templates simple and focused
- Use clear, descriptive variable names
- Include comments explaining complex sections
- Provide default values where appropriate
- Make optional fields clearly optional

### Variable Naming
- Use snake_case for YAML keys: `entry_price`
- Use descriptive names: `risk_reward_ratio` not `rrr`
- Be consistent across all templates
- Match database/API field names when applicable

### Documentation
- Document all variables and their types
- Provide usage examples
- Explain calculated vs input fields
- Note any validation requirements

### Maintenance
- Review templates regularly for needed updates
- Keep templates in sync with code changes
- Version control all template changes
- Test templates after modifications

## Related Documentation

- [Trade Pipeline](../docs/TRADE_PIPELINE.md) - How templates are used in automation
- [Developer Guide](../docs/README-DEV.md) - Implementation details
- [Scripts](../scripts/README.md) - Scripts that use templates
- [Copilot Instructions](../copilot-instructions.md) - Data structure definitions

---

**Last Updated:** October 2025  
**Template Count:** 2  
**Purpose:** Standardized content generation
