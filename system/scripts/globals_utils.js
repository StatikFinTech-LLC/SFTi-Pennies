#!/usr/bin/env node
/**
 * Global Utilities Module
 * Common utility functions used across multiple JavaScript scripts to eliminate code duplication.
 * This module provides reusable functions for file operations, date parsing, and path management.
 * 
 * This is a comprehensive JavaScript translation of globals_utils.py with full feature parity.
 * Python typing module (Dict, Any, Optional, Tuple) is replaced with JSDoc comments.
 */

const path = require('path');

// File system abstraction - use VFS in browser, fs in Node.js
let fs;
if (typeof window !== 'undefined' && window.PersonalPenniesSystem?.VFS) {
  // Browser: use VFS
  const VFS = window.PersonalPenniesSystem.VFS;
  fs = {
    async writeFile(filepath, content) {
      await VFS.writeFile(filepath, content);
    },
    async mkdir(dirpath, options) {
      // VFS creates directories implicitly
    }
  };
} else {
  // Node.js: use fs
  fs = require('fs').promises;
}

const fsSync = require('fs');

/**
 * Add the scripts directory to module paths for imports.
 * In JavaScript/Node.js, this is handled by relative requires, so this function
 * serves as a compatibility stub for Python's sys.path.insert() pattern.
 * 
 * Python equivalent: setup_imports(script_path)
 * Note: JavaScript module resolution works differently than Python's sys.path
 * 
 * @param {string} scriptPath - Path to the calling script (defaults to __filename)
 * 
 * @example
 * const { setupImports } = require('./globals_utils');
 * setupImports(__filename);
 */
function setupImports(scriptPath = __filename) {
    // In Node.js, module resolution is handled automatically via require()
    // This function exists for API compatibility with Python version
    const scriptsDir = path.dirname(path.resolve(scriptPath));
    // Node.js module system handles this automatically through require()
    // No action needed, but we return the scripts dir for reference
    return scriptsDir;
}

/**
 * Create a directory if it doesn't exist.
 * 
 * Python equivalent: ensure_directory(directory_path)
 * Uses: os.makedirs(directory_path, exist_ok=True)
 * 
 * @param {string} directoryPath - Path to directory to create
 * @returns {Promise<string>} The directory path
 * 
 * @example
 * await ensureDirectory("index.directory/assets/charts");
 */
async function ensureDirectory(directoryPath) {
    await fs.mkdir(directoryPath, { recursive: true });
    return directoryPath;
}

/**
 * Synchronous version of ensureDirectory
 * 
 * @param {string} directoryPath - Path to directory to create
 * @returns {string} The directory path
 */
function ensureDirectorySync(directoryPath) {
    fsSync.mkdirSync(directoryPath, { recursive: true });
    return directoryPath;
}

/**
 * Load a JSON file with error handling.
 * 
 * Python equivalent: load_json_file(filepath, default)
 * Uses: json.load() with file operations
 * 
 * @param {string} filepath - Path to JSON file
 * @param {*} defaultValue - Default value to return if file not found or invalid
 * @returns {Promise<*>} Parsed JSON data or default value
 * 
 * @example
 * const data = await loadJsonFile("index.directory/trades-index.json", {});
 */
async function loadJsonFile(filepath, defaultValue = null) {
    try {
        const data = await fs.readFile(filepath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`File not found: ${filepath}`);
        } else if (error instanceof SyntaxError) {
            console.log(`Error parsing JSON from ${filepath}: ${error.message}`);
        } else {
            console.log(`Error loading ${filepath}: ${error.message}`);
        }
        return defaultValue;
    }
}

/**
 * Synchronous version of loadJsonFile
 * 
 * @param {string} filepath - Path to JSON file
 * @param {*} defaultValue - Default value to return if file not found or invalid
 * @returns {*} Parsed JSON data or default value
 */
function loadJsonFileSync(filepath, defaultValue = null) {
    try {
        const data = fsSync.readFileSync(filepath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`File not found: ${filepath}`);
        } else if (error instanceof SyntaxError) {
            console.log(`Error parsing JSON from ${filepath}: ${error.message}`);
        } else {
            console.log(`Error loading ${filepath}: ${error.message}`);
        }
        return defaultValue;
    }
}

