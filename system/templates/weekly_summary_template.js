/**
 * Weekly Summary Template - Week Folder Summary Markdown Template
 * 
 * Provides the template structure for weekly summary markdown files.
 * Variables are substituted by the template engine.
 * 
 * Python equivalent: .github/templates/weekly-summary.md
 */

/**
 * Get weekly summary template
 * @returns {string} Template string with variable placeholders
 */
function getWeeklySummaryTemplate() {
    return `# Week \${week} - \${year} Summary

## Performance Overview

| Metric | Value |
|--------|-------|
| **Total Trades** | \${total_trades} |
| **Wins** | \${wins} |
| **Losses** | \${losses} |
| **Breakeven** | \${breakeven} |
| **Win Rate** | \${win_rate}% |
| **Net P&L** | $\${pnl_usd} |
| **Avg Win** | $\${avg_win} |
| **Avg Loss** | $\${avg_loss} |
| **Largest Win** | $\${largest_win} |
| **Largest Loss** | $\${largest_loss} |
| **Profit Factor** | \${profit_factor} |
| **Volume** | $\${volume_usd} |

## Weekly Reflection

\${reflection}

### What Went Well

\${what_went_well}

### What Went Wrong

\${what_went_wrong}

### Lessons Learned

\${lessons}

## Strategy Breakdown

{{#if strategy_breakdown}}
{{#each strategy_breakdown}}
### \${item.strategy}

- **Trades:** \${item.trades}
- **Win Rate:** \${item.win_rate}%
- **P&L:** $\${item.pnl_usd}
{{/each}}
{{/if}}

## Areas for Improvement

\${improvements}

## Goals for Next Week

\${goals}

## Trade List

{{#if trades}}
{{#each trades}}
- **\${item.ticker}** (\${item.direction}) - Entry: $\${item.entry_price}, Exit: $\${item.exit_price}, P&L: $\${item.pnl_usd} (\${item.pnl_percent}%)
{{/each}}
{{/if}}

---

*Summary generated for week \${week} of \${year}*
`;
}

/**
 * Get weekly summary template with all 20+ YAML variables
 * @returns {Object} Template metadata
 */
function getWeeklySummaryTemplateMetadata() {
    return {
        name: 'weekly_summary',
        description: 'Weekly summary markdown template',
        variables: [
            { name: 'week', type: 'number', required: true, description: 'ISO week number' },
            { name: 'year', type: 'number', required: true, description: 'Year' },
            { name: 'total_trades', type: 'number', required: true, description: 'Total trades this week' },
            { name: 'wins', type: 'number', required: true, description: 'Number of winning trades' },
            { name: 'losses', type: 'number', required: true, description: 'Number of losing trades' },
            { name: 'breakeven', type: 'number', required: true, description: 'Number of breakeven trades' },
            { name: 'win_rate', type: 'number', required: true, description: 'Win rate percentage' },
            { name: 'pnl_usd', type: 'number', required: true, description: 'Net P&L in USD' },
            { name: 'avg_win', type: 'number', required: true, description: 'Average win amount' },
            { name: 'avg_loss', type: 'number', required: true, description: 'Average loss amount' },
            { name: 'largest_win', type: 'number', required: true, description: 'Largest win' },
            { name: 'largest_loss', type: 'number', required: true, description: 'Largest loss' },
            { name: 'profit_factor', type: 'number', required: true, description: 'Profit factor ratio' },
            { name: 'volume_usd', type: 'number', required: true, description: 'Total volume traded' },
            { name: 'reflection', type: 'string', required: false, description: 'Weekly reflection text' },
            { name: 'what_went_well', type: 'string', required: false, description: 'What went well this week' },
            { name: 'what_went_wrong', type: 'string', required: false, description: 'What went wrong this week' },
            { name: 'lessons', type: 'string', required: false, description: 'Lessons learned' },
            { name: 'improvements', type: 'string', required: false, description: 'Areas for improvement' },
            { name: 'goals', type: 'string', required: false, description: 'Goals for next week' },
            { name: 'strategy_breakdown', type: 'array', required: false, description: 'Array of strategy stats' },
            { name: 'trades', type: 'array', required: false, description: 'Array of trade summaries' }
        ],
        usage: `
// Import template functions
import { renderWeeklySummaryTemplate } from './system/templates/template_engine.js';

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
    reflection: 'Strong week overall...',
    lessons: 'Need to cut losses faster',
    improvements: 'Better position sizing',
    goals: 'Focus on quality setups',
    strategy_breakdown: [
        { strategy: 'Momentum', trades: 8, win_rate: 75, pnl_usd: 900 },
        { strategy: 'Reversal', trades: 7, win_rate: 57, pnl_usd: 350.50 }
    ],
    trades: [
        { ticker: 'AAPL', direction: 'LONG', entry_price: 180, exit_price: 182, pnl_usd: 200, pnl_percent: 1.1 }
    ]
};

// Render template
const markdown = await renderWeeklySummaryTemplate(weekData);
console.log(markdown);
        `
    };
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        getWeeklySummaryTemplate,
        getWeeklySummaryTemplateMetadata
    };
}
