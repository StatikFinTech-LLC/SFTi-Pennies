#!/usr/bin/env node
/**
 * Generate Analytics Script
 * Computes advanced analytics from trades data including expectancy, streaks,
 * per-tag aggregates, drawdown series, and profit factors.
 * 
 * Performance Optimizations:
 * - Single-pass algorithms for calculating win/loss statistics
 * - Reduced list comprehensions and intermediate data structures
 * - Optimized aggregate_by_tag() to minimize iterations
 * - Efficient memory usage with streaming calculations
 * 
 * Output: analytics-data.json
 * 
 * This is a comprehensive JavaScript translation of generate_analytics.py with full feature parity.
 */

const { setupImports, saveJsonFile, ensureDirectory } = require('./globals_utils');

// Browser environment - use DataAccess
let loadTradesIndex, loadAccountConfig;
if (typeof window !== 'undefined' && window.PersonalPenniesDataAccess) {
  loadTradesIndex = window.PersonalPenniesDataAccess.loadTradesIndex;
  loadAccountConfig = window.PersonalPenniesDataAccess.loadAccountConfig;
} else {
  // Node.js environment - use sync versions
  const utils = require('./utils');
  loadTradesIndex = utils.loadTradesIndexSync;
  loadAccountConfig = utils.loadAccountConfigSync;
}

// Setup imports (compatibility with Python version)
setupImports(__filename);

// Constants
const MAX_PROFIT_FACTOR = 999.99;  // Used when profit factor would be infinity (all wins, no losses)

/**
 * Calculate percentage-based returns metrics
 * 
 * Python equivalent: calculate_returns_metrics(trades, starting_balance, deposits, withdrawals)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @param {number} startingBalance - Initial account balance
 * @param {Array} deposits - List of deposit records
 * @param {Array} withdrawals - List of withdrawal records
 * @returns {Object} Returns metrics
 */
function calculateReturnsMetrics(trades, startingBalance, deposits, withdrawals = null) {
    if (!trades || trades.length === 0 || startingBalance <= 0) {
        return {
            total_return_percent: 0.0,
            avg_return_percent: 0.0,
            max_drawdown_percent: 0.0,
            avg_risk_percent: 0.0,
            avg_position_size_percent: 0.0
        };
    }
    
    // Calculate total P&L
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl_usd || 0), 0);
    
    // Calculate total deposits and withdrawals
    const totalDeposits = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    if (withdrawals === null) {
        withdrawals = [];
    }
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    
    // Initial capital for returns calculation (subtract withdrawals)
    const initialCapital = startingBalance + totalDeposits - totalWithdrawals;
    
    // Total return % = (Total P&L / Initial Capital) * 100
    const totalReturnPercent = initialCapital > 0 ? (totalPnl / initialCapital * 100) : 0;
    
    // Average return per trade as % of account
    const avgReturnPercent = (initialCapital > 0 && trades.length > 0) ? 
        (totalPnl / trades.length / initialCapital * 100) : 0;
    
    // Calculate max drawdown as percentage
    const cumulativePnl = [];
    let runningTotal = 0;
    for (const trade of trades) {
        runningTotal += trade.pnl_usd || 0;
        cumulativePnl.push(runningTotal);
    }
    
    let peak = 0;
    let maxDrawdownDollars = 0;
    for (const value of cumulativePnl) {
        if (value > peak) {
            peak = value;
        }
        const drawdown = value - peak;
        if (drawdown < maxDrawdownDollars) {
            maxDrawdownDollars = drawdown;
        }
    }
    
    // Max drawdown % = (Max DD in $) / (Starting Balance + Deposits) * 100
    const maxDrawdownPercent = initialCapital > 0 ? (maxDrawdownDollars / initialCapital * 100) : 0;
    
    // Average risk per trade (as % of account at time of trade)
    let totalRiskPercent = 0.0;
    let accountBalance = initialCapital;
    
    for (const trade of trades) {
        const pnl = trade.pnl_usd || 0;
        const positionValue = Math.abs((trade.entry_price || 0) * (trade.position_size || 0));
        
        if (accountBalance > 0 && positionValue > 0) {
            totalRiskPercent += (positionValue / accountBalance * 100);
        }
        
        // Update account balance for next trade
        accountBalance += pnl;
    }
    
    const avgPositionSizePercent = trades.length > 0 ? totalRiskPercent / trades.length : 0;
    
    // Calculate average risk based on actual losses
    const losses = trades.filter(t => (t.pnl_usd || 0) < 0);
    let avgRiskPercent = 0;
    if (losses.length > 0) {
        const avgLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl_usd || 0), 0) / losses.length);
        avgRiskPercent = initialCapital > 0 ? (avgLoss / initialCapital * 100) : 0;
    }
    
    return {
        total_return_percent: Math.round(totalReturnPercent * 100) / 100,
        avg_return_percent: Math.round(avgReturnPercent * 10000) / 10000,
        max_drawdown_percent: Math.round(maxDrawdownPercent * 100) / 100,
        avg_risk_percent: Math.round(avgRiskPercent * 1000) / 1000,
        avg_position_size_percent: Math.round(avgPositionSizePercent * 100) / 100
    };
}

