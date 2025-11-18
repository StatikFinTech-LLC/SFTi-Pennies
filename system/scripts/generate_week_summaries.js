#!/usr/bin/env node
/**
 * Generate Week Summaries Script
 * Creates master.trade.md files for each week folder
 * 
 * This script:
 * 1. Scans all week folders in SFTi.Tradez/
 * 2. Aggregates trade data for each week
 * 3. Generates a master.trade.md file with week summary
 * 4. Includes statistics, trade list, and images
 * 
 * Performance Optimizations:
 * - Single-pass calculation for week statistics
 * - Efficient tracking of wins/losses without intermediate lists
 * - Combined calculation of totals and extremes
 * 
 * This is a comprehensive JavaScript translation of generate_week_summaries.py with full feature parity.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

/**
 * Get the repository root directory
 * 
 * Python equivalent: get_repo_root()
 * 
 * @returns {string} Repository root path
 */
function getRepoRoot() {
    const scriptDir = __dirname;
    return path.resolve(scriptDir, '..', '..');
}

/**
 * Parse a trade markdown file and extract frontmatter
 * 
 * Python equivalent: parse_trade_file(file_path)
 * Uses: yaml.safe_load() for parsing
 * Note: Simple YAML parser - for complex YAML, use js-yaml package
 * 
 * @param {string} filePath - Path to trade file
 * @returns {Object} Trade data from frontmatter
 */
