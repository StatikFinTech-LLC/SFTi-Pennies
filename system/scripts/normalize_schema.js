#!/usr/bin/env node
/**
 * Normalize Schema Script
 * Handles schema migrations and versioning for trade data
 * 
 * This script ensures backward compatibility when the trade data schema changes.
 * Features:
 * - Migrate old trade formats to new formats
 * - Validate trades against schema versions
 * - Supports schema versions 1.0 and 1.1
 * - Dry-run mode for safe testing
 * 
 * This is a comprehensive JavaScript translation of normalize_schema.py with full feature parity.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const { setupImports, saveJsonFile } = require('./globals_utils');
const { loadTradesIndex } = require('./utils');

// Setup imports (compatibility with Python version)
setupImports(__filename);

const CURRENT_SCHEMA_VERSION = '1.1';

// Schema version history
const SCHEMA_VERSIONS = {
    '1.0': 'Initial schema with basic trade fields',
    '1.1': 'Added tags (strategy, setup, session, market_condition) and notes field'
};

/**
 * Get current schema version from index
 * 
 * Python equivalent: get_schema_version(index_data)
 * 
 * @param {Object} indexData - Trade index data
 * @returns {string} Schema version
 */
function getSchemaVersion(indexData) {
    return indexData.version || '1.0';
}

/**
 * Migrate trade from schema 1.0 to 1.1
 * 
 * Python equivalent: migrate_1_0_to_1_1(trade)
 * 
 * Changes in 1.1:
 * - Add tags field (list of strings)
 * - Add strategy_tags, setup_tags, session_tags, market_condition_tags fields
 * - Add notes field (string)
 * 
 * @param {Object} trade - Trade in 1.0 format
 * @returns {Object} Trade in 1.1 format
 */
function migrate_1_0_to_1_1(trade) {
    // Add new fields with defaults
    if (!('tags' in trade)) {
        trade.tags = [];
    }
    
    if (!('strategy_tags' in trade)) {
        // If old 'strategy' field exists, use it as a tag
        const strategy = trade.strategy || '';
        trade.strategy_tags = strategy ? [strategy] : [];
    }
    
    if (!('setup_tags' in trade)) {
        trade.setup_tags = [];
    }
    
    if (!('session_tags' in trade)) {
        trade.session_tags = [];
    }
    
    if (!('market_condition_tags' in trade)) {
        trade.market_condition_tags = [];
    }
    
    if (!('notes' in trade)) {
        trade.notes = '';
    }
    
    // Keep backward compatibility - maintain old 'strategy' field
    // This allows old code to still work
    
    return trade;
}

/**
 * Migrate index data to target schema version
 * 
 * Python equivalent: migrate_schema(index_data, target_version)
 * 
 * @param {Object} indexData - Trade index data
 * @param {string} targetVersion - Target schema version
 * @returns {Object} Migrated index data
 */
function migrateSchema(indexData, targetVersion = CURRENT_SCHEMA_VERSION) {
    const currentVersion = getSchemaVersion(indexData);
    
    if (currentVersion === targetVersion) {
        console.log(`Schema is already at version ${targetVersion}`);
        return indexData;
    }
    
    console.log(`Migrating schema from ${currentVersion} to ${targetVersion}`);
    
    const trades = indexData.trades || [];
    const migratedTrades = [];
    
    for (let trade of trades) {
        // Apply migrations in sequence
        if (currentVersion === '1.0' && targetVersion === '1.1') {
            trade = migrate_1_0_to_1_1(trade);
        }
        
        // Future migration paths can be added here as schema evolves
        // Example:
        // else if (currentVersion === '1.1' && targetVersion === '1.2') {
        //     trade = migrate_1_1_to_1_2(trade);
        // }
        
        migratedTrades.push(trade);
    }
    
    // Update version
    indexData.trades = migratedTrades;
    indexData.version = targetVersion;
    indexData.schema_migrated_at = new Date().toISOString();
    
    return indexData;
}

/**
 * Validate that a trade conforms to the specified schema version
 * 
 * Python equivalent: validate_schema(trade, version)
 * 
 * @param {Object} trade - Trade dictionary
 * @param {string} version - Schema version to validate against
 * @returns {Array} [isValid: boolean, errors: Array]
 */
