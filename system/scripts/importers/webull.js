/**
 * Webull CSV Importer
 * Parses Webull transaction history CSV exports
 * 
 * Python equivalent: .github/scripts/importers/webull.py
 */

const BaseImporter = require('./base_importer');

/**
 * Webull CSV importer
 * 
 * Supports:
 * - Transaction history exports
 * - Account statements
 * 
 * Reference: Webull > Me > Statements
 * 
 * @class
 * @extends BaseImporter
 */
class WebullImporter extends BaseImporter {
    constructor() {
        super();
        this._brokerName = "Webull";
        this._supportedFormats = ["Transaction History", "Account Statements"];
    }

    /**
     * Detect Webull CSV format
     * 
     * Webull CSVs typically have headers like:
     * - "Time,Symbol,Side,Filled/Quantity,Filled Avg Price,Total,Status"
     * 
     * @param {string} csvContent - Raw CSV content
     * @returns {boolean} True if format is detected as Webull
     */
    detectFormat(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length === 0) {
            return false;
        }

        const header = lines[0].toLowerCase();

        // Look for Webull-specific indicators
        const webullIndicators = [
            'time',
            'symbol',
            'side',
            'filled/quantity',
            'filled avg price',
            'total',
            'status'
        ];

        const matches = webullIndicators.filter(ind => header.includes(ind)).length;

