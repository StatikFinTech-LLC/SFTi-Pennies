#!/usr/bin/env node
/**
 * Common Utilities Module
 * Shared functions used across multiple scripts to avoid code duplication.
 * 
 * This is a comprehensive JavaScript translation of utils.py with full feature parity.
 * All Python functions, classes, logic, and imports are represented here.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

/**
 * Load the trades index JSON file
 * 
 * Python equivalent: load_trades_index()
 * Handles: json.load() with file operations and error handling
 * 
 * @returns {Object|null} The trades index data, or null if file not found
 */
async function loadTradesIndex() {
    try {
        const filePath = path.join(process.cwd(), 'index.directory/trades-index.json');
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('index.directory/trades-index.json not found. Run parse_trades.js first.');
            return null;
        }
        console.error(`Error loading trades index: ${error.message}`);
        return null;
    }
}

/**
 * Synchronous version of loadTradesIndex for scripts that need blocking I/O
 * 
 * @returns {Object|null} The trades index data, or null if file not found
 */
function loadTradesIndexSync() {
    try {
        const filePath = path.join(process.cwd(), 'index.directory/trades-index.json');
        const data = fsSync.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('index.directory/trades-index.json not found. Run parse_trades.js first.');
            return null;
        }
        console.error(`Error loading trades index: ${error.message}`);
        return null;
    }
}

/**
 * Load account configuration with starting balance, deposits, and withdrawals
 * 
 * Python equivalent: load_account_config()
 * Handles: json.load() with defaults if file not found
 * 
 * Note:
 *     Default starting_balance is 0 to match the repository's account-config.json
 * 
 * @returns {Object} Account configuration data with defaults if file not found
 */
async function loadAccountConfig() {
    try {
        const filePath = path.join(process.cwd(), 'index.directory/account-config.json');
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('index.directory/account-config.json not found, using defaults');
        } else {
            console.error(`Error loading account config: ${error.message}`);
        }
        return {
            starting_balance: 0,
            deposits: [],
            withdrawals: [],
            version: '1.0'
        };
    }
}

/**
 * Synchronous version of loadAccountConfig
 * 
 * @returns {Object} Account configuration data with defaults if file not found
 */
function loadAccountConfigSync() {
    try {
        const filePath = path.join(process.cwd(), 'index.directory/account-config.json');
        const data = fsSync.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('index.directory/account-config.json not found, using defaults');
        } else {
            console.error(`Error loading account config: ${error.message}`);
        }
        return {
            starting_balance: 0,
            deposits: [],
            withdrawals: [],
            version: '1.0'
        };
    }
}

/**
 * Calculate statistics for a group of trades.
 * Shared function used by generate_summaries.js and other scripts.
 * 
 * Python equivalent: calculate_period_stats(trades)
 * Handles: defaultdict(lambda: {...}) with single-pass calculation
 * Note: JavaScript objects are used instead of Python's defaultdict
 * 
 * @param {Array} trades - List of trade dictionaries
 * @returns {Object} Period statistics including wins, losses, P&L, best/worst trades
 */
function calculatePeriodStats(trades) {
    if (!trades || trades.length === 0) {
        return {};
    }

    const totalTrades = trades.length;
    
    // Single pass to calculate all metrics
    let winCount = 0;
    let lossCount = 0;
    let totalPnl = 0.0;
    let totalVolume = 0;
    let bestTrade = null;
    let worstTrade = null;
    let bestPnl = -Infinity;  // Python's float('-inf')
    let worstPnl = Infinity;   // Python's float('inf')
    
    // Strategy breakdown using object for efficiency (replaces Python's defaultdict)
    const strategies = {};
    
    for (const trade of trades) {
        const pnl = trade.pnl_usd || 0;
        totalPnl += pnl;
        totalVolume += trade.position_size || 0;
        
        // Track wins/losses
        if (pnl > 0) {
            winCount += 1;
        } else if (pnl < 0) {
            lossCount += 1;
        }
        
        // Track best/worst trades
        if (pnl > bestPnl) {
            bestPnl = pnl;
            bestTrade = trade;
        }
        if (pnl < worstPnl) {
            worstPnl = pnl;
            worstTrade = trade;
        }
        
        // Update strategy breakdown
        const strategy = trade.strategy || 'Unknown';
        if (!strategies[strategy]) {
            strategies[strategy] = { count: 0, pnl: 0.0 };
        }
        strategies[strategy].count += 1;
        strategies[strategy].pnl += pnl;
    }

    // Use first trade as fallback if no best/worst found
    if (bestTrade === null) {
        bestTrade = trades[0];
    }
    if (worstTrade === null) {
        worstTrade = trades[0];
    }

    return {
        total_trades: totalTrades,
        winning_trades: winCount,
        losing_trades: lossCount,
        win_rate: totalTrades > 0 ? Math.round(winCount / totalTrades * 100 * 100) / 100 : 0,
        total_pnl: Math.round(totalPnl * 100) / 100,
        avg_pnl: totalTrades > 0 ? Math.round((totalPnl / totalTrades) * 100) / 100 : 0,
        best_trade: {
            ticker: bestTrade.ticker,
            pnl: Math.round((bestTrade.pnl_usd || 0) * 100) / 100,
            trade_number: bestTrade.trade_number,
        },
        worst_trade: {
            ticker: worstTrade.ticker,
            pnl: Math.round((worstTrade.pnl_usd || 0) * 100) / 100,
            trade_number: worstTrade.trade_number,
        },
        total_volume: totalVolume,
        strategies: strategies,
    };
}

// Export all functions for use in other modules
module.exports = {
    loadTradesIndex,
    loadTradesIndexSync,
    loadAccountConfig,
    loadAccountConfigSync,
    calculatePeriodStats
};

// ES Module exports for browser compatibility
export { loadTradesIndex, loadTradesIndexSync, loadAccountConfig, loadAccountConfigSync, calculatePeriodStats };
