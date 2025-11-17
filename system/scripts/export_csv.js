#!/usr/bin/env node
/**
 * Export CSV Script
 * Exports trades from trades-index.json to CSV format
 * 
 * Features:
 * - Export all trades or filter by strategy, date range
 * - Configurable output file path
 * - Standard CSV format compatible with spreadsheet applications
 * 
 * This is a comprehensive JavaScript translation of export_csv.py with full feature parity.
 * Python's csv module is replaced with manual CSV generation (or could use 'csv-writer' package).
 */

const fs = require('fs').promises;
const { setupImports } = require('./globals_utils');
const { loadTradesIndexSync } = require('./utils');

// Setup imports (compatibility with Python version)
setupImports(__filename);

/**
 * Export trades to CSV file with comprehensive trade data
 * 
 * Python equivalent: export_to_csv(trades, output_file)
 * Uses: csv.DictWriter for CSV generation
 * Note: JavaScript implementation uses manual CSV generation
 * 
 * @param {Array} trades - List of trade dictionaries
 * @param {string} outputFile - Output CSV file path
 */
async function exportToCsv(trades, outputFile = 'trades-export.csv') {
    if (!trades || trades.length === 0) {
        console.log('No trades to export');
        return;
    }

    // Define CSV fields - comprehensive set of trade attributes
    const fields = [
        'trade_number',
        'ticker',
        'entry_date',
        'entry_time',
        'entry_price',
        'exit_date',
        'exit_time',
        'exit_price',
        'position_size',
        'direction',
        'broker',
        'strategy',
        'pnl_usd',
        'pnl_percent',
        'risk_reward_ratio',
        'time_in_trade',
        'notes',
    ];

    try {
        // Create CSV content
        const rows = [];
        
        // Add header
        rows.push(fields.join(','));

        // Add trade rows
        for (const trade of trades) {
            const row = fields.map(field => {
                let value = trade[field] !== undefined ? trade[field] : '';
                
                // Convert to string and escape if contains comma or quotes
                value = String(value);
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                
                return value;
            });
            
            rows.push(row.join(','));
        }

        const csvContent = rows.join('\n');
        await fs.writeFile(outputFile, csvContent, 'utf-8');

        console.log(`Exported ${trades.length} trade(s) to ${outputFile}`);

    } catch (error) {
        console.log(`Error exporting to CSV: ${error.message}`);
    }
}

/**
 * Main execution function
 * 
 * Python equivalent: main()
 * Uses: argparse for command-line arguments
 * Note: JavaScript uses manual argument parsing (or could use 'commander' package)
 */
async function main() {
    // Simple argument parsing (could use commander.js for more features)
    const args = process.argv.slice(2);
    const options = {
        output: 'trades-export.csv',
        filterStrategy: null,
        filterDateFrom: null,
        filterDateTo: null
    };

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--output' || args[i] === '-o') {
            options.output = args[++i];
        } else if (args[i] === '--filter-strategy') {
            options.filterStrategy = args[++i];
        } else if (args[i] === '--filter-date-from') {
            options.filterDateFrom = args[++i];
        } else if (args[i] === '--filter-date-to') {
            options.filterDateTo = args[++i];
        } else if (args[i] === '--help' || args[i] === '-h') {
            console.log(`
SFTi-Pennies CSV Exporter

Usage: node export_csv.js [options]

Options:
  --output, -o <file>           Output CSV file path (default: trades-export.csv)
  --filter-strategy <strategy>  Filter by strategy name
  --filter-date-from <date>     Filter trades from date (YYYY-MM-DD)
  --filter-date-to <date>       Filter trades to date (YYYY-MM-DD)
  --help, -h                    Show this help message
            `);
            return;
        }
    }

    console.log('='.repeat(60));
    console.log('SFTi-Pennies CSV Exporter');
    console.log('='.repeat(60));

    // Load trades
    const indexData = loadTradesIndexSync();
    if (!indexData) {
        return;
    }

    let trades = indexData.trades || [];
    console.log(`Loaded ${trades.length} trade(s) from index`);

    // Apply filters
    if (options.filterStrategy) {
        trades = trades.filter(t => 
            (t.strategy || '').toLowerCase() === options.filterStrategy.toLowerCase()
        );
        console.log(`Filtered to ${trades.length} trade(s) with strategy '${options.filterStrategy}'`);
    }

    if (options.filterDateFrom) {
        // Filter trades from date (inclusive)
        try {
            const fromDate = new Date(options.filterDateFrom);
            trades = trades.filter(t => {
                const entryDate = t.entry_date;
                if (!entryDate) return false;
                
                try {
                    const tradeDate = new Date(entryDate);
                    return tradeDate >= fromDate;
                } catch (error) {
                    return false;
                }
            });
            console.log(`Filtered to ${trades.length} trade(s) from ${options.filterDateFrom}`);
        } catch (error) {
            console.log('Warning: Invalid date format for --filter-date-from (expected YYYY-MM-DD)');
        }
    }

    if (options.filterDateTo) {
        // Filter trades to date (inclusive)
        try {
            const toDate = new Date(options.filterDateTo);
            trades = trades.filter(t => {
                const entryDate = t.entry_date;
                if (!entryDate) return false;
                
                try {
                    const tradeDate = new Date(entryDate);
                    return tradeDate <= toDate;
                } catch (error) {
                    return false;
                }
            });
            console.log(`Filtered to ${trades.length} trade(s) until ${options.filterDateTo}`);
        } catch (error) {
            console.log('Warning: Invalid date format for --filter-date-to (expected YYYY-MM-DD)');
        }
    }

    // Export
    if (trades.length > 0) {
        await exportToCsv(trades, options.output);
    } else {
        console.log('No trades match filters');
    }

    console.log('='.repeat(60));
}

// Run main if executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

module.exports = { main, exportToCsv };

// ES Module exports for browser compatibility
export { main as exportCSV, exportToCsv };