        return matches >= 4;
    }

    /**
     * Parse Webull CSV into standard trade format
     * 
     * Webull CSV structure (example):
     * Time, Symbol, Side, Filled/Quantity, Filled Avg Price, Total, Status
     * 2025-01-15 09:30:15, AAPL, Buy, 100/100, 150.25, -15025.00, Filled
     * 2025-01-16 14:25:30, AAPL, Sell, 100/100, 152.50, 15250.00, Filled
     * 
     * @param {string} csvContent - Raw CSV content
     * @returns {Array<Object>} Array of parsed trades
     */
    parseCsv(csvContent) {
        const transactions = [];
        const lines = csvContent.trim().split('\n');
        
        if (lines.length < 2) {
            return [];
        }

        // Parse header
        const headers = this._parseCsvLine(lines[0]);
        const headerMap = {};
        headers.forEach((h, i) => {
            headerMap[h.toLowerCase().trim()] = i;
        });

        // Parse rows
        for (let i = 1; i < lines.length; i++) {
            const values = this._parseCsvLine(lines[i]);
            if (values.length === 0) continue;

            const row = {};
            headers.forEach((h, idx) => {
                row[h] = values[idx] || '';
            });

            // Filter by Status (Filled only)
            const status = (row['Status'] || row['status'] || '').trim().toUpperCase();
            if (status !== 'FILLED') {
                continue;
            }

            // Get symbol
            const symbol = (row['Symbol'] || row['symbol'] || '').trim().toUpperCase();
            if (!symbol) continue;

            // Parse timestamp (YYYY-MM-DD HH:MM:SS)
            const timeStr = row['Time'] || row['time'] || '';
            if (!timeStr) continue;

            let dateObj;
            try {
                // Try YYYY-MM-DD HH:MM:SS format
                const parts = timeStr.trim().split(' ');
                if (parts.length >= 2) {
                    const [datePart, timePart] = parts;
                    const [year, month, day] = datePart.split('-').map(x => parseInt(x));
                    const [hour, minute, second] = timePart.split(':').map(x => parseInt(x));
                    dateObj = new Date(year, month - 1, day, hour, minute, second || 0);
                } else {
                    throw new Error('Invalid date format');
                }
            } catch (e) {
                // Try MM/DD/YYYY HH:MM:SS format as fallback
                try {
                    const parts = timeStr.trim().split(' ');
                    if (parts.length >= 2) {
                        const [datePart, timePart] = parts;
                        const [month, day, year] = datePart.split('/').map(x => parseInt(x));
                        const [hour, minute, second] = timePart.split(':').map(x => parseInt(x));
                        dateObj = new Date(year, month - 1, day, hour, minute, second || 0);
                    } else {
                        continue;
                    }
                } catch (e2) {
                    continue;
                }
            }

            // Parse side
            const side = (row['Side'] || row['side'] || '').trim().toUpperCase();
            if (!['BUY', 'SELL'].includes(side)) {
                continue;
            }

            // Parse quantity from "Filled/Quantity" format (e.g., "100/100")
            const filledQty = row['Filled/Quantity'] || row['filled/quantity'] || '0/0';
            let quantity;
            try {
                quantity = parseInt(filledQty.split('/')[0]);
            } catch (e) {
                quantity = 0;
            }

            // Parse price
            const priceStr = row['Filled Avg Price'] || row['filled_avg_price'] || '0';
            let price;
            try {
                price = parseFloat(priceStr.replace(/,/g, '').replace('$', ''));
            } catch (e) {
                price = 0.0;
            }

            transactions.push({
                symbol: symbol,
                datetime: dateObj,
                quantity: quantity,
                price: price,
                direction: side,
                commission: 0.0  // Webull is commission-free for stocks
            });
        }

        // Match entry/exit pairs
        const trades = this._matchTransactions(transactions);
        return trades;
    }

    /**
     * Parse a single CSV line handling quotes and commas
     * @private
     */
    _parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }

    /**
     * Match buy/sell transactions into complete trades
     * @private
     */
    _matchTransactions(transactions) {
        const trades = [];
        let tradeNum = 1;

        // Group by symbol
        const bySymbol = {};
        for (const t of transactions) {
            if (!bySymbol[t.symbol]) {
                bySymbol[t.symbol] = [];
            }
            bySymbol[t.symbol].push(t);
        }

        // Match pairs
        for (const [symbol, txns] of Object.entries(bySymbol)) {
            txns.sort((a, b) => a.datetime - b.datetime);

            const buys = txns.filter(t => t.direction === 'BUY');
            const sells = txns.filter(t => t.direction === 'SELL');

            const minLen = Math.min(buys.length, sells.length);
            for (let i = 0; i < minLen; i++) {
                const buy = buys[i];
                const sell = sells[i];

                let trade = {
                    trade_number: tradeNum,
                    ticker: symbol,
                    entry_date: this._formatDate(buy.datetime),
                    entry_time: this._formatTime(buy.datetime),
                    entry_price: buy.price,
                    exit_date: this._formatDate(sell.datetime),
                    exit_time: this._formatTime(sell.datetime),
                    exit_price: sell.price,
                    position_size: buy.quantity,
                    direction: 'LONG',
                    broker: this._brokerName,
                    notes: 'Imported from Webull CSV'
                };

                trade = this._calculatePnl(trade);
                trades.push(trade);
                tradeNum++;
            }
        }

        return trades;
    }

    /**
     * Format date as YYYY-MM-DD
     * @private
     */
    _formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Format time as HH:MM:SS
     * @private
     */
    _formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    /**
     * Validate Webull trade data with broker-specific rules
     * 
     * @param {Object} trade - Trade object to validate
     * @returns {Array} [isValid, errors] - Validation result and error messages
     */
    validateTrade(trade) {
        let [isValid, errors] = this._validateRequiredFields(trade);

        // Webull-specific validation
        // Check for reasonable price ranges (penny stocks typically $0.01 - $50)
        const entryPrice = parseFloat(trade.entry_price || 0);
        const exitPrice = parseFloat(trade.exit_price || 0);

        if (entryPrice <= 0) {
            errors.push('Entry price must be positive');
            isValid = false;
        } else if (entryPrice > 10000) {
            errors.push(`Entry price $${entryPrice} seems unusually high`);
        }

        if (exitPrice <= 0) {
            errors.push('Exit price must be positive');
            isValid = false;
        } else if (exitPrice > 10000) {
            errors.push(`Exit price $${exitPrice} seems unusually high`);
        }

        // Check position size is reasonable
        const positionSize = parseInt(trade.position_size || 0);
        if (positionSize <= 0) {
            errors.push('Position size must be positive');
            isValid = false;
        }

        return [isValid, errors];
    }

    /**
     * Get sample Webull field mapping
     * 
     * @returns {Object} Sample field mapping documentation
     */
    getSampleMapping() {
        return {
            'Time': 'entry_date + entry_time / exit_date + exit_time',
            'Symbol': 'ticker',
            'Side': 'direction (Buy=LONG, Sell=exit)',
            'Filled/Quantity': 'position_size',
            'Filled Avg Price': 'entry_price / exit_price',
            'Total': 'calculated total',
            'Status': 'filter (Filled only)'
        };
    }
}

module.exports = WebullImporter;
