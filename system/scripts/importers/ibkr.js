#!/usr/bin/env node
/**
 * Interactive Brokers (IBKR) CSV Importer
 * Parses IBKR Flex Query or Activity Statement CSV exports
 * 
 * This is a comprehensive JavaScript translation of importers/ibkr.py with full feature parity.
 * 
 * Supports:
 * - Flex Query exports
 * - Activity Statement CSV
 * - Trade Confirmation reports
 * 
 * Reference: https://www.interactivebrokers.com/en/software/reportguide/reportguide.htm
 */

const { BaseImporter } = require('./base_importer');

/**
 * IBKR CSV importer
 * 
 * Python equivalent: class IBKRImporter(BaseImporter)
 */
class IBKRImporter extends BaseImporter {
    /**
     * Initialize IBKR importer
     * 
     * Python equivalent: def __init__(self)
     */
    constructor() {
        super();
        this.brokerName = "Interactive Brokers";
        this.supportedFormats = ["Flex Query", "Activity Statement"];
    }

    /**
     * Detect IBKR CSV format
     * 
     * IBKR CSVs typically have headers like:
     * - "Trades,Header,..."
     * - "DataDiscriminator,Asset Category,..."
     * - Or specific IBKR field names
     * 
     * Python equivalent: def detect_format(self, csv_content: str) -> bool
     * 
     * @param {string} csvContent - Raw CSV content
     * @returns {boolean} True if format matches, False otherwise
     */
    detectFormat(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length === 0) {
            return false;
        }

        const header = lines[0].toLowerCase();

        // Look for IBKR-specific indicators
        const ibkrIndicators = [
            "symbol",
            "date/time",
            "quantity",
            "proceeds",
            "comm/fee",
            "basis",
            "realized p/l",
            "datadiscriminator",
            "asset category",
        ];

        // Check if header contains IBKR-specific fields
        let matches = 0;
        for (const indicator of ibkrIndicators) {
            if (header.includes(indicator)) {
                matches++;
            }
        }

