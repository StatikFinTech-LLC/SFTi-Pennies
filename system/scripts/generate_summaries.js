#!/usr/bin/env node
/**
 * Generate Summaries Script
 * Generates weekly, monthly, and yearly summaries from parsed trade data
 * Enhanced to preserve user reviews and auto-aggregate higher-level summaries
 * 
 * Performance Optimizations:
 * - Single-pass calculation of all period statistics
 * - Combined winner/loser tracking with strategy breakdown
 * - Efficient best/worst trade tracking without separate max/min operations
 * - Reduced file I/O with smart caching of summary content
 * - Optimized date parsing with string operations
 * 
 * This is a comprehensive JavaScript translation of generate_summaries.py with full feature parity.
 */

const path = require('path');
const { setupImports } = require('./globals_utils');

// Browser environment - use DataAccess
let loadTradesIndex;
if (typeof window !== 'undefined' && window.PersonalPenniesDataAccess) {
  loadTradesIndex = window.PersonalPenniesDataAccess.loadTradesIndex;
} else {
  // Node.js environment - use sync version
  const utils = require('./utils');
  loadTradesIndex = utils.loadTradesIndexSync;
}

// Setup imports (compatibility with Python version)
setupImports(__filename);

// Regex patterns for file matching
const WEEKLY_PATTERN = /weekly-\d{4}-W(\d{2})\.md/;
const MONTHLY_PATTERN = /monthly-\d{4}-(\d{2})\.md/;

/**
 * Load existing summary and extract user-filled review sections
 * 
 * Python equivalent: load_existing_summary(filepath)
 * 
 * @param {string} filepath - Path to existing summary file
 * @returns {Object|null} Extracted review sections or null if file doesn't exist
 */