/**
 * Calculate expectancy (average P&L per trade)
 * 
 * Python equivalent: calculate_expectancy(trades)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @returns {number} Expectancy value
 */
function calculateExpectancy(trades) {
    if (!trades || trades.length === 0) {
        return 0.0;
    }

    // Single pass to calculate wins and losses
    const total = trades.length;
    let winCount = 0;
    let lossCount = 0;
    let totalWins = 0.0;
    let totalLosses = 0.0;
    
    for (const t of trades) {
        const pnl = t.pnl_usd || 0;
        if (pnl > 0) {
            winCount += 1;
            totalWins += pnl;
        } else if (pnl < 0) {
            lossCount += 1;
            totalLosses += pnl;
        }
    }

    const winRate = total > 0 ? winCount / total : 0;
    const lossRate = total > 0 ? lossCount / total : 0;

    const avgWin = winCount > 0 ? totalWins / winCount : 0;
    const avgLoss = lossCount > 0 ? Math.abs(totalLosses / lossCount) : 0;

    const expectancy = (winRate * avgWin) - (lossRate * avgLoss);
    return Math.round(expectancy * 100) / 100;
}

/**
 * Calculate profit factor (gross profit / gross loss)
 * 
 * Python equivalent: calculate_profit_factor(trades)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @returns {number} Profit factor
 */
function calculateProfitFactor(trades) {
    if (!trades || trades.length === 0) {
        return 0.0;
    }

    // Single pass calculation
    let grossProfit = 0.0;
    let grossLoss = 0.0;
    
    for (const t of trades) {
        const pnl = t.pnl_usd || 0;
        if (pnl > 0) {
            grossProfit += pnl;
        } else if (pnl < 0) {
            grossLoss += pnl;
        }
    }

    grossLoss = Math.abs(grossLoss);
    
    // Return 0 if no losses (avoids Infinity in JSON)
    if (grossLoss === 0) {
        return grossProfit === 0 ? 0.0 : MAX_PROFIT_FACTOR;
    }

    return Math.round(grossProfit / grossLoss * 100) / 100;
}

/**
 * Calculate max win and loss streaks
 * 
 * Python equivalent: calculate_streaks(trades)
 * 
 * @param {Array} trades - List of trade dictionaries (sorted by date)
 * @returns {Array} [max_win_streak, max_loss_streak]
 */
function calculateStreaks(trades) {
    if (!trades || trades.length === 0) {
        return [0, 0];
    }

    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    for (const trade of trades) {
        const pnl = trade.pnl_usd || 0;

        if (pnl > 0) {
            currentWinStreak += 1;
            currentLossStreak = 0;
            maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
        } else if (pnl < 0) {
            currentLossStreak += 1;
            currentWinStreak = 0;
            maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
        }
    }

    return [maxWinStreak, maxLossStreak];
}

/**
 * Calculate drawdown series over time
 * 
 * Python equivalent: calculate_drawdown_series(trades)
 * 
 * @param {Array} trades - List of trade dictionaries (sorted by date)
 * @returns {Object} {labels: [...], values: [...]}
 */
function calculateDrawdownSeries(trades) {
    if (!trades || trades.length === 0) {
        return { labels: [], values: [] };
    }

    const labels = [];
    const drawdowns = [];

    const cumulativePnl = [];
    let runningTotal = 0;

    for (const trade of trades) {
        const pnl = trade.pnl_usd || 0;
        runningTotal += pnl;
        cumulativePnl.push(runningTotal);

        // Date label
        const dateStr = trade.exit_date || trade.entry_date || '';
        try {
            const dateObj = new Date(String(dateStr).split('T')[0]);
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            labels.push(`${month}/${day}`);
        } catch (error) {
            labels.push(dateStr);
        }
    }

    // Calculate drawdown from peak (start peak at 0 for proper drawdown calculation)
    let peak = 0;
    for (const value of cumulativePnl) {
        if (value > peak) {
            peak = value;
        }
        const drawdown = value - peak;
        drawdowns.push(Math.round(drawdown * 100) / 100);
    }

    return { labels, values: drawdowns };
}

