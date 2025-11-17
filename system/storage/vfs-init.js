/**
 * VFS Repository Initialization and Migration
 * 
 * Fetches the entire repository structure and populates IndexedDB VFS
 * with all files (md, js, json, html, css, images, etc.)
 * 
 * This runs on first load when VFS is empty, or can be manually triggered
 * to refresh/update the VFS with latest repository content.
 */

import * as VFS from './vfs.js';

/**
 * List of directories and files to fetch from the repository
 * This represents the complete repository structure we want to mirror
 */
const REPO_STRUCTURE = [
  // Root files
  'index.html',
  'manifest.json',
  'index.csv',
  
  // HTML pages
  'index.directory/add-trade.html',
  'index.directory/add-note.html',
  'index.directory/add-pdf.html',
  'index.directory/all-trades.html',
  'index.directory/analytics.html',
  'index.directory/books.html',
  'index.directory/import.html',
  'index.directory/notes.html',
  'index.directory/review.html',
  'index.directory/system-test.html',
  
  // Configuration files
  'index.directory/account-config.json',
  'index.directory/notes-index.json',
  'index.directory/trades-index.json',
  // Note: analytics.json is generated, not a static file
  
  // CSS files
  'index.directory/assets/css/main.css',
  'index.directory/assets/css/glass-effects.css',
  'index.directory/assets/css/modals.css',
  'index.directory/assets/css/glowing-bubbles.css',
  'index.directory/assets/css/import.css',
  'index.directory/assets/css/review-trades.css',
  'index.directory/styles/markdown.css',
  'index.directory/styles/pdf-viewer.css',
  
  // JavaScript files - system
  'index.directory/assets/system/loader.js',
  'index.directory/assets/system/storage/db.js',
  'index.directory/assets/system/storage/vfs.js',
  'index.directory/assets/system/storage/vfs-init.js',
  
  // JavaScript files - scripts
  'index.directory/assets/system/scripts/utils.js',
  'index.directory/assets/system/scripts/globalsUtils.js',
  'index.directory/assets/system/scripts/parseTrades.js',
  'index.directory/assets/system/scripts/generateAnalytics.js',
  'index.directory/assets/system/scripts/generateCharts.js',
  'index.directory/assets/system/scripts/generateSummaries.js',
  'index.directory/assets/system/scripts/generateTradePages.js',
  'index.directory/assets/system/scripts/generateWeekSummaries.js',
  'index.directory/assets/system/scripts/generateBooksIndex.js',
  'index.directory/assets/system/scripts/generateNotesIndex.js',
  'index.directory/assets/system/scripts/generateIndex.js',
  'index.directory/assets/system/scripts/updateHomepage.js',
  'index.directory/assets/system/scripts/navbarTemplate.js',
  'index.directory/assets/system/scripts/normalizeSchema.js',
  'index.directory/assets/system/scripts/attachMedia.js',
  'index.directory/assets/system/scripts/importExport.js',
  
  // JavaScript files - UI
  'index.directory/assets/js/accountManager.js',
  'index.directory/assets/js/addTradeForm.js',
  'index.directory/assets/js/analytics.js',
  'index.directory/assets/js/app.js',
  'index.directory/assets/js/auth.js',
  'index.directory/assets/js/background.js',
  'index.directory/assets/js/charts.js',
  'index.directory/assets/js/chartConfig.js',
  'index.directory/assets/js/eventBus.js',
  'index.directory/assets/js/footer.js',
  'index.directory/assets/js/glowing-bubbles.js',
  'index.directory/assets/js/import.js',
  'index.directory/assets/js/modals.js',
  'index.directory/assets/js/navbar.js',
  'index.directory/assets/js/registerServiceWorker.js',
  'index.directory/assets/js/toastNotifications.js',
  'index.directory/assets/js/utils.js',
  
  // Markdown files - notes
  'index.directory/SFTi.Notez/README.md',
  'index.directory/SFTi.Notez/7.Step.Frame.md',
  'index.directory/SFTi.Notez/Dip.n.Rip.md',
  'index.directory/SFTi.Notez/GSTRWT.md',
  'index.directory/SFTi.Notez/Penny.Indicators.md',
  
  // Documentation
  'index.directory/Informational.Bookz/README.md',
  'index.directory/render/README.md',
  'index.directory/SFTi.Tradez/template/README.md',
];

/**
 * Directories to scan recursively for dynamic content
 */
const DYNAMIC_DIRECTORIES = [
  'index.directory/SFTi.Tradez',      // Trade markdown files
  'index.directory/trades',            // Generated trade HTML pages
  'index.directory/summaries',         // Generated summaries
  'index.directory/assets/charts',     // Chart JSON files
  'index.directory/assets/icons',      // App icons
  'index.directory/media',             // Trade screenshots
];

