/**
 * Personal-Pennies System Loader
 * Loads all system modules in the correct order
 * 
 * Usage: Add to HTML pages that need the client-side system
 * <script src="system/loader.js" type="module"></script>
 */

// Load LocalForage from local vendor directory (bundled locally, but updates client-side)
const localforageScript = document.createElement('script');
// Use path relative to the base path of the site
const basePath = window.location.pathname.split('/').slice(0, -1).join('/') || '';
localforageScript.src = `${basePath}/system/vendor/localforage.min.js`;
localforageScript.onload = async () => {
  console.log('[System] LocalForage loaded from local bundle');
  
  // Now load our modules
  await loadSystemModules();
};
localforageScript.onerror = (error) => {
  console.error('[System] Failed to load LocalForage:', error);
  console.error('[System] Attempted to load from:', localforageScript.src);
};
document.head.appendChild(localforageScript);

async function loadSystemModules() {
  try {
    // Import VFS (filesystem-based storage)
    const VFS = await import('./storage/vfs.js');
    const VFSInit = await import('./storage/vfs-init.js');
    const VFSAdapter = await import('./storage/vfs-adapter.js');
    const DataAccess = await import('./storage/data-access.js');

    // Import utilities
    const Utils = await import('./scripts/utils.js');
    const GlobalsUtils = await import('./scripts/globals_utils.js');

    // Import scripts (using named exports)
    const ParseTradesModule = await import('./scripts/parse_trades.js');
    const ParseTrades = { parseTrades: ParseTradesModule.parseTrades, generate: ParseTradesModule.parseTrades };
    
    const GenerateAnalyticsModule = await import('./scripts/generate_analytics.js');
    const GenerateAnalytics = { generate: GenerateAnalyticsModule.generate || GenerateAnalyticsModule.generateAnalytics };
    
    const GenerateChartsModule = await import('./scripts/generate_charts.js');
    const GenerateCharts = { generate: GenerateChartsModule.generate || GenerateChartsModule.generateCharts };
    
    const GenerateSummariesModule = await import('./scripts/generate_summaries.js');
    const GenerateSummaries = { generate: GenerateSummariesModule.generate || GenerateSummariesModule.generateSummaries };
    
    const GenerateTradePagesModule = await import('./scripts/generate_trade_pages.js');
    const GenerateTradePages = { generate: GenerateTradePagesModule.generate || GenerateTradePagesModule.generateTradePages };
    
    const GenerateWeekSummariesModule = await import('./scripts/generate_week_summaries.js');
    const GenerateWeekSummaries = { generate: GenerateWeekSummariesModule.generate || GenerateWeekSummariesModule.generateWeekSummaries };
    
    const GenerateBooksIndexModule = await import('./scripts/generate_books_index.js');
    const GenerateBooksIndex = { generate: GenerateBooksIndexModule.generate || GenerateBooksIndexModule.generateBooksIndex };
    
    const GenerateNotesIndexModule = await import('./scripts/generate_notes_index.js');
    const GenerateNotesIndex = { generate: GenerateNotesIndexModule.generate || GenerateNotesIndexModule.generateNotesIndex };
    
    const GenerateIndexModule = await import('./scripts/generate_index.js');
    const GenerateIndex = { generate: GenerateIndexModule.generate || GenerateIndexModule.generateIndex };
    
    const UpdateHomepageModule = await import('./scripts/update_homepage.js');
    const UpdateHomepage = { update: UpdateHomepageModule.update || UpdateHomepageModule.updateHomepage };
    
    const NavbarTemplate = await import('./scripts/navbar_template.js');
    const NormalizeSchema = await import('./scripts/normalize_schema.js');
    const AttachMedia = await import('./scripts/attach_media.js');
    const ImportCSV = await import('./scripts/import_csv.js');
    const ExportCSV = await import('./scripts/export_csv.js');
    
    // Import broker importers
    const Importers = await import('./scripts/importers/index.js');

    // Import pipeline
    const Pipeline = await import('./workflows/trade_pipeline.js');

    // Make modules globally available
    window.PersonalPenniesSystem = {
      VFS,
      VFSInit,
      VFSAdapter,
      DataAccess,
      Utils,
      GlobalsUtils,
      ParseTrades,
      GenerateAnalytics,
      GenerateCharts,
      GenerateSummaries,
      GenerateTradePages,
      GenerateWeekSummaries,
      GenerateBooksIndex,
      GenerateNotesIndex,
      GenerateIndex,
      UpdateHomepage,
      NavbarTemplate,
      NormalizeSchema,
      AttachMedia,
      ImportCSV,
      ExportCSV,
      Importers,
      Pipeline,
      version: '2.0.0',
      ready: true
    };
    
    // Also expose DataAccess globally for easy access
    window.PersonalPenniesDataAccess = DataAccess;
    
    // Expose DB interface for legacy compatibility
    window.PersonalPenniesSystem.DB = {
      saveTrade: DataAccess.saveTrade,
      loadTradesIndex: DataAccess.loadTradesIndex,
      loadTradeMarkdown: DataAccess.loadTradeMarkdown,
      saveTradeMarkdown: DataAccess.saveTradeMarkdown
    };

    console.log('[System] Personal-Pennies client-side system loaded successfully');
    console.log('[System] Version:', window.PersonalPenniesSystem.version);
    console.log('[System] Modules loaded:', Object.keys(window.PersonalPenniesSystem).length);

    // Initialize VFS (filesystem-based storage)
    await initializeVFS();

    // Emit system ready event
    if (window.SFTiEventBus) {
      window.SFTiEventBus.emit('system:ready', { version: '2.0.0' });
    }
  } catch (error) {
    console.error('[System] Failed to load system modules:', error);
  }
}

