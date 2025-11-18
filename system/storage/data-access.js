/**
 * Data Access Layer for Personal-Pennies
 * 
 * Provides high-level API for accessing application data from VFS.
 * This replaces direct fetch() calls and bucket-based storage access.
 * 
 * All data access should go through this layer to ensure consistent
 * VFS usage with proper fallbacks.
 */

import { vfsFetch, readJSON, writeJSON, readText, writeText } from './vfs-adapter.js';
import * as VFS from './vfs.js';

/**
 * Get base path for constructing URLs
 */
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/index.directory/')) {
    return path.split('/index.directory/')[0];
  }
  return '';
}

/**
 * Normalize path to be relative to repository root
 */
function normalizePath(path) {
  // Remove base path if present
  const basePath = getBasePath();
  if (path.startsWith(basePath)) {
    path = path.substring(basePath.length);
  }
  
  // Remove leading slash
  path = path.replace(/^\/+/, '');
  
  return path;
}

/**
 * TRADES
 */

/**
 * Load trades index
 * @returns {Promise<Object>} Trades index with trades array and statistics
 */
export async function loadTradesIndex() {
  const path = 'index.directory/trades-index.json';
  
  try {
    const data = await readJSON(path);
    console.log(`[DataAccess] Loaded trades index: ${data.trades?.length || 0} trades`);
    return data;
  } catch (error) {
    console.warn('[DataAccess] Failed to load trades index:', error);
    return { trades: [], statistics: {} };
  }
}

/**
 * Load a specific trade markdown file
 * @param {string} weekKey - Week key (e.g., "week.2025.45")
 * @param {string} tradeFile - Trade filename (e.g., "11:05:2025.1.md")
 * @returns {Promise<string|null>} Trade markdown content
 */
export async function loadTradeMarkdown(weekKey, tradeFile) {
  const path = `index.directory/SFTi.Tradez/${weekKey}/${tradeFile}`;
  
  try {
    const content = await readText(path);
    console.log(`[DataAccess] Loaded trade: ${path}`);
    return content;
  } catch (error) {
    console.warn(`[DataAccess] Failed to load trade ${path}:`, error);
    return null;
  }
}

/**
 * Save a trade markdown file
 * @param {string} weekKey - Week key (e.g., "week.2025.45")
 * @param {string} tradeFile - Trade filename (e.g., "11:05:2025.1.md")
 * @param {string} content - Trade markdown content
 */
export async function saveTradeMarkdown(weekKey, tradeFile, content) {
  const path = `index.directory/SFTi.Tradez/${weekKey}/${tradeFile}`;
  
  try {
    await writeText(path, content, { mimeType: 'text/markdown' });
    console.log(`[DataAccess] Saved trade: ${path}`);
    return true;
  } catch (error) {
    console.error(`[DataAccess] Failed to save trade ${path}:`, error);
    return false;
  }
}

/**
 * Convert trade object to markdown format with YAML frontmatter
 * @param {Object} trade - Trade data object
 * @returns {string} Markdown content with YAML frontmatter
 */
