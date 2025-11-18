#!/usr/bin/env node
/**
 * Generate Index Script
 * Consolidates all parsed trade data and generates the master trades index
 * This is essentially a wrapper that ensures parse_trades.js output is in the right place
 * 
 * This is a comprehensive JavaScript translation of generate_index.py with full feature parity.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { getNavbarHtml } = require('./navbar_template');

/**
 * Create a simple HTML page listing all trades
 * 
 * Python equivalent: create_trade_list_html(trades)
 * 
 * @param {Array} trades - List of trade dictionaries
 */
async function createTradeListHtml(trades) {
    // Generate table rows
    const rows = [];
    
    if (trades && trades.length > 0) {
        // Sort by trade number (descending)
        const sortedTrades = [...trades].sort((a, b) => 
            (b.trade_number || 0) - (a.trade_number || 0)
        );
        
        for (const trade of sortedTrades) {
            const pnl = trade.pnl_usd || 0;
            const pnlClass = pnl >= 0 ? 'positive' : 'negative';
            const pnlSign = pnl >= 0 ? '+' : '';

            // Generate trade page link
            const tradeNumber = trade.trade_number || 0;
            const ticker = trade.ticker || 'UNKNOWN';
            const tradeLink = `trades/trade-${String(tradeNumber).padStart(3, '0')}-${ticker}.html`;

            const entryPrice = (trade.entry_price || 0).toFixed(4);
            const exitPrice = (trade.exit_price || 0).toFixed(4);
            const positionSize = (trade.position_size || 0).toLocaleString();
            const pnlAbs = Math.abs(pnl).toFixed(2);

            rows.push(`
        <tr style="cursor: pointer;" onclick="window.location.href='${tradeLink}'">
            <td><a href="${tradeLink}" style="color: inherit; text-decoration: none;">#${trade.trade_number || 'N/A'}</a></td>
            <td><a href="${tradeLink}" style="color: inherit; text-decoration: none;"><strong>${trade.ticker || 'N/A'}</strong></a></td>
            <td>${trade.direction || 'N/A'}</td>
            <td>$${entryPrice}</td>
            <td>$${exitPrice}</td>
            <td>${positionSize}</td>
            <td class="${pnlClass}">${pnlSign}$${pnlAbs}</td>
            <td>${trade.entry_date || 'N/A'}</td>
            <td>${trade.strategy || 'N/A'}</td>
        </tr>
        `);
        }
    } else {
        // Show empty state message
        rows.push(`
        <tr>
            <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                No trades recorded yet. Add your first trade to get started!
            </td>
        </tr>
        `);
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="description" content="Complete list of all recorded trades">
    <meta name="theme-color" content="#00ff88">
    
    <title>All Trades - SFTi-Pennies</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom Styles -->
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/glass-effects.css">
    <link rel="stylesheet" href="assets/css/review-trades.css">
    <link rel="stylesheet" href="assets/css/glowing-bubbles.css">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="../manifest.json">
    
    <!-- Icons -->
    <link rel="icon" type="image/png" sizes="192x192" href="assets/icons/icon-192.png">
    
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
        }
        th, td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        th {
            background-color: var(--bg-tertiary);
            font-weight: 600;
            color: var(--accent-green);
            text-transform: uppercase;
            font-size: 0.875rem;
            letter-spacing: 0.05em;
        }
        tr:hover {
            background-color: var(--bg-tertiary);
            cursor: pointer;
        }
        tr a {
            display: block;
            width: 100%;
            height: 100%;
        }
        .positive {
            color: var(--accent-green);
            font-weight: 600;
        }
        .negative {
            color: var(--accent-red);
            font-weight: 600;
        }
    </style>
</head>
<body>
    <canvas id="bg-canvas"></canvas>
    
${getNavbarHtml('directory')}
    
    <main class="container">
        <h1>All Trades</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
            Complete list of all recorded trades
        </p>
        
        <div style="overflow-x: auto;">
            <table>
                <thead>
                    <tr>
                        <th>Trade #</th>
                        <th>Ticker</th>
                        <th>Direction</th>
                        <th>Entry</th>
                        <th>Exit</th>
                        <th>Size</th>
                        <th>P&L</th>
                        <th>Date</th>
                        <th>Strategy</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.join('')}
                </tbody>
            </table>
        </div>
    </main>
    
    <!-- Footer - Generated by footer.js -->
    
    <!-- Load shared utilities first -->
    <script src="assets/js/utils.js"></script>
    <script src="assets/js/chartConfig.js"></script>
    
    <!-- Application scripts -->
    <script src="assets/js/navbar.js"></script>
    <script src="assets/js/footer.js"></script>
    <script src="assets/js/background.js"></script>
    <script src="assets/js/auth.js"></script>
    <script src="assets/js/app.js"></script>
    <script src="assets/js/glowing-bubbles.js"></script>
</body>
</html>
`;

    await fs.writeFile('index.directory/all-trades.html', htmlContent, 'utf-8');
    console.log('Trade list HTML created at index.directory/all-trades.html');
}

/**
 * Main execution function
 * 
 * Python equivalent: main()
 */
async function main() {
    console.log('Generating master trade index...');

    // Check if trades-index.json exists
    const indexPath = 'index.directory/trades-index.json';
    
    try {
        await fs.access(indexPath);
    } catch (error) {
        console.log('Warning: index.directory/trades-index.json not found');
        console.log('This file should be created by parse_trades.js');
        return;
    }

    // Load the index
    const indexDataStr = await fs.readFile(indexPath, 'utf-8');
    const indexData = JSON.parse(indexDataStr);

    const trades = indexData.trades || [];
    const stats = indexData.statistics || {};

    console.log(`Master index contains ${trades.length} trade(s)`);
    console.log(`Total P&L: $${stats.total_pnl || 0}`);
    console.log(`Win Rate: ${stats.win_rate || 0}%`);

    // Ensure the file is in place for GitHub Pages
    // (it's already at index.directory/, which is correct)
    console.log('Master index is ready at index.directory/trades-index.json');

    // Create a simple trade list HTML for easy browsing (optional)
    await createTradeListHtml(trades);
}

// Run main if executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

module.exports = { main, createTradeListHtml };

// ES Module exports for browser
export { main as generateIndex, main as generate, createTradeListHtml };
