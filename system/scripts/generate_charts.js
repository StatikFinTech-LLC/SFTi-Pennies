#!/usr/bin/env node
/**
 * Generate Charts Script
 * Generates equity curve data in Chart.js compatible JSON format
 * and creates a static chart image using matplotlib (if available)
 * 
 * This is a comprehensive JavaScript translation of generate_charts.py with full feature parity.
 * Python's matplotlib is replaced with notes indicating browser-based charting via Chart.js.
 * All data generation functions are fully implemented for Chart.js compatibility.
 */

const path = require('path');
const { setupImports, ensureDirectory, saveJsonFile } = require('./globals_utils');

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

// Try to import matplotlib - not available in Node.js
// Note: In JavaScript/Node.js, we skip static image generation as it requires matplotlib
// Charts are rendered client-side using Chart.js in the browser instead
const MATPLOTLIB_AVAILABLE = false;
console.log('Note: matplotlib not available in JavaScript, skipping static chart generation');
console.log('Charts will be rendered client-side using Chart.js');

// Standard trading session order for time of day performance
const TRADING_SESSION_ORDER = [
    'Pre-Market',
    'Morning',
    'Midday',
    'Afternoon',
    'After-Hours',
    'Extended Hours'
];

/**
 * Generate equity curve data from trades
 * 
 * Python equivalent: generate_equity_curve_data(trades)
 * 
 * @param {Array} trades - List of trade dictionaries sorted by date
 * @returns {Object} Chart.js compatible data structure
 */
function generateEquityCurveData(trades) {
    if (!trades || trades.length === 0) {
        return {
            labels: [],
            datasets: [
                {
                    label: 'Equity Curve',
                    data: [],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    tension: 0.4,
                }
            ],
        };
    }

    // Sort trades by exit date
    const sortedTrades = [...trades].sort((a, b) => {
        const dateA = a.exit_date || a.entry_date || '';
        const dateB = b.exit_date || b.entry_date || '';
        return dateA.localeCompare(dateB);
    });

    // Calculate cumulative P&L
    const labels = [];
    const cumulativePnl = [];
    let runningTotal = 0;

    for (const trade of sortedTrades) {
        const pnl = trade.pnl_usd || 0;
        runningTotal += pnl;

        // Use exit date for the equity point
        const dateStr = trade.exit_date || trade.entry_date || '';
        try {
            const dateObj = new Date(String(dateStr));
            labels.push(dateObj.toISOString().split('T')[0]);
        } catch (error) {
            labels.push(dateStr);
        }

        cumulativePnl.push(Math.round(runningTotal * 100) / 100);
    }

    // Chart.js format
    const chartjsData = {
        labels: labels,
        datasets: [
            {
                label: 'Equity Curve',
                data: cumulativePnl,
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#00ff88',
                pointBorderColor: '#0a0e27',
                pointBorderWidth: 2,
            }
        ],
    };

    return chartjsData;
}

/**
 * Generate a static equity curve image using matplotlib
 * Note: Not available in JavaScript - this is a placeholder
 * 
 * Python equivalent: generate_static_chart(trades, output_path)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @param {string} outputPath - Output file path for the chart
 */
function generateStaticChart(trades, outputPath = 'index.directory/assets/charts/equity-curve.png') {
    if (!MATPLOTLIB_AVAILABLE) {
        console.log('Skipping static chart generation (matplotlib not available in JavaScript)');
        console.log('Use Chart.js in the browser for interactive charts instead');
        return;
    }
    // Matplotlib functionality not available in Node.js
}

/**
 * Generate a bar chart showing P&L distribution
 * Note: Not available in JavaScript - this is a placeholder
 * 
 * Python equivalent: generate_trade_distribution_chart(trades, output_path)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @param {string} outputPath - Output file path for the chart
 */
function generateTradeDistributionChart(trades, outputPath = 'index.directory/assets/charts/trade-distribution.png') {
    if (!MATPLOTLIB_AVAILABLE) {
        console.log('Skipping trade distribution chart generation (matplotlib not available in JavaScript)');
        return;
    }
    // Matplotlib functionality not available in Node.js
}

/**
 * Generate win/loss ratio by strategy data in Chart.js format
 * 
 * Python equivalent: generate_win_loss_ratio_by_strategy_data(trades)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @returns {Object} Chart.js compatible data structure
 */
