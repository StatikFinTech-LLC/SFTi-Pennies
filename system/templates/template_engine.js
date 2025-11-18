/**
 * Template Engine - Browser-Based Template Rendering
 * 
 * Provides template rendering with variable substitution, conditionals,
 * and loops for generating markdown files from templates.
 * 
 * Python equivalent: Jinja2/string.Template
 */

/**
 * TemplateEngine class - Renders templates with variables
 */
class TemplateEngine {
    /**
     * Render a template with variables
     * @param {string} template - Template string
     * @param {Object} variables - Variables to substitute
     * @returns {string} Rendered template
     */
    static render(template, variables) {
        let result = template;
        
        // Simple variable substitution: ${variable}
        result = result.replace(/\$\{(\w+)\}/g, (match, varName) => {
            return variables[varName] !== undefined ? variables[varName] : match;
        });
        
        // Array/list substitution: ${array[0]}
        result = result.replace(/\$\{(\w+)\[(\d+)\]\}/g, (match, varName, index) => {
            const arr = variables[varName];
            return (arr && arr[index] !== undefined) ? arr[index] : match;
        });
        
        // Conditional blocks: {{#if condition}}...{{/if}}
        result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
            return variables[condition] ? content : '';
        });
        
        // Loop blocks: {{#each array}}...{{/each}}
        result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrName, content) => {
            const arr = variables[arrName];
            if (!arr || !Array.isArray(arr)) return '';
            
            return arr.map(item => {
                let itemContent = content;
                // Replace ${item} with array item
                if (typeof item === 'object') {
                    Object.keys(item).forEach(key => {
                        itemContent = itemContent.replace(new RegExp(`\\$\\{item\\.${key}\\}`, 'g'), item[key]);
                    });
                } else {
                    itemContent = itemContent.replace(/\$\{item\}/g, item);
                }
                return itemContent;
            }).join('');
        });
        
        return result;
    }

    /**
     * Render template with default values
     * @param {string} template - Template string
     * @param {Object} variables - Variables
     * @param {Object} defaults - Default values
     * @returns {string} Rendered template
     */
    static renderWithDefaults(template, variables, defaults = {}) {
        const merged = { ...defaults, ...variables };
        return this.render(template, merged);
    }

    /**
     * Format a date value
     * @param {string|Date} date - Date to format
     * @param {string} format - Format string (default: YYYY-MM-DD)
     * @returns {string} Formatted date
     */
    static formatDate(date, format = 'YYYY-MM-DD') {
        const d = date instanceof Date ? date : new Date(date);
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    /**
     * Format a number as currency
     * @param {number} value - Number to format
     * @param {string} currency - Currency symbol (default: $)
     * @returns {string} Formatted currency
     */
    static formatCurrency(value, currency = '$') {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        
        const formatted = Math.abs(num).toFixed(2);
        const sign = num < 0 ? '-' : '';
        return `${sign}${currency}${formatted}`;
    }

    /**
     * Format a number as percentage
     * @param {number} value - Number to format
     * @param {number} decimals - Decimal places (default: 2)
     * @returns {string} Formatted percentage
     */
    static formatPercent(value, decimals = 2) {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        
        return `${num.toFixed(decimals)}%`;
    }

    /**
     * Escape markdown special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    static escapeMarkdown(text) {
        if (!text) return '';
        return String(text).replace(/[*_`[\]()#+\-.!]/g, '\\$&');
    }

    /**
     * Generate YAML frontmatter
     * @param {Object} data - Data object
     * @returns {string} YAML frontmatter string
     */
    static generateYAMLFrontmatter(data) {
        const lines = ['---'];
        
        Object.keys(data).forEach(key => {
            const value = data[key];
            
            if (value === null || value === undefined) {
                lines.push(`${key}:`);
            } else if (Array.isArray(value)) {
                if (value.length === 0) {
                    lines.push(`${key}: []`);
                } else {
                    lines.push(`${key}:`);
                    value.forEach(item => {
                        lines.push(`  - ${item}`);
                    });
                }
            } else if (typeof value === 'object') {
                lines.push(`${key}:`);
                Object.keys(value).forEach(subKey => {
                    lines.push(`  ${subKey}: ${value[subKey]}`);
                });
            } else if (typeof value === 'string' && (value.includes(':') || value.includes('#'))) {
                lines.push(`${key}: "${value}"`);
            } else {
                lines.push(`${key}: ${value}`);
            }
        });
        
        lines.push('---');
        return lines.join('\n');
    }
}

