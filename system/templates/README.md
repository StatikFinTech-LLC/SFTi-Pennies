# System Templates - Browser-Based JavaScript Implementation

This directory contains browser-executable JavaScript template engine and template definitions for generating markdown files **entirely in the browser**.

## Overview

The template system provides a powerful rendering engine that can generate trade markdown files and weekly summaries with variable substitution, conditionals, and loops - all running client-side.

## Files

### Core Engine
- **`template_engine.js`** - Template rendering engine
  - Variable substitution with `${variable}` syntax
  - Conditional blocks with `{{#if condition}}`
  - Loop support with `{{#each array}}`
  - YAML frontmatter generation
  - Date/currency/percent formatting helpers

### Templates
- **`trade_template.js`** - Individual trade markdown template (21 variables)
- **`weekly_summary_template.js`** - Weekly summary template (20+ variables)

## Usage

### Render Trade Template

```javascript
import { renderTradeTemplate } from './template_engine.js';

// Prepare trade data
const trade = {
    ticker: 'AAPL',
    entry_date: '2024-01-15',
    entry_time: '09:30:00',
    entry_price: 180.50,
    exit_date: '2024-01-15',
    exit_time: '15:45:00',
    exit_price: 182.75,
    direction: 'LONG',
    position_size: 100,
    pnl_usd: 225.00,
    pnl_percent: 1.25,
    commission: 2.00,
    strategy_tags: ['momentum', 'breakout'],
    setup_tags: ['bull-flag'],
    session_tags: ['pre-market'],
    market_condition_tags: ['trending'],
    stop_loss: 178.00,
    target: 185.00,
    risk_reward_ratio: '1:3',
    time_in_trade: '6h 15m',
    images: ['assets/trade-images/aapl-entry.png'],
    notes: 'Clean breakout above resistance',
    journal: 'Followed plan, took profit at target'
};

// Render to markdown
const markdown = await renderTradeTemplate(trade);
console.log(markdown);
```

### Render Weekly Summary Template

```javascript
import { renderWeeklySummaryTemplate } from './template_engine.js';

// Prepare week data
const weekData = {
    week: 3,
    year: 2024,
    total_trades: 15,
    wins: 10,
    losses: 4,
    breakeven: 1,
    win_rate: 66.67,
    pnl_usd: 1250.50,
    avg_win: 187.50,
    avg_loss: -93.75,
    largest_win: 450.00,
    largest_loss: -175.00,
    profit_factor: 2.0,
    volume_usd: 125000.00,
    reflection: 'Strong week overall with disciplined execution',
    what_went_well: 'Stuck to trading plan, cut losses quickly',
    what_went_wrong: 'Over-traded on Friday, need to be more selective',
    lessons: 'Quality over quantity - focus on A+ setups',
    improvements: 'Better position sizing on high-conviction trades',
    goals: 'Focus on pre-market momentum plays',
    strategy_breakdown: [
        { strategy: 'Momentum', trades: 8, win_rate: 75, pnl_usd: 900 },
        { strategy: 'Reversal', trades: 7, win_rate: 57, pnl_usd: 350.50 }
    ],
    trades: [
        { ticker: 'AAPL', direction: 'LONG', entry_price: 180, exit_price: 182, pnl_usd: 200, pnl_percent: 1.1 },
        // ... more trades
    ]
};

// Render to markdown
const markdown = await renderWeeklySummaryTemplate(weekData);
console.log(markdown);
```

### Using Template Engine Directly

