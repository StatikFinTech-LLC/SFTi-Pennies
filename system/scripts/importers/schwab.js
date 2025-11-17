/**
 * TD Ameritrade / Charles Schwab CSV Importer
 * Parses Schwab transaction history CSV exports
 * 
 * Note: TD Ameritrade merged with Schwab, so this handles both formats
 * 
 * Python equivalent: .github/scripts/importers/schwab.py
 */

const BaseImporter = require('./base_importer');

/**
 * Schwab/TD Ameritrade CSV importer
 * 
 * Supports:
 * - Schwab transaction history exports
 * - TD Ameritrade legacy formats
 * - Combined Schwab/TDA CSV
 * 
 * Reference: Schwab > Accounts > History > Export
 * 
 * @class
 * @extends BaseImporter
 */
class SchwabImporter extends BaseImporter {
    constructor() {
        super();
        this._brokerName = "Charles Schwab";
        this._supportedFormats = ["Transaction History", "TD Ameritrade History"];
    }

    /**
     * Detect Schwab/TDA CSV format
     * 
     * Schwab CSVs typically have headers like:
     * - "Date,Action,Symbol,Description,Quantity,Price,Fees & Comm,Amount"
     * - Or TDA specific headers
     * 
     * @param {string} csvContent - Raw CSV content
     * @returns {boolean} True if format is detected as Schwab/TDA
     */
    detectFormat(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length === 0) {
            return false;
        }

        const header = lines[0].toLowerCase();

        // Look for Schwab/TDA-specific indicators
        const schwabIndicators = [
            'action',
            'symbol',
            'description',
            'quantity',
            'price',
            'fees & comm',
            'amount'
        ];

        const tdaIndicators = [
            'trade date',
            'exec time',
            'symbol',
            'side',
            'qty',
            'pos effect',
            'net price'
        ];

        const matches = schwabIndicators.filter(ind => header.includes(ind)).length;
        const tdaMatches = tdaIndicators.filter(ind => header.includes(ind)).length;

        return matches >= 4 || tdaMatches >= 4;
    }

    /**
     * Parse Schwab/TDA CSV into standard trade format
     * 
     * Schwab CSV structure (example):
     * Date, Action, Symbol, Description, Quantity, Price, Fees & Comm, Amount
     * 01/15/2025, Buy, AAPL, APPLE INC, 100, 150.25, 0.00, -15025.00
     * 01/16/2025, Sell, AAPL, APPLE INC, 100, 152.50, 0.00, 15250.00
     * 
     * TDA CSV structure (example):
     * Trade Date, Exec Time, Symbol, Side, Qty, Pos Effect, Net Price, Comm, Fees
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

            // Map Schwab fields to standard format
            const symbol = (row['Symbol'] || row['symbol'] || '').trim().toUpperCase();
            if (!symbol) continue;

            // Parse date (MM/DD/YYYY or YYYY-MM-DD)
            const dateStr = row['Date'] || row['Trade Date'] || '';
            const timeStr = row['Time'] || row['Exec Time'] || '09:30:00';

            if (!dateStr) continue;

            let dateObj;
            try {
                if (dateStr.includes('/')) {
                    // MM/DD/YYYY format
                    const [month, day, year] = dateStr.trim().split('/');
                    dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } else {
                    // YYYY-MM-DD format
                    dateObj = new Date(dateStr.trim());
                }
            } catch (e) {
                continue;
            }

            // Parse time if available
            try {
                if (timeStr && timeStr.includes(':')) {
                    const timeParts = timeStr.trim().split(':');
                    dateObj.setHours(
                        parseInt(timeParts[0]),
                        parseInt(timeParts[1]),
                        timeParts.length > 2 ? parseInt(timeParts[2]) : 0
                    );
                }
            } catch (e) {
                // Keep default time
            }

            // Detect action/direction
            const action = (row['Action'] || row['Side'] || '').trim().toUpperCase();
            let direction;
            if (action.includes('BUY')) {
                direction = 'BUY';
            } else if (action.includes('SELL')) {
                direction = 'SELL';
            } else {
                continue;
            }

            // Parse quantity
            const qtyStr = row['Quantity'] || row['Qty'] || '0';
            let quantity;
            try {
                quantity = parseInt(parseFloat(qtyStr.replace(/,/g, '')));
            } catch (e) {
                quantity = 0;
            }

            // Parse price
            const priceStr = row['Price'] || row['Net Price'] || '0';
            let price;
            try {
                price = parseFloat(priceStr.replace(/,/g, '').replace('$', ''));
            } catch (e) {
                price = 0.0;
            }

            // Parse commission
            const commStr = row['Fees & Comm'] || row['Comm'] || '0';
            let commission;
            try {
                commission = Math.abs(parseFloat(commStr.replace(/,/g, '').replace('$', '')));
            } catch (e) {
                commission = 0.0;
            }

            transactions.push({
                symbol: symbol,
                datetime: dateObj,
                quantity: Math.abs(quantity),
                price: price,
                direction: direction,
                commission: commission
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

        // Match pairs for each symbol
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
                    notes: 'Imported from Schwab CSV'
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
     * Validate Schwab/TDA trade data with broker-specific rules
     * 
     * @param {Object} trade - Trade object to validate
     * @returns {Array} [isValid, errors] - Validation result and error messages
     */
    validateTrade(trade) {
        let [isValid, errors] = this._validateRequiredFields(trade);

        // Schwab-specific validation
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

        // Check position size is reasonable and whole number
        // (Schwab doesn't support fractional shares for penny stocks)
        const positionSize = trade.position_size || 0;
        if (positionSize <= 0) {
            errors.push('Position size must be positive');
            isValid = false;
        } else if (typeof positionSize === 'number' && positionSize !== parseInt(positionSize)) {
            errors.push('Schwab does not support fractional shares for most stocks');
        }

        return [isValid, errors];
    }

    /**
     * Get sample Schwab field mapping
     * 
     * @returns {Object} Sample field mapping documentation
     */
    getSampleMapping() {
        return {
            'Date': 'entry_date / exit_date',
            'Action': 'direction (Buy=LONG, Sell=exit)',
            'Symbol': 'ticker',
            'Quantity': 'position_size',
            'Price': 'entry_price / exit_price',
            'Fees & Comm': 'commission',
            'Amount': 'calculated total'
        };
    }
}

module.exports = SchwabImporter;