/**
 * File extensions to skip (large binaries we don't need)
 */
const SKIP_EXTENSIONS = [
  // Skip very large files
  'mp4', 'webm', 'mov', 'avi',
  // Skip temp files
  'tmp', 'swp', 'bak'
];

/**
 * Get base path for repository
 */
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/index.directory/')) {
    return path.split('/index.directory/')[0];
  }
  return '';
}

/**
 * Fetch a file from the repository
 */
async function fetchFile(path) {
  const basePath = getBasePath();
  const url = `${basePath}/${path}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[VFS-Init] Failed to fetch ${path}: ${response.status}`);
      return null;
    }
    
    // Check if binary or text
    const isBinary = VFS.isBinaryFile(path);
    
    if (isBinary) {
      const arrayBuffer = await response.arrayBuffer();
      return {
        path: path,
        content: arrayBuffer,
        isBinary: true
      };
    } else {
      const text = await response.text();
      return {
        path: path,
        content: text,
        isBinary: false
      };
    }
  } catch (error) {
    console.warn(`[VFS-Init] Error fetching ${path}:`, error);
    return null;
  }
}

/**
 * Scan a directory for files
 */
async function scanDirectory(dirPath) {
  // For now, we can't dynamically list directory contents from static hosting
  // We'll rely on index files or known patterns
  // This is a limitation of static hosting - we need to know what files exist
  console.log(`[VFS-Init] Scanning directory: ${dirPath}`);
  
  const files = [];
  
  // Try to fetch index.json if it exists
  const indexPath = `${dirPath}/index.json`;
  const indexData = await fetchFile(indexPath);
  
  if (indexData && !indexData.isBinary) {
    try {
      const index = JSON.parse(indexData.content);
      if (index.files && Array.isArray(index.files)) {
        for (const file of index.files) {
          files.push(`${dirPath}/${file}`);
        }
      }
    } catch (e) {
      console.warn(`[VFS-Init] Failed to parse ${indexPath}:`, e);
    }
  }
  
  return files;
}

/**
 * Populate VFS with repository content
 */
export async function populateVFS(options = {}) {
  const { 
    force = false,
    onProgress = null,
    includeStatic = true,
    includeDynamic = true 
  } = options;
  
  console.log('[VFS-Init] Starting VFS population...');
  
  // Check if VFS is already populated (unless force)
  if (!force) {
    const stats = await VFS.getVFSStats();
    if (stats.totalFiles > 0) {
      console.log(`[VFS-Init] VFS already has ${stats.totalFiles} files, skipping population (use force=true to repopulate)`);
      return stats;
    }
  }
  
  const startTime = Date.now();
  let filesAdded = 0;
  let filesFailed = 0;
  
  // Fetch static files
  if (includeStatic) {
    console.log(`[VFS-Init] Fetching ${REPO_STRUCTURE.length} static files...`);
    
    for (let i = 0; i < REPO_STRUCTURE.length; i++) {
      const path = REPO_STRUCTURE[i];
      
      // Check if we should skip this file
      const ext = path.split('.').pop().toLowerCase();
      if (SKIP_EXTENSIONS.includes(ext)) {
        continue;
      }
      
      if (onProgress) {
        onProgress({
          phase: 'static',
          current: i + 1,
          total: REPO_STRUCTURE.length,
          path: path
        });
      }
      
      const fileData = await fetchFile(path);
      
      if (fileData) {
        await VFS.writeFile(fileData.path, fileData.content, {
          binary: fileData.isBinary
        });
        filesAdded++;
      } else {
        filesFailed++;
      }
    }
  }
  
  // Scan dynamic directories
  if (includeDynamic) {
    console.log(`[VFS-Init] Scanning ${DYNAMIC_DIRECTORIES.length} dynamic directories...`);
    
    for (const dirPath of DYNAMIC_DIRECTORIES) {
      if (onProgress) {
        onProgress({
          phase: 'dynamic',
          directory: dirPath
        });
      }
      
      const files = await scanDirectory(dirPath);
      
      for (const path of files) {
        const ext = path.split('.').pop().toLowerCase();
        if (SKIP_EXTENSIONS.includes(ext)) {
          continue;
        }
        
        const fileData = await fetchFile(path);
        
        if (fileData) {
          await VFS.writeFile(fileData.path, fileData.content, {
            binary: fileData.isBinary
          });
          filesAdded++;
        } else {
          filesFailed++;
        }
      }
    }
  }
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const stats = await VFS.getVFSStats();
  
  console.log(`[VFS-Init] Population complete in ${elapsed}s`);
  console.log(`[VFS-Init] Files added: ${filesAdded}, failed: ${filesFailed}`);
  console.log(`[VFS-Init] VFS Stats:`, stats);
  
  return stats;
}

