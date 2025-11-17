#!/usr/bin/env node
/**
 * Parse Trades Script
 * Parses markdown files from the trades/ directory and generates a JSON index
 * with all trade data extracted from YAML frontmatter
 * 
 * Performance Optimizations:
 * - Single-pass statistics calculation combining multiple metrics
 * - Efficient cumulative P&L tracking for drawdown calculation
 * - Reduced memory allocation with in-place updates
 * - Optimized type conversions and validations
 * 
 * This is a comprehensive JavaScript translation of parse_trades.py with full feature parity.
 * Python's yaml module is replaced with a simple YAML parser (can use js-yaml for complex cases).
 * Python's glob module is replaced with fs.readdir + recursive directory walking.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { saveJsonFile } = require('./globals_utils');

// File system abstraction - use VFS in browser, fs in Node.js
let fs;
if (typeof window !== 'undefined' && window.PersonalPenniesSystem?.VFS) {
  // Browser: use VFS
  const VFS = window.PersonalPenniesSystem.VFS;
  fs = {
    async readFile(filepath, encoding) {
      return await VFS.readFile(filepath);
    },
    async readdir(dirpath) {
      const files = await VFS.listFiles(dirpath, { recursive: false });
      return files.map(f => f.name);
    },
    async stat(filepath) {
      const stats = await VFS.stat(filepath);
      return {
        isDirectory() { return stats.isDirectory; },
        isFile() { return !stats.isDirectory; }
      };
    }
  };
} else {
  // Node.js: use fs
  fs = require('fs').promises;
}

/**
 * Extract YAML frontmatter from markdown content
 * 
 * Python equivalent: parse_frontmatter(content)
 * Uses: yaml.safe_load() for parsing
 * Note: Simple YAML parser - for complex YAML, use js-yaml package
 * 
 * @param {string} content - Markdown file content
 * @returns {Object} Object with {frontmatter: Object, body: string}
 */