/**
 * Render trade template with variables
 * @param {Object} trade - Trade data
 * @returns {Promise<string>} Rendered markdown
 */
async function renderTradeTemplate(trade) {
    const { getTradeTemplate } = await import('./trade_template.js');
    const template = getTradeTemplate();
    
    // Generate frontmatter
    const frontmatter = TemplateEngine.generateYAMLFrontmatter({
        ticker: trade.ticker || '',
        entry_date: trade.entry_date || '',
        entry_time: trade.entry_time || '',
        entry_price: trade.entry_price || '',
        exit_date: trade.exit_date || '',
        exit_time: trade.exit_time || '',
        exit_price: trade.exit_price || '',
        direction: trade.direction || 'LONG',
        position_size: trade.position_size || '',
        pnl_usd: trade.pnl_usd || 0,
        pnl_percent: trade.pnl_percent || 0,
        commission: trade.commission || 0,
        strategy_tags: trade.strategy_tags || [],
        setup_tags: trade.setup_tags || [],
        session_tags: trade.session_tags || [],
        market_condition_tags: trade.market_condition_tags || [],
        stop_loss: trade.stop_loss || '',
        target: trade.target || '',
        risk_reward_ratio: trade.risk_reward_ratio || '',
        time_in_trade: trade.time_in_trade || '',
        images: trade.images || []
    });
    
    // Render body
    const variables = {
        ...trade,
        notes: trade.notes || 'Add your trade notes here...',
        journal: trade.journal || 'Add your trade journal entry here...'
    };
    
    const body = TemplateEngine.render(template, variables);
    
    return `${frontmatter}\n\n${body}`;
}

/**
 * Render weekly summary template with variables
 * @param {Object} weekData - Week summary data
 * @returns {Promise<string>} Rendered markdown
 */
async function renderWeeklySummaryTemplate(weekData) {
    const { getWeeklySummaryTemplate } = await import('./weekly_summary_template.js');
    const template = getWeeklySummaryTemplate();
    
    // Generate frontmatter
    const frontmatter = TemplateEngine.generateYAMLFrontmatter({
        week: weekData.week || '',
        year: weekData.year || new Date().getFullYear(),
        total_trades: weekData.total_trades || 0,
        wins: weekData.wins || 0,
        losses: weekData.losses || 0,
        breakeven: weekData.breakeven || 0,
        win_rate: weekData.win_rate || 0,
        pnl_usd: weekData.pnl_usd || 0,
        avg_win: weekData.avg_win || 0,
        avg_loss: weekData.avg_loss || 0,
        largest_win: weekData.largest_win || 0,
        largest_loss: weekData.largest_loss || 0,
        profit_factor: weekData.profit_factor || 0,
        volume_usd: weekData.volume_usd || 0
    });
    
    // Render body
    const variables = {
        ...weekData,
        reflection: weekData.reflection || 'Add your weekly reflection here...',
        lessons: weekData.lessons || 'What did you learn this week?',
        improvements: weekData.improvements || 'What can you improve next week?',
        goals: weekData.goals || 'Set your goals for next week...'
    };
    
    const body = TemplateEngine.render(template, variables);
    
    return `${frontmatter}\n\n${body}`;
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        TemplateEngine,
        renderTradeTemplate,
        renderWeeklySummaryTemplate
    };
}