/**
 * Initialize VFS and populate with repository content
 */
async function initializeVFS() {
  try {
    console.log('[VFS] Initializing Virtual Filesystem...');
    
    // Auto-initialize VFS if empty
    const stats = await window.PersonalPenniesSystem.VFSInit.autoInitialize();
    
    console.log('[VFS] Virtual Filesystem ready');
    console.log('[VFS] Files:', stats.totalFiles, '| Size:', stats.totalSizeMB, 'MB');
    
    // Install VFS fetch adapter to intercept all fetch calls
    window.PersonalPenniesSystem.VFSAdapter.installGlobalVFSFetch();
    console.log('[VFS] Fetch adapter installed - fetch() now reads from IndexedDB first');
    
    // Emit VFS ready event
    if (window.SFTiEventBus) {
      window.SFTiEventBus.emit('vfs:ready', stats);
    }
    
    // Setup VFS file watcher to trigger pipeline (matches GitHub Actions on: push: paths:)
    setupVFSWatcher();
    
  } catch (error) {
    console.error('[VFS] Failed to initialize Virtual Filesystem:', error);
  }
}

/**
 * Setup VFS file watcher to trigger pipeline on file writes
 * Matches GitHub Actions workflow trigger: on push to specific paths
 */
function setupVFSWatcher() {
  console.log('[Workflow] Setting up VFS file watcher...');
  
  // Trigger paths from .github/workflows/trade_pipeline.yml
  const triggerPaths = [
    'index.directory/SFTi.Tradez/',          // Trades
    'index.directory/account-config.json',    // Account config (deposits/withdrawals)
    'index.directory/Informational.Bookz/',   // Books
    'index.directory/SFTi.Notez/'            // Notes
  ];
  
  // Intercept VFS writeFile to detect file changes
  const originalWriteFile = window.PersonalPenniesSystem.VFS.writeFile;
  
  window.PersonalPenniesSystem.VFS.writeFile = async function(path, content, options) {
    // Call original writeFile
    const result = await originalWriteFile(path, content, options);
    
    // Check if path matches trigger patterns
    const shouldTrigger = triggerPaths.some(triggerPath => path.startsWith(triggerPath));
    
    if (shouldTrigger) {
      console.log(`[Workflow] File write detected in trigger path: ${path}`);
      console.log('[Workflow] Auto-triggering trade pipeline...');
      
      // Trigger pipeline asynchronously (don't wait for it)
      window.PersonalPenniesSystem.Pipeline.runTradePipeline()
        .then(results => {
          console.log('[Workflow] Pipeline completed successfully');
          // Emit pipeline completed event
          if (window.SFTiEventBus) {
            window.SFTiEventBus.emit('pipeline:completed', results);
          }
        })
        .catch(error => {
          console.error('[Workflow] Pipeline failed:', error);
          if (window.SFTiEventBus) {
            window.SFTiEventBus.emit('pipeline:failed', { error: error.message });
          }
        });
    }
    
    return result;
  };
  
  console.log('[Workflow] VFS file watcher active - monitoring trigger paths');
}
