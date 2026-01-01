/**
 * Theme Commit System
 * Generates and commits theme change markdown files to index.directory/theme.c/
 * 
 * This module integrates with the customization system to persist theme changes
 * as markdown files (similar to trade commits). When a user edits theme settings
 * through customization.html, this module:
 * 
 * 1. Generates updated markdown content for the theme file
 * 2. Triggers a rebuild of Python-generated HTML pages (all-trades.html, trades/*.html)
 * 
 * @version 1.0.0
 * @see UsrC.Miles.md for customization milestone documentation
 */

(function() {
  'use strict';

  // ===== Configuration =====
  const CONFIG = {
    THEME_DIR: 'index.directory/theme.c/',
    REBUILD_DELAY: 2000, // Delay before triggering rebuild (ms)
    REBUILD_ENDPOINT: null // Set if using a rebuild API endpoint
  };

  // ===== CSS Variable to Theme Property Mapping =====
  // Maps customization.js theme keys to theme.c file properties
  const THEME_KEY_MAP = {
    // Colors
    'primaryColor': { file: 'colors', property: 'primary_color' },
    'accentColor': { file: 'colors', property: 'accent_color' },
    'redColor': { file: 'colors', property: 'red_color' },
    'blueColor': { file: 'colors', property: 'blue_color' },
    'backgroundColor': { file: 'colors', property: 'bg_primary' },
    'secondaryColor': { file: 'colors', property: 'bg_secondary' },
    'borderColor': { file: 'colors', property: 'border_color' },
    
    // Glass effects
    'glassOpacity': { file: 'glass', property: 'opacity' },
    'glassBlur': { file: 'glass', property: 'blur' },
    
    // Page messages
    'pageMessages.index': { file: 'messages', property: 'index' },
    'pageMessages.dashboard': { file: 'messages', property: 'dashboard' },
    'pageMessages.add_trade': { file: 'messages', property: 'add_trade' },
    'pageMessages.add_note': { file: 'messages', property: 'add_note' },
    'pageMessages.add_pdf': { file: 'messages', property: 'add_pdf' },
    'pageMessages.all_trades': { file: 'messages', property: 'all_trades' },
    'pageMessages.all_weeks': { file: 'messages', property: 'all_weeks' },
    'pageMessages.analytics': { file: 'messages', property: 'analytics' },
    'pageMessages.books': { file: 'messages', property: 'books' },
    'pageMessages.notes': { file: 'messages', property: 'notes' },
    'pageMessages.review': { file: 'messages', property: 'review' },
    'pageMessages.import': { file: 'messages', property: 'import' },
    'pageMessages.customization': { file: 'messages', property: 'customization' }
  };

  // ===== State =====
  let pendingCommits = {};
  let rebuildTimer = null;

  // ===== Public API =====

  /**
   * Queue a theme change for commit
   * Called when customization.js applies a theme change
   * 
   * @param {string} themeKey - The theme property key (e.g., 'primaryColor')
   * @param {any} value - The new value for the property
   */
  function queueThemeChange(themeKey, value) {
    const mapping = THEME_KEY_MAP[themeKey];
    if (!mapping) {
      console.warn(`[ThemeCommit] Unknown theme key: ${themeKey}`);
      return;
    }

    // Group changes by file
    if (!pendingCommits[mapping.file]) {
      pendingCommits[mapping.file] = {};
    }
    pendingCommits[mapping.file][mapping.property] = value;

    console.log(`[ThemeCommit] Queued change: ${themeKey} = ${value}`);
  }

  /**
   * Commit all pending theme changes
   * Generates markdown files and triggers rebuild
   * 
   * @returns {Promise<boolean>} True if commit was successful
   */
  async function commitThemeChanges() {
    if (Object.keys(pendingCommits).length === 0) {
      console.log('[ThemeCommit] No pending changes to commit');
      return true;
    }

    console.log('[ThemeCommit] Committing theme changes:', pendingCommits);

    // Store the markdown content in localStorage for the Python script to read
    // This is a client-side approach; in production, this would use a proper API
    try {
      const themeData = buildThemeData();
      localStorage.setItem('sfti_theme_pending', JSON.stringify({
        timestamp: new Date().toISOString(),
        changes: pendingCommits,
        fullTheme: themeData
      }));

      // Clear pending commits
      const committedChanges = { ...pendingCommits };
      pendingCommits = {};

      // Schedule rebuild
      scheduleRebuild();

      // Emit event for other components
      emitThemeCommitEvent(committedChanges);

      return true;
    } catch (error) {
      console.error('[ThemeCommit] Failed to commit changes:', error);
      return false;
    }
  }

  /**
   * Build complete theme data from current customizations
   * 
   * @returns {Object} Complete theme configuration
   */
  function buildThemeData() {
    const theme = window.accountManager?.getCustomization('theme') || {};
    const preferences = window.accountManager?.getCustomization('preferences') || {};
    const pageMessages = preferences.pageMessages || {};
    
    return {
      colors: {
        primary_color: theme.primaryColor || '#00ff88',
        accent_color: theme.accentColor || '#ffd93d',
        red_color: theme.redColor || '#ff4757',
        blue_color: theme.blueColor || '#00d4ff',
        bg_primary: theme.backgroundColor || '#0a0e27',
        bg_secondary: theme.secondaryColor || '#0f1429',
        border_color: theme.borderColor || '#27272a',
        text_primary: '#e4e4e7',
        text_secondary: '#a1a1aa'
      },
      glass: {
        opacity: theme.glassOpacity || 0.55,
        blur: theme.glassBlur || 45,
        border_opacity: 0.12,
        shadow_opacity: 0.25
      },
      header: {
        background_color: 'rgba(10, 14, 39, 0.55)',
        border_color: 'rgba(255, 255, 255, 0.12)',
        text_color: '#e4e4e7',
        logo_color: theme.primaryColor || '#00ff88',
        height: '60px',
        blur: 20
      },
      glowbubbles: {
        profile: { color: 'rgba(147, 51, 234, 1)', glow_intensity: 0.3 },
        add: { color: theme.primaryColor || 'rgba(0, 255, 136, 1)', glow_intensity: 0.3 },
        books: { color: 'rgba(100, 255, 218, 1)', glow_intensity: 0.3 },
        notes: { color: 'rgba(147, 51, 234, 1)', glow_intensity: 0.3 },
        trades: { color: theme.accentColor || 'rgba(251, 191, 36, 1)', glow_intensity: 0.3 },
        mentors: { color: 'rgba(236, 72, 153, 1)', glow_intensity: 0.3 }
      },
      messages: {
        index: pageMessages.index || 'Welcome to Your Trading Journal',
        dashboard: pageMessages.dashboard || 'Welcome to Your Trading Journal',
        add_trade: pageMessages.add_trade || 'Add New Trade',
        add_note: pageMessages.add_note || 'Add New Note',
        add_pdf: pageMessages.add_pdf || 'Upload Trade PDF',
        all_trades: pageMessages.all_trades || 'All Trades',
        all_weeks: pageMessages.all_weeks || 'Weekly Performance',
        analytics: pageMessages.analytics || 'Analytics Dashboard',
        books: pageMessages.books || 'Trading Books Library',
        notes: pageMessages.notes || 'Trading Notes',
        review: pageMessages.review || 'Trade Review',
        import: pageMessages['import'] || 'Import Trading Data',
        customization: pageMessages.customization || 'Customize Your Journal'
      }
    };
  }

  /**
   * Generate markdown content for a theme file
   * 
   * @param {string} component - Component name (colors, glass, header, etc.)
   * @param {Object} data - Theme data for the component
   * @returns {string} Markdown file content
   */
  function generateMarkdown(component, data) {
    const timestamp = new Date().toISOString();
    
    // Build YAML front matter
    let frontMatter = `---\ncomponent: ${component}\nupdated: ${timestamp}\nauthor: user\nversion: 1.0\n`;
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object') {
        // Handle nested objects (like glowbubble properties)
        for (const [subKey, subValue] of Object.entries(value)) {
          frontMatter += `${subKey}: ${formatYamlValue(subValue)}\n`;
        }
      } else {
        frontMatter += `${key}: ${formatYamlValue(value)}\n`;
      }
    }
    
    frontMatter += '---\n\n';

    // Build markdown body
    const body = generateMarkdownBody(component, data);

    return frontMatter + body;
  }

  /**
   * Format a value for YAML
   * 
   * @param {any} value - Value to format
   * @returns {string} YAML-formatted value
   */
  function formatYamlValue(value) {
    if (typeof value === 'string') {
      // Quote strings that contain special characters
      // First escape backslashes, then escape quotes to prevent injection
      if (value.includes(':') || value.includes('#') || value.includes('"') || value.includes('\\')) {
        return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      }
      return `"${value}"`;
    }
    return String(value);
  }

  /**
   * Generate markdown body content for a component
   * 
   * @param {string} component - Component name
   * @param {Object} data - Theme data
   * @returns {string} Markdown body content
   */
  function generateMarkdownBody(component, data) {
    const titles = {
      colors: 'Theme: Global Colors',
      glass: 'Theme: Glass Effects',
      header: 'Theme: Header/Navbar',
      messages: 'Theme: Top Page Messages'
    };

    // Validate component against known titles to avoid injecting arbitrary content
    const allowedComponents = Object.keys(titles);
    const isAllowedComponent = allowedComponents.includes(component);
    const headingTitle = isAllowedComponent
      ? titles[component]
      : 'Theme: Custom Component';

    let body = `# ${headingTitle}\n\n`;
    body += `Configuration updated by user customization.\n\n`;
    body += `## Current Values\n\n`;
    body += `| Property | Value |\n|----------|-------|\n`;

    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'object') {
        body += `| ${key} | ${value} |\n`;
      }
    }

    body += `\n## Usage Notes\n\n`;
    body += `- Changes trigger rebuild of \`all-trades.html\` and \`trades/*.html\`\n`;
    body += `- Updated: ${new Date().toLocaleString()}\n`;

    return body;
  }

  /**
   * Schedule a rebuild of Python-generated HTML files
   * Uses a debounce to batch multiple changes
   */
  function scheduleRebuild() {
    // Clear any existing timer
    if (rebuildTimer) {
      clearTimeout(rebuildTimer);
    }

    // Schedule new rebuild
    rebuildTimer = setTimeout(() => {
      triggerRebuild();
    }, CONFIG.REBUILD_DELAY);

    console.log(`[ThemeCommit] Rebuild scheduled in ${CONFIG.REBUILD_DELAY}ms`);
  }

  /**
   * Trigger rebuild of Python-generated HTML files
   * In a GitHub Pages environment, this notifies the user that
   * changes require a manual rebuild or GitHub Actions workflow
   */
  function triggerRebuild() {
    console.log('[ThemeCommit] Triggering rebuild...');

    // Check if we have a rebuild endpoint configured
    if (CONFIG.REBUILD_ENDPOINT) {
      // Would call API endpoint here for server-side rebuild
      fetch(CONFIG.REBUILD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rebuild_theme',
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.warn('[ThemeCommit] Rebuild API call failed:', err));
    }

    // Show notification to user about theme changes
    showRebuildNotification();
  }

  /**
   * Show notification about rebuild status
   */
  function showRebuildNotification() {
    // Emit event that can be caught by notification system
    const event = new CustomEvent('themeRebuildRequired', {
      detail: {
        message: 'Theme changes saved. Trade pages will update on next build.',
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);

    // Also show via accountManager if available
    if (window.accountManager?.showNotification) {
      window.accountManager.showNotification(
        'Theme Updated',
        'Your theme changes have been saved. Generated pages will update on next build.',
        'info'
      );
    }
  }

  /**
   * Emit theme commit event for other components to listen to
   * 
   * @param {Object} changes - The committed changes
   */
  function emitThemeCommitEvent(changes) {
    const event = new CustomEvent('themeCommitted', {
      detail: {
        changes,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get pending theme changes
   * 
   * @returns {Object} Pending changes grouped by file
   */
  function getPendingChanges() {
    return { ...pendingCommits };
  }

  /**
   * Clear pending theme changes without committing
   */
  function clearPendingChanges() {
    pendingCommits = {};
    if (rebuildTimer) {
      clearTimeout(rebuildTimer);
      rebuildTimer = null;
    }
  }

  /**
   * Check if there are pending theme changes
   * 
   * @returns {boolean} True if there are pending changes
   */
  function hasPendingChanges() {
    return Object.keys(pendingCommits).length > 0;
  }

  /**
   * Get the full theme configuration
   * Combines defaults with user customizations
   * 
   * @returns {Object} Complete theme configuration
   */
  function getThemeConfig() {
    return buildThemeData();
  }

  // ===== Integration with Customization System =====

  /**
   * Hook into accountManager to intercept theme changes
   * This allows automatic queuing of theme changes for commit
   */
  function hookCustomizationSystem() {
    // Wait for accountManager to be ready
    const checkInterval = setInterval(() => {
      if (window.accountManager && window.accountManager.setCustomization) {
        clearInterval(checkInterval);
        
        // Wrap setCustomization to intercept theme changes
        const originalSetCustomization = window.accountManager.setCustomization.bind(window.accountManager);
        
        window.accountManager.setCustomization = function(key, value) {
          const result = originalSetCustomization(key, value);
          
          // Check if this is a theme change
          if (key.startsWith('theme.')) {
            const themeKey = key.replace('theme.', '');
            queueThemeChange(themeKey, value);
          }
          
          return result;
        };
        
        console.log('[ThemeCommit] Hooked into customization system');
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkInterval), 10000);
  }

  // ===== Export Public API =====
  window.ThemeCommit = {
    queueThemeChange,
    commitThemeChanges,
    getPendingChanges,
    clearPendingChanges,
    hasPendingChanges,
    getThemeConfig,
    generateMarkdown,
    CONFIG
  };

  // ===== Auto-Initialize =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookCustomizationSystem);
  } else {
    hookCustomizationSystem();
  }

})();
