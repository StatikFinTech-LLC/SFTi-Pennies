#!/usr/bin/env node
/**
 * Base Importer Class
 * Abstract interface for broker CSV importers
 * 
 * This is a comprehensive JavaScript translation of importers/base_importer.py with full feature parity.
 * 
 * Python equivalent: class BaseImporter(ABC)
 */

/**
 * Abstract base class for broker CSV importers
 * 
 * All broker-specific importers should extend this class and implement
 * the required methods.
 * 
 * Python equivalent: class BaseImporter(ABC)
 * 
 * Note: JavaScript doesn't have built-in abstract classes like Python's ABC,
 * but we enforce the pattern by throwing errors if abstract methods aren't implemented.
 */
class BaseImporter {
    /**
     * Initialize the importer
     * 
     * Python equivalent: def __init__(self)
     */
    constructor() {
        this.brokerName = "Unknown";
        this.supportedFormats = [];
    }

    /**
     * Detect if CSV matches this broker's format
     * 
     * Python equivalent: @abstractmethod def detect_format(self, csv_content: str) -> bool
     * 
     * @param {string} csvContent - Raw CSV content
     * @returns {boolean} True if format matches, False otherwise
     * @abstract
     */
    detectFormat(csvContent) {
        throw new Error('detectFormat() must be implemented by subclass');
    }

    /**
     * Parse CSV content into standardized trade format
     * 
     * Python equivalent: @abstractmethod def parse_csv(self, csv_content: str) -> List[Dict]
     * 
     * Standard trade format:
     * {
     *     trade_number: number,
     *     ticker: string,
     *     entry_date: string (ISO format),
     *     entry_time: string (HH:MM:SS),
     *     entry_price: number,
     *     exit_date: string (ISO format),
     *     exit_time: string (HH:MM:SS),
     *     exit_price: number,
     *     position_size: number,
     *     direction: string ('LONG' or 'SHORT'),
     *     broker: string,
     *     pnl_usd: number,
     *     pnl_percent: number,
     *     strategy: string (optional),
     *     notes: string (optional)
     * }
     * 
     * @param {string} csvContent - Raw CSV content
     * @returns {Array<Object>} List of trade objects in standard format
     * @abstract
     */
    parseCsv(csvContent) {
        throw new Error('parseCsv() must be implemented by subclass');
    }

    /**
     * Validate a parsed trade
     * 
     * Python equivalent: @abstractmethod def validate_trade(self, trade: Dict) -> tuple[bool, List[str]]
     * 
     * @param {Object} trade - Trade object
     * @returns {Array} [isValid: boolean, errors: Array<string>]
     * @abstract
     */
    validateTrade(trade) {
        throw new Error('validateTrade() must be implemented by subclass');
    }

    /**
     * Get the broker name
     * 
     * Python equivalent: def get_broker_name(self) -> str
     * 
     * @returns {string} Broker name
     */
    getBrokerName() {
        return this.brokerName;
    }

    /**
     * Get list of supported CSV formats
     * 
     * Python equivalent: def get_supported_formats(self) -> List[str]
     * 
     * @returns {Array<string>} List of supported CSV formats
     */
    getSupportedFormats() {
        return this.supportedFormats;
    }

    /**
     * Get sample field mapping for this broker
     * 
     * Python equivalent: def get_sample_mapping(self) -> Dict
     * 
     * @returns {Object} Sample field mapping showing broker fields -> standard fields
     */
    getSampleMapping() {
        return {
            "broker_field_1": "standard_field_1",
            "broker_field_2": "standard_field_2",
            // Implement in subclass for specific broker mappings
        };
    }

    /**
     * Validate that required fields are present
     * 
     * Python equivalent: def _validate_required_fields(self, trade: Dict) -> tuple[bool, List[str]]
     * 
     * @param {Object} trade - Trade object
     * @returns {Object} {isValid: boolean, errors: Array<string>}
     * @protected
     */
    _validateRequiredFields(trade) {
        const requiredFields = [
            "ticker",
            "entry_date",
            "entry_price",
            "exit_price",
            "position_size",
            "direction",
        ];

        const errors = [];
        for (const field of requiredFields) {
            if (!(field in trade) || trade[field] === null || trade[field] === undefined) {
                errors.push(`Missing required field: ${field}`);
            }
        }

        return [errors.length === 0, errors];
    }

    /**
     * Calculate P&L if not already present
     * 
     * Python equivalent: def _calculate_pnl(self, trade: Dict) -> Dict
     * 
     * @param {Object} trade - Trade object
     * @returns {Object} Trade with calculated P&L fields
     * @protected
     */
    _calculatePnl(trade) {
        // Calculate pnl_usd if not present
        if (!('pnl_usd' in trade) || trade.pnl_usd === null || trade.pnl_usd === undefined) {
            const entryPrice = parseFloat(trade.entry_price || 0);
            const exitPrice = parseFloat(trade.exit_price || 0);
            const positionSize = parseInt(trade.position_size || 0);
            const direction = (trade.direction || 'LONG').toUpperCase();

            let pnlUsd;
            if (direction === 'LONG') {
                pnlUsd = (exitPrice - entryPrice) * positionSize;
            } else { // SHORT
                pnlUsd = (entryPrice - exitPrice) * positionSize;
            }

            trade.pnl_usd = Math.round(pnlUsd * 100) / 100; // Round to 2 decimal places
        }

        // Calculate pnl_percent if not present
        if (!('pnl_percent' in trade) || trade.pnl_percent === null || trade.pnl_percent === undefined) {
            const entryPrice = parseFloat(trade.entry_price || 0);
            if (entryPrice > 0) {
                const costBasis = entryPrice * trade.position_size;
                trade.pnl_percent = Math.round((trade.pnl_usd / costBasis) * 100 * 100) / 100; // Round to 2 decimal places
            } else {
                trade.pnl_percent = 0;
            }
        }

        return trade;
    }
}

module.exports = { BaseImporter };