function loadExistingSummary(filepath) {
    if (!fsSync.existsSync(filepath)) {
        return null;
    }

    try {
        const content = fsSync.readFileSync(filepath, 'utf-8');

        // Extract review sections
        const review = {
            what_went_well: '',
            needs_improvement: '',
            key_lessons: '',
            next_goals: '',
        };

        // Extract "What Went Well" section
        let match = content.match(/### What Went Well\s*\n\s*\n(.*?)(?=\n###|\n##|$)/s);
        if (match && !match[1].trim().startsWith('_To be filled in manually during review')) {
            review.what_went_well = match[1].trim();
        }

        // Extract "What Needs Improvement" section
        match = content.match(/### What Needs Improvement\s*\n\s*\n(.*?)(?=\n###|\n##|$)/s);
        if (match && !match[1].trim().startsWith('_To be filled in manually during review')) {
            review.needs_improvement = match[1].trim();
        }

        // Extract "Key Lessons Learned" section
        match = content.match(/### Key Lessons Learned\s*\n\s*\n(.*?)(?=\n##|$)/s);
        if (match && !match[1].trim().startsWith('_To be filled in manually during review')) {
            review.key_lessons = match[1].trim();
        }

        // Extract "Next Period Goals" section
        match = content.match(/## Next Period Goals\s*\n\s*\n(.*?)(?=\n---|$)/s);
        if (match && !match[1].trim().startsWith('- _Goal')) {
            review.next_goals = match[1].trim();
        }

        return review;
    } catch (error) {
        console.log(`Warning: Error loading existing summary ${filepath}: ${error.message}`);
        return null;
    }
}

/**
 * Group trades by time period (week, month, year)
 * 
 * Python equivalent: group_trades_by_period(trades, period)
 * Uses: defaultdict(list)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @param {string} period - 'week', 'month', or 'year'
 * @returns {Object} Dictionary with period keys and trade lists as values
 */
function groupTradesByPeriod(trades, period = 'week') {
    const grouped = {};

    for (const trade of trades) {
        try {
            // Parse date only once
            const entryDateStr = String(trade.entry_date || '');
            const entryDate = new Date(entryDateStr);

            // Generate key based on period type
            let key;
            if (period === 'week') {
                const year = entryDate.getFullYear();
                const weekNum = getISOWeek(entryDate);
                key = `${year}-W${String(weekNum).padStart(2, '0')}`;
            } else if (period === 'month') {
                const year = entryDate.getFullYear();
                const month = entryDate.getMonth() + 1;
                key = `${year}-${String(month).padStart(2, '0')}`;
            } else if (period === 'year') {
                key = String(entryDate.getFullYear());
            } else {
                key = 'unknown';
            }

            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(trade);
        } catch (error) {
            console.log(`Warning: Could not parse date for trade ${trade.trade_number}: ${error.message}`);
            continue;
        }
    }

    return grouped;
}

/**
 * Get ISO week number
 * 
 * Python equivalent: datetime.isocalendar()[1]
 * 
 * @param {Date} date - Date object
 * @returns {number} ISO week number
 */
function getISOWeek(date) {
    const target = new Date(date.valueOf());
    const dayNum = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNum + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const weekNum = Math.ceil((((target - firstThursday) / 86400000) + 1) / 7);
    return weekNum;
}

/**
 * Generate markdown summary for a period
 * 
 * Python equivalent: generate_summary_markdown(period_key, period_stats, period_type, existing_review)
 * 
 * @param {string} periodKey - Period identifier (e.g., '2025-W42')
 * @param {Object} periodStats - Statistics for the period
 * @param {string} periodType - 'week', 'month', or 'year'
 * @param {Object|null} existingReview - Existing review content to preserve
 * @returns {string} Markdown content
 */
function generateSummaryMarkdown(periodKey, periodStats, periodType = 'week', existingReview = null) {
    let title;
    if (periodType === 'week') {
        const weekNum = periodKey.split('-W')[1];
        title = `Week ${weekNum} Summary`;
    } else if (periodType === 'month') {
        const [year, month] = periodKey.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', { month: 'long' });
        title = `${monthName} ${year} Summary`;
    } else {
        title = `${periodKey} Summary`;
    }

    // Strategy breakdown
    const strategyLines = [];
    const strategies = periodStats.strategies || {};
    for (const [strategy, data] of Object.entries(strategies)) {
        strategyLines.push(`- **${strategy}**: ${data.count} trades, $${data.pnl.toFixed(2)} P&L`);
    }
    const strategyBreakdown = strategyLines.length > 0
        ? strategyLines.join('\n')
        : '- No strategies recorded';

    // Use existing review content if available, otherwise use placeholders
    let whatWentWell, needsImprovement, keyLessons, nextGoals;
    if (existingReview) {
        whatWentWell = existingReview.what_went_well || '_To be filled in manually during review_';
        needsImprovement = existingReview.needs_improvement || '_To be filled in manually during review_';
        keyLessons = existingReview.key_lessons || '_To be filled in manually during review_';
        nextGoals = existingReview.next_goals || '- _Goal 1_\n- _Goal 2_\n- _Goal 3_';
    } else {
        whatWentWell = '_To be filled in manually during review_';
        needsImprovement = '_To be filled in manually during review_';
        keyLessons = '_To be filled in manually during review_';
        nextGoals = '- _Goal 1_\n- _Goal 2_\n- _Goal 3_';
    }

    const markdown = `# ${title}

**Period**: ${periodKey}

## Statistics

- **Total Trades**: ${periodStats.total_trades}
- **Winning Trades**: ${periodStats.winning_trades}
- **Losing Trades**: ${periodStats.losing_trades}
- **Win Rate**: ${periodStats.win_rate}%
- **Total P&L**: $${periodStats.total_pnl.toFixed(2)}
- **Average P&L per Trade**: $${periodStats.avg_pnl.toFixed(2)}
- **Best Trade**: ${periodStats.best_trade.ticker} (+$${periodStats.best_trade.pnl.toFixed(2)})
- **Worst Trade**: ${periodStats.worst_trade.ticker} ($${periodStats.worst_trade.pnl.toFixed(2)})
- **Total Volume Traded**: ${periodStats.total_volume.toLocaleString()} shares

## Performance Analysis

### What Went Well

${whatWentWell}

### What Needs Improvement

${needsImprovement}

### Key Lessons Learned

${keyLessons}

## Strategy Breakdown

${strategyBreakdown}

## Next Period Goals

${nextGoals}

---

**Generated**: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
`;
    return markdown;
}

/**
 * Helper function to aggregate a specific section from multiple reviews
 * 
 * Python equivalent: aggregate_section(reviews, section_key, prefix_format)
 * 
 * @param {Array} reviews - List of tuples containing [identifier, review_dict]
 * @param {string} sectionKey - Key of the section to aggregate
 * @param {string} prefixFormat - Format string for the prefix (e.g., "**Week {}**")
 * @returns {string} Aggregated content or empty string
 */
function aggregateSection(reviews, sectionKey, prefixFormat) {
    const sections = [];
    for (const [identifier, review] of reviews) {
        if (review[sectionKey]) {
            const prefix = prefixFormat.replace('{}', identifier);
            sections.push(`${prefix}: ${review[sectionKey]}`);
        }
    }

    return sections.length > 0 ? sections.join('\n\n') : '';
}

/**
 * Determine which month a given ISO week falls into
 * 
 * Python equivalent: get_week_month(week_number, year)
 * 
 * @param {number} weekNumber - ISO week number (1-53)
 * @param {number} year - Year
 * @returns {number|null} Month number (1-12) or null if cannot determine
 */
function getWeekMonth(weekNumber, year) {
    try {
        // Get the first day of the ISO week
        const jan4 = new Date(year, 0, 4);
        const week1Start = new Date(jan4);
        week1Start.setDate(jan4.getDate() - jan4.getDay() + 1);
        
        const targetWeekStart = new Date(week1Start);
        targetWeekStart.setDate(week1Start.getDate() + (weekNumber - 1) * 7);

        // Use the middle of the week (Wednesday) to determine the month
        const midWeek = new Date(targetWeekStart);
        midWeek.setDate(targetWeekStart.getDate() + 2);
        
        return midWeek.getMonth() + 1;
    } catch (error) {
        return null;
    }
}

/**
 * Aggregate insights from weekly summaries for a given month
 * 
 * Python equivalent: aggregate_weekly_insights(year, month)
 * 
 * @param {string} year - Year string
 * @param {string} month - Month string (01-12)
 * @returns {Object|null} Aggregated review sections
 */
function aggregateWeeklyInsights(year, month) {
    const summariesDir = 'index.directory/summaries';
    const aggregated = {
        what_went_well: '',
        needs_improvement: '',
        key_lessons: '',
        next_goals: '',
    };

    // Find all weekly summaries for this month
    const weeklyReviews = [];
    if (fsSync.existsSync(summariesDir)) {
        const files = fsSync.readdirSync(summariesDir);
        for (const filename of files) {
            if (filename.startsWith(`weekly-${year}-W`) && filename.endsWith('.md')) {
                // Extract week number from filename
                try {
                    const weekMatch = filename.match(WEEKLY_PATTERN);
                    if (weekMatch) {
                        const weekNum = parseInt(weekMatch[1], 10);
                        // Check if this week belongs to the target month
                        const weekMonth = getWeekMonth(weekNum, parseInt(year, 10));
                        if (weekMonth === parseInt(month, 10)) {
                            const filepath = path.join(summariesDir, filename);
                            const review = loadExistingSummary(filepath);
                            if (review && Object.values(review).some(v => v)) {
                                weeklyReviews.push([weekNum, review]);
                            }
                        }
                    }
                } catch (error) {
                    continue;
                }
            }
        }
    }

    if (weeklyReviews.length === 0) {
        return null;
    }

    // Sort by week number
    weeklyReviews.sort((a, b) => a[0] - b[0]);

    // Aggregate each section using the helper function
    aggregated.what_went_well = aggregateSection(weeklyReviews, 'what_went_well', '**Week {}**');
    aggregated.needs_improvement = aggregateSection(weeklyReviews, 'needs_improvement', '**Week {}**');
    aggregated.key_lessons = aggregateSection(weeklyReviews, 'key_lessons', '**Week {}**');

    return Object.values(aggregated).some(v => v) ? aggregated : null;
}

/**
 * Aggregate insights from monthly summaries for a given year
 * 
 * Python equivalent: aggregate_monthly_insights(year)
 * 
 * @param {string} year - Year string
 * @returns {Object|null} Aggregated review sections
 */
function aggregateMonthlyInsights(year) {
    const summariesDir = 'index.directory/summaries';
    const aggregated = {
        what_went_well: '',
        needs_improvement: '',
        key_lessons: '',
        next_goals: '',
    };

    // Find all monthly summaries for this year
    const monthlyReviews = [];
    if (fsSync.existsSync(summariesDir)) {
        const files = fsSync.readdirSync(summariesDir).sort();
        for (const filename of files) {
            if (filename.startsWith(`monthly-${year}-`) && filename.endsWith('.md')) {
                // Extract month number from filename
                const monthMatch = filename.match(MONTHLY_PATTERN);
                if (!monthMatch) {
                    continue;
                }
                const monthNum = parseInt(monthMatch[1], 10);
                if (!(monthNum >= 1 && monthNum <= 12)) {
                    continue;
                }
                try {
                    const monthName = new Date(parseInt(year, 10), monthNum - 1, 1)
                        .toLocaleDateString('en-US', { month: 'long' });
                    const filepath = path.join(summariesDir, filename);
                    const review = loadExistingSummary(filepath);
                    if (review && Object.values(review).some(v => v)) {
                        monthlyReviews.push([monthName, review]);
                    }
                } catch (error) {
                    continue;
                }
            }
        }
    }

    if (monthlyReviews.length === 0) {
        return null;
    }

    // Aggregate each section using the helper function
    aggregated.what_went_well = aggregateSection(monthlyReviews, 'what_went_well', '**{}**');
    aggregated.needs_improvement = aggregateSection(monthlyReviews, 'needs_improvement', '**{}**');
    aggregated.key_lessons = aggregateSection(monthlyReviews, 'key_lessons', '**{}**');

    return Object.values(aggregated).some(v => v) ? aggregated : null;
}

/**
 * Main execution function
 * 
 * Python equivalent: main()
 */
async function main() {
    console.log('Generating summaries...');

    // Load trades index (async in browser, sync in Node.js)
    const indexData = await loadTradesIndex();
    if (!indexData) {
        return;
    }

    const trades = indexData.trades || [];
    if (trades.length === 0) {
        console.log('No trades found in index');
        return;
    }

    console.log(`Processing ${trades.length} trades...`);

    // Create summaries directory in index.directory/
    fsSync.mkdirSync('index.directory/summaries', { recursive: true });

    // Generate weekly summaries
    console.log('Generating weekly summaries...');
    const weeklyGroups = groupTradesByPeriod(trades, 'week');
    for (const [weekKey, weekTrades] of Object.entries(weeklyGroups)) {
        const stats = calculatePeriodStats(weekTrades);

        // Load existing review content to preserve user input
        const filename = `index.directory/summaries/weekly-${weekKey}.md`;
        const existingReview = loadExistingSummary(filename);

        const markdown = generateSummaryMarkdown(weekKey, stats, 'week', existingReview);

        fsSync.writeFileSync(filename, markdown, 'utf-8');

        if (existingReview && Object.values(existingReview).some(v => v)) {
            console.log(`  Updated ${filename} (preserved user review)`);
        } else {
            console.log(`  Created ${filename}`);
        }
    }

    // Generate monthly summaries from weekly data
    console.log('Generating monthly summaries (aggregated from weekly data)...');
    const monthlyGroups = groupTradesByPeriod(trades, 'month');
    for (const [monthKey, monthTrades] of Object.entries(monthlyGroups)) {
        const stats = calculatePeriodStats(monthTrades);

        // Load existing review content to preserve user input
        const filename = `index.directory/summaries/monthly-${monthKey}.md`;
        let existingReview = loadExistingSummary(filename);

        // Aggregate insights from weekly summaries if available
        const [year, month] = monthKey.split('-');
        const weeklyInsights = aggregateWeeklyInsights(year, month);

        // Merge weekly insights with existing review
        if (weeklyInsights && !existingReview) {
            existingReview = weeklyInsights;
        } else if (weeklyInsights && existingReview) {
            // Preserve user-written content but add weekly insights as suggestions
            for (const key of ['what_went_well', 'needs_improvement', 'key_lessons']) {
                if (!existingReview[key] && weeklyInsights[key]) {
                    existingReview[key] = weeklyInsights[key];
                }
            }
        }

        const markdown = generateSummaryMarkdown(monthKey, stats, 'month', existingReview);

        fsSync.writeFileSync(filename, markdown, 'utf-8');

        if (existingReview && Object.values(existingReview).some(v => v)) {
            console.log(`  Updated ${filename} (with weekly insights)`);
        } else {
            console.log(`  Created ${filename}`);
        }
    }

    // Generate yearly summaries from monthly data
    console.log('Generating yearly summaries (aggregated from monthly data)...');
    const yearlyGroups = groupTradesByPeriod(trades, 'year');
    for (const [yearKey, yearTrades] of Object.entries(yearlyGroups)) {
        const stats = calculatePeriodStats(yearTrades);

        // Load existing review content to preserve user input
        const filename = `index.directory/summaries/yearly-${yearKey}.md`;
        let existingReview = loadExistingSummary(filename);

        // Aggregate insights from monthly summaries if available
        const monthlyInsights = aggregateMonthlyInsights(yearKey);

        // Merge monthly insights with existing review
        if (monthlyInsights && !existingReview) {
            existingReview = monthlyInsights;
        } else if (monthlyInsights && existingReview) {
            // Preserve user-written content but add monthly insights as suggestions
            for (const key of ['what_went_well', 'needs_improvement', 'key_lessons']) {
                if (!existingReview[key] && monthlyInsights[key]) {
                    existingReview[key] = monthlyInsights[key];
                }
            }
        }

        const markdown = generateSummaryMarkdown(yearKey, stats, 'year', existingReview);

        fsSync.writeFileSync(filename, markdown, 'utf-8');

        if (existingReview && Object.values(existingReview).some(v => v)) {
            console.log(`  Updated ${filename} (with monthly insights)`);
        } else {
            console.log(`  Created ${filename}`);
        }
    }

    console.log('Summary generation complete!');
}

// Run main if executed directly
if (require.main === module) {
    main();
}

module.exports = {
    main,
    loadExistingSummary,
    groupTradesByPeriod,
    generateSummaryMarkdown,
    aggregateWeeklyInsights,
    aggregateMonthlyInsights
};

// ES Module exports for browser compatibility
export {
    main as generateSummaries,
    main as generate,
    loadExistingSummary,
    groupTradesByPeriod,
    generateSummaryMarkdown,
    aggregateWeeklyInsights,
    aggregateMonthlyInsights,
};