function generateWinLossRatioByStrategyData(trades) {
    if (!trades || trades.length === 0) {
        return {
            labels: [],
            datasets: [
                { label: 'Wins', data: [], backgroundColor: '#00ff88' },
                { label: 'Losses', data: [], backgroundColor: '#ff4757' }
            ],
        };
    }

    // Aggregate by strategy
    const strategyStats = {};

    for (const trade of trades) {
        const strategy = trade.strategy || 'Unclassified';
        const pnl = trade.pnl_usd || 0;

        if (!strategyStats[strategy]) {
            strategyStats[strategy] = { wins: 0, losses: 0 };
        }

        if (pnl > 0) {
            strategyStats[strategy].wins += 1;
        } else if (pnl < 0) {
            strategyStats[strategy].losses += 1;
        }
    }

    // Sort by total trades (descending)
    const sortedStrategies = Object.entries(strategyStats).sort(
        (a, b) => (b[1].wins + b[1].losses) - (a[1].wins + a[1].losses)
    );

    // Prepare data
    const labels = [];
    const wins = [];
    const losses = [];

    for (const [strategy, stats] of sortedStrategies) {
        labels.push(strategy);
        wins.push(stats.wins);
        losses.push(stats.losses);
    }

    return {
        labels: labels,
        datasets: [
            {
                label: 'Wins',
                data: wins,
                backgroundColor: '#00ff88',
                borderColor: '#00ff88',
                borderWidth: 2,
            },
            {
                label: 'Losses',
                data: losses,
                backgroundColor: '#ff4757',
                borderColor: '#ff4757',
                borderWidth: 2,
            }
        ],
    };
}

/**
 * Generate performance by day of week data in Chart.js format
 * 
 * Python equivalent: generate_performance_by_day_data(trades)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @returns {Object} Chart.js compatible data structure
 */
function generatePerformanceByDayData(trades) {
    if (!trades || trades.length === 0) {
        return {
            labels: [],
            datasets: [{ label: 'Average P&L', data: [], backgroundColor: [] }],
        };
    }

    // Initialize day statistics
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayStats = {};
    for (const day of days) {
        dayStats[day] = { total_pnl: 0, count: 0 };
    }

    // Aggregate by day of week
    for (const trade of trades) {
        const exitDateStr = trade.exit_date || trade.entry_date || '';
        try {
            const dateObj = new Date(String(exitDateStr));
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            const pnl = trade.pnl_usd || 0;

            dayStats[dayName].total_pnl += pnl;
            dayStats[dayName].count += 1;
        } catch (error) {
            continue;
        }
    }

    // Calculate averages
    const labels = [];
    const avgPnls = [];
    const colors = [];

    for (const day of days) {
        if (dayStats[day].count > 0) {
            labels.push(day);
            const avgPnl = dayStats[day].total_pnl / dayStats[day].count;
            avgPnls.push(Math.round(avgPnl * 100) / 100);
            colors.push(avgPnl >= 0 ? '#00ff88' : '#ff4757');
        }
    }

    return {
        labels: labels,
        datasets: [
            {
                label: 'Average P&L ($)',
                data: avgPnls,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2,
            }
        ],
    };
}

/**
 * Generate performance by ticker data in Chart.js format
 * 
 * Python equivalent: generate_ticker_performance_data(trades)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @returns {Object} Chart.js compatible data structure
 */
function generateTickerPerformanceData(trades) {
    if (!trades || trades.length === 0) {
        return {
            labels: [],
            datasets: [{ label: 'Total P&L', data: [], backgroundColor: [] }],
        };
    }

    // Aggregate by ticker
    const tickerStats = {};

    for (const trade of trades) {
        const ticker = trade.ticker || 'UNKNOWN';
        const pnl = trade.pnl_usd || 0;

        if (!tickerStats[ticker]) {
            tickerStats[ticker] = { total_pnl: 0, count: 0 };
        }

        tickerStats[ticker].total_pnl += pnl;
        tickerStats[ticker].count += 1;
    }

    // Sort by total P&L (descending)
    const sortedTickers = Object.entries(tickerStats).sort(
        (a, b) => b[1].total_pnl - a[1].total_pnl
    );

    // Prepare data (top 20 tickers)
    const labels = [];
    const totalPnls = [];
    const colors = [];

    for (const [ticker, stats] of sortedTickers.slice(0, 20)) {
        labels.push(ticker);
        const totalPnl = stats.total_pnl;
        totalPnls.push(Math.round(totalPnl * 100) / 100);
        colors.push(totalPnl >= 0 ? '#00ff88' : '#ff4757');
    }

    return {
        labels: labels,
        datasets: [
            {
                label: 'Total P&L ($)',
                data: totalPnls,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2,
            }
        ],
    };
}