function parseFrontmatter(content) {
    if (!content.startsWith('---')) {
        return { frontmatter: {}, body: content };
    }

    try {
        // Split content by --- markers
        const parts = content.split('---', 3);
        if (parts.length < 3) {
            return { frontmatter: {}, body: content };
        }

        // Parse YAML frontmatter (simple parser)
        const yamlText = parts[1];
        const frontmatter = {};
        
        const lines = yamlText.split('\n');
        let currentKey = null;
        let currentArray = null;
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            // Handle array continuation
            if (trimmed.startsWith('- ') && currentArray) {
                const value = trimmed.substring(2).trim().replace(/^["']|["']$/g, '');
                currentArray.push(value);
                continue;
            }
            
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex > 0) {
                currentKey = trimmed.substring(0, colonIndex).trim();
                let value = trimmed.substring(colonIndex + 1).trim();
                
                // Handle arrays starting on same line [item1, item2]
                if (value.startsWith('[') && value.endsWith(']')) {
                    value = value.substring(1, value.length - 1)
                        .split(',')
                        .map(v => v.trim().replace(/^["']|["']$/g, ''));
                    frontmatter[currentKey] = value;
                    currentArray = null;
                } else if (value === '' || value === '[]') {
                    // Array starting on next lines
                    frontmatter[currentKey] = [];
                    currentArray = frontmatter[currentKey];
                } else {
                    // Remove quotes and convert types
                    value = value.replace(/^["']|["']$/g, '');
                    // Try to parse as number
                    const numValue = Number(value);
                    if (!isNaN(numValue) && value !== '') {
                        frontmatter[currentKey] = numValue;
                    } else {
                        frontmatter[currentKey] = value;
                    }
                    currentArray = null;
                }
            }
        }

        const body = parts[2].trim();
        return { frontmatter, body };
    } catch (error) {
        console.log(`Error parsing frontmatter: ${error.message}`);
        return { frontmatter: {}, body: content };
    }
}

/**
 * Parse a single trade markdown file
 * 
 * Python equivalent: parse_trade_file(filepath)
 * 
 * @param {string} filepath - Path to trade markdown file
 * @returns {Object|null} Parsed trade data or null if parsing fails
 */
async function parseTradeFile(filepath) {
    try {
        const content = await fs.readFile(filepath, 'utf-8');

        const { frontmatter, body } = parseFrontmatter(content);

        if (!frontmatter || Object.keys(frontmatter).length === 0) {
            console.log(`Warning: No frontmatter found in ${filepath}`);
            return null;
        }

        // Validate required fields
        const requiredFields = [
            'trade_number',
            'ticker',
            'entry_date',
            'entry_price',
            'exit_price',
            'position_size',
            'direction',
        ];

        const missingFields = requiredFields.filter(f => !(f in frontmatter));
        if (missingFields.length > 0) {
            console.log(`Warning: Missing required fields in ${filepath}: ${missingFields.join(', ')}`);
            return null;
        }

        // Extract notes section from markdown body
        let notes = '';
        const notesMatch = body.match(/## Notes\s*\n+(.*?)(?=\n##|\Z)/s);
        if (notesMatch) {
            notes = notesMatch[1].trim();
        }

        // Add computed fields
        const tradeData = {
            file_path: filepath,
            body: body.length > 200 ? body.substring(0, 200) + '...' : body,  // Preview
            notes: notes || 'No notes recorded.',
            ...frontmatter,
        };

        // Ensure numeric fields are properly typed
        const numericFields = [
            'trade_number',
            'entry_price',
            'exit_price',
            'position_size',
            'stop_loss',
            'target_price',
            'pnl_usd',
            'pnl_percent',
            'risk_reward_ratio',
        ];

        for (const field of numericFields) {
            if (field in tradeData && tradeData[field] !== null && tradeData[field] !== undefined) {
                try {
                    tradeData[field] = parseFloat(tradeData[field]);
                } catch (error) {
                    console.log(`Warning: Could not convert ${field} to number in ${filepath}`);
                }
            }
        }

        // Convert trade_number to int specifically
        if ('trade_number' in tradeData) {
            tradeData.trade_number = parseInt(tradeData.trade_number, 10);
        }

        // Convert date/time fields to strings for JSON serialization
        // Handle YAML sexagesimal time parsing bug where "18:55" becomes integer 1135
        const timeFields = ['entry_time', 'exit_time'];
        for (const field of timeFields) {
            if (field in tradeData && tradeData[field] !== null && tradeData[field] !== undefined) {
                const timeVal = tradeData[field];
                // If time was parsed as int (sexagesimal), convert back to HH:MM format
                if (typeof timeVal === 'number') {
                    const hours = Math.floor(timeVal / 60);
                    const minutes = timeVal % 60;
                    tradeData[field] = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                } else {
                    tradeData[field] = String(timeVal);
                }
            }
        }
        
        // Convert date fields to strings
        const dateFields = ['entry_date', 'exit_date'];
        for (const field of dateFields) {
            if (field in tradeData && tradeData[field] !== null && tradeData[field] !== undefined) {
                tradeData[field] = String(tradeData[field]);
            }
        }

        return tradeData;

    } catch (error) {
        console.log(`Error parsing ${filepath}: ${error.message}`);
        return null;
    }
}

/**
 * Calculate aggregate statistics from all trades
 * 
 * Python equivalent: calculate_statistics(trades)
 * 
 * @param {Array} trades - List of trade dictionaries
 * @returns {Object} Statistics dictionary
 */
function calculateStatistics(trades) {
    if (!trades || trades.length === 0) {
        return {
            total_trades: 0,
            winning_trades: 0,
            losing_trades: 0,
            win_rate: 0,
            total_pnl: 0,
            avg_pnl: 0,
            avg_winner: 0,
            avg_loser: 0,
            largest_win: 0,
            largest_loss: 0,
            total_volume: 0,
        };
    }

    // Single pass through all trades to calculate multiple metrics
    const totalTrades = trades.length;
    let winningTrades = 0;
    let losingTrades = 0;
    let totalPnl = 0.0;
    let totalWinnerPnl = 0.0;
    let totalLoserPnl = 0.0;
    let largestWin = -Infinity;
    let largestLoss = Infinity;
    let totalVolume = 0;
    
    // For drawdown calculation
    const cumulativePnl = [];
    let runningTotal = 0.0;

    for (const t of trades) {
        const pnl = t.pnl_usd || 0;
        totalPnl += pnl;
        totalVolume += t.position_size || 0;
        
        // Track cumulative for drawdown
        runningTotal += pnl;
        cumulativePnl.push(runningTotal);
        
        // Update extremes
        if (pnl > largestWin) {
            largestWin = pnl;
        }
        if (pnl < largestLoss) {
            largestLoss = pnl;
        }
        
        // Categorize winners/losers
        if (pnl > 0) {
            winningTrades += 1;
            totalWinnerPnl += pnl;
        } else if (pnl < 0) {
            losingTrades += 1;
            totalLoserPnl += pnl;
        }
    }

    // Calculate derived statistics
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;
    const avgPnl = totalTrades > 0 ? totalPnl / totalTrades : 0;
    const avgWinner = winningTrades > 0 ? totalWinnerPnl / winningTrades : 0;
    const avgLoser = losingTrades > 0 ? totalLoserPnl / losingTrades : 0;

    // Calculate max drawdown efficiently (start peak at 0 for proper drawdown calculation)
    let maxDrawdown = 0;
    if (cumulativePnl.length > 0) {
        let peak = 0;
        for (const value of cumulativePnl) {
            if (value > peak) {
                peak = value;
            }
            const drawdown = value - peak;
            if (drawdown < maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
    }

    // Handle edge cases for extremes
    if (largestWin === -Infinity) {
        largestWin = 0;
    }
    if (largestLoss === Infinity) {
        largestLoss = 0;
    }

    return {
        total_trades: totalTrades,
        winning_trades: winningTrades,
        losing_trades: losingTrades,
        win_rate: Math.round(winRate * 100) / 100,
        total_pnl: Math.round(totalPnl * 100) / 100,
        avg_pnl: Math.round(avgPnl * 100) / 100,
        avg_winner: Math.round(avgWinner * 100) / 100,
        avg_loser: Math.round(avgLoser * 100) / 100,
        largest_win: Math.round(largestWin * 100) / 100,
        largest_loss: Math.round(largestLoss * 100) / 100,
        total_volume: Math.floor(totalVolume),
        max_drawdown: Math.round(maxDrawdown * 100) / 100,
        profit_factor: avgLoser !== 0 ? Math.round(Math.abs(avgWinner / avgLoser) * 100) / 100 : 0,
    };
}

/**
 * Recursively find all markdown files in a directory
 * 
 * Python equivalent: glob.glob()
 * 
 * @param {string} dir - Directory to search
 * @param {Array} fileList - Accumulator for file paths
 * @returns {Promise<Array>} Array of file paths
 */
async function findMarkdownFiles(dir, fileList = []) {
    try {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            
            if (stat.isDirectory()) {
                await findMarkdownFiles(filePath, fileList);
            } else if (file.endsWith('.md') && !file.endsWith('README.md')) {
                fileList.push(filePath);
            }
        }
    } catch (error) {
        // Directory doesn't exist, skip
    }
    
    return fileList;
}

/**
 * Main execution function
 * 
 * Python equivalent: main()
 */
async function main() {
    console.log('Starting trade parsing...');

    // Find all trade markdown files in both locations:
    // 1. Legacy location: trades/*.md
    // 2. New location: index.directory/SFTi.Tradez/week.*/**.md (supports both week.XXX and week.YYYY.WW formats)
    let tradeFiles = [];

    // Check legacy trades/ directory
    try {
        const legacyFiles = await findMarkdownFiles('trades');
        if (legacyFiles.length > 0) {
            console.log(`Found ${legacyFiles.length} legacy trade file(s) in trades/`);
            tradeFiles.push(...legacyFiles);
        }
    } catch (error) {
        // Directory doesn't exist
    }

    // Check new index.directory/SFTi.Tradez structure (supports week.XXX and week.YYYY.WW patterns)
    try {
        const sftiFiles = await findMarkdownFiles('index.directory/SFTi.Tradez');
        if (sftiFiles.length > 0) {
            console.log(`Found ${sftiFiles.length} trade file(s) in index.directory/SFTi.Tradez/`);
            tradeFiles.push(...sftiFiles);
        }
    } catch (error) {
        // Directory doesn't exist
    }

    // Remove duplicates
    tradeFiles = [...new Set(tradeFiles)];

    let output;
    if (tradeFiles.length === 0) {
        console.log('No trade files found in trades/ or index.directory/SFTi.Tradez/ directories');
        // Create empty index
        output = {
            trades: [],
            statistics: calculateStatistics([]),
            generated_at: new Date().toISOString(),
            version: '1.0',
        };
    } else {
        console.log(`Found ${tradeFiles.length} total trade file(s)`);

        // Parse all trade files
        const trades = [];
        for (const filepath of tradeFiles) {
            console.log(`Parsing ${filepath}...`);
            const tradeData = await parseTradeFile(filepath);
            if (tradeData) {
                trades.push(tradeData);
            }
        }

        console.log(`Successfully parsed ${trades.length} trade(s)`);

        // Sort trades by trade number
        trades.sort((a, b) => (a.trade_number || 0) - (b.trade_number || 0));

        // Calculate statistics
        const stats = calculateStatistics(trades);

        // Generate output
        output = {
            trades: trades,
            statistics: stats,
            generated_at: new Date().toISOString(),
            version: '1.0',
        };
    }

    // Write JSON index
    const outputFile = 'index.directory/trades-index.json';
    await saveJsonFile(outputFile, output);

    console.log(`Trade index written to ${outputFile}`);
    console.log(`Total trades: ${output.statistics.total_trades}`);
    console.log(`Win rate: ${output.statistics.win_rate}%`);
    console.log(`Total P&L: $${output.statistics.total_pnl}`);
}

// Run main if executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

module.exports = {
    main,
    parseFrontmatter,
    parseTradeFile,
    calculateStatistics,
    findMarkdownFiles
};

// ES Module exports for browser compatibility
export { main as parseTrades, main as generate, parseFrontmatter, parseTradeFile, calculateStatistics, findMarkdownFiles };
