/**
 * Trade Template - Individual Trade Markdown Template
 * 
 * Provides the template structure for individual trade markdown files.
 * Variables are substituted by the template engine.
 * 
 * Python equivalent: .github/templates/trade.md
 */

/**
 * Get trade template
 * @returns {string} Template string with variable placeholders
 */
function getTradeTemplate() {
    return `## Trade Overview

**Ticker:** \${ticker}  
**Direction:** \${direction}  
**Entry:** $\${entry_price} on \${entry_date} at \${entry_time}  
**Exit:** $\${exit_price} on \${exit_date} at \${exit_time}  
**Position Size:** \${position_size} shares  
**Time in Trade:** \${time_in_trade}

## Performance

**P&L (USD):** $\${pnl_usd}  
**P&L (%):** \${pnl_percent}%  
**Commission:** $\${commission}

## Risk Management

{{#if stop_loss}}**Stop Loss:** $\${stop_loss}{{/if}}  
{{#if target}}**Target:** $\${target}{{/if}}  
{{#if risk_reward_ratio}}**Risk/Reward Ratio:** \${risk_reward_ratio}{{/if}}

## Tags

{{#if strategy_tags}}**Strategy:** {{#each strategy_tags}}\${item}{{/each}}{{/if}}  
{{#if setup_tags}}**Setup:** {{#each setup_tags}}\${item}{{/each}}{{/if}}  
{{#if session_tags}}**Session:** {{#each session_tags}}\${item}{{/each}}{{/if}}  
{{#if market_condition_tags}}**Market Condition:** {{#each market_condition_tags}}\${item}{{/each}}{{/if}}

## Trade Notes

\${notes}

## Journal Entry

\${journal}

## Screenshots

{{#if images}}
{{#each images}}
![\${ticker} trade screenshot](\${item})
{{/each}}
{{/if}}

---

*Trade logged on \${entry_date}*
`;
}

/**
 * Get trade template with all 21 YAML variables
 * @returns {Object} Template metadata
 */
function getTradeTemplateMetadata() {
    return {
        name: 'trade',
        description: 'Individual trade markdown template',
        variables: [
            { name: 'ticker', type: 'string', required: true, description: 'Stock/crypto ticker symbol' },
            { name: 'entry_date', type: 'string', required: true, description: 'Entry date (YYYY-MM-DD)' },
            { name: 'entry_time', type: 'string', required: false, description: 'Entry time (HH:MM:SS)' },
            { name: 'entry_price', type: 'number', required: true, description: 'Entry price' },
            { name: 'exit_date', type: 'string', required: true, description: 'Exit date (YYYY-MM-DD)' },
            { name: 'exit_time', type: 'string', required: false, description: 'Exit time (HH:MM:SS)' },
            { name: 'exit_price', type: 'number', required: true, description: 'Exit price' },
            { name: 'direction', type: 'string', required: true, description: 'Trade direction (LONG/SHORT)' },
            { name: 'position_size', type: 'number', required: true, description: 'Number of shares/contracts' },
            { name: 'pnl_usd', type: 'number', required: true, description: 'Profit/loss in USD' },
            { name: 'pnl_percent', type: 'number', required: true, description: 'Profit/loss percentage' },
            { name: 'commission', type: 'number', required: false, description: 'Commission paid' },
            { name: 'strategy_tags', type: 'array', required: false, description: 'Strategy tags' },
            { name: 'setup_tags', type: 'array', required: false, description: 'Setup tags' },
            { name: 'session_tags', type: 'array', required: false, description: 'Session tags' },
            { name: 'market_condition_tags', type: 'array', required: false, description: 'Market condition tags' },
            { name: 'stop_loss', type: 'number', required: false, description: 'Stop loss price' },
            { name: 'target', type: 'number', required: false, description: 'Target price' },
            { name: 'risk_reward_ratio', type: 'string', required: false, description: 'Risk/reward ratio (e.g., 1:2)' },
            { name: 'time_in_trade', type: 'string', required: false, description: 'Time in trade (e.g., 2h 30m)' },
            { name: 'images', type: 'array', required: false, description: 'Array of image paths' },
            { name: 'notes', type: 'string', required: false, description: 'Trade notes' },
            { name: 'journal', type: 'string', required: false, description: 'Journal entry' }
        ],
        usage: `
// Import template functions
import { renderTradeTemplate } from './system/templates/template_engine.js';

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
    stop_loss: 178.00,
    target: 185.00,
    risk_reward_ratio: '1:3',
    images: ['assets/trade-images/aapl-entry.png']
};

// Render template
const markdown = await renderTradeTemplate(trade);
console.log(markdown);
        `
    };
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        getTradeTemplate,
        getTradeTemplateMetadata
    };
}