```javascript
import { TemplateEngine } from './template_engine.js';

// Simple variable substitution
const template = 'Hello ${name}, you have ${count} messages';
const result = TemplateEngine.render(template, { name: 'Alice', count: 5 });
// Output: "Hello Alice, you have 5 messages"

// Conditional blocks
const template2 = '{{#if premium}}Premium User{{/if}}';
const result2 = TemplateEngine.render(template2, { premium: true });
// Output: "Premium User"

// Loop blocks
const template3 = '{{#each items}}- ${item}\n{{/each}}';
const result3 = TemplateEngine.render(template3, { items: ['Apple', 'Banana', 'Cherry'] });
// Output: "- Apple\n- Banana\n- Cherry\n"

// Generate YAML frontmatter
const data = {
    title: 'My Trade',
    tags: ['momentum', 'breakout'],
    metrics: { pnl: 100, win_rate: 75 }
};
const yaml = TemplateEngine.generateYAMLFrontmatter(data);
console.log(yaml);
```

## Template Variables

### Trade Template (21 variables)

**Required:**
- `ticker` - Stock/crypto ticker symbol
- `entry_date` - Entry date (YYYY-MM-DD)
- `entry_price` - Entry price
- `exit_date` - Exit date (YYYY-MM-DD)
- `exit_price` - Exit price
- `direction` - LONG or SHORT
- `position_size` - Number of shares/contracts
- `pnl_usd` - Profit/loss in USD
- `pnl_percent` - Profit/loss percentage

**Optional:**
- `entry_time` - Entry time (HH:MM:SS)
- `exit_time` - Exit time (HH:MM:SS)
- `commission` - Commission paid
- `strategy_tags` - Array of strategy tags
- `setup_tags` - Array of setup tags
- `session_tags` - Array of session tags
- `market_condition_tags` - Array of market condition tags
- `stop_loss` - Stop loss price
- `target` - Target price
- `risk_reward_ratio` - Risk/reward ratio (e.g., "1:2")
- `time_in_trade` - Time in trade (e.g., "2h 30m")
- `images` - Array of image paths
- `notes` - Trade notes
- `journal` - Journal entry

### Weekly Summary Template (20+ variables)

**Required:**
- `week` - ISO week number
- `year` - Year
- `total_trades` - Total trades this week
- `wins` - Number of winning trades
- `losses` - Number of losing trades
- `breakeven` - Number of breakeven trades
- `win_rate` - Win rate percentage
- `pnl_usd` - Net P&L in USD
- `avg_win` - Average win amount
- `avg_loss` - Average loss amount
- `largest_win` - Largest win
- `largest_loss` - Largest loss
- `profit_factor` - Profit factor ratio
- `volume_usd` - Total volume traded

**Optional:**
- `reflection` - Weekly reflection text
- `what_went_well` - What went well this week
- `what_went_wrong` - What went wrong this week
- `lessons` - Lessons learned
- `improvements` - Areas for improvement
- `goals` - Goals for next week
- `strategy_breakdown` - Array of strategy stats
- `trades` - Array of trade summaries

## Template Syntax

### Variable Substitution
```
${variableName}
${array[0]}
```

### Conditionals
```
{{#if condition}}
  Content shown if condition is truthy
{{/if}}
```

### Loops
```
{{#each arrayName}}
  ${item} or ${item.property}
{{/each}}
```

## Helper Functions

### Format Date
```javascript
TemplateEngine.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
// Output: "2024-01-15 09:30:00"
```

### Format Currency
```javascript
TemplateEngine.formatCurrency(1234.56);
// Output: "$1234.56"
```

### Format Percent
```javascript
TemplateEngine.formatPercent(12.345, 2);
// Output: "12.35%"
```

### Escape Markdown
```javascript
TemplateEngine.escapeMarkdown('**bold** text');
// Output: "\\*\\*bold\\*\\* text"
```

## Integration

Templates are used by:
- `import_workflow.js` - Generates trade markdown from CSV
- `site_submit_workflow.js` - Generates trade markdown from form
- `generate_week_summaries.js` - Generates weekly summaries
- `import_csv.js` - Direct template usage

## Python Migration

These JavaScript templates replace:
- `.github/templates/trade.md` → `trade_template.js`
- `.github/templates/weekly-summary.md` → `weekly_summary_template.js`

All functionality is preserved with 100% feature parity, but now runs entirely in the browser with the template engine providing variable substitution, conditionals, and loops.