function parseTradeFile(filePath) {
    try {
        const content = fsSync.readFileSync(filePath, 'utf-8');

        // Extract YAML frontmatter
        const match = content.match(/^---\s*\n(.*?)\n---\s*\n(.*)$/s);
        if (!match) {
            return {};
        }

        const frontmatterText = match[1];
        const bodyText = match[2];

        // Parse YAML (simple parser)
        const data = {};
        const lines = frontmatterText.split('\n');
        let currentKey = null;
        let currentArray = null;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Handle array continuation
            if (trimmed.startsWith('- ') && currentArray) {
                const value = trimmed.substring(2).trim().replace(/^["']|["']$/g, '');
                currentArray.push(value);
                continue;
            }

            const colonIndex = trimmed.indexOf(':');
            if (colonIndex > 0) {
                currentKey = trimmed.substring(0, colonIndex).trim();
                let value = trimmed.substring(colonIndex + 1).trim();

                // Handle arrays starting on same line [item1, item2]
                if (value.startsWith('[') && value.endsWith(']')) {
                    value = value.substring(1, value.length - 1)
                        .split(',')
                        .map(v => v.trim().replace(/^["']|["']$/g, ''));
                    data[currentKey] = value;
                    currentArray = null;
                } else if (value === '' || value === '[]') {
                    // Array starting on next lines
                    data[currentKey] = [];
                    currentArray = data[currentKey];
                } else {
                    // Remove quotes and convert types
                    value = value.replace(/^["']|["']$/g, '');
                    // Try to parse as number
                    const numValue = Number(value);
                    if (!isNaN(numValue) && value !== '') {
                        data[currentKey] = numValue;
                    } else {
                        data[currentKey] = value;
                    }
                    currentArray = null;
                }
            }
        }

        data.body = bodyText.trim();

        return data;
    } catch (error) {
        console.log(`Error parsing ${filePath}: ${error.message}`);
        return {};
    }
}

/**
 * Collect all trades from a week folder
 * 
 * Python equivalent: collect_week_trades(week_folder)
 * 
 * @param {string} weekFolder - Path to week folder
 * @returns {Array} List of trade data
 */
function collectWeekTrades(weekFolder) {
    const trades = [];

    try {
        // Find all .md files except master.trade.md
        const files = fsSync.readdirSync(weekFolder);
        for (const file of files) {
            if (file.endsWith('.md') && file !== 'master.trade.md') {
                const filePath = path.join(weekFolder, file);
                const tradeData = parseTradeFile(filePath);
                if (tradeData && Object.keys(tradeData).length > 0) {
                    tradeData.file_name = file;
                    trades.push(tradeData);
                }
            }
        }
    } catch (error) {
        console.log(`Error reading week folder ${weekFolder}: ${error.message}`);
    }

    // Sort by date
    trades.sort((a, b) => {
        const dateA = a.entry_date || '';
        const dateB = b.entry_date || '';
        return dateA.localeCompare(dateB);
    });

    return trades;
}

/**
 * Calculate statistics for a week
 * 
 * Python equivalent: calculate_week_stats(trades)
 * 
 * @param {Array} trades - List of trade data
 * @returns {Object} Week statistics
 */
function calculateWeekStats(trades) {
    if (!trades || trades.length === 0) {
        return {
            total_trades: 0,
            total_pnl: 0.0,
            wins: 0,
            losses: 0,
            breakeven: 0,
            win_rate: 0.0,
            avg_win: 0.0,
            avg_loss: 0.0,
            largest_win: 0.0,
            largest_loss: 0.0,
            profit_factor: 0.0,
        };
    }

    // Single-pass calculation for efficiency
    let totalPnl = 0.0;
    let winCount = 0;
    let lossCount = 0;
    let breakeven = 0;
    let totalWins = 0.0;
    let totalLosses = 0.0;
    let largestWin = 0.0;
    let largestLoss = 0.0;

    for (const trade of trades) {
        const pnl = parseFloat(trade.pnl_usd || 0);
        totalPnl += pnl;

        if (pnl > 0) {
            winCount += 1;
            totalWins += pnl;
            if (pnl > largestWin) {
                largestWin = pnl;
            }
        } else if (pnl < 0) {
            lossCount += 1;
            totalLosses += pnl;
            if (pnl < largestLoss) {
                largestLoss = pnl;
            }
        } else {
            breakeven += 1;
        }
    }

    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades * 100) : 0.0;

    const avgWin = winCount > 0 ? totalWins / winCount : 0.0;
    const avgLoss = lossCount > 0 ? totalLosses / lossCount : 0.0;

    const grossProfit = totalWins;
    const grossLoss = Math.abs(totalLosses);
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0.0;

    return {
        total_trades: totalTrades,
        total_pnl: totalPnl,
        wins: winCount,
        losses: lossCount,
        breakeven: breakeven,
        win_rate: winRate,
        avg_win: avgWin,
        avg_loss: avgLoss,
        largest_win: largestWin,
        largest_loss: largestLoss,
        profit_factor: profitFactor,
        gross_profit: grossProfit,
        gross_loss: grossLoss,
    };
}

/**
 * Generate master.trade.md content
 * 
 * Python equivalent: generate_master_markdown(week_name, stats, trades)
 * 
 * @param {string} weekName - Week identifier (e.g., "2025.01")
 * @param {Object} stats - Week statistics
 * @param {Array} trades - List of trade data
 * @returns {string} Markdown content
 */
function generateMasterMarkdown(weekName, stats, trades) {
    // Extract year and week number
    const parts = weekName.split('.');
    let title;
    if (parts.length === 2) {
        const [year, week] = parts;
        title = `Week ${week}, ${year}`;
    } else {
        title = `Week ${weekName}`;
    }

    // Generate markdown
    let md = `# ${title} - Trading Summary

## Overview

This week's trading session included **${stats.total_trades} trades** with a total P&L of **$${stats.total_pnl.toFixed(2)}**.

## Performance Metrics

| Metric | Value |
|--------|-------|
| Total Trades | ${stats.total_trades} |
| Total P&L | $${stats.total_pnl.toFixed(2)} |
| Win Rate | ${stats.win_rate.toFixed(1)}% |
| Wins | ${stats.wins} |
| Losses | ${stats.losses} |
| Breakeven | ${stats.breakeven} |
| Average Win | $${stats.avg_win.toFixed(2)} |
| Average Loss | $${stats.avg_loss.toFixed(2)} |
| Largest Win | $${stats.largest_win.toFixed(2)} |
| Largest Loss | $${stats.largest_loss.toFixed(2)} |
| Profit Factor | ${stats.profit_factor.toFixed(2)} |
| Gross Profit | $${stats.gross_profit.toFixed(2)} |
| Gross Loss | $${stats.gross_loss.toFixed(2)} |

## Trade List

`;

    // Add trade list
    for (let i = 0; i < trades.length; i++) {
        const trade = trades[i];
        const ticker = trade.ticker || 'N/A';
        const date = trade.entry_date || 'N/A';
        const pnl = parseFloat(trade.pnl_usd || 0);
        const pnlStr = `$${pnl.toFixed(2)}`;
        const direction = trade.direction || 'LONG';
        const entry = parseFloat(trade.entry_price || 0);
        const exitVal = parseFloat(trade.exit_price || 0);

        md += `\n### ${i + 1}. ${ticker} - ${date}\n\n`;
        md += `- **Direction**: ${direction}\n`;
        md += `- **Entry**: $${entry.toFixed(2)}\n`;
        md += `- **Exit**: $${exitVal.toFixed(2)}\n`;
        md += `- **P&L**: ${pnlStr}\n`;

        // Add strategy tags if available
        if (trade.strategy_tags) {
            const tags = trade.strategy_tags;
            if (Array.isArray(tags)) {
                md += `- **Strategy**: ${tags.join(', ')}\n`;
            } else {
                md += `- **Strategy**: ${tags}\n`;
            }
        }

        // Add setup tags if available
        if (trade.setup_tags) {
            const tags = trade.setup_tags;
            if (Array.isArray(tags)) {
                md += `- **Setup**: ${tags.join(', ')}\n`;
            } else {
                md += `- **Setup**: ${tags}\n`;
            }
        }

        // Add notes if available
        if (trade.notes) {
            const notes = trade.notes.trim();
            if (notes) {
                md += `\n**Notes**: ${notes}\n`;
            }
        }
    }

    md += '\n\n## Weekly Reflection\n\n';
    md += '_Add your weekly reflection, lessons learned, and improvements for next week..._\n\n';

    md += '---\n\n';
    md += `*Generated on ${new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    })}*\n`;

    return md;
}

/**
 * Process a single week folder and generate master.trade.md
 * 
 * Python equivalent: process_week_folder(week_folder)
 * 
 * @param {string} weekFolder - Path to week folder
 * @returns {boolean} True if successful
 */
function processWeekFolder(weekFolder) {
    const weekName = path.basename(weekFolder).replace('week.', '');
    console.log(`Processing ${path.basename(weekFolder)}...`);

    // Collect trades
    const trades = collectWeekTrades(weekFolder);

    if (trades.length === 0) {
        console.log(`  No trades found in ${path.basename(weekFolder)}`);
        return false;
    }

    // Calculate statistics
    const stats = calculateWeekStats(trades);

    // Generate markdown
    const markdownContent = generateMasterMarkdown(weekName, stats, trades);

    // Write to file
    const masterFile = path.join(weekFolder, 'master.trade.md');
    try {
        fsSync.writeFileSync(masterFile, markdownContent, 'utf-8');
        console.log(`  ✓ Generated master.trade.md with ${trades.length} trades`);
        return true;
    } catch (error) {
        console.log(`  ✗ Error writing master.trade.md: ${error.message}`);
        return false;
    }
}

/**
 * Main function
 * 
 * Python equivalent: main()
 */
function main() {
    const repoRoot = getRepoRoot();
    const tradesDir = path.join(repoRoot, 'index.directory', 'SFTi.Tradez');

    if (!fsSync.existsSync(tradesDir)) {
        console.log(`Error: Trades directory not found: ${tradesDir}`);
        return 1;
    }

    // Find all week folders
    const entries = fsSync.readdirSync(tradesDir, { withFileTypes: true });
    const weekFolders = entries
        .filter(entry => entry.isDirectory() && entry.name.startsWith('week.'))
        .map(entry => path.join(tradesDir, entry.name))
        .sort();

    if (weekFolders.length === 0) {
        console.log('No week folders found');
        return 0;
    }

    console.log(`Found ${weekFolders.length} week folders\n`);

    let successCount = 0;
    for (const weekFolder of weekFolders) {
        if (processWeekFolder(weekFolder)) {
            successCount += 1;
        }
    }

    console.log(`\n✓ Successfully generated ${successCount}/${weekFolders.length} master.trade.md files`);

    return 0;
}

// Run main if executed directly
if (require.main === module) {
    process.exit(main());
}

module.exports = {
    main,
    getRepoRoot,
    parseTradeFile,
    collectWeekTrades,
    calculateWeekStats,
    generateMasterMarkdown,
    processWeekFolder
};

// ES Module exports for browser compatibility
export {
    main as generateWeekSummaries,
    getRepoRoot,
    parseTradeFile,
    collectWeekTrades,
    calculateWeekStats,
    generateMasterMarkdown,
    processWeekFolder,
};

// ES Module exports for browser compatibility
export { main as generateWeekSummaries, main as generate, generateMasterMarkdown, processWeekFolder, parseTradeMarkdown };