/**
 * Calculate Kelly Criterion percentage
 * 
 * Python equivalent: calculate_kelly_criterion(trades)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @returns {number} Kelly percentage
 */
function calculateKellyCriterion(trades) {
    if (!trades || trades.length === 0) {
        return 0.0;
    }

    // Single pass to calculate stats
    let winCount = 0;
    let lossCount = 0;
    let totalWins = 0.0;
    let totalLosses = 0.0;
    
    for (const t of trades) {
        const pnl = t.pnl_usd || 0;
        if (pnl > 0) {
            winCount += 1;
            totalWins += pnl;
        } else if (pnl < 0) {
            lossCount += 1;
            totalLosses += pnl;
        }
    }

    if (winCount === 0 || lossCount === 0) {
        return 0.0;
    }

    const winRate = winCount / trades.length;
    const avgWin = totalWins / winCount;
    const avgLoss = Math.abs(totalLosses / lossCount);

    if (avgLoss === 0) {
        return 0.0;
    }

    const rRatio = avgWin / avgLoss;
    const kelly = winRate - ((1 - winRate) / rRatio);

    return Math.round(kelly * 100 * 10) / 10;
}

/**
 * Calculate Sharpe Ratio - risk-adjusted returns
 * 
 * Python equivalent: calculate_sharpe_ratio(trades, risk_free_rate)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @param {number} riskFreeRate - Risk-free rate (default 0%)
 * @returns {number} Sharpe ratio
 */
function calculateSharpeRatio(trades, riskFreeRate = 0.0) {
    if (!trades || trades.length < 2) {
        return 0.0;
    }
    
    // Get returns as percentages
    const returns = trades.map(t => t.pnl_percent || 0);
    
    // Calculate average return
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    
    // Calculate standard deviation
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) {
        return 0.0;
    }
    
    const sharpe = (avgReturn - riskFreeRate) / stdDev;
    
    return Math.round(sharpe * 100) / 100;
}

/**
 * Calculate R-Multiple distribution - returns in risk units
 * 
 * Python equivalent: calculate_r_multiple_distribution(trades)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @returns {Object} R-multiple distribution data
 */
function calculateRMultipleDistribution(trades) {
    if (!trades || trades.length === 0) {
        return {
            labels: [],
            data: [],
            avg_r_multiple: 0,
            median_r_multiple: 0
        };
    }
    
    const rMultiples = [];
    
    for (const trade of trades) {
        const entryPrice = trade.entry_price || 0;
        const exitPrice = trade.exit_price || 0;
        const stopLoss = trade.stop_loss || 0;
        const direction = trade.direction || 'LONG';
        
        if (entryPrice === 0 || stopLoss === 0) {
            continue;
        }
        
        // Calculate risk (distance from entry to stop)
        let risk, gain;
        if (direction === 'LONG') {
            risk = entryPrice - stopLoss;
            gain = exitPrice - entryPrice;
        } else {  // SHORT
            risk = stopLoss - entryPrice;
            gain = entryPrice - exitPrice;
        }
        
        if (risk <= 0) {
            continue;
        }
        
        // R-multiple is gain divided by risk
        const rMultiple = gain / risk;
        rMultiples.push(rMultiple);
    }
    
    if (rMultiples.length === 0) {
        return {
            labels: [],
            data: [],
            avg_r_multiple: 0,
            median_r_multiple: 0
        };
    }
    
    // Create histogram buckets
    const buckets = {
        '< -2R': 0,
        '-2R to -1R': 0,
        '-1R to 0R': 0,
        '0R to 1R': 0,
        '1R to 2R': 0,
        '2R to 3R': 0,
        '> 3R': 0
    };
    
    for (const r of rMultiples) {
        if (r < -2) {
            buckets['< -2R'] += 1;
        } else if (r < -1) {
            buckets['-2R to -1R'] += 1;
        } else if (r < 0) {
            buckets['-1R to 0R'] += 1;
        } else if (r < 1) {
            buckets['0R to 1R'] += 1;
        } else if (r < 2) {
            buckets['1R to 2R'] += 1;
        } else if (r < 3) {
            buckets['2R to 3R'] += 1;
        } else {
            buckets['> 3R'] += 1;
        }
    }
    
    // Calculate statistics
    const avgR = rMultiples.reduce((sum, r) => sum + r, 0) / rMultiples.length;
    const sortedR = [...rMultiples].sort((a, b) => a - b);
    const medianR = sortedR.length % 2 === 1
        ? sortedR[Math.floor(sortedR.length / 2)]
        : (sortedR[Math.floor(sortedR.length / 2) - 1] + sortedR[Math.floor(sortedR.length / 2)]) / 2;
    
    return {
        labels: Object.keys(buckets),
        data: Object.values(buckets),
        avg_r_multiple: Math.round(avgR * 100) / 100,
        median_r_multiple: Math.round(medianR * 100) / 100
    };
}

