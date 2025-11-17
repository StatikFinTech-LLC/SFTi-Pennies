#!/usr/bin/env node
/**
 * Generate Trade Detail Pages Script
 * Creates individual HTML pages for each trade with full details, charts, and media
 * 
 * Features:
 * - Generates responsive HTML pages with trade metrics
 * - Displays P&L, risk management, and trade details
 * - Includes image galleries with GLightbox integration
 * - Shows strategy and setup tags
 * - Mobile-friendly design with dark theme
 * 
 * Performance Optimizations:
 * - Array methods (map, join) for gallery and tag rendering
 * - Efficient string joining instead of concatenation in loops
 * - Pre-computed formatting with template literals
 * 
 * Output: index.directory/trades/{trade-id}.html
 * 
 * This is a comprehensive JavaScript translation of generate_trade_pages.py with full feature parity.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { getNavbarHtml } = require('./navbar_template');
const { setupImports, calculateTimeInTrade } = require('./globals_utils');
const { loadTradesIndexSync } = require('./utils');

// Setup imports (compatibility with Python version)
setupImports(__filename);

/**
 * Generate HTML for a single trade detail page with full details
 * 
 * Python equivalent: generate_trade_html(trade)
 * 
 * @param {Object} trade - Trade dictionary
 * @returns {string} HTML content
 */