/**
 * Generate time of day performance data using session_tags in Chart.js format
 * 
 * Python equivalent: generate_time_of_day_performance_data(trades)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @returns {Object} Chart.js compatible data structure
 */
function generateTimeOfDayPerformanceData(trades) {
    if (!trades || trades.length === 0) {
        return {
            labels: [],
            datasets: [{ label: 'Average P&L', data: [], backgroundColor: [] }],
        };
    }

    // Aggregate by session tag
    const sessionStats = {};

    for (const trade of trades) {
        // session_tags is an array, take the first one
        const sessionTags = trade.session_tags || [];
        
        let session;
        if (Array.isArray(sessionTags) && sessionTags.length > 0) {
            session = sessionTags[0];
        } else {
            session = 'Unclassified';
        }

        const pnl = trade.pnl_usd || 0;

        if (!sessionStats[session]) {
            sessionStats[session] = { total_pnl: 0, count: 0 };
        }

        sessionStats[session].total_pnl += pnl;
        sessionStats[session].count += 1;
    }

    // Sort by standard trading session order (module-level constant)
    const existingSessions = TRADING_SESSION_ORDER.filter(s => s in sessionStats);
    
    // Add any other sessions not in the standard order
    const otherSessions = Object.keys(sessionStats)
        .filter(s => !TRADING_SESSION_ORDER.includes(s))
        .sort();
    const allSessions = existingSessions.concat(otherSessions);

    // Prepare data
    const labels = [];
    const avgPnls = [];
    const colors = [];

    for (const session of allSessions) {
        const stats = sessionStats[session];
        if (stats.count === 0) {
            continue;  // Skip sessions with zero trades
        }
        labels.push(session);
        const avgPnl = stats.total_pnl / stats.count;
        avgPnls.push(Math.round(avgPnl * 100) / 100);
        colors.push(avgPnl >= 0 ? '#00ff88' : '#ff4757');
    }

    return {
        labels: labels,
        datasets: [
            {
                label: 'Average P&L ($)',
                data: avgPnls,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2,
            }
        ],
    };
}

/**
 * Format a date object into a label string based on the timeframe and interval
 * 
 * Python equivalent: format_date_label(date, timeframe, interval)
 * 
 * @param {Date} date - The date to format
 * @param {string} timeframe - The timeframe (day, week, month, quarter, year, 5year)
 * @param {string|null} interval - Optional interval override
 * @returns {string} Formatted date label
 */