/**
 * Calculate MAE (Mean Adverse Excursion) and MFE (Mean Favorable Excursion)
 * 
 * Python equivalent: calculate_mae_mfe_analysis(trades)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @returns {Object} MAE/MFE analysis placeholder
 */
function calculateMaeMfeAnalysis(trades) {
    return {
        available: false,
        message: 'MAE/MFE analysis requires intraday price data collection. This feature will be available once intraday high/low prices are tracked for each trade.',
        mae_avg: 0,
        mfe_avg: 0,
        note: 'To enable this metric, add \'intraday_high\' and \'intraday_low\' fields to trade entries.'
    };
}

/**
 * Aggregate statistics by a tag field
 * 
 * Python equivalent: aggregate_by_tag(trades, tag_field)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @param {string} tagField - Field to group by
 * @returns {Object} Aggregated statistics
 */
function aggregateByTag(trades, tagField) {
    const aggregates = {};

    // Group trades by tag and calculate stats in single pass
    for (const trade of trades) {
        let tagValue = trade[tagField];
        
        // Handle array/list tags
        if (Array.isArray(tagValue)) {
            tagValue = tagValue.length > 0 ? String(tagValue[0]) : 'Unclassified';
        }
        
        if (!tagValue || tagValue === '') {
            tagValue = 'Unclassified';
        }

        if (!(tagValue in aggregates)) {
            aggregates[tagValue] = {
                trades: [],
                total_trades: 0,
                winning_trades: 0,
                losing_trades: 0,
                win_rate: 0,
                total_pnl: 0.0,
                avg_pnl: 0,
                expectancy: 0,
            };
        }

        aggregates[tagValue].trades.push(trade);
    }

    // Calculate stats for each tag in optimized manner
    for (const [tagValue, data] of Object.entries(aggregates)) {
        const tagTrades = data.trades;
        data.total_trades = tagTrades.length;
        
        // Calculate all metrics in single pass
        let winCount = 0;
        let lossCount = 0;
        let totalPnl = 0.0;
        
        for (const t of tagTrades) {
            const pnl = t.pnl_usd || 0;
            totalPnl += pnl;
            if (pnl > 0) {
                winCount += 1;
            } else if (pnl < 0) {
                lossCount += 1;
            }
        }
        
        data.winning_trades = winCount;
        data.losing_trades = lossCount;
        data.win_rate = Math.round(
            (data.total_trades > 0 ? winCount / data.total_trades * 100 : 0) * 10
        ) / 10;
        data.total_pnl = Math.round(totalPnl * 100) / 100;
        data.avg_pnl = Math.round(
            (data.total_trades > 0 ? totalPnl / data.total_trades : 0) * 100
        ) / 100;
        data.expectancy = calculateExpectancy(tagTrades);

        // Remove trades list from output
        delete data.trades;
    }

    return aggregates;
}

/**
 * Main execution function
 * 
 * Python equivalent: main()
 */