export function tradeToMarkdown(trade) {
  const {
    trade_number,
    ticker,
    entry_date,
    entry_time,
    exit_date,
    exit_time,
    entry_price,
    exit_price,
    position_size,
    direction,
    strategy,
    setup,
    session,
    market_condition,
    stop_loss,
    target_price,
    risk_reward_ratio,
    broker,
    pnl_usd,
    pnl_percent,
    time_in_trade,
    notes,
    journal,
    screenshots = []
  } = trade;

  // Build YAML frontmatter
  const frontmatter = `---
trade_number: ${trade_number || 1}
ticker: ${ticker || ''}
entry_date: ${entry_date || ''}
entry_time: ${entry_time || ''}
exit_date: ${exit_date || ''}
exit_time: ${exit_time || ''}
entry_price: ${entry_price || 0}
exit_price: ${exit_price || 0}
position_size: ${position_size || 0}
direction: ${direction || 'LONG'}
strategy: ${strategy || ''}
setup: ${setup || ''}
session: ${session || ''}
market_condition: ${market_condition || ''}
stop_loss: ${stop_loss || 0}
target_price: ${target_price || 0}
risk_reward_ratio: ${risk_reward_ratio || 0}
broker: ${broker || ''}
pnl_usd: ${pnl_usd || 0}
pnl_percent: ${pnl_percent || 0}
time_in_trade: ${time_in_trade || ''}
screenshots:${screenshots.length > 0 ? '\n' + screenshots.map(s => `  - ${s}`).join('\n') : '\n  - None'}
---`;

  // Build markdown body
  const body = `
# Trade #${trade_number} - ${ticker}

## Trade Details

- **Ticker**: ${ticker}
- **Direction**: ${direction}
- **Entry**: $${entry_price} on ${entry_date} at ${entry_time || 'N/A'}
- **Exit**: $${exit_price} on ${exit_date} at ${exit_time || 'N/A'}
- **Position Size**: ${position_size} shares
${strategy ? `- **Strategy**: ${strategy}` : ''}
${setup ? `- **Setup**: ${setup}` : ''}
${session ? `- **Session**: ${session}` : ''}
${market_condition ? `- **Market Condition**: ${market_condition}` : ''}
${broker ? `- **Broker**: ${broker}` : ''}

## Risk Management

${stop_loss ? `- **Stop Loss**: $${stop_loss}` : ''}
${target_price ? `- **Target Price**: $${target_price}` : ''}
${risk_reward_ratio ? `- **Risk:Reward Ratio**: ${risk_reward_ratio}` : ''}

## Results

- **P&L (USD)**: $${pnl_usd || 0}
- **P&L (%)**: ${pnl_percent || 0}%
${time_in_trade ? `- **Time in Trade**: ${time_in_trade}` : ''}

## Notes

${notes || 'No notes provided.'}

${journal ? `## Journal Entry\n\n${journal}` : ''}

${screenshots.length > 0 ? `## Screenshots\n\n${screenshots.map((s, i) => `![Screenshot ${i + 1}](${s})`).join('\n\n')}` : ''}
`;

  return frontmatter + '\n' + body;
}

/**
 * Save a trade from form data
 * @param {string} weekKey - Week key (e.g., "week.2025.45")
 * @param {Object} tradeData - Trade data object from form
 * @returns {Promise<string>} Trade file path
 */
export async function saveTrade(weekKey, tradeData) {
  // Generate filename (MM:DD:YYYY.N.md)
  const entryDate = new Date(tradeData.entry_date);
  const month = String(entryDate.getMonth() + 1).padStart(2, '0');
  const day = String(entryDate.getDate()).padStart(2, '0');
  const year = entryDate.getFullYear();
  const tradeNumber = tradeData.trade_number || 1;
  
  const tradeFile = `${month}:${day}:${year}.${tradeNumber}.md`;
  
  // Convert trade data to markdown
  const markdown = tradeToMarkdown(tradeData);
  
  // Save to VFS
  await saveTradeMarkdown(weekKey, tradeFile, markdown);
  
  const fullPath = `index.directory/SFTi.Tradez/${weekKey}/${tradeFile}`;
  console.log(`[DataAccess] Trade saved to: ${fullPath}`);
  
  return fullPath;
}


/**
 * Load generated trade HTML page
 * @param {string} tradeId - Trade ID (e.g., "trade-001-SCNX")
 * @returns {Promise<string|null>} Trade HTML content
 */
export async function loadTradeHTML(tradeId) {
  const path = `index.directory/trades/${tradeId}.html`;
  
  try {
    const content = await readText(path);
    console.log(`[DataAccess] Loaded trade HTML: ${path}`);
    return content;
  } catch (error) {
    console.warn(`[DataAccess] Failed to load trade HTML ${path}:`, error);
    return null;
  }
}

/**
 * ANALYTICS & CHARTS
 */

/**
 * Load analytics data
 * @returns {Promise<Object>} Analytics data
 */
export async function loadAnalytics() {
  const path = 'index.directory/assets/charts/analytics-data.json';
  
  try {
    const data = await readJSON(path);
    console.log('[DataAccess] Loaded analytics');
    return data;
  } catch (error) {
    console.warn('[DataAccess] Failed to load analytics:', error);
    return null;
  }
}

/**
 * Save analytics data
 * @param {Object} data - Analytics data
 */
export async function saveAnalytics(data) {
  const path = 'index.directory/assets/charts/analytics-data.json';
  
  try {
    await writeJSON(path, data, { pretty: true });
    console.log('[DataAccess] Saved analytics');
    return true;
  } catch (error) {
    console.error('[DataAccess] Failed to save analytics:', error);
    return false;
  }
}

/**
 * Load chart data
 * @param {string} chartName - Chart name (e.g., "equity-curve-data")
 * @returns {Promise<Object|null>} Chart data
 */
export async function loadChart(chartName) {
  const path = `index.directory/assets/charts/${chartName}.json`;
  
  try {
    const data = await readJSON(path);
    console.log(`[DataAccess] Loaded chart: ${chartName}`);
    return data;
  } catch (error) {
    console.warn(`[DataAccess] Failed to load chart ${chartName}:`, error);
    return null;
  }
}

/**
 * Save chart data
 * @param {string} chartName - Chart name (e.g., "equity-curve-data")
 * @param {Object} data - Chart data
 */
export async function saveChart(chartName, data) {
  const path = `index.directory/assets/charts/${chartName}.json`;
  
  try {
    await writeJSON(path, data, { pretty: true });
    console.log(`[DataAccess] Saved chart: ${chartName}`);
    return true;
  } catch (error) {
    console.error(`[DataAccess] Failed to save chart ${chartName}:`, error);
    return false;
  }
}

/**
 * CONFIGURATION
 */

/**
 * Load account configuration
 * @returns {Promise<Object>} Account config
 */
export async function loadAccountConfig() {
  const path = 'index.directory/account-config.json';
  
  try {
    const data = await readJSON(path);
    console.log('[DataAccess] Loaded account config');
    return data;
  } catch (error) {
    console.warn('[DataAccess] Failed to load account config:', error);
    return null;
  }
}

/**
 * Save account configuration
 * @param {Object} data - Account config data
 */
export async function saveAccountConfig(data) {
  const path = 'index.directory/account-config.json';
  
  try {
    await writeJSON(path, data, { pretty: true });
    console.log('[DataAccess] Saved account config');
    return true;
  } catch (error) {
    console.error('[DataAccess] Failed to save account config:', error);
    return false;
  }
}

/**
 * NOTES
 */

/**
 * Load notes index
 * @returns {Promise<Object>} Notes index
 */
export async function loadNotesIndex() {
  const path = 'index.directory/notes-index.json';
  
  try {
    const data = await readJSON(path);
    console.log(`[DataAccess] Loaded notes index: ${data.notes?.length || 0} notes`);
    return data;
  } catch (error) {
    console.warn('[DataAccess] Failed to load notes index:', error);
    return { notes: [] };
  }
}

/**
 * Load a note markdown file
 * @param {string} notePath - Note path relative to SFTi.Notez (e.g., "7.Step.Frame.md")
 * @returns {Promise<string|null>} Note markdown content
 */
export async function loadNote(notePath) {
  const path = `index.directory/SFTi.Notez/${notePath}`;
  
  try {
    const content = await readText(path);
    console.log(`[DataAccess] Loaded note: ${notePath}`);
    return content;
  } catch (error) {
    console.warn(`[DataAccess] Failed to load note ${notePath}:`, error);
    return null;
  }
}

/**
 * Save a note markdown file
 * @param {string} notePath - Note path relative to SFTi.Notez
 * @param {string} content - Note markdown content
 */
export async function saveNote(notePath, content) {
  const path = `index.directory/SFTi.Notez/${notePath}`;
  
  try {
    await writeText(path, content, { mimeType: 'text/markdown' });
    console.log(`[DataAccess] Saved note: ${notePath}`);
    return true;
  } catch (error) {
    console.error(`[DataAccess] Failed to save note ${notePath}:`, error);
    return false;
  }
}

/**
 * SUMMARIES
 */

/**
 * Load a summary markdown file
 * @param {string} summaryKey - Summary key (e.g., "weekly-2025-W45")
 * @returns {Promise<string|null>} Summary markdown content
 */
export async function loadSummary(summaryKey) {
  const path = `index.directory/summaries/${summaryKey}.md`;
  
  try {
    const content = await readText(path);
    console.log(`[DataAccess] Loaded summary: ${summaryKey}`);
    return content;
  } catch (error) {
    console.warn(`[DataAccess] Failed to load summary ${summaryKey}:`, error);
    return null;
  }
}

/**
 * Save a summary markdown file
 * @param {string} summaryKey - Summary key (e.g., "weekly-2025-W45")
 * @param {string} content - Summary markdown content
 */
export async function saveSummary(summaryKey, content) {
  const path = `index.directory/summaries/${summaryKey}.md`;
  
  try {
    await writeText(path, content, { mimeType: 'text/markdown' });
    console.log(`[DataAccess] Saved summary: ${summaryKey}`);
    return true;
  } catch (error) {
    console.error(`[DataAccess] Failed to save summary ${summaryKey}:`, error);
    return false;
  }
}

/**
 * MEDIA
 */

/**
 * Load an image file
 * @param {string} imagePath - Image path (e.g., "index.directory/media/trade-001-entry.png")
 * @returns {Promise<string|null>} Data URL for the image
 */
export async function loadImage(imagePath) {
  const path = normalizePath(imagePath);
  
  try {
    const fileData = await VFS.readFile(path, { metadata: true });
    
    if (!fileData) {
      // Try fetching from network
      const response = await fetch(imagePath);
      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
      return null;
    }
    
    // Convert to data URL if in VFS
    if (fileData.content instanceof ArrayBuffer) {
      const blob = new Blob([fileData.content], { type: fileData.mimeType });
      return URL.createObjectURL(blob);
    }
    
    return fileData.content;
  } catch (error) {
    console.warn(`[DataAccess] Failed to load image ${imagePath}:`, error);
    return null;
  }
}

/**
 * Save an image file
 * @param {string} imagePath - Image path
 * @param {ArrayBuffer|Blob} data - Image data
 * @param {string} mimeType - MIME type (e.g., "image/png")
 */
export async function saveImage(imagePath, data, mimeType) {
  const path = normalizePath(imagePath);
  
  try {
    await VFS.writeFile(path, data, {
      binary: true,
      mimeType: mimeType
    });
    console.log(`[DataAccess] Saved image: ${path}`);
    return true;
  } catch (error) {
    console.error(`[DataAccess] Failed to save image ${path}:`, error);
    return false;
  }
}

/**
 * UTILITY
 */

/**
 * Check if a file exists
 * @param {string} path - File path
 * @returns {Promise<boolean>}
 */
export async function fileExists(path) {
  const normalizedPath = normalizePath(path);
  return await VFS.fileExists(normalizedPath);
}

/**
 * List files in a directory
 * @param {string} dirPath - Directory path
 * @param {object} options - List options
 * @returns {Promise<Array>} Array of file paths
 */
export async function listFiles(dirPath, options = {}) {
  const normalizedPath = normalizePath(dirPath);
  return await VFS.listFiles(normalizedPath, options);
}

/**
 * Get VFS statistics
 * @returns {Promise<Object>} VFS statistics
 */
export async function getVFSStats() {
  return await VFS.getVFSStats();
}

// Export for global access
if (typeof window !== 'undefined') {
  window.PersonalPenniesDataAccess = {
    // Trades
    loadTradesIndex,
    loadTradeMarkdown,
    saveTradeMarkdown,
    saveTrade,
    tradeToMarkdown,
    loadTradeHTML,
    
    // Analytics & Charts
    loadAnalytics,
    saveAnalytics,
    loadChart,
    saveChart,
    
    // Configuration
    loadAccountConfig,
    saveAccountConfig,
    
    // Notes
    loadNotesIndex,
    loadNote,
    saveNote,
    
    // Summaries
    loadSummary,
    saveSummary,
    
    // Media
    loadImage,
    saveImage,
    
    // Utility
    fileExists,
    listFiles,
    getVFSStats
  };
}

console.log('[DataAccess] Data access layer loaded');