function formatDateLabel(date, timeframe, interval = null) {
    // Use interval if provided, otherwise use default for timeframe
    if (interval === '30min') {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (interval === 'daily') {
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    } else if (interval === 'weekly') {
        const weekNum = getISOWeek(date);
        return `W${String(weekNum).padStart(2, '0')} ${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    } else if (interval === 'monthly') {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (interval === 'quarterly') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()} Q${quarter}`;
    } else if (interval === 'yearly') {
        return String(date.getFullYear());
    }
    
    // Default formatting based on timeframe
    if (timeframe === 'day') {
        return (date.getHours() !== 0 || date.getMinutes() !== 0)
            ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
            : `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    } else if (timeframe === 'week') {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit' });
    } else if (timeframe === 'month') {
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    } else if (timeframe === 'quarter') {
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    } else if (timeframe === 'year') {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (timeframe === '5year') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()} Q${quarter}`;
    } else {
        return date.toISOString().split('T')[0];
    }
}

/**
 * Get ISO week number
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
 * Calculate the start date for a given timeframe based on the end date
 * 
 * Python equivalent: get_timeframe_range(end_date, timeframe)
 * 
 * @param {Date} endDate - The most recent trade date
 * @param {string} timeframe - The timeframe
 * @returns {Date} The start date for the timeframe
 */
function getTimeframeRange(endDate, timeframe) {
    const result = new Date(endDate);
    
    if (timeframe === 'day') {
        result.setHours(result.getHours() - 24);
    } else if (timeframe === 'week') {
        result.setDate(result.getDate() - 7);
    } else if (timeframe === 'month') {
        result.setDate(result.getDate() - 30);
    } else if (timeframe === 'quarter') {
        result.setDate(result.getDate() - 90);
    } else if (timeframe === 'year') {
        result.setDate(result.getDate() - 365);
    } else if (timeframe === '5year') {
        result.setDate(result.getDate() - 1825);
    } else {
        result.setDate(result.getDate() - 30);
    }
    
    return result;
}

/**
 * Get the default data point interval for a timeframe
 * 
 * Python equivalent: get_default_interval(timeframe)
 * 
 * @param {string} timeframe - The timeframe
 * @returns {string} The default interval
 */
function getDefaultInterval(timeframe) {
    if (timeframe === 'day') return '30min';
    if (timeframe === 'week') return '30min';
    if (timeframe === 'month') return 'daily';
    if (timeframe === 'quarter') return 'weekly';
    if (timeframe === 'year') return 'weekly';
    if (timeframe === '5year') return 'quarterly';
    return 'daily';
}

/**
 * Get bucket key for aggregation
 * 
 * @param {Date} date - Date to bucket
 * @param {string} interval - Interval type
 * @returns {Date} Bucket key
 */
function getBucketKey(date, interval) {
    const result = new Date(date);
    
    if (interval === '30min') {
        result.setMinutes(Math.floor(result.getMinutes() / 30) * 30, 0, 0);
    } else if (interval === 'daily') {
        result.setHours(0, 0, 0, 0);
    } else if (interval === 'weekly') {
        const daysSinceMonday = result.getDay() === 0 ? 6 : result.getDay() - 1;
        result.setDate(result.getDate() - daysSinceMonday);
        result.setHours(0, 0, 0, 0);
    } else if (interval === 'monthly') {
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
    } else if (interval === 'quarterly') {
        const quarterMonth = Math.floor(result.getMonth() / 3) * 3;
        result.setMonth(quarterMonth, 1);
        result.setHours(0, 0, 0, 0);
    } else if (interval === 'yearly') {
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
    } else {
        result.setHours(0, 0, 0, 0);
    }
    
    return result;
}

/**
 * Filter data to timeframe range and aggregate by interval
 * 
 * Python equivalent: filter_and_aggregate_by_timeframe(dates, values, timeframe, interval, end_date, base_value)
 * 
 * @param {Array} dates - List of Date objects
 * @param {Array} values - List of values
 * @param {string} timeframe - Timeframe to filter
 * @param {string} interval - Data point interval
 * @param {Date} endDate - End date
 * @param {number} baseValue - Starting value
 * @returns {Object} {labels: Array, data: Array}
 */
function filterAndAggregateByTimeframe(dates, values, timeframe, interval, endDate, baseValue) {
    const startDate = getTimeframeRange(endDate, timeframe);
    
    // Filter trades within the timeframe range
    const filteredDates = [];
    const filteredValues = [];
    for (let i = 0; i < dates.length; i++) {
        if (dates[i] >= startDate && dates[i] <= endDate) {
            filteredDates.push(dates[i]);
            filteredValues.push(values[i]);
        }
    }
    
    if (filteredDates.length === 0) {
        const startLabel = formatDateLabel(startDate, timeframe, interval);
        const endLabel = formatDateLabel(endDate, timeframe, interval);
        return { labels: [startLabel, endLabel], data: [baseValue, baseValue] };
    }
    
    // Aggregate by bucket
    const aggregated = {};
    
    for (let i = 0; i < filteredDates.length; i++) {
        const bucket = getBucketKey(filteredDates[i], interval);
        const bucketKey = bucket.getTime();
        
        if (!aggregated[bucketKey]) {
            aggregated[bucketKey] = { dates: [], values: [], bucketDate: bucket };
        }
        aggregated[bucketKey].dates.push(filteredDates[i]);
        aggregated[bucketKey].values.push(filteredValues[i]);
    }
    
    // Sort buckets chronologically
    const sortedBuckets = Object.keys(aggregated).sort((a, b) => parseInt(a) - parseInt(b));
    
    // Take the last value for each bucket
    const labels = [];
    const data = [];
    
    // Add starting point if needed
    if (sortedBuckets.length > 0) {
        const firstBucket = aggregated[sortedBuckets[0]].bucketDate;
        if (firstBucket > startDate) {
            labels.push(formatDateLabel(startDate, timeframe, interval));
            data.push(baseValue);
        }
    }
    
    // Add aggregated data points
    for (const bucketKey of sortedBuckets) {
        const bucket = aggregated[bucketKey];
        const lastValue = bucket.values[bucket.values.length - 1];
        labels.push(formatDateLabel(bucket.bucketDate, timeframe, interval));
        data.push(lastValue);
    }
    
    return { labels, data };
}

/**
 * Parse trade exit datetime from trade dictionary
 * 
 * Python equivalent: parse_trade_datetime(trade)
 * 
 * @param {Object} trade - Trade dictionary
 * @returns {Date|null} Parsed datetime or null
 */
function parseTradeDateTime(trade) {
    const dateStr = trade.exit_date || trade.entry_date || '';
    const timeStr = trade.exit_time || trade.entry_time || '';
    
    if (!dateStr) {
        return null;
    }
    
    try {
        let datetimeStr;
        if (timeStr) {
            const colonCount = (timeStr.match(/:/g) || []).length;
            if (colonCount === 1) {
                datetimeStr = `${dateStr}T${timeStr}:00`;
            } else if (colonCount === 2) {
                datetimeStr = `${dateStr}T${timeStr}`;
            } else {
                datetimeStr = String(dateStr);
            }
        } else {
            datetimeStr = String(dateStr);
        }
        
        return new Date(datetimeStr);
    } catch (error) {
        return null;
    }
}

/**
 * Generate portfolio value charts for all timeframes
 * 
 * Python equivalent: generate_portfolio_value_charts(trades, account_config)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @param {Object} accountConfig - Account configuration
 */
function generatePortfolioValueCharts(trades, accountConfig) {
    const startingBalance = accountConfig.starting_balance || 0;
    const deposits = accountConfig.deposits || [];
    const withdrawals = accountConfig.withdrawals || [];
    
    const totalDeposits = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    
    // Sort trades by date and time
    const sortedTrades = trades.filter(t => parseTradeDateTime(t));
    sortedTrades.sort((a, b) => parseTradeDateTime(a) - parseTradeDateTime(b));
    
    // Calculate cumulative P&L at each trade
    const tradeDates = [];
    const portfolioValues = [];
    let cumulativePnl = 0;
    
    const baseValue = startingBalance + totalDeposits - totalWithdrawals;
    
    for (const trade of sortedTrades) {
        const pnl = trade.pnl_usd || 0;
        cumulativePnl += pnl;
        
        const dateObj = parseTradeDateTime(trade);
        if (dateObj) {
            tradeDates.push(dateObj);
            portfolioValues.push(baseValue + cumulativePnl);
        }
    }
    
    const endDate = tradeDates.length > 0 ? tradeDates[tradeDates.length - 1] : new Date();
    
    // Generate for each timeframe
    const timeframes = ['day', 'week', 'month', 'quarter', 'year', '5year'];
    for (const timeframe of timeframes) {
        let chartData;
        
        if (timeframe === 'day') {
            // Special handling for day timeframe
            chartData = createDayChartData(sortedTrades, endDate, baseValue, 'portfolio');
        } else {
            const interval = getDefaultInterval(timeframe);
            const { labels, data } = filterAndAggregateByTimeframe(
                tradeDates, portfolioValues, timeframe, interval, endDate, baseValue
            );
            
            chartData = {
                labels,
                datasets: [{
                    label: 'Portfolio Value',
                    data,
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#00ff88',
                    pointBorderColor: '#0a0e27',
                    pointBorderWidth: 2,
                }]
            };
        }
        
        const outputPath = `index.directory/assets/charts/portfolio-value-${timeframe}.json`;
        fsSync.writeFileSync(outputPath, JSON.stringify(chartData, null, 2), 'utf-8');
        console.log(`  ✓ Portfolio value (${timeframe}) with ${getDefaultInterval(timeframe)} interval saved`);
    }
}

/**
 * Generate total return percentage charts for all timeframes
 * 
 * Python equivalent: generate_total_return_charts(trades, account_config)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @param {Object} accountConfig - Account configuration
 */
function generateTotalReturnCharts(trades, accountConfig) {
    const startingBalance = accountConfig.starting_balance || 0;
    const deposits = accountConfig.deposits || [];
    const withdrawals = accountConfig.withdrawals || [];
    
    const totalDeposits = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    
    let startingInvestment = startingBalance + totalDeposits - totalWithdrawals;
    if (startingInvestment === 0) {
        startingInvestment = 1;  // Avoid division by zero
    }
    
    // Sort trades by date and time
    const sortedTrades = trades.filter(t => parseTradeDateTime(t));
    sortedTrades.sort((a, b) => parseTradeDateTime(a) - parseTradeDateTime(b));
    
    // Calculate return percentage at each trade
    const tradeDates = [];
    const returnPercentages = [];
    let cumulativePnl = 0;
    
    for (const trade of sortedTrades) {
        const pnl = trade.pnl_usd || 0;
        cumulativePnl += pnl;
        
        const returnPct = (cumulativePnl / startingInvestment) * 100;
        
        const dateObj = parseTradeDateTime(trade);
        if (dateObj) {
            tradeDates.push(dateObj);
            returnPercentages.push(returnPct);
        }
    }
    
    const endDate = tradeDates.length > 0 ? tradeDates[tradeDates.length - 1] : new Date();
    
    // Generate for each timeframe
    const timeframes = ['day', 'week', 'month', 'quarter', 'year', '5year'];
    for (const timeframe of timeframes) {
        let chartData;
        
        if (timeframe === 'day') {
            // Special handling for day timeframe
            chartData = createDayChartData(sortedTrades, endDate, startingInvestment, 'return');
        } else {
            const interval = getDefaultInterval(timeframe);
            const { labels, data } = filterAndAggregateByTimeframe(
                tradeDates, returnPercentages, timeframe, interval, endDate, 0
            );
            
            // Round to 2 decimal places
            const roundedData = data.map(v => Math.round(v * 100) / 100);
            
            chartData = {
                labels,
                datasets: [{
                    label: 'Total Return %',
                    data: roundedData,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#00d4ff',
                    pointBorderColor: '#0a0e27',
                    pointBorderWidth: 2,
                }]
            };
        }
        
        const outputPath = `index.directory/assets/charts/total-return-${timeframe}.json`;
        fsSync.writeFileSync(outputPath, JSON.stringify(chartData, null, 2), 'utf-8');
        console.log(`  ✓ Total return (${timeframe}) with ${getDefaultInterval(timeframe)} interval saved`);
    }
}

/**
 * Create day chart data (special handling)
 * 
 * @param {Array} sortedTrades - Sorted trades
 * @param {Date} endDate - End date
 * @param {number} baseValue - Base value
 * @param {string} chartType - 'portfolio' or 'return'
 * @returns {Object} Chart data
 */
function createDayChartData(sortedTrades, endDate, baseValue, chartType) {
    const startDate = new Date(endDate);
    startDate.setHours(startDate.getHours() - 24);
    
    const dayTrades = sortedTrades.filter(t => {
        const tradeDate = parseTradeDateTime(t);
        return tradeDate && tradeDate >= startDate && tradeDate <= endDate;
    });
    
    // Calculate value at start of day
    let cumulativePnlBeforeDay = 0;
    for (const trade of sortedTrades) {
        const tradeDate = parseTradeDateTime(trade);
        if (tradeDate && tradeDate < startDate) {
            cumulativePnlBeforeDay += trade.pnl_usd || 0;
        }
    }
    
    const valueAtDayStart = chartType === 'portfolio'
        ? baseValue + cumulativePnlBeforeDay
        : 0;
    
    if (dayTrades.length === 0) {
        const interval = getDefaultInterval('day');
        const startLabel = formatDateLabel(startDate, 'day', interval);
        const endLabel = formatDateLabel(endDate, 'day', interval);
        return {
            labels: [startLabel, endLabel],
            datasets: [{
                label: chartType === 'portfolio' ? 'Portfolio Value' : 'Total Return %',
                data: [valueAtDayStart, valueAtDayStart],
                borderColor: chartType === 'portfolio' ? '#00ff88' : '#00d4ff',
                backgroundColor: chartType === 'portfolio' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 212, 255, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: chartType === 'portfolio' ? '#00ff88' : '#00d4ff',
                pointBorderColor: '#0a0e27',
                pointBorderWidth: 2,
            }]
        };
    }
    
    // Calculate values for each trade during the day
    const dayTradeDates = [];
    const dayValues = [];
    let dayCumulativePnl = 0;
    
    const divisor = chartType === 'return'
        ? (baseValue + cumulativePnlBeforeDay || baseValue || 1)
        : 1;
    
    for (const trade of dayTrades) {
        const pnl = trade.pnl_usd || 0;
        dayCumulativePnl += pnl;
        
        const value = chartType === 'portfolio'
            ? (baseValue + cumulativePnlBeforeDay + dayCumulativePnl)
            : ((dayCumulativePnl / divisor) * 100);
        
        const tradeDate = parseTradeDateTime(trade);
        if (tradeDate) {
            dayTradeDates.push(tradeDate);
            dayValues.push(value);
        }
    }
    
    const interval = getDefaultInterval('day');
    const { labels, data } = filterAndAggregateByTimeframe(
        dayTradeDates, dayValues, 'day', interval, endDate, valueAtDayStart
    );
    
    return {
        labels,
        datasets: [{
            label: chartType === 'portfolio' ? 'Portfolio Value' : 'Total Return %',
            data: chartType === 'return' ? data.map(v => Math.round(v * 100) / 100) : data,
            borderColor: chartType === 'portfolio' ? '#00ff88' : '#00d4ff',
            backgroundColor: chartType === 'portfolio' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 212, 255, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: chartType === 'portfolio' ? '#00ff88' : '#00d4ff',
            pointBorderColor: '#0a0e27',
            pointBorderWidth: 2,
        }]
    };
}

/**
 * Main execution function
 * 
 * Python equivalent: main()
 */
async function main() {
    console.log('Generating charts...');

    // Load trades index (async in browser, sync in Node.js)
    const indexData = await loadTradesIndex();
    if (!indexData) {
        return;
    }

    const trades = indexData.trades || [];
    
    // Load account config (async in browser, sync in Node.js)
    const accountConfig = await loadAccountConfig();
    
    console.log(`Processing ${trades.length} trades...`);

    // Ensure output directory exists
    ensureDirectorySync('index.directory/assets/charts');

    // Generate all Chart.js data files
    console.log('Generating Chart.js data files...');

    // 1. Equity Curve
    const equityData = generateEquityCurveData(trades);
    saveJsonFileSync('index.directory/assets/charts/equity-curve-data.json', equityData);
    console.log('  ✓ Equity curve data saved');

    // 2. Win/Loss Ratio by Strategy
    const winLossRatioData = generateWinLossRatioByStrategyData(trades);
    saveJsonFileSync('index.directory/assets/charts/win-loss-ratio-by-strategy-data.json', winLossRatioData);
    console.log('  ✓ Win/Loss ratio by strategy data saved');

    // 3. Performance by Day
    const dayData = generatePerformanceByDayData(trades);
    saveJsonFileSync('index.directory/assets/charts/performance-by-day-data.json', dayData);
    console.log('  ✓ Performance by day data saved');

    // 4. Ticker Performance
    const tickerData = generateTickerPerformanceData(trades);
    saveJsonFileSync('index.directory/assets/charts/ticker-performance-data.json', tickerData);
    console.log('  ✓ Ticker performance data saved');
    
    // 5. Time of Day Performance
    const timeOfDayData = generateTimeOfDayPerformanceData(trades);
    saveJsonFileSync('index.directory/assets/charts/time-of-day-performance-data.json', timeOfDayData);
    console.log('  ✓ Time of day performance data saved');
    
    // 6. Portfolio Value Charts (all timeframes)
    console.log('\nGenerating Portfolio Value charts...');
    generatePortfolioValueCharts(trades, accountConfig);
    
    // 7. Total Return Charts (all timeframes)
    console.log('\nGenerating Total Return charts...');
    generateTotalReturnCharts(trades, accountConfig);

    // Generate static charts (PNG images) - not available in JavaScript
    console.log('\nStatic chart generation skipped (matplotlib not available in JavaScript)');
    console.log('Use Chart.js in the browser for interactive charts instead');
}

// Sync helper functions
function ensureDirectorySync(dir) {
    fsSync.mkdirSync(dir, { recursive: true });
}

function saveJsonFileSync(filepath, data) {
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
    generateEquityCurveData,
    generateWinLossRatioByStrategyData,
    generatePerformanceByDayData,
    generateTickerPerformanceData,
    generateTimeOfDayPerformanceData,
    generatePortfolioValueCharts,
    generateTotalReturnCharts
};

// ES Module exports for browser compatibility
export {
    main as generateCharts,
    main as generate,
    generateEquityCurveData,
    generateWinLossRatioByStrategyData,
    generatePerformanceByDayData,
    generateTickerPerformanceData,
    generateTimeOfDayPerformanceData,
    generatePortfolioValueCharts,
    generateTotalReturnCharts,
};