async function main() {
    console.log('Generating analytics...');

    // Load account config (async in browser, sync in Node.js)
    const accountConfig = await loadAccountConfig();
    const startingBalance = accountConfig.starting_balance || 1000.00;
    const totalDeposits = (accountConfig.deposits || []).reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalWithdrawals = (accountConfig.withdrawals || []).reduce((sum, w) => sum + (w.amount || 0), 0);
    
    // Load trades index (async in browser, sync in Node.js)
    const indexData = await loadTradesIndex();
    if (!indexData) {
        return;
    }

    const trades = indexData.trades || [];
    const stats = indexData.statistics || {};
    const totalPnl = stats.total_pnl || 0;
    
    // Calculate portfolio value (subtract withdrawals)
    const portfolioValue = startingBalance + totalDeposits - totalWithdrawals + totalPnl;
    
    let analytics;
    
    if (trades.length === 0) {
        console.log('No trades found in index');
        // Create empty analytics
        analytics = {
            expectancy: 0,
            profit_factor: 0,
            max_win_streak: 0,
            max_loss_streak: 0,
            max_drawdown: 0,
            kelly_criterion: 0,
            by_strategy: {},
            by_setup: {},
            by_session: {},
            drawdown_series: { labels: [], values: [] },
            account: {
                starting_balance: startingBalance,
                total_deposits: totalDeposits,
                total_pnl: totalPnl,
                portfolio_value: portfolioValue
            },
            generated_at: new Date().toISOString(),
        };
    } else {
        console.log(`Processing ${trades.length} trades...`);

        // Sort trades by date
        const sortedTrades = [...trades].sort((a, b) => {
            const dateA = a.exit_date || a.entry_date || '';
            const dateB = b.exit_date || b.entry_date || '';
            return dateA.localeCompare(dateB);
        });

        // Calculate overall metrics
        const expectancy = calculateExpectancy(sortedTrades);
        const profitFactor = calculateProfitFactor(sortedTrades);
        const [maxWinStreak, maxLossStreak] = calculateStreaks(sortedTrades);
        const drawdownSeries = calculateDrawdownSeries(sortedTrades);
        const maxDrawdown = drawdownSeries.values.length > 0 ? Math.min(...drawdownSeries.values) : 0;
        const kelly = calculateKellyCriterion(sortedTrades);
        
        // Calculate advanced analytics
        const sharpeRatio = calculateSharpeRatio(sortedTrades);
        const rMultipleDist = calculateRMultipleDistribution(sortedTrades);
        const maeMfe = calculateMaeMfeAnalysis(sortedTrades);
        
        // Calculate percentage-based returns metrics
        const returnsMetrics = calculateReturnsMetrics(
            sortedTrades,
            startingBalance,
            accountConfig.deposits || [],
            accountConfig.withdrawals || []
        );

        // Aggregate by tags
        const byStrategy = aggregateByTag(sortedTrades, 'strategy');
        const bySetup = aggregateByTag(sortedTrades, 'setup_tags');
        const bySession = aggregateByTag(sortedTrades, 'session_tags');

        analytics = {
            expectancy: expectancy,
            profit_factor: profitFactor,
            max_win_streak: maxWinStreak,
            max_loss_streak: maxLossStreak,
            max_drawdown: maxDrawdown,
            max_drawdown_percent: returnsMetrics.max_drawdown_percent,
            kelly_criterion: kelly,
            sharpe_ratio: sharpeRatio,
            r_multiple_distribution: rMultipleDist,
            mae_mfe_analysis: maeMfe,
            by_strategy: byStrategy,
            by_setup: bySetup,
            by_session: bySession,
            drawdown_series: drawdownSeries,
            returns: {
                total_return_percent: returnsMetrics.total_return_percent,
                avg_return_percent: returnsMetrics.avg_return_percent,
                avg_risk_percent: returnsMetrics.avg_risk_percent,
                avg_position_size_percent: returnsMetrics.avg_position_size_percent
            },
            account: {
                starting_balance: startingBalance,
                total_deposits: totalDeposits,
                total_pnl: totalPnl,
                portfolio_value: portfolioValue
            },
            generated_at: new Date().toISOString(),
        };
    }

    // Save analytics data
    ensureDirectorySync('index.directory/assets/charts');
    const outputFile = 'index.directory/assets/charts/analytics-data.json';

    saveJsonFileSync(outputFile, analytics);

    console.log(`Analytics written to ${outputFile}`);
    console.log(`Expectancy: $${analytics.expectancy}`);
    console.log(`Profit Factor: ${analytics.profit_factor}`);
    console.log(`Kelly Criterion: ${analytics.kelly_criterion}%`);
}

// Sync version of ensure/save for compatibility
function ensureDirectorySync(dir) {
    const fsSync = require('fs');
    const path = require('path');
    fsSync.mkdirSync(dir, { recursive: true });
}

function saveJsonFileSync(filepath, data) {
    const fsSync = require('fs');
    const path = require('path');
    const dir = path.dirname(filepath);
    if (dir) {
        ensureDirectorySync(dir);
    }
    fsSync.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

// Run main if executed directly
if (require.main === module) {
    main();
}

module.exports = {
    main,
    calculateReturnsMetrics,
    calculateExpectancy,
    calculateProfitFactor,
    calculateStreaks,
    calculateDrawdownSeries,
    calculateKellyCriterion,
    calculateSharpeRatio,
    calculateRMultipleDistribution,
    calculateMaeMfeAnalysis,
    aggregateByTag
};

// ES Module exports for browser compatibility
export {
    main as generateAnalytics,
    main as generate,
    calculateReturnsMetrics,
    calculateExpectancy,
    calculateProfitFactor,
    calculateStreaks,
    calculateDrawdownSeries,
    calculateKellyCriterion,
    calculateSharpeRatio,
    calculateRMultipleDistribution,
    calculateMaeMfeAnalysis,
    aggregateByTag,
};