        return matches >= 3;
    }

    /**
     * Parse IBKR CSV into standard trade format
     * 
     * IBKR CSV structure (example):
     * - Symbol, Date/Time, Quantity, T. Price, C. Price, Proceeds, Comm/Fee, Basis, Realized P/L
     * - Or: DataDiscriminator, Asset Category, Currency, Symbol, Date/Time, ...
     * 
     * Steps:
     * 1. Identify CSV variant (Flex Query vs Activity Statement)
     * 2. Parse rows into standardized format
     * 3. Match entry/exit pairs for complete trades
     * 4. Calculate P&L and metrics
     * 
     * Python equivalent: def parse_csv(self, csv_content: str) -> List[Dict]
     * 
     * @param {string} csvContent - Raw CSV content
     * @returns {Array<Object>} List of trade objects in standard format
     */
    parseCsv(csvContent) {
        const trades = [];
        const transactions = [];

        // Parse CSV and collect all transactions
        // Python equivalent: reader = csv.DictReader(StringIO(csv_content))
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) {
            return trades;
        }

        // Parse header
        const header = lines[0].split(',').map(h => h.trim().replace(/^"/, '').replace(/"$/, ''));
        
        // Parse each row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            // Simple CSV parsing (handles basic cases, could be enhanced with proper CSV library)
            const values = this._parseCsvLine(line);
            const row = {};
            for (let j = 0; j < header.length && j < values.length; j++) {
                row[header[j]] = values[j];
            }

            // Map IBKR fields to standard format
            const symbol = (row['Symbol'] || row['symbol'] || '').trim().toUpperCase();
            if (!symbol) {
                continue;
            }

            // Parse date/time from IBKR format (YYYY-MM-DD HH:MM:SS or variations)
            const dateTimeStr = row['Date/Time'] || row['DateTime'] || row['date/time'] || '';
            if (!dateTimeStr) {
                continue;
            }

            let dt;
            try {
                // Try parsing full datetime: YYYY-MM-DD HH:MM:SS
                dt = this._parseDateTime(dateTimeStr.trim());
            } catch (error) {
                try {
                    // Try parsing just date: YYYY-MM-DD
                    const dateOnly = dateTimeStr.trim().split(' ')[0];
                    dt = this._parseDateTime(dateOnly + ' 00:00:00');
                } catch (error2) {
                    continue;
                }
            }

            // Parse quantity and prices
            const quantityStr = row['Quantity'] || row['quantity'] || '0';
            let quantity;
            try {
                quantity = parseInt(parseFloat(quantityStr.replace(/,/g, '')));
            } catch (error) {
                quantity = 0;
            }

            const priceStr = row['T. Price'] || row['Price'] || row['price'] || '0';
            let price;
            try {
                price = parseFloat(priceStr.replace(/,/g, ''));
            } catch (error) {
                price = 0.0;
            }

            // Detect direction (buy/sell) - positive quantity = buy, negative = sell
            const direction = quantity > 0 ? 'BUY' : 'SELL';

            transactions.push({
                symbol: symbol,
                datetime: dt,
                quantity: Math.abs(quantity),
                price: price,
                direction: direction,
                commission: this._parseCommission(row)
            });
        }

        // Match entry/exit pairs for complete trades
        return this._matchTransactions(transactions);
    }

    /**
     * Parse a CSV line handling quotes and commas
     * 
     * Note: This is a simple implementation. For production use, consider using a proper CSV library.
     * 
     * @param {string} line - CSV line
     * @returns {Array<string>} Array of values
     * @private
     */
    _parseCsvLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        return values;
    }

    /**
     * Parse datetime string
     * 
     * Python equivalent: datetime.strptime(date_time_str.strip(), "%Y-%m-%d %H:%M:%S")
     * 
     * @param {string} dateTimeStr - Date/time string in format YYYY-MM-DD HH:MM:SS
     * @returns {Date} JavaScript Date object
     * @private
     */
    _parseDateTime(dateTimeStr) {
        // Format: YYYY-MM-DD HH:MM:SS
        const parts = dateTimeStr.trim().split(' ');
        const datePart = parts[0];
        const timePart = parts[1] || '00:00:00';

        const [year, month, day] = datePart.split('-').map(n => parseInt(n));
        const [hour, minute, second] = timePart.split(':').map(n => parseInt(n));

        return new Date(year, month - 1, day, hour, minute, second);
    }

    /**
     * Parse commission from row
     * 
     * Python equivalent: def _parse_commission(self, row: Dict) -> float
     * 
     * @param {Object} row - CSV row object
     * @returns {number} Commission amount
     * @private
     */
    _parseCommission(row) {
        const commStr = row['Comm/Fee'] || row['Commission'] || row['commission'] || '0';
        try {
            return Math.abs(parseFloat(commStr.replace(/,/g, '')));
        } catch (error) {
            return 0.0;
        }
    }

    /**
     * Match buy/sell transactions into complete trades
     * 
     * Python equivalent: def _match_transactions(self, transactions: List[Dict]) -> List[Dict]
     * 
     * @param {Array<Object>} transactions - List of transaction objects
     * @returns {Array<Object>} List of matched trade objects
     * @private
     */
    _matchTransactions(transactions) {
        const trades = [];
        let tradeNum = 1;

        // Group transactions by symbol
        const bySymbol = {};
        for (const t of transactions) {
            if (!(t.symbol in bySymbol)) {
                bySymbol[t.symbol] = [];
            }
            bySymbol[t.symbol].push(t);
        }

        // Match pairs for each symbol
        for (const [symbol, txns] of Object.entries(bySymbol)) {
            // Sort by datetime
            txns.sort((a, b) => a.datetime - b.datetime);

            // Simple FIFO matching
            const buys = txns.filter(t => t.direction === 'BUY');
            const sells = txns.filter(t => t.direction === 'SELL');

            // Match buy/sell pairs
            const minLength = Math.min(buys.length, sells.length);
            for (let i = 0; i < minLength; i++) {
                const buy = buys[i];
                const sell = sells[i];

                const trade = {
                    trade_number: tradeNum,
                    ticker: symbol,
                    entry_date: this._formatDate(buy.datetime),
                    entry_time: this._formatTime(buy.datetime),
                    entry_price: buy.price,
                    exit_date: this._formatDate(sell.datetime),
                    exit_time: this._formatTime(sell.datetime),
                    exit_price: sell.price,
                    position_size: buy.quantity,
                    direction: "LONG",
                    broker: this.brokerName,
                    notes: "Imported from IBKR CSV"
                };

                // Calculate P&L
                trade = this._calculatePnl(trade);
                trades.push(trade);
                tradeNum++;
            }
        }

        return trades;
    }

    /**
     * Format date to YYYY-MM-DD
     * 
     * Python equivalent: buy["datetime"].strftime("%Y-%m-%d")
     * 
     * @param {Date} date - JavaScript Date object
     * @returns {string} Formatted date string
     * @private
     */
    _formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Format time to HH:MM:SS
     * 
     * Python equivalent: buy["datetime"].strftime("%H:%M:%S")
     * 
     * @param {Date} date - JavaScript Date object
     * @returns {string} Formatted time string
     * @private
     */
    _formatTime(date) {
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        return `${hour}:${minute}:${second}`;
    }

    /**
     * Validate IBKR trade data with IBKR-specific rules
     * 
     * Python equivalent: def validate_trade(self, trade: Dict) -> tuple[bool, List[str]]
     * 
     * @param {Object} trade - Trade object
     * @returns {Object} {isValid: boolean, errors: Array<string>}
     */
    validateTrade(trade) {
        const result = this._validateRequiredFields(trade);

        // Add IBKR-specific validation if needed
        // - Check for valid IBKR symbols
        // - Validate commission structures
        // - Check for split/reverse split indicators

        return result;
    }

    /**
     * Get sample IBKR field mapping
     * 
     * Returns sample mapping for documentation/reference
     * 
     * Python equivalent: def get_sample_mapping(self) -> Dict
     * 
     * @returns {Object} Sample field mapping
     */
    getSampleMapping() {
        return {
            "Symbol": "ticker",
            "Date/Time": "entry_date + entry_time",
            "Quantity": "position_size",
            "T. Price": "entry_price / exit_price",
            "Proceeds": "calculated from price * quantity",
            "Comm/Fee": "commission (separate field)",
            "Realized P/L": "pnl_usd"
        };
    }
}

module.exports = { IBKRImporter };