/**
 * Save data to a JSON file with error handling.
 * 
 * Python equivalent: save_json_file(filepath, data, indent)
 * Uses: json.dump() with file operations
 * 
 * @param {string} filepath - Path to save JSON file
 * @param {*} data - Data to serialize to JSON
 * @param {number} indent - Number of spaces for indentation (default: 2)
 * @returns {Promise<boolean>} True if successful, False otherwise
 * 
 * @example
 * await saveJsonFile("output.json", {"key": "value"});
 */
async function saveJsonFile(filepath, data, indent = 2) {
    try {
        // Ensure directory exists
        const directory = path.dirname(filepath);
        if (directory) {
            await ensureDirectory(directory);
        }
        
        const jsonString = JSON.stringify(data, null, indent);
        await fs.writeFile(filepath, jsonString, 'utf-8');
        return true;
    } catch (error) {
        console.log(`Error saving to ${filepath}: ${error.message}`);
        return false;
    }
}

/**
 * Synchronous version of saveJsonFile
 * 
 * @param {string} filepath - Path to save JSON file
 * @param {*} data - Data to serialize to JSON
 * @param {number} indent - Number of spaces for indentation (default: 2)
 * @returns {boolean} True if successful, False otherwise
 */
function saveJsonFileSync(filepath, data, indent = 2) {
    try {
        // Ensure directory exists
        const directory = path.dirname(filepath);
        if (directory) {
            ensureDirectorySync(directory);
        }
        
        const jsonString = JSON.stringify(data, null, indent);
        fsSync.writeFileSync(filepath, jsonString, 'utf-8');
        return true;
    } catch (error) {
        console.log(`Error saving to ${filepath}: ${error.message}`);
        return false;
    }
}

/**
 * Parse a date string into a Date object with error handling.
 * Supports ISO format dates (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).
 * 
 * Python equivalent: parse_date(date_str, default)
 * Uses: datetime.fromisoformat()
 * 
 * @param {string} dateStr - Date string to parse
 * @param {Date|null} defaultValue - Default value to return if parsing fails
 * @returns {Date|null} Date object or default value
 * 
 * @example
 * const date = parseDate("2025-10-15");
 * const dateWithTime = parseDate("2025-10-15T14:30:00");
 */
function parseDate(dateStr, defaultValue = null) {
    if (!dateStr) {
        return defaultValue;
    }
    
    try {
        // Convert to string if not already
        const str = String(dateStr);
        
        // Handle ISO format with time or date only
        const date = new Date(str);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return defaultValue;
        }
        
        return date;
    } catch (error) {
        return defaultValue;
    }
}

/**
 * Format a number as currency with proper sign handling.
 * 
 * NOTE: Reserved for future use. Not currently used in any scripts.
 * 
 * Python equivalent: format_currency(amount, symbol, decimals)
 * 
 * @param {number} amount - Amount to format
 * @param {string} symbol - Currency symbol (default: "$")
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatCurrency(1234.56)  // Returns "$1,234.56"
 * formatCurrency(-42.5)     // Returns "-$42.50"
 */
function formatCurrency(amount, symbol = '$', decimals = 2) {
    const absAmount = Math.abs(amount);
    const formatted = absAmount.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
    
    if (amount >= 0) {
        return `${symbol}${formatted}`;
    } else {
        return `-${symbol}${formatted}`;
    }
}

/**
 * Safely divide two numbers, returning default if denominator is zero.
 * 
 * NOTE: Reserved for future use. Not currently used in any scripts.
 * 
 * Python equivalent: safe_divide(numerator, denominator, default)
 * 
 * @param {number} numerator - Numerator value
 * @param {number} denominator - Denominator value
 * @param {number} defaultValue - Value to return if denominator is zero (default: 0.0)
 * @returns {number} Result of division or default value
 * 
 * @example
 * const result = safeDivide(10, 2);      // Returns 5.0
 * const result = safeDivide(10, 0, -1);  // Returns -1
 */
function safeDivide(numerator, denominator, defaultValue = 0.0) {
    if (denominator === 0) {
        return defaultValue;
    }
    return numerator / denominator;
}

/**
 * Generate a week folder name from a date object.
 * Format: week.YYYY.WW (e.g., week.2025.42)
 * 
 * Python equivalent: get_week_folder(date_obj)
 * Uses: date_obj.isocalendar()[1] for week number
 * 
 * @param {Date} dateObj - Date object
 * @returns {string} Week folder name string
 * 
 * @example
 * const folder = getWeekFolder(new Date(2025, 9, 15));  // Returns "week.2025.42"
 */