/**
 * Migrate data from old bucket-based storage to VFS
 */
export async function migrateFromLegacyStorage() {
  console.log('[VFS-Init] Starting migration from legacy storage...');
  
  if (!window.PersonalPenniesDB) {
    console.warn('[VFS-Init] Legacy storage not available, skipping migration');
    return;
  }
  
  const DB = window.PersonalPenniesDB;
  let migrated = 0;
  
  try {
    // Migrate trades
    const trades = await DB.getAllTrades();
    console.log(`[VFS-Init] Migrating ${trades.length} trades...`);
    
    for (const trade of trades) {
      if (trade._key) {
        // Construct VFS path from trade key
        // Old format: "week.YYYY.WW/MM:DD:YYYY.N.md"
        const vfsPath = `index.directory/SFTi.Tradez/${trade._key}`;
        
        // Get markdown content from trade
        const markdown = generateTradeMarkdown(trade);
        
        await VFS.writeFile(vfsPath, markdown);
        migrated++;
      }
    }
    
    // Migrate config
    const config = await DB.getConfig('account-config');
    if (config) {
      console.log('[VFS-Init] Migrating account config...');
      await VFS.writeFile('index.directory/account-config.json', JSON.stringify(config, null, 2));
      migrated++;
    }
    
    // Migrate analytics
    const analytics = await DB.getAnalytics();
    if (analytics) {
      console.log('[VFS-Init] Migrating analytics...');
      await VFS.writeFile('index.directory/analytics.json', JSON.stringify(analytics, null, 2));
      migrated++;
    }
    
    // Migrate charts
    const chartStore = DB.getStore('charts');
    const chartKeys = await chartStore.keys();
    console.log(`[VFS-Init] Migrating ${chartKeys.length} charts...`);
    
    for (const key of chartKeys) {
      const chartData = await chartStore.getItem(key);
      if (chartData) {
        const vfsPath = `index.directory/assets/charts/${key}.json`;
        await VFS.writeFile(vfsPath, JSON.stringify(chartData, null, 2));
        migrated++;
      }
    }
    
    console.log(`[VFS-Init] Migration complete, migrated ${migrated} items`);
    
  } catch (error) {
    console.error('[VFS-Init] Migration error:', error);
  }
}

/**
 * Generate markdown from trade object (for migration)
 */
function generateTradeMarkdown(trade) {
  const frontmatter = `---
trade_number: ${trade.trade_number || 1}
ticker: ${trade.ticker || 'UNKNOWN'}
entry_date: ${trade.entry_date || ''}
entry_time: ${trade.entry_time || ''}
exit_date: ${trade.exit_date || ''}
exit_time: ${trade.exit_time || ''}
entry_price: ${trade.entry_price || 0}
exit_price: ${trade.exit_price || 0}
shares: ${trade.shares || 0}
position_size: ${trade.position_size || 0}
stop_loss: ${trade.stop_loss || 0}
take_profit: ${trade.take_profit || 0}
pnl: ${trade.pnl || 0}
pnl_percent: ${trade.pnl_percent || 0}
commission: ${trade.commission || 0}
win: ${trade.win || false}
strategy: ${trade.strategy || 'none'}
setup: ${trade.setup || 'none'}
session: ${trade.session || 'regular'}
market_condition: ${trade.market_condition || 'neutral'}
notes: ""
images: []
---

# Trade ${trade.trade_number || 1}: ${trade.ticker || 'UNKNOWN'}

${trade.notes || 'No notes available'}
`;
  
  return frontmatter;
}

/**
 * Check if VFS needs initialization
 */
export async function needsInitialization() {
  const stats = await VFS.getVFSStats();
  return stats.totalFiles === 0;
}

/**
 * Auto-initialize VFS if empty
 */
export async function autoInitialize() {
  const needs = await needsInitialization();
  
  if (needs) {
    console.log('[VFS-Init] VFS is empty, auto-initializing...');
    
    // Try migration first
    await migrateFromLegacyStorage();
    
    // Then populate from repository
    const stats = await populateVFS({
      force: false,
      onProgress: (progress) => {
        if (progress.phase === 'static' && progress.current % 10 === 0) {
          console.log(`[VFS-Init] Progress: ${progress.current}/${progress.total} - ${progress.path}`);
        }
      }
    });
    
    return stats;
  } else {
    console.log('[VFS-Init] VFS already initialized');
    return await VFS.getVFSStats();
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.PersonalPenniesVFSInit = {
    populateVFS,
    migrateFromLegacyStorage,
    needsInitialization,
    autoInitialize
  };
}

console.log('[VFS-Init] VFS initialization module loaded');