function generateTradeHtml(trade) {
    // Extract trade data
    const tradeNumber = trade.trade_number || 0;
    const ticker = trade.ticker || 'UNKNOWN';
    const entryDate = trade.entry_date || '';
    const entryTime = trade.entry_time || '';
    const exitDate = trade.exit_date || '';
    const exitTime = trade.exit_time || '';
    const entryPrice = trade.entry_price || 0;
    const exitPrice = trade.exit_price || 0;
    const positionSize = trade.position_size || 0;
    const pnlUsd = trade.pnl_usd || 0;
    const pnlPercent = trade.pnl_percent || 0;
    const direction = trade.direction || 'LONG';
    const strategy = trade.strategy || 'Unknown';
    const stopLoss = trade.stop_loss || 0;
    const targetPrice = trade.target_price || 0;
    const riskRewardRatio = trade.risk_reward_ratio || 0;
    const broker = trade.broker || 'Unknown';
    const notes = trade.notes || 'No notes recorded.';

    // Get tags (v1.1 schema)
    const strategyTags = trade.strategy_tags || [];
    const setupTags = trade.setup_tags || [];
    const sessionTags = trade.session_tags || [];
    const marketConditionTags = trade.market_condition_tags || [];

    // Get images
    let images = trade.images || [];
    const screenshots = trade.screenshots || [];
    if (images.length === 0 && screenshots) {
        images = Array.isArray(screenshots) ? screenshots : [];
    }

    // Calculate additional metrics using utility function
    const timeInTrade = calculateTimeInTrade(entryDate, entryTime, exitDate, exitTime);

    // Generate tag badges HTML
    function renderTags(tags, color) {
        if (!tags || tags.length === 0) {
            return '<span style="color: var(--text-secondary); font-style: italic;">None</span>';
        }
        // Use array methods and join for better performance
        return tags.map(tag =>
            `<span style="display: inline-block; padding: 0.25rem 0.75rem; background: ${color}; color: white; border-radius: 4px; font-size: 0.875rem; margin-right: 0.5rem; margin-bottom: 0.5rem;">${tag}</span>`
        ).join('');
    }

    // Generate image gallery HTML
    let galleryHtml = '';
    if (images && images.length > 0) {
        // Filter and map images to gallery items
        const galleryItems = images
            .map((img, idx) => {
                if (img && img !== 'None' && img.trim()) {
                    const imgPath = img.replace('../../assets/', '../assets/');
                    return `
                <a href="${imgPath}" class="glightbox" data-gallery="trade-${tradeNumber}">
                    <img src="${imgPath}" alt="Trade screenshot ${idx + 1}" style="width: 200px; height: 150px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid var(--border-color); transition: all 0.3s;">
                </a>
                `;
                }
                return null;
            })
            .filter(item => item !== null);

        if (galleryItems.length > 0) {
            galleryHtml = `
            <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h2 style="margin-bottom: 1rem;">📸 Screenshots</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                    ${galleryItems.join('')}
                </div>
            </div>
            `;
        } else {
            galleryHtml = `
            <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h2 style="margin-bottom: 1rem;">📸 Screenshots</h2>
                <p style="color: var(--text-secondary); margin: 0;">No screenshots available for this trade.</p>
            </div>
            `;
        }
    }

    // Generate full HTML template
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="Trade #${tradeNumber} - ${ticker} details and analysis">
  <meta name="theme-color" content="#00ff88">
  
  <title>Trade #${tradeNumber} - ${ticker} - SFTi-Pennies</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- GLightbox CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css">
  
  <!-- Custom Styles -->
  <link rel="stylesheet" href="../assets/css/main.css">
  <link rel="stylesheet" href="../assets/css/glass-effects.css">
  <link rel="stylesheet" href="../assets/css/glowing-bubbles.css">
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="../../manifest.json">
  
  <!-- Icons -->
  <link rel="icon" type="image/png" sizes="192x192" href="../assets/icons/icon-192.png">
</head>
<body>
  <canvas id="bg-canvas"></canvas>
  
${getNavbarHtml('subdirectory')}
  
  <!-- Main Content -->
  <main class="container">
    <section>
      <!-- Header -->
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
          <h1 style="margin: 0;">Trade #${tradeNumber}: ${ticker}</h1>
          <span style="padding: 0.375rem 1rem; background: ${pnlUsd >= 0 ? 'rgba(0,255,136,0.2)' : 'rgba(255,71,87,0.2)'}; color: ${pnlUsd >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}; border-radius: 6px; font-weight: 700; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em;">
            ${pnlUsd >= 0 ? '🎯 WIN' : '❌ LOSS'}
          </span>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <p style="color: var(--text-secondary); margin: 0;">${strategy} | ${direction}</p>
          <span style="color: var(--text-secondary);">•</span>
          <p style="color: var(--text-secondary); margin: 0;">${broker}</p>
        </div>
      </div>
      
      <!-- Key Metrics Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 8px; border: 2px solid ${pnlUsd >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">P&L (USD)</div>
          <div style="font-family: var(--font-mono); font-size: 2rem; font-weight: 700; color: ${pnlUsd >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
            $${pnlUsd.toFixed(2)}
          </div>
        </div>
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">P&L (%)</div>
          <div style="font-family: var(--font-mono); font-size: 2rem; font-weight: 700; color: ${pnlPercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
            ${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%
          </div>
        </div>
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Position Size</div>
          <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 600;">
            ${positionSize} shares
          </div>
        </div>
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Time in Trade</div>
          <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 600;">
            ${timeInTrade}
          </div>
        </div>
      </div>
      
      <!-- Trade Details -->
      <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1.5rem;">📊 Trade Details</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
          <div>
            <h3 style="font-size: 0.875rem; color: var(--accent-green); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Entry</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Price:</span>
                <span style="font-family: var(--font-mono); font-weight: 600;">$${entryPrice.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Date:</span>
                <span style="font-family: var(--font-mono);">${entryDate}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Time:</span>
                <span style="font-family: var(--font-mono);">${entryTime}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 style="font-size: 0.875rem; color: var(--accent-red); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Exit</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Price:</span>
                <span style="font-family: var(--font-mono); font-weight: 600;">$${exitPrice.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Date:</span>
                <span style="font-family: var(--font-mono);">${exitDate}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Time:</span>
                <span style="font-family: var(--font-mono);">${exitTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Risk Management -->
      <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1.5rem;">🎯 Risk Management</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Stop Loss</div>
            <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 600; color: var(--accent-red);">
              $${stopLoss.toFixed(2)}
            </div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Target Price</div>
            <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 600; color: var(--accent-green);">
              $${targetPrice.toFixed(2)}
            </div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Risk:Reward Ratio</div>
            <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 600; color: var(--accent-yellow);">
              1:${riskRewardRatio.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tags Section -->
      <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1.5rem;">🏷️ Tags & Classification</h2>
        <div style="display: grid; gap: 1rem;">
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Strategy Tags:</div>
            <div>${renderTags(strategyTags, 'var(--accent-green)')}</div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Setup Tags:</div>
            <div>${renderTags(setupTags, 'var(--accent-blue)')}</div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Session Tags:</div>
            <div>${renderTags(sessionTags, 'var(--accent-yellow)')}</div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Market Condition Tags:</div>
            <div>${renderTags(marketConditionTags, 'var(--accent-red)')}</div>
          </div>
        </div>
      </div>
      
      <!-- Screenshots Gallery -->
      ${galleryHtml}
      
      <!-- Notes Section -->
      <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1rem;">📝 Notes & Journal</h2>
        <div style="line-height: 1.8; color: var(--text-primary);">
          ${notes.replace(/\n/g, '<br>')}
        </div>
      </div>
      
    </section>
  </main>
  
  <!-- Footer - Generated by footer.js -->
  
  <!-- GLightbox JS -->
  <script src="https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js"></script>
  <script>
    // Initialize GLightbox for image gallery
    const lightbox = GLightbox({
      selector: '.glightbox',
      touchNavigation: true,
      loop: true,
      autoplayVideos: true
    });
  </script>
  
  <!-- Load shared utilities first -->
  <script src="../assets/js/utils.js"></script>
  <script src="../assets/js/chartConfig.js"></script>
  
  <!-- Application scripts -->
  <script src="../assets/js/navbar.js"></script>
  <script src="../assets/js/footer.js"></script>
  <script src="../assets/js/background.js"></script>
  <script src="../assets/js/auth.js"></script>
  <script src="../assets/js/app.js"></script>
  <script src="../assets/js/glowing-bubbles.js"></script>
</body>
</html>
`;

    return html;
}

/**
 * Main execution function
 * 
 * Python equivalent: main()
 */
function main() {
    console.log('Generating trade detail pages...');

    // Load trades
    const indexData = loadTradesIndexSync();
    if (!indexData) {
        return;
    }

    const trades = indexData.trades || [];
    if (trades.length === 0) {
        console.log('No trades found');
        return;
    }

    console.log(`Processing ${trades.length} trade(s)...`);

    // Create output directory
    const outputDir = 'index.directory/trades';
    fsSync.mkdirSync(outputDir, { recursive: true });

    // Generate pages
    for (const trade of trades) {
        const tradeNumber = trade.trade_number || 0;
        const ticker = trade.ticker || 'UNKNOWN';

        // Generate HTML
        const htmlContent = generateTradeHtml(trade);

        // Write file
        const filename = `trade-${String(tradeNumber).padStart(3, '0')}-${ticker}.html`;
        const filepath = path.join(outputDir, filename);

        fsSync.writeFileSync(filepath, htmlContent, 'utf-8');

        console.log(`Generated: ${filepath}`);
    }

    console.log(`\n✓ Generated ${trades.length} trade detail page(s)`);
    console.log(`Output directory: ${outputDir}`);
}

// Run main if executed directly
if (require.main === module) {
    main();
}

module.exports = {
    main,
    generateTradeHtml
};

// ES Module exports for browser
export { main as generateTradePages, main as generate, generateTradeHtml };