function getWeekFolder(dateObj) {
    const year = dateObj.getFullYear();
    
    // Calculate ISO week number (JavaScript doesn't have built-in ISO week)
    // This implements the ISO 8601 week date system
    const target = new Date(dateObj.valueOf());
    const dayNum = (dateObj.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    target.setDate(target.getDate() - dayNum + 3); // Nearest Thursday
    const firstThursday = new Date(target.getFullYear(), 0, 4); // Jan 4th is always in week 1
    const weekNum = Math.ceil((((target - firstThursday) / 86400000) + 1) / 7);
    
    return `week.${year}.${String(weekNum).padStart(2, '0')}`;
}

/**
 * Calculate time duration between entry and exit.
 * 
 * Python equivalent: calculate_time_in_trade(entry_date, entry_time, exit_date, exit_time)
 * Uses: datetime.strptime() and timedelta calculations
 * 
 * @param {string} entryDate - Entry date string (YYYY-MM-DD)
 * @param {string} entryTime - Entry time string (HH:MM)
 * @param {string} exitDate - Exit date string (YYYY-MM-DD)
 * @param {string} exitTime - Exit time string (HH:MM)
 * @returns {string} Human-readable duration string
 * 
 * @example
 * const duration = calculateTimeInTrade("2025-10-15", "09:30", "2025-10-15", "11:45");
 * // Returns "2.3 hours" or "135 minutes"
 */
function calculateTimeInTrade(entryDate, entryTime, exitDate, exitTime) {
    if (!entryDate || !entryTime || !exitDate || !exitTime) {
        return 'Unknown';
    }
    
    try {
        // Parse entry datetime
        const entryDt = new Date(`${entryDate}T${entryTime}:00`);
        // Parse exit datetime
        const exitDt = new Date(`${exitDate}T${exitTime}:00`);
        
        // Calculate duration in milliseconds
        const durationMs = exitDt - entryDt;
        
        // Convert to hours
        const hours = durationMs / (1000 * 60 * 60);
        
        if (hours < 1) {
            const minutes = Math.floor(durationMs / (1000 * 60));
            return `${minutes} minutes`;
        } else {
            return `${hours.toFixed(1)} hours`;
        }
    } catch (error) {
        return 'Unknown';
    }
}

/**
 * Validate that a dictionary contains all required fields.
 * 
 * NOTE: Reserved for future use. Not currently used in any scripts.
 * 
 * Python equivalent: validate_required_fields(data, required_fields)
 * Returns: Tuple of (is_valid: bool, missing_fields: list)
 * 
 * @param {Object} data - Dictionary to validate
 * @param {Array<string>} requiredFields - List of required field names
 * @returns {Object} Object with isValid boolean and missingFields array
 * 
 * @example
 * const result = validateRequiredFields(
 *     {"name": "John", "age": 30},
 *     ["name", "age", "email"]
 * );
 * // Returns {isValid: false, missingFields: ["email"]}
 */
function validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(field => !(field in data));
    return {
        isValid: missingFields.length === 0,
        missingFields: missingFields
    };
}

/**
 * Round a float to specified decimal places.
 * 
 * Python equivalent: round_decimals(value, decimals)
 * 
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Rounded value
 * 
 * @example
 * roundDecimals(3.14159, 2)  // Returns 3.14
 */
function roundDecimals(value, decimals = 2) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
}

// Export all functions for use in other modules
module.exports = {
    setupImports,
    ensureDirectory,
    ensureDirectorySync,
    loadJsonFile,
    loadJsonFileSync,
    saveJsonFile,
    saveJsonFileSync,
    parseDate,
    formatCurrency,
    safeDivide,
    getWeekFolder,
    calculateTimeInTrade,
    validateRequiredFields,
    roundDecimals
};

// ES Module exports for browser compatibility
export { setupImports,ensureDirectory,ensureDirectorySync,loadJsonFile,loadJsonFileSync,saveJsonFile,saveJsonFileSync,parseDate,formatCurrency,safeDivide,getWeekFolder,calculateTimeInTrade,validateRequiredFields,roundDecimals };