function validateSchema(trade, version = CURRENT_SCHEMA_VERSION) {
    const errors = [];
    
    // Required fields for all versions
    const requiredBaseFields = [
        'trade_number',
        'ticker',
        'entry_date',
        'entry_price',
        'exit_price',
        'position_size',
        'direction'
    ];
    
    for (const field of requiredBaseFields) {
        if (!(field in trade)) {
            errors.push(`Missing required field: ${field}`);
        }
    }
    
    // Version-specific validation
    if (version === '1.1') {
        // Check for tag fields
        const tagFields = [
            'tags',
            'strategy_tags',
            'setup_tags',
            'session_tags',
            'market_condition_tags'
        ];
        for (const field of tagFields) {
            if (field in trade && !Array.isArray(trade[field])) {
                errors.push(`Field ${field} must be a list`);
            }
        }
    }
    
    return [errors.length === 0, errors];
}

/**
 * Main execution function
 * 
 * Python equivalent: main()
 */
function main() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    
    let targetVersion = CURRENT_SCHEMA_VERSION;
    let validateOnly = false;
    let dryRun = false;
    
    // Simple argument parsing
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--target-version' && i + 1 < args.length) {
            targetVersion = args[i + 1];
            i++;
        } else if (args[i] === '--validate-only') {
            validateOnly = true;
        } else if (args[i] === '--dry-run') {
            dryRun = true;
        } else if (args[i] === '--help' || args[i] === '-h') {
            console.log(`
Usage: node normalize_schema.js [options]

Options:
  --target-version <version>  Target schema version (default: ${CURRENT_SCHEMA_VERSION})
  --validate-only             Validate schema without migrating
  --dry-run                   Show what would be migrated without saving
  --help, -h                  Show this help message

Schema Versions:
  1.0: Initial schema with basic trade fields
  1.1: Added tags (strategy, setup, session, market_condition) and notes field

Example:
  node normalize_schema.js --target-version 1.1
  node normalize_schema.js --validate-only
  node normalize_schema.js --dry-run
`);
            process.exit(0);
        }
    }
    
    console.log('='.repeat(60));
    console.log('SFTi-Pennies Schema Normalizer');
    console.log('='.repeat(60));
    console.log(`Current schema version: ${CURRENT_SCHEMA_VERSION}`);
    console.log(`Target schema version: ${targetVersion}`);
    console.log('='.repeat(60));
    
    // Load trades index
    const indexData = loadTradesIndex();
    if (!indexData) {
        return;
    }
    
    const currentVersion = getSchemaVersion(indexData);
    console.log(`\nIndex schema version: ${currentVersion}`);
    
    const trades = indexData.trades || [];
    console.log(`Total trades: ${trades.length}`);
    
    if (validateOnly) {
        console.log(`\nValidating against schema ${targetVersion}...`);
        let invalidCount = 0;
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const [isValid, errors] = validateSchema(trade, targetVersion);
            if (!isValid) {
                console.log(`  Trade #${i + 1} (${trade.ticker || 'UNKNOWN'}): ${errors.join(', ')}`);
                invalidCount++;
            }
        }
        
        if (invalidCount === 0) {
            console.log(`✓ All trades conform to schema ${targetVersion}`);
        } else {
            console.log(`✗ ${invalidCount} trade(s) do not conform to schema`);
        }
        return;
    }
    
    // Migrate
    if (currentVersion !== targetVersion) {
        const migratedData = migrateSchema(indexData, targetVersion);
        
        if (dryRun) {
            console.log(`\n[DRY RUN] Would migrate ${trades.length} trade(s) to schema ${targetVersion}`);
        } else {
            // Save migrated data
            saveJsonFile('index.directory/trades-index.json', migratedData);
            
            console.log(`\n✓ Migrated ${trades.length} trade(s) to schema ${targetVersion}`);
            console.log('Updated: index.directory/trades-index.json');
        }
    }
    
    console.log('='.repeat(60));
}

// Run main if executed directly
if (require.main === module) {
    main();
}

module.exports = {
    main,
    CURRENT_SCHEMA_VERSION,
    SCHEMA_VERSIONS,
    getSchemaVersion,
    migrate_1_0_to_1_1,
    migrateSchema,
    validateSchema
};

// ES Module exports for browser compatibility
export { main,CURRENT_SCHEMA_VERSION,SCHEMA_VERSIONS,getSchemaVersion,migrate_1_0_to_1_1,migrateSchema,validateSchema };
