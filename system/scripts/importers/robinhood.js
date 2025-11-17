/**
 * Robinhood CSV Importer
 * Parses Robinhood account statement CSV exports
 * 
 * Python equivalent: .github/scripts/importers/robinhood.py
 */

const BaseImporter = require('./base_importer');

/**
 * Robinhood CSV importer
 * 
 * Supports:
 * - Account statement exports
 * - Transaction history
 * 
 * Reference: Robinhood > Account > Statements & History
 * 
 * @class
 * @extends BaseImporter
 */
class RobinhoodImporter extends BaseImporter {
    constructor() {
        super();
        this._brokerName = "Robinhood";
        this._supportedFormats = ["Account Statements", "Transaction History"];
    }

    /**
     * Detect Robinhood CSV format
     * 
     * Robinhood CSVs typically have headers like:
     * - "Activity Date,Process Date,Settle Date,Instrument,Description,Trans Code,Quantity,Price,Amount"
     * 
     * @param {string} csvContent - Raw CSV content
     * @returns {boolean} True if format is detected as Robinhood
     */
    detectFormat(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length === 0) {
            return false;
        }

        const header = lines[0].toLowerCase();

        // Look for Robinhood-specific indicators
        const rhIndicators = [
            'activity date',
            'process date',
            'settle date',
            'instrument',
            'trans code',
            'quantity',
            'price',
            'amount'
        ];

        const matches = rhIndicators.filter(ind => header.includes(ind)).length;

        return matches >= 5;
    }

    /**
     * Parse Robinhood CSV into standard trade format
     * 
     * Robinhood CSV structure (example):
     * Activity Date, Process Date, Settle Date, Instrument, Description, Trans Code, Quantity, Price, Amount
     * 01/15/2025, 01/15/2025, 01/17/2025, AAPL, APPLE INC, Buy, 10, 150.25, -1502.50
     * 01/16/2025, 01/16/2025, 01/18/2025, AAPL, APPLE INC, Sell, 10, 152.50, 1525.00
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

            // Filter by Trans Code (Buy/Sell only)
            const transCode = (row['Trans Code'] || row['trans_code'] || '').trim().toUpperCase();
            if (!['BUY', 'SELL'].includes(transCode)) {
                continue;
            }

            // Get symbol
            const symbol = (row['Instrument'] || row['instrument'] || '').trim().toUpperCase();
            if (!symbol) continue;

            // Parse date (MM/DD/YYYY)
            const dateStr = row['Activity Date'] || row['activity_date'] || '';
            if (!dateStr) continue;

            let dateObj;
            try {
                if (dateStr.includes('/')) {
                    const [month, day, year] = dateStr.trim().split('/');
                    dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } else {
                    dateObj = new Date(dateStr.trim());
                }
            } catch (e) {
                continue;
            }

            // Parse quantity
            const qtyStr = row['Quantity'] || row['quantity'] || '0';
            let quantity;
            try {
                quantity = Math.abs(parseFloat(qtyStr.replace(/,/g, '')));
            } catch (e) {
                quantity = 0.0;
            }

            // Parse price
            const priceStr = row['Price'] || row['price'] || '0';
            let price;
            try {
                price = Math.abs(parseFloat(priceStr.replace(/,/g, '').replace('$', '')));
            } catch (e) {
                price = 0.0;
            }

            transactions.push({
                symbol: symbol,
                datetime: dateObj,
                quantity: quantity,
                price: price,
                direction: transCode,
                commission: 0.0  // Robinhood is commission-free
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
                    position_size: parseInt(buy.quantity),
                    direction: 'LONG',
                    broker: this._brokerName,
                    notes: 'Imported from Robinhood CSV'
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
     * Validate Robinhood trade data with broker-specific rules
     * 
     * @param {Object} trade - Trade object to validate
     * @returns {Array} [isValid, errors] - Validation result and error messages
     */
    validateTrade(trade) {
        let [isValid, errors] = this._validateRequiredFields(trade);

        // Robinhood-specific validation
        // Check for fractional shares (Robinhood supports fractional trading)
        const positionSize = trade.position_size || 0;
        if (typeof positionSize === 'number' && positionSize < 1 && positionSize > 0) {
            // Fractional shares are valid on Robinhood, just note it
            // No error needed
        } else if (positionSize <= 0) {
            errors.push('Position size must be positive');
            isValid = false;
        }

        // Check for reasonable price ranges
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

        return [isValid, errors];
    }

    /**
     * Get sample Robinhood field mapping
     * 
     * @returns {Object} Sample field mapping documentation
     */
    getSampleMapping() {
        return {
            'Activity Date': 'entry_date / exit_date',
            'Instrument': 'ticker',
            'Trans Code': 'direction (Buy/Sell)',
            'Quantity': 'position_size',
            'Price': 'entry_price / exit_price',
            'Amount': 'calculated total (negative for buys)'
        };
    }
}

module.exports = RobinhoodImporter;
