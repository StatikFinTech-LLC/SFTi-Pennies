/**
 * Customization Page Controller
 * Comprehensive customization system for SFTi-Pennies Trading Journal
 * Implements sidebar/preview/actions layout with per-page component awareness
 * 
 * @version 2.0.0
 * @see UsrC.Miles.md for full milestone documentation
 */

(function() {
  'use strict';

  // ===== Configuration =====
  const CONFIG = {
    MAX_INIT_RETRIES: 100,
    INIT_RETRY_DELAY: 100,
    DEFAULT_CATEGORY: 'global-colors',
    DEFAULT_PAGE: 'index'
  };

  // ===== Default Color Constants =====
  // Centralized default values for consistency across the module
  const DEFAULT_COLORS = {
    PRIMARY: '#00ff88',      // Accent green - buttons, links, positive
    ACCENT: '#ffd93d',       // Yellow - highlights, warnings
    RED: '#ff4757',          // Error/loss color
    BLUE: '#00d4ff',         // Info color
    BG_PRIMARY: '#0a0e27',   // Main background
    BG_SECONDARY: '#0f1429', // Card/container background
    BORDER: '#27272a'        // Default border color
  };

  // ===== Default Glass Settings =====
  const DEFAULT_GLASS = {
    OPACITY: 0.55,
    BLUR: 45
  };

  // ===== Default Animation Settings =====
  const DEFAULT_ANIMATION = {
    INTENSITY: 1.0
  };

  // ===== Color Scheme Presets =====
  // Predefined color scheme presets for one-click application
  const COLOR_SCHEME_PRESETS = {
    'default': {
      name: 'Default',
      icon: '🎨',
      description: 'The classic SFTi-Pennies color scheme',
      colors: {
        primaryColor: '#00ff88',
        accentColor: '#ffd93d',
        redColor: '#ff4757',
        blueColor: '#00d4ff',
        backgroundColor: '#0a0e27',
        secondaryColor: '#0f1429',
        borderColor: '#27272a'
      }
    },
    'professional': {
      name: 'Professional',
      icon: '💼',
      description: 'Clean, minimal, and business-focused',
      colors: {
        primaryColor: '#059669',
        accentColor: '#f59e0b',
        redColor: '#ef4444',
        blueColor: '#3b82f6',
        backgroundColor: '#0f172a',
        secondaryColor: '#1e293b',
        borderColor: '#334155'
      }
    },
    'cosmic': {
      name: 'Cosmic',
      icon: '🌌',
      description: 'Deep space vibes with purple and cyan',
      colors: {
        primaryColor: '#a78bfa',
        accentColor: '#22d3ee',
        redColor: '#f472b6',
        blueColor: '#60a5fa',
        backgroundColor: '#0c0a1f',
        secondaryColor: '#1a1533',
        borderColor: '#312e81'
      }
    },
    'energetic': {
      name: 'Energetic',
      icon: '⚡',
      description: 'Bold, vibrant colors for high energy',
      colors: {
        primaryColor: '#00ffcc',
        accentColor: '#ffcc00',
        redColor: '#ff3366',
        blueColor: '#00ccff',
        backgroundColor: '#0d1117',
        secondaryColor: '#161b22',
        borderColor: '#30363d'
      }
    },
    'zen': {
      name: 'Zen',
      icon: '🧘',
      description: 'Calm, balanced tones for focus',
      colors: {
        primaryColor: '#34d399',
        accentColor: '#fbbf24',
        redColor: '#f87171',
        blueColor: '#60a5fa',
        backgroundColor: '#111827',
        secondaryColor: '#1f2937',
        borderColor: '#374151'
      }
    },
    'ocean': {
      name: 'Ocean',
      icon: '🌊',
      description: 'Deep blue and teal sea-inspired palette',
      colors: {
        primaryColor: '#06b6d4',
        accentColor: '#14b8a6',
        redColor: '#ef4444',
        blueColor: '#0ea5e9',
        backgroundColor: '#0a192f',
        secondaryColor: '#112240',
        borderColor: '#233554'
      }
    },
    'sunset': {
      name: 'Sunset',
      icon: '🌅',
      description: 'Warm oranges and purples like dusk',
      colors: {
        primaryColor: '#f97316',
        accentColor: '#fbbf24',
        redColor: '#dc2626',
        blueColor: '#8b5cf6',
        backgroundColor: '#1a0f1f',
        secondaryColor: '#2d1b3d',
        borderColor: '#4c2a5c'
      }
    },
    'forest': {
      name: 'Forest',
      icon: '🌲',
      description: 'Natural greens and earth tones',
      colors: {
        primaryColor: '#10b981',
        accentColor: '#84cc16',
        redColor: '#dc2626',
        blueColor: '#0ea5e9',
        backgroundColor: '#0f1f0f',
        secondaryColor: '#1a2e1a',
        borderColor: '#2d4a2d'
      }
    }
  };

  // ===== CSS Variable Mapping =====
  // Maps theme properties to CSS custom properties for live updates.
  // Only properties listed here are applied via CSS variables; other theme
  // settings (e.g., layout/typography options) are handled by different
  // mechanisms and are intentionally excluded from live CSS var mapping.
  const CSS_VAR_MAP = {
    'primaryColor': '--accent-green',
    'accentColor': '--accent-yellow',
    'redColor': '--accent-red',
    'blueColor': '--accent-blue',
    'backgroundColor': '--bg-primary',
    'secondaryColor': '--bg-secondary',
    'borderColor': '--border-color',
    'glowColor': '--glow-color',
    // Glassmorphism settings for live updates
    'glassOpacity': '--glass-opacity',
    'glassBlur': '--glass-blur'
  };

  // ===== Pages excluded from page selector =====
  const EXCLUDED_PAGES = ['customization'];

  // ===== Comprehensive Category Definitions =====
  // Categories are organized by: Global (all pages) and Page-Specific
  const CATEGORIES = {
    // ===== GLOBAL CATEGORIES (apply to all pages) =====
    'global-colors': {
      id: 'global-colors',
      name: 'Colors',
      icon: 'palette',
      description: 'Primary accent colors used throughout your journal',
      scope: 'global',
      cssVars: ['--accent-green', '--accent-yellow', '--accent-red', '--accent-blue']
    },
    'themes': {
      id: 'themes',
      name: 'Theme Mode',
      icon: 'adjustments',
      description: 'Light/dark mode, animation intensity, and visual effects',
      scope: 'global',
      cssVars: []
    },
    'global-backgrounds': {
      id: 'global-backgrounds',
      name: 'Backgrounds',
      icon: 'image',
      description: 'Page backgrounds, canvas animations, and blur effects',
      scope: 'global',
      cssVars: ['--bg-primary', '--bg-secondary', '--bg-tertiary']
    },
    'global-glass': {
      id: 'global-glass',
      name: 'Glass Effects',
      icon: 'sparkles',
      description: 'Glassmorphism blur, opacity, and glow settings',
      scope: 'global',
      cssVars: ['--glass-blur-light', '--glass-blur-medium', '--glass-opacity-light']
    },
    'global-typography': {
      id: 'global-typography',
      name: 'Typography',
      icon: 'type',
      description: 'Font sizes, families, and text colors',
      scope: 'global',
      cssVars: ['--font-mono', '--font-sans', '--text-primary', '--text-secondary']
    },
    'global-borders': {
      id: 'global-borders',
      name: 'Borders',
      icon: 'square',
      description: 'Border colors, widths, and corner radius settings',
      scope: 'global',
      cssVars: ['--border-color', '--glass-radius-sm', '--glass-radius-md']
    },
    
    // ===== COMPONENT CATEGORIES =====
    'navbar': {
      id: 'navbar',
      name: 'Navigation Bar',
      icon: 'menu',
      description: 'Top navigation bar colors, icons, and dropdown styles',
      scope: 'component',
      pages: ['all'],
      elements: ['.nav-container', '.nav-menu', '.nav-item', '.nav-link']
    },
    'footer': {
      id: 'footer',
      name: 'Footer',
      icon: 'footer',
      description: 'Footer background, text colors, and link styles',
      scope: 'component',
      pages: ['all'],
      elements: ['footer', '.footer-content', '.footer-links']
    },
    'bubbles': {
      id: 'bubbles',
      name: 'Glowing Bubbles',
      icon: 'bubble',
      description: 'Mobile navigation bubble colors, glow effects, and animations',
      scope: 'component',
      pages: ['all'],
      elements: ['.glowing-bubble', '.bubble-dropdown', '.glowing-bubbles-container']
    },
    'cards': {
      id: 'cards',
      name: 'Cards & Boxes',
      icon: 'card',
      description: 'Stat cards, glass cards, and container styles',
      scope: 'component',
      pages: ['all'],
      elements: ['.stat-card', '.glass-card', '.glass-stat', '.glass-chart']
    },
    'modals': {
      id: 'modals',
      name: 'Modals & Popups',
      icon: 'modal',
      description: 'Modal backgrounds, borders, and animation styles',
      scope: 'component',
      pages: ['all'],
      elements: ['.modal-overlay', '.modal-container', '.modal-header']
    },
    'charts': {
      id: 'charts',
      name: 'Charts & Analytics',
      icon: 'chart',
      description: 'Chart colors, grid lines, tooltips, and data visualization',
      scope: 'component',
      pages: ['index', 'analytics', 'all-trades', 'all-weeks'],
      elements: ['canvas', '.chart-container', '.glass-chart']
    },
    'buttons': {
      id: 'buttons',
      name: 'Buttons',
      icon: 'cursor',
      description: 'Primary, secondary, and action button styles',
      scope: 'component',
      pages: ['all'],
      elements: ['.btn-primary', '.btn-secondary', '.btn-danger', '.glass-btn']
    },
    'forms': {
      id: 'forms',
      name: 'Forms & Inputs',
      icon: 'form',
      description: 'Input fields, selects, and form control styles',
      scope: 'component',
      pages: ['add-trade', 'add-note', 'add-pdf', 'import'],
      elements: ['input', 'select', 'textarea', '.form-group']
    },
    
    // ===== PREFERENCES CATEGORY =====
    'preferences': {
      id: 'preferences',
      name: 'Preferences',
      icon: 'cog',
      description: 'Date format, currency symbol, timezone, and page messages',
      scope: 'preferences'
    },
    
    // ===== PAGE-SPECIFIC CATEGORIES =====
    'page-messages': {
      id: 'page-messages',
      name: 'Page Messages',
      icon: 'message',
      description: 'Custom welcome messages for each page',
      scope: 'page-specific'
    }
  };

  // ===== Page Names =====
  const PAGE_NAMES = {
    'index': 'Dashboard',
    'add-trade': 'Add Trade',
    'add-note': 'Add Note',
    'add-pdf': 'Add PDF',
    'all-trades': 'All Trades',
    'all-weeks': 'All Weeks',
    'analytics': 'Analytics',
    'books': 'Books',
    'notes': 'Notes',
    'review': 'Review',
    'import': 'Import',
    'customization': 'Customization'
  };

  // ===== Page-Specific Components Registry =====
  // Defines which components are available on each page
  const PAGE_COMPONENTS = {
    'index': ['navbar', 'footer', 'cards', 'charts', 'modals', 'buttons'],
    'add-trade': ['navbar', 'footer', 'forms', 'buttons', 'cards'],
    'add-note': ['navbar', 'footer', 'forms', 'buttons'],
    'add-pdf': ['navbar', 'footer', 'forms', 'buttons'],
    'all-trades': ['navbar', 'footer', 'cards', 'buttons', 'charts'],
    'all-weeks': ['navbar', 'footer', 'cards', 'buttons', 'charts'],
    'analytics': ['navbar', 'footer', 'cards', 'charts', 'buttons'],
    'books': ['navbar', 'footer', 'cards', 'buttons'],
    'notes': ['navbar', 'footer', 'cards', 'buttons'],
    'review': ['navbar', 'footer', 'cards', 'charts', 'buttons'],
    'import': ['navbar', 'footer', 'forms', 'buttons', 'cards']
  };

  // ===== SVG Icons (Extended Set) =====
  const ICONS = {
    // Navigation & UI
    palette: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>',
    adjustments: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>',
    cog: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    chevronRight: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>',
    home: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
    message: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>',
    
    // Component Icons
    image: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    sparkles: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>',
    type: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>',
    square: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"/></svg>',
    menu: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>',
    footer: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>',
    bubble: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01"/></svg>',
    card: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>',
    modal: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
    chart: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    cursor: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>',
    form: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>'
  };

  // ===== State =====
  let state = {
    category: CONFIG.DEFAULT_CATEGORY,
    referringPage: CONFIG.DEFAULT_PAGE,
    initRetryCount: 0,
    pendingChanges: {}
  };

  // ===== Initialization =====

  /**
   * Initialize customization page
   */
  function init() {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    state.category = urlParams.get('category') || CONFIG.DEFAULT_CATEGORY;
    state.referringPage = urlParams.get('page') || CONFIG.DEFAULT_PAGE;

    // Wait for accountManager to be ready
    waitForAccountManager();
  }

  /**
   * Wait for accountManager to be initialized
   */
  function waitForAccountManager() {
    if (!window.accountManager || !window.accountManager.config) {
      if (state.initRetryCount >= CONFIG.MAX_INIT_RETRIES) {
        showInitializationError();
        return;
      }
      state.initRetryCount++;
      setTimeout(waitForAccountManager, CONFIG.INIT_RETRY_DELAY);
      return;
    }

    // AccountManager is ready, render the page
    renderPage();
  }

  /**
   * Show initialization error
   */
  function showInitializationError() {
    const container = document.getElementById('customization-container');
    if (container) {
      container.innerHTML = `
        <div class="customization-error">
          <div class="customization-error-icon">
            <svg width="64" height="64" fill="none" stroke="var(--accent-red)" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h4 class="customization-error-title">Unable to Load Settings</h4>
          <p class="customization-error-message">Please reload the page and try again.</p>
        </div>
      `;
    }
  }

  // ===== Rendering =====

  /**
   * Render the complete page
   */
  function renderPage() {
    const container = document.getElementById('customization-container');
    if (!container) return;

    container.innerHTML = `
      <div class="customization-layout">
        ${renderBreadcrumb()}
        ${renderSidebar()}
        ${renderPreview()}
        ${renderActions()}
      </div>
    `;

    // Setup event listeners
    setupEventListeners();
  }

  /**
   * Render breadcrumb navigation
   */
  function renderBreadcrumb() {
    const homeUrl = getBackURL(state.referringPage);
    const pageName = getPageDisplayName(state.referringPage);
    const categoryName = CATEGORIES[state.category]?.name || state.category;

    return `
      <nav class="customization-breadcrumb" aria-label="Breadcrumb">
        <a href="${homeUrl}" class="breadcrumb-link" title="Go to ${pageName}">
          ${ICONS.home}
          <span>${pageName}</span>
        </a>
        <span class="breadcrumb-separator">${ICONS.chevronRight}</span>
        <span class="breadcrumb-current">${categoryName}</span>
      </nav>
    `;
  }

  /**
   * Render page selector dropdown
   */
  function renderPageSelector() {
    const pageOptions = Object.entries(PAGE_NAMES)
      .filter(([key]) => !EXCLUDED_PAGES.includes(key))
      .map(([key, name]) => {
        const selected = key === state.referringPage ? 'selected' : '';
        return `<option value="${key}" ${selected}>${name}</option>`;
      }).join('');

    return `
      <div class="page-selector-container">
        <label for="page-selector" class="page-selector-label" id="page-selector-label">Preview for Page:</label>
        <select id="page-selector" class="page-selector-select" aria-labelledby="page-selector-label">
          ${pageOptions}
        </select>
      </div>
    `;
  }

  /**
   * Render sidebar navigation with categories grouped by scope
   * Categories are filtered based on the referring page's available components
   */
  function renderSidebar() {
    const pageComponents = PAGE_COMPONENTS[state.referringPage] || [];
    
    // Group categories by scope
    const globalCategories = Object.values(CATEGORIES).filter(cat => cat.scope === 'global');
    const componentCategories = Object.values(CATEGORIES).filter(cat => {
      if (cat.scope !== 'component') return false;
      // Show if it applies to 'all' pages or specifically to this page
      if (cat.pages && cat.pages.includes('all')) return true;
      if (cat.pages && cat.pages.includes(state.referringPage)) return true;
      // Also show if it's in the page's component list
      return pageComponents.includes(cat.id);
    });
    const preferenceCategories = Object.values(CATEGORIES).filter(cat => 
      cat.scope === 'preferences' || cat.scope === 'page-specific'
    );

    const renderCategoryGroup = (categories, groupTitle) => {
      if (categories.length === 0) return '';
      
      const items = categories.map(cat => {
        const isActive = cat.id === state.category;
        const activeClass = isActive ? 'active' : '';
        const ariaCurrent = isActive ? 'aria-current="page"' : '';
        
        return `
          <button 
            class="sidebar-nav-item ${activeClass}" 
            data-category="${cat.id}"
            ${ariaCurrent}
            aria-label="Customize ${cat.name}"
          >
            ${ICONS[cat.icon] || ICONS.cog}
            <span>${cat.name}</span>
          </button>
        `;
      }).join('');

      return `
        <div class="sidebar-group">
          <h4 class="sidebar-group-title">${groupTitle}</h4>
          ${items}
        </div>
      `;
    };

    return `
      <aside class="customization-sidebar" role="navigation" aria-label="Customization categories">
        <h3 class="sidebar-title">Customize</h3>
        ${renderPageSelector()}
        ${renderCategoryGroup(globalCategories, 'Global Styles')}
        ${renderCategoryGroup(componentCategories, 'Components')}
        ${renderCategoryGroup(preferenceCategories, 'Preferences')}
      </aside>
    `;
  }

  /**
   * Render preview panel
   */
  function renderPreview() {
    const category = CATEGORIES[state.category];
    const content = getCategoryContent(state.category);

    return `
      <section class="customization-preview" aria-label="Customization options">
        <div class="preview-header">
          ${ICONS[category?.icon || 'cog']}
          <h3 id="preview-title">${category?.name || 'Customization'}</h3>
        </div>
        <p id="preview-description" style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          ${category?.description || 'Customize your settings'}
        </p>
        <div id="preview-content" class="preview-content">
          ${content}
        </div>
      </section>
    `;
  }

  /**
   * Render actions panel
   */
  function renderActions() {
    return `
      <footer class="customization-actions" id="customization-actions">
        <button id="btn-cancel" class="btn-secondary" type="button">
          Cancel
        </button>
        <button id="btn-reset" class="btn-secondary" type="button" style="border-color: var(--accent-yellow); color: var(--accent-yellow);">
          Reset to Default
        </button>
        <button id="btn-apply" class="btn-primary" type="button">
          Apply Changes
        </button>
      </footer>
    `;
  }

  /**
   * Get category-specific content
   * Routes to appropriate renderer based on category type
   */
  function getCategoryContent(category) {
    switch (category) {
      // Global Styles
      case 'global-colors':
        return renderGlobalColorsCustomization();
      case 'themes':
        return renderThemeCustomization();
      case 'global-backgrounds':
        return renderBackgroundsCustomization();
      case 'global-glass':
        return renderGlassEffectsCustomization();
      case 'global-typography':
        return renderTypographyCustomization();
      case 'global-borders':
        return renderBordersCustomization();
      
      // Components
      case 'navbar':
        return renderNavbarCustomization();
      case 'footer':
        return renderFooterCustomization();
      case 'bubbles':
        return renderBubblesCustomization();
      case 'cards':
        return renderCardsCustomization();
      case 'modals':
        return renderModalsCustomization();
      case 'charts':
        return renderChartsCustomization();
      case 'buttons':
        return renderButtonsCustomization();
      case 'forms':
        return renderFormsCustomization();
      
      // Preferences
      case 'preferences':
        return renderPreferencesCustomization();
      case 'page-messages':
        return renderPageMessagesCustomization();
      
      // Default fallback
      default:
        return renderGlobalColorsCustomization();
    }
  }

  /**
   * Render Global Colors customization with live preview
   */
  function renderGlobalColorsCustomization() {
    const theme = window.accountManager.getCustomization('theme') || {};
    const primaryColor = theme.primaryColor || DEFAULT_COLORS.PRIMARY;
    const accentColor = theme.accentColor || DEFAULT_COLORS.ACCENT;
    const redColor = theme.redColor || DEFAULT_COLORS.RED;
    const blueColor = theme.blueColor || DEFAULT_COLORS.BLUE;
    const glowColor = theme.glowColor || primaryColor;

    return `
      <!-- Preset Color Schemes Section -->
      <div class="customization-form-group">
        <label class="customization-label">
          ⚡ Quick Presets - One-Click Color Schemes
        </label>
        <p class="customization-help-text" style="margin-bottom: 1rem;">
          Choose a preset to instantly update all colors, backgrounds, and borders.
        </p>
        ${renderColorPresets()}
      </div>
      
      <hr style="border: none; border-top: 1px solid var(--border-color); margin: 2rem 0;">
      
      <!-- Individual Color Pickers Section -->
      <div class="customization-form-group">
        <label class="customization-label" style="font-size: 1rem; margin-bottom: 1rem;">
          🎨 Custom Colors - Fine-Tune Individual Colors
        </label>
      </div>
      
      <div class="customization-form-group">
        <label for="primary-color" class="customization-label">
          Primary Color (Accent Green)
        </label>
        <div class="color-input-group">
          <div class="color-picker-wrapper">
            <input type="color" id="primary-color" value="${primaryColor}" aria-label="Primary color picker">
          </div>
          <input type="text" id="primary-color-text" class="color-text-input" value="${primaryColor}" 
                 placeholder="${DEFAULT_COLORS.PRIMARY}" aria-label="Primary color hex value">
        </div>
        <p class="customization-help-text">
          Used for buttons, links, positive indicators, and success states.
        </p>
      </div>
      
      <div class="customization-form-group">
        <label for="accent-color" class="customization-label">
          Accent Color (Yellow)
        </label>
        <div class="color-input-group">
          <div class="color-picker-wrapper">
            <input type="color" id="accent-color" value="${accentColor}" aria-label="Accent color picker">
          </div>
          <input type="text" id="accent-color-text" class="color-text-input" value="${accentColor}" 
                 placeholder="${DEFAULT_COLORS.ACCENT}" aria-label="Accent color hex value">
        </div>
        <p class="customization-help-text">
          Used for highlights, warnings, and secondary actions.
        </p>
      </div>
      
      <div class="customization-form-group">
        <label for="red-color" class="customization-label">
          Error/Loss Color (Red)
        </label>
        <div class="color-input-group">
          <div class="color-picker-wrapper">
            <input type="color" id="red-color" value="${redColor}" aria-label="Red color picker">
          </div>
          <input type="text" id="red-color-text" class="color-text-input" value="${redColor}" 
                 placeholder="${DEFAULT_COLORS.RED}" aria-label="Red color hex value">
        </div>
        <p class="customization-help-text">
          Used for errors, losses, and danger indicators.
        </p>
      </div>
      
      <div class="customization-form-group">
        <label for="blue-color" class="customization-label">
          Info Color (Blue)
        </label>
        <div class="color-input-group">
          <div class="color-picker-wrapper">
            <input type="color" id="blue-color" value="${blueColor}" aria-label="Blue color picker">
          </div>
          <input type="text" id="blue-color-text" class="color-text-input" value="${blueColor}" 
                 placeholder="${DEFAULT_COLORS.BLUE}" aria-label="Blue color hex value">
        </div>
        <p class="customization-help-text">
          Used for information, links, and neutral indicators.
        </p>
      </div>
      
      <div class="customization-form-group">
        <label for="glow-color" class="customization-label">
          Glow Color (Bubble Effects)
        </label>
        <div class="color-input-group">
          <div class="color-picker-wrapper">
            <input type="color" id="glow-color" value="${glowColor}" aria-label="Glow color picker">
          </div>
          <input type="text" id="glow-color-text" class="color-text-input" value="${glowColor}" 
                 placeholder="${DEFAULT_COLORS.PRIMARY}" aria-label="Glow color hex value">
        </div>
        <p class="customization-help-text">
          Used for glowing effects on navigation bubbles and hover states.
        </p>
      </div>
      
      ${renderColorPreviewBox(primaryColor, accentColor, redColor, blueColor, glowColor)}
    `;
  }

  /**
   * Render color scheme preset buttons
   */
  function renderColorPresets() {
    const presets = Object.entries(COLOR_SCHEME_PRESETS).map(([key, preset]) => {
      return `
        <button 
          class="color-preset-btn" 
          data-preset="${key}"
          title="${preset.description}"
          aria-label="Apply ${preset.name} color scheme"
        >
          <span class="preset-icon">${preset.icon}</span>
          <span class="preset-name">${preset.name}</span>
          <div class="preset-colors">
            <span class="preset-color-dot" style="background: ${preset.colors.primaryColor};"></span>
            <span class="preset-color-dot" style="background: ${preset.colors.accentColor};"></span>
            <span class="preset-color-dot" style="background: ${preset.colors.redColor};"></span>
            <span class="preset-color-dot" style="background: ${preset.colors.blueColor};"></span>
          </div>
        </button>
      `;
    }).join('');

    return `
      <div class="color-presets-grid">
        ${presets}
      </div>
    `;
  }

  /**
   * Render color preview box with actual UI components
   */
  function renderColorPreviewBox(primaryColor, accentColor, redColor, blueColor, glowColor) {
    return `
      <div class="preview-box" id="color-preview-box">
        <h4 class="preview-box-title">Live Preview</h4>
        <div class="preview-components">
          <!-- Button Row -->
          <div class="preview-row">
            <span class="preview-label">Buttons:</span>
            <div class="preview-items">
              <button id="preview-primary-btn" class="preview-btn" style="background: ${primaryColor}; color: #000;">
                Primary
              </button>
              <button id="preview-accent-btn" class="preview-btn" style="background: ${accentColor}; color: #000;">
                Warning
              </button>
              <button id="preview-red-btn" class="preview-btn" style="background: ${redColor}; color: #fff;">
                Danger
              </button>
              <button id="preview-blue-btn" class="preview-btn" style="background: ${blueColor}; color: #000;">
                Info
              </button>
            </div>
          </div>
          
          <!-- Stat Card Preview -->
          <div class="preview-row">
            <span class="preview-label">Stat Card:</span>
            <div class="preview-stat-card" id="preview-stat-card" style="border-color: ${primaryColor};">
              <div class="preview-stat-label">Portfolio Value</div>
              <div class="preview-stat-value" style="color: ${primaryColor};">$12,345.67</div>
            </div>
          </div>
          
          <!-- Text Colors -->
          <div class="preview-row">
            <span class="preview-label">Text:</span>
            <div class="preview-items">
              <span id="preview-positive" style="color: ${primaryColor}; font-weight: 600;">+$500 Profit</span>
              <span id="preview-negative" style="color: ${redColor}; font-weight: 600;">-$200 Loss</span>
              <span id="preview-info" style="color: ${blueColor};">Information</span>
            </div>
          </div>
          
          <!-- Glow Effect Preview -->
          <div class="preview-row">
            <span class="preview-label">Glow:</span>
            <div class="preview-items">
              <div id="preview-glow-bubble" class="preview-glow-bubble" style="border-color: ${glowColor || primaryColor}; box-shadow: 0 0 20px ${glowColor || primaryColor};">
                <span style="color: ${glowColor || primaryColor};">✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Theme Mode customization (light/dark, animation intensity)
   */
  function renderThemeCustomization() {
    const theme = window.accountManager.getCustomization('theme') || {};
    const themeMode = theme.mode || 'dark';
    const animationIntensity = theme.animationIntensity || DEFAULT_ANIMATION.INTENSITY;
    
    return `
      <!-- Theme Mode Selection -->
      <div class="customization-form-group">
        <label class="customization-label">
          Theme Mode
        </label>
        <div class="theme-mode-toggle" role="radiogroup" aria-label="Theme mode selection">
          <button 
            class="theme-mode-btn ${themeMode === 'dark' ? 'active' : ''}" 
            data-mode="dark"
            role="radio"
            aria-checked="${themeMode === 'dark'}"
            aria-label="Dark theme"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
            <span>Dark</span>
          </button>
          <button 
            class="theme-mode-btn ${themeMode === 'light' ? 'active' : ''}" 
            data-mode="light"
            role="radio"
            aria-checked="${themeMode === 'light'}"
            aria-label="Light theme"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span>Light</span>
          </button>
        </div>
        <p class="customization-help-text">
          Switch between dark and light themes. Dark theme is optimized for low-light trading environments.
        </p>
      </div>
      
      <!-- Animation Intensity Slider -->
      <div class="customization-form-group">
        <label for="animation-intensity" class="customization-label">
          Animation Intensity: <span id="intensity-value">${(animationIntensity * 100).toFixed(0)}%</span>
        </label>
        <input type="range" id="animation-intensity" class="customization-range" 
               min="0" max="1" step="0.1" value="${animationIntensity}"
               aria-label="Animation intensity slider">
        <div class="intensity-labels">
          <span class="intensity-label-start">Off</span>
          <span class="intensity-label-mid">Medium</span>
          <span class="intensity-label-end">Full</span>
        </div>
        <p class="customization-help-text">
          Control the intensity of background animations. Lower values reduce motion and improve performance.
        </p>
      </div>
      
      <!-- Theme Preview -->
      <div class="preview-box">
        <h4 class="preview-box-title">Theme Preview</h4>
        <div id="theme-preview" class="theme-preview-container" data-theme="${themeMode}">
          <div class="theme-preview-content">
            <div class="preview-stat-card">
              <div class="preview-stat-label">Portfolio Value</div>
              <div class="preview-stat-value" style="color: var(--accent-green);">$12,345.67</div>
            </div>
            <div class="preview-text-samples">
              <p style="color: var(--text-primary); margin: 0.5rem 0;">Primary text content</p>
              <p style="color: var(--text-secondary); margin: 0.5rem 0; font-size: 0.875rem;">Secondary text for descriptions</p>
            </div>
          </div>
        </div>
      </div>
      
      <p class="customization-help-tip" style="margin-top: 1rem;">
        💡 <strong>Tip:</strong> Light theme is perfect for daytime trading, while dark theme reduces eye strain during extended sessions.
      </p>
    `;
  }

  /**
   * Render Backgrounds customization
   */
  function renderBackgroundsCustomization() {
    const theme = window.accountManager.getCustomization('theme') || {};
    const bgPrimary = theme.backgroundColor || DEFAULT_COLORS.BG_PRIMARY;
    const bgSecondary = theme.secondaryColor || DEFAULT_COLORS.BG_SECONDARY;
    const backgroundId = theme.backgroundId || 'digital-rain';
    const backgroundBlur = theme.backgroundBlur || 0;
    const backgroundParallax = theme.backgroundParallax || 0;
    
    return `
      <!-- Background Theme Selection -->
      <div class="customization-form-group">
        <label class="customization-label">
          🎨 Background Themes
        </label>
        <p class="customization-help-text" style="margin-bottom: 1rem;">
          Choose from animated, gradient, pattern, or solid backgrounds.
        </p>
        <div id="background-themes-grid" class="background-themes-grid" data-selected="${backgroundId}">
          <!-- Background options loaded dynamically -->
          <div class="background-theme-loading">Loading backgrounds...</div>
        </div>
      </div>
      
      <!-- Blur Control -->
      <div class="customization-form-group">
        <label for="background-blur" class="customization-label">
          Background Blur: <span id="blur-amount-value">${backgroundBlur}px</span>
        </label>
        <input type="range" id="background-blur" class="customization-range" 
               min="0" max="50" step="5" value="${backgroundBlur}"
               aria-label="Background blur slider">
        <div class="intensity-labels">
          <span class="intensity-label-start">None</span>
          <span class="intensity-label-mid">Medium</span>
          <span class="intensity-label-end">Heavy</span>
        </div>
        <p class="customization-help-text">
          Add a blur effect to the background for a softer, more focused appearance.
        </p>
      </div>
      
      <!-- Parallax Control -->
      <div class="customization-form-group">
        <label for="background-parallax" class="customization-label">
          Parallax Effect: <span id="parallax-value">${backgroundParallax > 0 ? (backgroundParallax * 100).toFixed(0) + '%' : 'Off'}</span>
        </label>
        <input type="range" id="background-parallax" class="customization-range" 
               min="0" max="0.7" step="0.1" value="${backgroundParallax}"
               aria-label="Parallax effect slider">
        <div class="intensity-labels">
          <span class="intensity-label-start">Off</span>
          <span class="intensity-label-mid">Subtle</span>
          <span class="intensity-label-end">Strong</span>
        </div>
        <p class="customization-help-text">
          Enable parallax scrolling for depth effect (works best with gradient/pattern backgrounds).
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid var(--border-color); margin: 2rem 0;">
      
      <!-- Custom Colors Section -->
      <div class="customization-form-group">
        <label class="customization-label" style="font-size: 1rem; margin-bottom: 1rem;">
          🎨 Custom Colors Override
        </label>
        <p class="customization-help-text" style="margin-bottom: 1rem;">
          Fine-tune the primary and secondary colors used in backgrounds.
        </p>
      </div>
      
      <div class="customization-form-group">
        <label for="bg-primary" class="customization-label">
          Primary Background Color
        </label>
        <div class="color-input-group">
          <div class="color-picker-wrapper">
            <input type="color" id="bg-primary" value="${bgPrimary}" aria-label="Primary background picker">
          </div>
          <input type="text" id="bg-primary-text" class="color-text-input" value="${bgPrimary}" 
                 placeholder="${DEFAULT_COLORS.BG_PRIMARY}" aria-label="Primary background hex value">
        </div>
      </div>
      
      <div class="customization-form-group">
        <label for="bg-secondary" class="customization-label">
          Secondary Background Color
        </label>
        <div class="color-input-group">
          <div class="color-picker-wrapper">
            <input type="color" id="bg-secondary" value="${bgSecondary}" aria-label="Secondary background picker">
          </div>
          <input type="text" id="bg-secondary-text" class="color-text-input" value="${bgSecondary}" 
                 placeholder="${DEFAULT_COLORS.BG_SECONDARY}" aria-label="Secondary background hex value">
        </div>
      </div>
      
      <!-- Live Preview -->
      <div class="preview-box">
        <h4 class="preview-box-title">Live Preview</h4>
        <div id="bg-preview" class="bg-preview-container" data-bg-id="${backgroundId}" style="background: ${bgPrimary};">
          <div class="bg-preview-card" style="background: ${bgSecondary};">
            <p style="color: var(--text-primary);">Sample Card Content</p>
            <p style="color: var(--text-secondary); font-size: 0.875rem;">Secondary text</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Glass Effects customization
   */
  function renderGlassEffectsCustomization() {
    const theme = window.accountManager.getCustomization('theme') || {};
    const glassOpacity = theme.glassOpacity || DEFAULT_GLASS.OPACITY;
    const glassBlur = theme.glassBlur || DEFAULT_GLASS.BLUR;
    
    return `
      <div class="customization-form-group">
        <label for="glass-opacity" class="customization-label">
          Glass Opacity: <span id="opacity-value">${glassOpacity}</span>
        </label>
        <input type="range" id="glass-opacity" class="customization-range" 
               min="0.1" max="0.9" step="0.05" value="${glassOpacity}">
        <p class="customization-help-text">
          Controls how transparent glass cards and containers appear (0.1 = very transparent, 0.9 = nearly opaque).
        </p>
      </div>
      
      <div class="customization-form-group">
        <label for="glass-blur" class="customization-label">
          Blur Intensity: <span id="blur-value">${glassBlur}px</span>
        </label>
        <input type="range" id="glass-blur" class="customization-range" 
               min="5" max="100" step="5" value="${glassBlur}">
        <p class="customization-help-text">
          Controls the frosted glass blur effect intensity.
        </p>
      </div>
      
      <div class="preview-box">
        <h4 class="preview-box-title">Glass Effect Preview</h4>
        <div id="glass-preview" class="glass-preview-container">
          <div class="glass-preview-card" id="glass-preview-card" 
               style="background: rgba(10, 14, 39, ${glassOpacity}); backdrop-filter: blur(${glassBlur}px);">
            <h5 style="color: var(--accent-green); margin: 0 0 0.5rem 0;">Glass Card</h5>
            <p style="color: var(--text-secondary); margin: 0; font-size: 0.875rem;">
              This card demonstrates the current glass effect settings.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Typography customization
   */
  function renderTypographyCustomization() {
    const theme = window.accountManager.getCustomization('theme') || {};
    const fontSize = theme.fontSize || 'medium';
    
    return `
      <div class="customization-form-group">
        <label for="font-size" class="customization-label">
          Base Font Size
        </label>
        <select id="font-size" class="customization-select">
          <option value="small" ${fontSize === 'small' ? 'selected' : ''}>Small (14px)</option>
          <option value="medium" ${fontSize === 'medium' ? 'selected' : ''}>Medium (16px) - Default</option>
          <option value="large" ${fontSize === 'large' ? 'selected' : ''}>Large (18px)</option>
        </select>
        <p class="customization-help-text">
          Adjusts the base text size throughout the application.
        </p>
      </div>
      
      <div class="preview-box">
        <h4 class="preview-box-title">Typography Preview</h4>
        <div id="typography-preview">
          <h3 style="color: var(--accent-green);">Heading Text</h3>
          <p style="color: var(--text-primary);">Primary text appears like this.</p>
          <p style="color: var(--text-secondary); font-size: 0.875rem;">Secondary text for descriptions and metadata.</p>
          <code style="font-family: var(--font-mono); color: var(--accent-green);">Monospace: $12,345.67</code>
        </div>
      </div>
      
      <div class="customization-coming-soon" style="margin-top: 1.5rem;">
        <h4>🔤 Font Family Selection - Coming Soon</h4>
        <p>Choose from curated professional fonts for headings and body text.</p>
      </div>
    `;
  }

  /**
   * Render Borders customization
   */
  function renderBordersCustomization() {
    const theme = window.accountManager.getCustomization('theme') || {};
    const borderRadius = theme.borderRadius || 'rounded';
    const borderColor = theme.borderColor || '#27272a';
    
    return `
      <div class="customization-form-group">
        <label for="border-radius" class="customization-label">
          Border Radius Style
        </label>
        <select id="border-radius" class="customization-select">
          <option value="sharp" ${borderRadius === 'sharp' ? 'selected' : ''}>Sharp (4px)</option>
          <option value="rounded" ${borderRadius === 'rounded' ? 'selected' : ''}>Rounded (8px) - Default</option>
          <option value="pill" ${borderRadius === 'pill' ? 'selected' : ''}>Pill (18px)</option>
        </select>
        <p class="customization-help-text">
          Controls how rounded corners appear on cards, buttons, and inputs.
        </p>
      </div>
      
      <div class="customization-form-group">
        <label for="border-color" class="customization-label">
          Border Color
        </label>
        <div class="color-input-group">
          <div class="color-picker-wrapper">
            <input type="color" id="border-color" value="${borderColor}" aria-label="Border color picker">
          </div>
          <input type="text" id="border-color-text" class="color-text-input" value="${borderColor}" 
                 placeholder="#27272a" aria-label="Border color hex value">
        </div>
        <p class="customization-help-text">
          Default border color for cards, inputs, and dividers.
        </p>
      </div>
      
      <div class="preview-box">
        <h4 class="preview-box-title">Border Preview</h4>
        <div class="preview-border-samples" id="border-preview">
          <div class="preview-border-card" style="border: 1px solid ${borderColor}; border-radius: ${getBorderRadiusValue(borderRadius)};">
            Card with border
          </div>
          <button class="preview-border-btn" style="border: 1px solid ${borderColor}; border-radius: ${getBorderRadiusValue(borderRadius)};">
            Button
          </button>
          <input type="text" class="preview-border-input" placeholder="Input field" 
                 style="border: 1px solid ${borderColor}; border-radius: ${getBorderRadiusValue(borderRadius)};">
        </div>
      </div>
    `;
  }

  /**
   * Get border radius CSS value from preset name
   */
  function getBorderRadiusValue(preset) {
    const values = { sharp: '4px', rounded: '8px', pill: '18px' };
    return values[preset] || '8px';
  }

  /**
   * Render Navbar customization
   */
  function renderNavbarCustomization() {
    const theme = window.accountManager.getCustomization('theme') || {};
    
    return `
      <div class="customization-form-group">
        <label class="customization-label">Navigation Bar</label>
        <p class="customization-help-text">
          Customize the top navigation bar appearance including background, text colors, and dropdown styles.
        </p>
      </div>
      
      <div class="preview-box">
        <h4 class="preview-box-title">Navbar Preview</h4>
        <div class="preview-navbar" id="navbar-preview">
          <div class="preview-nav-logo">📈 SFTi-Pennies</div>
          <div class="preview-nav-links">
            <a href="#" class="preview-nav-link active">Dashboard</a>
            <a href="#" class="preview-nav-link">Trades</a>
            <a href="#" class="preview-nav-link">Analytics</a>
          </div>
        </div>
      </div>
      
      <div class="customization-coming-soon" style="margin-top: 1.5rem;">
        <h4>⚙️ Advanced Navbar Settings - Coming Soon</h4>
        <p>Full control over navbar background, link colors, hover effects, and dropdown animations.</p>
      </div>
    `;
  }

  /**
   * Render Footer customization
   */
  function renderFooterCustomization() {
    return `
      <div class="customization-form-group">
        <label class="customization-label">Footer</label>
        <p class="customization-help-text">
          Customize the page footer including background color, text, and link styles.
        </p>
      </div>
      
      <div class="preview-box">
        <h4 class="preview-box-title">Footer Preview</h4>
        <div class="preview-footer" id="footer-preview">
          <p>© 2025 SFTi-Pennies Trading Journal</p>
          <div class="preview-footer-links">
            <a href="#">LinkedIn</a> | <a href="#">GitHub</a> | <a href="#">License</a>
          </div>
        </div>
      </div>
      
      <div class="customization-coming-soon" style="margin-top: 1.5rem;">
        <h4>⚙️ Footer Customization - Coming Soon</h4>
        <p>Control footer background, text colors, and custom content.</p>
      </div>
    `;
  }

  /**
   * Render Glowing Bubbles customization
   * Shows all 6 navigation bubbles: Account, Add Trade, Books, Notes, Trades, Mentors
   */
  function renderBubblesCustomization() {
    return `
      <div class="customization-form-group">
        <label class="customization-label">Mobile Navigation Bubbles</label>
        <p class="customization-help-text">
          The 6 glowing navigation bubbles shown at the bottom of the screen on mobile devices. Each bubble has a unique color and glow animation.
        </p>
      </div>
      
      <div class="preview-box">
        <h4 class="preview-box-title">All Navigation Bubbles</h4>
        <div class="preview-bubbles-full" id="bubbles-preview">
          <!-- Account Bubble (Purple) -->
          <div class="preview-bubble-item">
            <div class="preview-bubble-real bubble-account" style="border-color: rgba(147, 51, 234, 0.6); color: rgba(147, 51, 234, 1); box-shadow: 0 4px 24px rgba(147, 51, 234, 0.3);">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <span class="preview-bubble-name">Account</span>
          </div>
          
          <!-- Add Trade Bubble (Green) -->
          <div class="preview-bubble-item">
            <div class="preview-bubble-real bubble-add-trade" style="border-color: rgba(0, 255, 136, 0.6); color: var(--accent-green); box-shadow: 0 4px 24px rgba(0, 255, 136, 0.3);">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span class="preview-bubble-name">Add Trade</span>
          </div>
          
          <!-- Books Bubble (Cyan) -->
          <div class="preview-bubble-item">
            <div class="preview-bubble-real bubble-books" style="border-color: rgba(100, 255, 218, 0.6); color: rgba(100, 255, 218, 1); box-shadow: 0 4px 24px rgba(100, 255, 218, 0.3);">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <span class="preview-bubble-name">Books</span>
          </div>
          
          <!-- Notes Bubble (Purple/Violet) -->
          <div class="preview-bubble-item">
            <div class="preview-bubble-real bubble-notes" style="border-color: rgba(147, 51, 234, 0.6); color: rgba(147, 51, 234, 1); box-shadow: 0 4px 24px rgba(147, 51, 234, 0.3);">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <span class="preview-bubble-name">Notes</span>
          </div>
          
          <!-- Trades Bubble (Yellow) -->
          <div class="preview-bubble-item">
            <div class="preview-bubble-real bubble-trades" style="border-color: rgba(251, 191, 36, 0.6); color: rgba(251, 191, 36, 1); box-shadow: 0 4px 24px rgba(251, 191, 36, 0.3);">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <span class="preview-bubble-name">Trades</span>
          </div>
          
          <!-- Mentors Bubble (Pink) -->
          <div class="preview-bubble-item">
            <div class="preview-bubble-real bubble-mentors" style="border-color: rgba(236, 72, 153, 0.6); color: rgba(236, 72, 153, 1); box-shadow: 0 4px 24px rgba(236, 72, 153, 0.3);">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <span class="preview-bubble-name">Mentors</span>
          </div>
        </div>
      </div>
      
      <p class="customization-help-tip" style="margin-top: 1rem;">
        💡 <strong>Note:</strong> These bubbles appear only on mobile screens (768px and below). They provide quick navigation to key features.
      </p>
      
      <div class="customization-coming-soon" style="margin-top: 1.5rem;">
        <h4>✨ Individual Bubble Colors - Coming Soon</h4>
        <p>Customize each bubble's color, glow intensity, and animation timing.</p>
      </div>
    `;
  }

  /**
   * Render Cards customization
   */
  function renderCardsCustomization() {
    return `
      <div class="customization-form-group">
        <label class="customization-label">Cards & Stat Boxes</label>
        <p class="customization-help-text">
          Customize the appearance of stat cards, glass cards, and container boxes.
        </p>
      </div>
      
      <div class="preview-box">
        <h4 class="preview-box-title">Card Styles Preview</h4>
        <div class="preview-cards" id="cards-preview">
          <div class="preview-card-stat">
            <div class="preview-card-label">Portfolio Value</div>
            <div class="preview-card-value">$12,345.67</div>
          </div>
          <div class="preview-card-stat">
            <div class="preview-card-label">Total Return</div>
            <div class="preview-card-value positive">+23.45%</div>
          </div>
          <div class="preview-card-stat">
            <div class="preview-card-label">Win Rate</div>
            <div class="preview-card-value">68%</div>
          </div>
        </div>
      </div>
      
      <div class="customization-coming-soon" style="margin-top: 1.5rem;">
        <h4>🎴 Card Style Options - Coming Soon</h4>
        <p>Control card backgrounds, borders, shadows, and hover effects.</p>
      </div>
    `;
  }

  /**
   * Render Modals customization
   */
  function renderModalsCustomization() {
    return `
      <div class="customization-form-group">
        <label class="customization-label">Modals & Popups</label>
        <p class="customization-help-text">
          Customize modal dialogs including overlay color, container styles, and animations.
        </p>
      </div>
      
      <div class="preview-box">
        <h4 class="preview-box-title">Modal Preview</h4>
        <div class="preview-modal-container" id="modal-preview">
          <div class="preview-modal-overlay">
            <div class="preview-modal-dialog">
              <div class="preview-modal-header">
                <h4>Sample Modal</h4>
                <button class="preview-modal-close">×</button>
              </div>
              <div class="preview-modal-body">
                Modal content goes here...
              </div>
              <div class="preview-modal-footer">
                <button class="preview-btn-secondary">Cancel</button>
                <button class="preview-btn-primary">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="customization-coming-soon" style="margin-top: 1.5rem;">
        <h4>🪟 Modal Animations - Coming Soon</h4>
        <p>Choose from fade, slide, or scale animations for modal dialogs.</p>
      </div>
    `;
  }

  /**
   * Render Charts customization
   */
  function renderChartsCustomization() {
    const theme = window.accountManager.getCustomization('theme') || {};
    const chartProfitColor = theme.chartProfitColor || DEFAULT_COLORS.PRIMARY;
    const chartLossColor = theme.chartLossColor || DEFAULT_COLORS.RED;
    const chartGridColor = theme.chartGridColor || 'rgba(39, 39, 42, 0.5)';
    const chartStyle = theme.chartStyle || 'bars';
    
    return `
      <div class="customization-form-group">
        <label class="customization-label">Charts & Analytics</label>
        <p class="customization-help-text">
          Customize chart colors, styles, and data visualization appearance.
        </p>
      </div>
      
      <!-- Chart Style Selection -->
      <div class="customization-form-group">
        <label for="chart-style" class="customization-label">
          Chart Style
        </label>
        <select id="chart-style" class="customization-select">
          <option value="bars" ${chartStyle === 'bars' ? 'selected' : ''}>Bar Chart</option>
          <option value="line" ${chartStyle === 'line' ? 'selected' : ''}>Line Chart</option>
          <option value="area" ${chartStyle === 'area' ? 'selected' : ''}>Area Chart</option>
        </select>
        <p class="customization-help-text">
          Choose how your trading data is visualized in charts.
        </p>
      </div>
      
      <!-- Chart Colors -->
      <div class="customization-form-group">
        <label for="chart-profit-color" class="customization-label">
          Profit Color
        </label>
        <div class="color-input-group">
          <div class="color-picker-wrapper">
            <input type="color" id="chart-profit-color" value="${chartProfitColor}" aria-label="Chart profit color">
          </div>
          <input type="text" id="chart-profit-color-text" class="color-text-input" value="${chartProfitColor}" 
                 placeholder="${DEFAULT_COLORS.PRIMARY}" aria-label="Chart profit color hex value">
        </div>
        <p class="customization-help-text">
          Color for winning trades and positive values.
        </p>
      </div>
      
      <div class="customization-form-group">
        <label for="chart-loss-color" class="customization-label">
          Loss Color
        </label>
        <div class="color-input-group">
          <div class="color-picker-wrapper">
            <input type="color" id="chart-loss-color" value="${chartLossColor}" aria-label="Chart loss color">
          </div>
          <input type="text" id="chart-loss-color-text" class="color-text-input" value="${chartLossColor}" 
                 placeholder="${DEFAULT_COLORS.RED}" aria-label="Chart loss color hex value">
        </div>
        <p class="customization-help-text">
          Color for losing trades and negative values.
        </p>
      </div>
      
      <!-- Live Preview -->
      <div class="preview-box">
        <h4 class="preview-box-title">Chart Preview</h4>
        <div class="preview-chart" id="chart-preview">
          <div class="preview-chart-bars" id="chart-bars-preview">
            <div class="preview-chart-bar positive" style="height: 60%; background: ${chartProfitColor};">
              <span>+$150</span>
            </div>
            <div class="preview-chart-bar negative" style="height: 40%; background: ${chartLossColor};">
              <span>-$80</span>
            </div>
            <div class="preview-chart-bar positive" style="height: 80%; background: ${chartProfitColor};">
              <span>+$220</span>
            </div>
            <div class="preview-chart-bar positive" style="height: 55%; background: ${chartProfitColor};">
              <span>+$120</span>
            </div>
            <div class="preview-chart-bar negative" style="height: 30%; background: ${chartLossColor};">
              <span>-$45</span>
            </div>
          </div>
          <div class="preview-chart-legend">
            <span class="preview-legend-item" id="legend-profit" style="color: ${chartProfitColor};">● Profits</span>
            <span class="preview-legend-item" id="legend-loss" style="color: ${chartLossColor};">● Losses</span>
          </div>
        </div>
      </div>
      
      <p class="customization-help-tip" style="margin-top: 1rem;">
        💡 <strong>Tip:</strong> Chart colors are applied across all analytics pages including Dashboard, Analytics, and Trade Review.
      </p>
    `;
  }

  /**
   * Render Buttons customization
   */
  function renderButtonsCustomization() {
    const theme = window.accountManager.getCustomization('theme') || {};
    const primaryColor = theme.primaryColor || DEFAULT_COLORS.PRIMARY;
    const accentColor = theme.accentColor || DEFAULT_COLORS.ACCENT;
    const redColor = theme.redColor || DEFAULT_COLORS.RED;
    
    return `
      <div class="customization-form-group">
        <label class="customization-label">Buttons</label>
        <p class="customization-help-text">
          Customize button styles including colors, borders, hover effects, and sizes.
        </p>
      </div>
      
      <div class="preview-box">
        <h4 class="preview-box-title">Button Styles</h4>
        <div class="preview-buttons-grid" id="buttons-preview">
          <div class="button-preview-item">
            <button class="preview-btn-demo primary" style="background: ${primaryColor}; color: #000;">
              Primary Action
            </button>
            <span class="button-label">Primary</span>
          </div>
          <div class="button-preview-item">
            <button class="preview-btn-demo secondary" style="border-color: ${primaryColor}; color: ${primaryColor};">
              Secondary
            </button>
            <span class="button-label">Secondary</span>
          </div>
          <div class="button-preview-item">
            <button class="preview-btn-demo danger" style="background: ${redColor}; color: #fff;">
              Delete
            </button>
            <span class="button-label">Danger</span>
          </div>
          <div class="button-preview-item">
            <button class="preview-btn-demo ghost">
              Ghost Button
            </button>
            <span class="button-label">Ghost</span>
          </div>
        </div>
      </div>
      
      <div class="customization-coming-soon" style="margin-top: 1.5rem;">
        <h4>🔘 Button Customization - Coming Soon</h4>
        <p>Full control over button colors, hover states, and animations.</p>
      </div>
    `;
  }

  /**
   * Render Forms customization
   */
  function renderFormsCustomization() {
    return `
      <div class="customization-form-group">
        <label class="customization-label">Forms & Inputs</label>
        <p class="customization-help-text">
          Customize form controls including input fields, selects, and text areas.
        </p>
      </div>
      
      <div class="preview-box">
        <h4 class="preview-box-title">Form Elements</h4>
        <div class="preview-forms" id="forms-preview">
          <div class="preview-form-group">
            <label>Text Input</label>
            <input type="text" placeholder="Enter ticker symbol..." class="preview-input">
          </div>
          <div class="preview-form-group">
            <label>Select</label>
            <select class="preview-select">
              <option>Long</option>
              <option>Short</option>
            </select>
          </div>
          <div class="preview-form-group">
            <label>Textarea</label>
            <textarea placeholder="Trade notes..." class="preview-textarea"></textarea>
          </div>
        </div>
      </div>
      
      <div class="customization-coming-soon" style="margin-top: 1.5rem;">
        <h4>📝 Form Styling - Coming Soon</h4>
        <p>Customize input backgrounds, borders, focus states, and validation colors.</p>
      </div>
    `;
  }

  /**
   * Render Page Messages customization
   */
  function renderPageMessagesCustomization() {
    const preferences = window.accountManager.getCustomization('preferences') || {};
    const pageMessages = preferences.pageMessages || {};
    
    // Generate message inputs for all pages
    const pageInputs = Object.entries(PAGE_NAMES)
      .filter(([key]) => key !== 'customization')
      .map(([pageKey, pageName]) => {
        const currentMessage = pageMessages[pageKey] || '';
        return `
          <div class="customization-form-group">
            <label for="msg-${pageKey}" class="customization-label">
              ${pageName}
            </label>
            <input type="text" id="msg-${pageKey}" class="customization-input page-message-input" 
                   maxlength="100" data-page="${pageKey}"
                   value="${escapeHtml(currentMessage)}" 
                   placeholder="Custom message for ${pageName}...">
          </div>
        `;
      }).join('');

    return `
      <div class="customization-intro">
        <p class="customization-help-text" style="margin-bottom: 1.5rem;">
          Set custom welcome messages for each page. Leave empty to use the default message.
          Maximum 100 characters per message.
        </p>
      </div>
      
      ${pageInputs}
      
      <div class="preview-box" style="margin-top: 1.5rem;">
        <h4 class="preview-box-title">Message Preview</h4>
        <div id="page-message-preview" class="preview-message">
          <span class="preview-message-icon">👋</span>
          <span id="preview-message-text">Your custom message will appear here</span>
        </div>
      </div>
    `;
  }

  /**
   * Render preferences customization options
   */
  function renderPreferencesCustomization() {
    const preferences = window.accountManager.getCustomization('preferences') || {};
    const dateFormat = preferences.dateFormat || 'MM/DD/YYYY';
    const currencySymbol = preferences.currencySymbol || '$';
    const timezone = preferences.timezone || 'America/New_York';
    const pageMessages = preferences.pageMessages || {};
    const pageMessage = pageMessages[state.referringPage] || '';

    return `
      <div class="customization-form-group">
        <label for="date-format" class="customization-label">
          Date Format
        </label>
        <select id="date-format" class="customization-select">
          <option value="MM/DD/YYYY" ${dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY (US)</option>
          <option value="DD/MM/YYYY" ${dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY (European)</option>
          <option value="YYYY-MM-DD" ${dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD (ISO)</option>
        </select>
        <p class="customization-help-text">
          Choose how dates are displayed throughout the application
        </p>
      </div>
      
      <div class="customization-form-group">
        <label for="currency-symbol" class="customization-label">
          Currency Symbol
        </label>
        <input type="text" id="currency-symbol" class="customization-input" maxlength="3" 
               value="${escapeHtml(currencySymbol)}" placeholder="$" 
               title="Enter a 3-letter currency code or a symbol">
        <p class="customization-help-text">
          Enter a currency symbol ($, €, £, ¥) or 3-letter code (USD, EUR, GBP)
        </p>
      </div>
      
      <div class="customization-form-group">
        <label for="timezone" class="customization-label">
          Timezone
        </label>
        <select id="timezone" class="customization-select">
          ${renderTimezoneOptions(timezone)}
        </select>
        <p class="customization-help-text">
          Select your preferred timezone for displaying dates and times
        </p>
      </div>
      
      <div class="page-specific-section">
        <h4 class="page-specific-header">
          ${ICONS.message}
          Page Message (${getPageDisplayName(state.referringPage)})
        </h4>
        <div class="customization-form-group" style="margin-bottom: 0;">
          <label for="page-message" class="customization-label">
            Custom Welcome Message
          </label>
          <input type="text" id="page-message" class="customization-input" maxlength="100" 
                 value="${escapeHtml(pageMessage)}" placeholder="e.g., Let's crush it today!">
          <p class="customization-help-text">
            Personalize the welcome message for the <strong>${getPageDisplayName(state.referringPage)}</strong> page (max 100 characters)
          </p>
          <p class="customization-help-tip">
            💡 Leave empty to use the default message
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Render timezone options
   */
  function renderTimezoneOptions(selectedTimezone) {
    const timezones = [
      { value: 'America/New_York', label: 'America/New_York (Eastern)' },
      { value: 'America/Chicago', label: 'America/Chicago (Central)' },
      { value: 'America/Denver', label: 'America/Denver (Mountain)' },
      { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific)' },
      { value: 'Europe/London', label: 'Europe/London' },
      { value: 'Europe/Berlin', label: 'Europe/Berlin' },
      { value: 'Europe/Paris', label: 'Europe/Paris' },
      { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
      { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
      { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong' },
      { value: 'Asia/Singapore', label: 'Asia/Singapore' },
      { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
      { value: 'Australia/Sydney', label: 'Australia/Sydney' },
      { value: 'UTC', label: 'UTC' }
    ];

    return timezones.map(tz => 
      `<option value="${tz.value}" ${selectedTimezone === tz.value ? 'selected' : ''}>${tz.label}</option>`
    ).join('');
  }

  // ===== Event Handling =====

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
      btn.addEventListener('click', handleCategoryChange);
    });

    // Page selector
    const pageSelector = document.getElementById('page-selector');
    if (pageSelector) {
      pageSelector.addEventListener('change', handlePageChange);
    }

    // Browser back/forward navigation
    window.addEventListener('popstate', handlePopState);

    // Action buttons
    const btnCancel = document.getElementById('btn-cancel');
    const btnReset = document.getElementById('btn-reset');
    const btnApply = document.getElementById('btn-apply');

    if (btnCancel) btnCancel.addEventListener('click', handleCancel);
    if (btnReset) btnReset.addEventListener('click', handleReset);
    if (btnApply) btnApply.addEventListener('click', handleApply);

    // Category-specific listeners
    setupCategoryEventListeners();
  }

  /**
   * Handle page selector change
   */
  function handlePageChange(e) {
    const newPage = e.target.value;
    if (newPage && newPage !== state.referringPage) {
      // Defensive check: ensure the new page is a known, valid page
      if (typeof PAGE_NAMES !== 'object' ||
          !Object.prototype.hasOwnProperty.call(PAGE_NAMES, newPage)) {
        // Reset the select to the current page if the value is invalid
        e.target.value = state.referringPage;
        return;
      }

      // Check if there are pending changes that would be lost
      const hasPendingChanges = Object.keys(state.pendingChanges).length > 0;
      
      if (hasPendingChanges) {
        const confirmChange = confirm(
          'You have unsaved changes. Changing pages will discard these changes.\n\n' +
          'Do you want to continue?'
        );
        if (!confirmChange) {
          // Reset the select to the current page
          e.target.value = state.referringPage;
          return;
        }
      }
      
      state.referringPage = newPage;
      state.pendingChanges = {};
      
      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.set('page', newPage);
      window.history.pushState({}, '', url);
      
      // Re-render page to update breadcrumb and component filtering
      renderPage();
    }
  }

  /**
   * Handle browser back/forward navigation
   * Synchronizes UI state with URL when using browser navigation buttons
   */
  function handlePopState() {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page') || CONFIG.DEFAULT_PAGE;
    const categoryParam = params.get('category') || CONFIG.DEFAULT_CATEGORY;
    
    // Only update if state has changed
    if (pageParam !== state.referringPage || categoryParam !== state.category) {
      // Validate page parameter
      if (PAGE_NAMES[pageParam]) {
        state.referringPage = pageParam;
      }
      // Validate category parameter
      if (CATEGORIES[categoryParam]) {
        state.category = categoryParam;
      }
      state.pendingChanges = {};
      renderPage();
    }
  }

  /**
   * Setup category-specific event listeners
   */
  function setupCategoryEventListeners() {
    switch (state.category) {
      case 'global-colors':
        setupGlobalColorListeners();
        break;
      case 'themes':
        setupThemeListeners();
        break;
      case 'global-backgrounds':
        setupBackgroundListeners();
        break;
      case 'global-glass':
        setupGlassListeners();
        break;
      case 'global-typography':
        setupTypographyListeners();
        break;
      case 'global-borders':
        setupBordersListeners();
        break;
      case 'page-messages':
        setupPageMessageListeners();
        break;
      case 'charts':
        setupChartsListeners();
        break;
      // Other categories will use default form handling
    }
  }

  /**
   * Setup Charts customization listeners
   */
  function setupChartsListeners() {
    // Chart style selector
    const chartStyleSelect = document.getElementById('chart-style');
    if (chartStyleSelect) {
      chartStyleSelect.addEventListener('change', (e) => {
        state.pendingChanges['theme.chartStyle'] = e.target.value;
      });
    }
    
    // Profit color
    setupColorPairListeners('chart-profit-color', 'chart-profit-color-text', (value) => {
      // Update preview bars
      document.querySelectorAll('#chart-bars-preview .positive').forEach(bar => {
        bar.style.background = value;
      });
      // Update legend
      const legendProfit = document.getElementById('legend-profit');
      if (legendProfit) legendProfit.style.color = value;
      
      state.pendingChanges['theme.chartProfitColor'] = value;
    });
    
    // Loss color
    setupColorPairListeners('chart-loss-color', 'chart-loss-color-text', (value) => {
      // Update preview bars
      document.querySelectorAll('#chart-bars-preview .negative').forEach(bar => {
        bar.style.background = value;
      });
      // Update legend
      const legendLoss = document.getElementById('legend-loss');
      if (legendLoss) legendLoss.style.color = value;
      
      state.pendingChanges['theme.chartLossColor'] = value;
    });
  }

  /**
   * Setup global color customization listeners with 4-color preview
   */
  function setupGlobalColorListeners() {
    // Preset buttons
    const presetButtons = document.querySelectorAll('.color-preset-btn');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', handlePresetClick);
    });

    // Primary color
    setupColorPairListeners('primary-color', 'primary-color-text', (value) => {
      const btn = document.getElementById('preview-primary-btn');
      const statCard = document.getElementById('preview-stat-card');
      const positive = document.getElementById('preview-positive');
      if (btn) btn.style.background = value;
      if (statCard) statCard.style.borderColor = value;
      if (positive) positive.style.color = value;
      state.pendingChanges['theme.primaryColor'] = value;
      // Apply live CSS variable update for immediate visual feedback
      applyLiveThemeColor('primaryColor', value);
    });

    // Accent color (yellow)
    setupColorPairListeners('accent-color', 'accent-color-text', (value) => {
      const btn = document.getElementById('preview-accent-btn');
      if (btn) btn.style.background = value;
      state.pendingChanges['theme.accentColor'] = value;
      // Apply live CSS variable update for immediate visual feedback
      applyLiveThemeColor('accentColor', value);
    });

    // Red color
    setupColorPairListeners('red-color', 'red-color-text', (value) => {
      const btn = document.getElementById('preview-red-btn');
      const negative = document.getElementById('preview-negative');
      if (btn) btn.style.background = value;
      if (negative) negative.style.color = value;
      state.pendingChanges['theme.redColor'] = value;
      // Apply live CSS variable update for immediate visual feedback
      applyLiveThemeColor('redColor', value);
    });

    // Blue color
    setupColorPairListeners('blue-color', 'blue-color-text', (value) => {
      const btn = document.getElementById('preview-blue-btn');
      const info = document.getElementById('preview-info');
      if (btn) btn.style.background = value;
      if (info) info.style.color = value;
      state.pendingChanges['theme.blueColor'] = value;
      // Apply live CSS variable update for immediate visual feedback
      applyLiveThemeColor('blueColor', value);
    });

    // Glow color
    setupColorPairListeners('glow-color', 'glow-color-text', (value) => {
      const glowBubble = document.getElementById('preview-glow-bubble');
      if (glowBubble) {
        glowBubble.style.borderColor = value;
        glowBubble.style.boxShadow = `0 0 20px ${value}`;
        const span = glowBubble.querySelector('span');
        if (span) span.style.color = value;
      }
      state.pendingChanges['theme.glowColor'] = value;
      // Apply live CSS variable update for immediate visual feedback
      applyLiveThemeColor('glowColor', value);
    });
  }

  /**
   * Handle preset color scheme button click
   */
  function handlePresetClick(e) {
    const btn = e.currentTarget;
    const presetKey = btn.dataset.preset;
    const preset = COLOR_SCHEME_PRESETS[presetKey];
    
    if (!preset) return;

    // Apply all colors from the preset
    applyColorPreset(preset);
  }

  /**
   * Apply a color preset to all inputs and previews
   */
  function applyColorPreset(preset) {
    const colors = preset.colors;

    // Update all color pickers and text inputs
    const colorMappings = [
      { picker: 'primary-color', text: 'primary-color-text', value: colors.primaryColor },
      { picker: 'accent-color', text: 'accent-color-text', value: colors.accentColor },
      { picker: 'red-color', text: 'red-color-text', value: colors.redColor },
      { picker: 'blue-color', text: 'blue-color-text', value: colors.blueColor },
      // Glow color: Use primary color as default since presets don't define separate glow colors
      // Users can still manually adjust glow color after applying preset
      { picker: 'glow-color', text: 'glow-color-text', value: colors.primaryColor }
    ];

    colorMappings.forEach(mapping => {
      const picker = document.getElementById(mapping.picker);
      const text = document.getElementById(mapping.text);
      
      if (picker) {
        picker.value = mapping.value;
        // Trigger input event to update preview
        picker.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (text) {
        text.value = mapping.value;
      }
    });

    // Also update background and border colors if they exist
    if (colors.backgroundColor) {
      state.pendingChanges['theme.backgroundColor'] = colors.backgroundColor;
      applyLiveThemeColor('backgroundColor', colors.backgroundColor);
    }
    if (colors.secondaryColor) {
      state.pendingChanges['theme.secondaryColor'] = colors.secondaryColor;
      applyLiveThemeColor('secondaryColor', colors.secondaryColor);
    }
    if (colors.borderColor) {
      state.pendingChanges['theme.borderColor'] = colors.borderColor;
      applyLiveThemeColor('borderColor', colors.borderColor);
    }

    // Show notification
    showNotification('Preset Applied', `${preset.name} color scheme has been applied to the preview. Click "Apply Changes" to save.`, 'success');
  }

  /**
   * Setup theme mode and animation intensity listeners
   */
  function setupThemeListeners() {
    // Theme mode toggle buttons
    const themeButtons = document.querySelectorAll('.theme-mode-btn');
    themeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = btn.dataset.mode;
        
        // Update UI state
        themeButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        
        // Update preview
        const preview = document.getElementById('theme-preview');
        if (preview) {
          preview.dataset.theme = mode;
          applyThemePreview(mode);
        }
        
        // Store pending change
        state.pendingChanges['theme.mode'] = mode;
      });
    });
    
    // Animation intensity slider
    const intensitySlider = document.getElementById('animation-intensity');
    const intensityValue = document.getElementById('intensity-value');
    
    if (intensitySlider && intensityValue) {
      intensitySlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        intensityValue.textContent = `${(val * 100).toFixed(0)}%`;
        state.pendingChanges['theme.animationIntensity'] = val;
      });
    }
  }

  /**
   * Apply theme mode to preview
   * Note: Uses hardcoded values that match .theme-light/.theme-dark CSS classes
   * to show preview before theme is actually applied
   */
  function applyThemePreview(mode) {
    const preview = document.getElementById('theme-preview');
    if (!preview) return;
    
    if (mode === 'light') {
      // Apply light theme colors to preview (matches .theme-light in main.css)
      preview.style.background = '#fafafa';
      preview.style.color = '#1a1a1a';
    } else {
      // Apply dark theme colors to preview (matches .theme-dark in main.css)
      preview.style.background = 'var(--bg-tertiary, #141b33)';
      preview.style.color = 'var(--text-primary, #e4e4e7)';
    }
  }

  /**
   * Helper to setup color picker + text input pair
   * Includes validation for both picker and text input values
   */
  function setupColorPairListeners(pickerId, textId, onUpdate) {
    const picker = document.getElementById(pickerId);
    const text = document.getElementById(textId);

    if (picker && text) {
      picker.addEventListener('input', (e) => {
        const value = e.target.value;
        // Validate color picker value before applying
        if (isValidColor(value)) {
          text.value = value;
          onUpdate(value);
        }
      });

      text.addEventListener('input', (e) => {
        if (isValidColor(e.target.value)) {
          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
            picker.value = e.target.value;
          }
          text.classList.remove('invalid');
          onUpdate(e.target.value);
        } else {
          text.classList.add('invalid');
        }
      });
    }
  }

  /**
   * Setup background customization listeners
   */
  function setupBackgroundListeners() {
    // Load background themes from JSON
    loadBackgroundThemes();
    
    // Blur slider
    const blurSlider = document.getElementById('background-blur');
    const blurValue = document.getElementById('blur-amount-value');
    if (blurSlider && blurValue) {
      blurSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        blurValue.textContent = `${val}px`;
        state.pendingChanges['theme.backgroundBlur'] = val;
        updateBackgroundPreviewEffects();
      });
    }
    
    // Parallax slider
    const parallaxSlider = document.getElementById('background-parallax');
    const parallaxValue = document.getElementById('parallax-value');
    if (parallaxSlider && parallaxValue) {
      parallaxSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        parallaxValue.textContent = val > 0 ? `${(val * 100).toFixed(0)}%` : 'Off';
        state.pendingChanges['theme.backgroundParallax'] = val;
      });
    }

    setupColorPairListeners('bg-primary', 'bg-primary-text', (value) => {
      const preview = document.getElementById('bg-preview');
      if (preview) {
        updateBackgroundPreviewEffects();
      }
      state.pendingChanges['theme.backgroundColor'] = value;
      // Apply live CSS variable update for immediate visual feedback
      applyLiveThemeColor('backgroundColor', value);
    });

    setupColorPairListeners('bg-secondary', 'bg-secondary-text', (value) => {
      const card = document.querySelector('.bg-preview-card');
      const preview = document.getElementById('bg-preview');
      if (card) card.style.background = value;
      if (preview) {
        updateBackgroundPreviewEffects();
      }
      state.pendingChanges['theme.secondaryColor'] = value;
      // Apply live CSS variable update for immediate visual feedback
      applyLiveThemeColor('secondaryColor', value);
    });
  }

  /**
   * Load background themes from themes.json
   */
  async function loadBackgroundThemes() {
    const grid = document.getElementById('background-themes-grid');
    if (!grid) return;
    
    try {
      const response = await fetch('assets/themes/themes.json');
      if (!response.ok) {
        throw new Error(`Failed to load themes.json (HTTP ${response.status})`);
      }
      const themesData = await response.json();
      
      renderBackgroundThemesGrid(themesData.backgrounds, grid);
    } catch (error) {
      console.warn('[Customization] Could not load themes.json, falling back to built-in backgrounds. Error:', error.message);
      // Fallback to built-in backgrounds - users will see a subset of available themes
      renderBackgroundThemesGrid(getDefaultBackgrounds(), grid);
    }
  }
  
  /**
   * Get default backgrounds if themes.json is unavailable
   */
  function getDefaultBackgrounds() {
    return [
      { id: 'digital-rain', name: 'Digital Rain', type: 'canvas-animation', category: 'animated', default: true },
      { id: 'gradient-dark-blue', name: 'Deep Ocean', type: 'gradient', category: 'gradient', css: 'linear-gradient(135deg, #0a192f 0%, #112240 50%, #1a365d 100%)' },
      { id: 'gradient-purple-haze', name: 'Purple Haze', type: 'gradient', category: 'gradient', css: 'linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1e1b4b 100%)' },
      { id: 'solid-dark', name: 'Solid Dark', type: 'solid', category: 'solid', css: '#0a0e27' },
      { id: 'pattern-dots', name: 'Dot Matrix', type: 'pattern', category: 'pattern', css: 'radial-gradient(circle, rgba(0, 255, 136, 0.03) 1px, transparent 1px)', cssSize: '20px 20px', baseColor: '#0a0e27' }
    ];
  }
  
  /**
   * Render background themes grid
   */
  function renderBackgroundThemesGrid(backgrounds, container) {
    const selectedId = container.dataset.selected || 'digital-rain';
    
    // Group by category
    const categories = {
      animated: [],
      gradient: [],
      pattern: [],
      solid: []
    };
    
    backgrounds.forEach(bg => {
      if (categories[bg.category]) {
        categories[bg.category].push(bg);
      }
    });
    
    let html = '';
    
    // Render each category
    Object.entries(categories).forEach(([category, items]) => {
      if (items.length === 0) return;
      
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      html += `<div class="background-category-label">${categoryName}</div>`;
      
      items.forEach(bg => {
        const isSelected = bg.id === selectedId;
        const previewStyle = getBackgroundPreviewStyle(bg);
        
        html += `
          <button 
            class="background-theme-item ${isSelected ? 'selected' : ''}"
            data-bg-id="${bg.id}"
            data-bg-type="${bg.type}"
            data-bg-css="${escapeHtml(bg.css || '')}"
            ${bg.cssSize ? `data-bg-size="${bg.cssSize}"` : ''}
            ${bg.baseColor ? `data-bg-base="${bg.baseColor}"` : ''}
            title="${bg.description || bg.name}"
            aria-label="${bg.name}"
            aria-pressed="${isSelected}"
          >
            <div class="background-theme-preview" style="${previewStyle}">
              ${bg.type === 'canvas-animation' ? '<span class="bg-animated-indicator">✨</span>' : ''}
            </div>
            <span class="background-theme-name">${bg.name}</span>
          </button>
        `;
      });
    });
    
    container.innerHTML = html;
    
    // Add click listeners
    container.querySelectorAll('.background-theme-item').forEach(btn => {
      btn.addEventListener('click', handleBackgroundThemeSelect);
    });
  }
  
  /**
   * Get CSS preview style for a background theme
   */
  function getBackgroundPreviewStyle(bg) {
    if (bg.type === 'canvas-animation') {
      // Show a representation of animated backgrounds
      return 'background: linear-gradient(135deg, #0a0e27 0%, rgba(0, 255, 136, 0.1) 50%, #0a0e27 100%);';
    }
    if (bg.type === 'solid') {
      return `background: ${bg.css};`;
    }
    if (bg.type === 'pattern') {
      return `background: ${bg.baseColor || '#0a0e27'}; background-image: ${bg.css}; ${bg.cssSize ? `background-size: ${bg.cssSize};` : ''}`;
    }
    // Gradient or animated-gradient
    return `background: ${bg.css};`;
  }
  
  /**
   * Handle background theme selection
   */
  function handleBackgroundThemeSelect(e) {
    const btn = e.currentTarget;
    const bgId = btn.dataset.bgId;
    const bgType = btn.dataset.bgType;
    const bgCss = btn.dataset.bgCss;
    const bgSize = btn.dataset.bgSize;
    const bgBase = btn.dataset.bgBase;
    
    // Update selection state
    const container = document.getElementById('background-themes-grid');
    container.querySelectorAll('.background-theme-item').forEach(item => {
      item.classList.remove('selected');
      item.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('selected');
    btn.setAttribute('aria-pressed', 'true');
    
    // Store pending changes
    state.pendingChanges['theme.backgroundId'] = bgId;
    state.pendingChanges['theme.backgroundType'] = bgType;
    if (bgCss) state.pendingChanges['theme.backgroundCss'] = bgCss;
    if (bgSize) state.pendingChanges['theme.backgroundSize'] = bgSize;
    if (bgBase) state.pendingChanges['theme.backgroundBase'] = bgBase;
    
    // Update preview
    updateBackgroundPreviewFromSelection(bgId, bgType, bgCss, bgSize, bgBase);
  }
  
  /**
   * Update background preview from theme selection
   */
  function updateBackgroundPreviewFromSelection(bgId, bgType, bgCss, bgSize, bgBase) {
    const preview = document.getElementById('bg-preview');
    if (!preview) return;
    
    preview.dataset.bgId = bgId;
    
    const blurAmount = document.getElementById('background-blur')?.value || 0;
    let filterStyle = blurAmount > 0 ? `filter: blur(${blurAmount}px);` : '';
    
    if (bgType === 'canvas-animation') {
      // For canvas animations, just show base color in preview
      const primaryColor = document.getElementById('bg-primary-text')?.value || DEFAULT_COLORS.BG_PRIMARY;
      preview.style.cssText = `background: ${primaryColor}; ${filterStyle}`;
    } else if (bgType === 'solid') {
      preview.style.cssText = `background: ${bgCss}; ${filterStyle}`;
    } else if (bgType === 'pattern') {
      preview.style.cssText = `background: ${bgBase || '#0a0e27'}; background-image: ${bgCss}; ${bgSize ? `background-size: ${bgSize};` : ''} ${filterStyle}`;
    } else {
      // Gradient
      preview.style.cssText = `background: ${bgCss}; ${filterStyle}`;
    }
  }
  
  /**
   * Update background preview effects (blur)
   */
  function updateBackgroundPreviewEffects() {
    const preview = document.getElementById('bg-preview');
    if (!preview) return;
    
    const selectedBtn = document.querySelector('.background-theme-item.selected');
    if (selectedBtn) {
      const bgId = selectedBtn.dataset.bgId;
      const bgType = selectedBtn.dataset.bgType;
      const bgCss = selectedBtn.dataset.bgCss;
      const bgSize = selectedBtn.dataset.bgSize;
      const bgBase = selectedBtn.dataset.bgBase;
      updateBackgroundPreviewFromSelection(bgId, bgType, bgCss, bgSize, bgBase);
    } else {
      // Default preview
      const blurAmount = document.getElementById('background-blur')?.value || 0;
      const primaryColor = document.getElementById('bg-primary-text')?.value || DEFAULT_COLORS.BG_PRIMARY;
      preview.style.cssText = `background: ${primaryColor}; ${blurAmount > 0 ? `filter: blur(${blurAmount}px);` : ''}`;
    }
  }

  /**
   * Update background preview based on type
   */
  function updateBackgroundPreview(bgType, primaryColor, secondaryColor) {
    const preview = document.getElementById('bg-preview');
    if (!preview) return;

    preview.dataset.bgType = bgType;
    
    const primary = primaryColor || document.getElementById('bg-primary-text')?.value || DEFAULT_COLORS.BG_PRIMARY;
    const secondary = secondaryColor || document.getElementById('bg-secondary-text')?.value || DEFAULT_COLORS.BG_SECONDARY;

    switch (bgType) {
      case 'digital-rain':
        preview.style.background = primary;
        preview.style.backgroundImage = 'none';
        break;
      case 'gradient':
        preview.style.background = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
        preview.style.backgroundImage = '';
        break;
      case 'solid':
        preview.style.background = primary;
        preview.style.backgroundImage = 'none';
        break;
      default:
        preview.style.background = primary;
        preview.style.backgroundImage = 'none';
    }
  }

  /**
   * Setup glass effects listeners
   */
  function setupGlassListeners() {
    const opacitySlider = document.getElementById('glass-opacity');
    const opacityValue = document.getElementById('opacity-value');
    const blurSlider = document.getElementById('glass-blur');
    const blurValue = document.getElementById('blur-value');
    const previewCard = document.getElementById('glass-preview-card');

    if (opacitySlider && opacityValue) {
      opacitySlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        opacityValue.textContent = val.toFixed(2);
        if (previewCard) {
          previewCard.style.background = `rgba(10, 14, 39, ${val})`;
        }
        state.pendingChanges['theme.glassOpacity'] = val;
        // Apply live CSS variable update for immediate visual feedback
        applyLiveCssVariable('--glass-opacity-light', val);
      });
    }

    if (blurSlider && blurValue) {
      blurSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        blurValue.textContent = `${val}px`;
        if (previewCard) {
          previewCard.style.backdropFilter = `blur(${val}px)`;
          previewCard.style.webkitBackdropFilter = `blur(${val}px)`;
        }
        state.pendingChanges['theme.glassBlur'] = val;
        // Apply live CSS variable update for immediate visual feedback
        applyLiveCssVariable('--glass-blur-medium', `${val}px`);
      });
    }
  }

  /**
   * Setup typography listeners for live preview
   */
  function setupTypographyListeners() {
    const fontSizeSelect = document.getElementById('font-size');
    const preview = document.getElementById('typography-preview');

    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        state.pendingChanges['theme.fontSize'] = value;
        
        // Update preview font size
        if (preview) {
          const sizeMap = { small: '14px', medium: '16px', large: '18px' };
          preview.style.fontSize = sizeMap[value] || '16px';
        }
      });
    }
  }

  /**
   * Setup borders listeners for live preview
   */
  function setupBordersListeners() {
    const borderRadiusSelect = document.getElementById('border-radius');
    const borderColorPicker = document.getElementById('border-color');
    const borderColorText = document.getElementById('border-color-text');
    const previewCard = document.querySelector('.preview-border-card');
    const previewBtn = document.querySelector('.preview-border-btn');
    const previewInput = document.querySelector('.preview-border-input');

    // Border radius change
    if (borderRadiusSelect) {
      borderRadiusSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        state.pendingChanges['theme.borderRadius'] = value;
        
        const radiusMap = { sharp: '4px', rounded: '8px', pill: '18px' };
        const radiusValue = radiusMap[value] || '8px';
        
        if (previewCard) previewCard.style.borderRadius = radiusValue;
        if (previewBtn) previewBtn.style.borderRadius = radiusValue;
        if (previewInput) previewInput.style.borderRadius = radiusValue;
      });
    }

    // Border color - setup paired color picker and text input
    if (borderColorPicker && borderColorText) {
      borderColorPicker.addEventListener('input', (e) => {
        const value = e.target.value;
        borderColorText.value = value;
        updateBorderPreviewColor(value);
        state.pendingChanges['theme.borderColor'] = value;
      });

      borderColorText.addEventListener('input', (e) => {
        const value = e.target.value;
        if (isValidColor(value)) {
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            borderColorPicker.value = value;
          }
          borderColorText.classList.remove('invalid');
          updateBorderPreviewColor(value);
          state.pendingChanges['theme.borderColor'] = value;
        } else {
          borderColorText.classList.add('invalid');
        }
      });
    }

    function updateBorderPreviewColor(color) {
      if (previewCard) previewCard.style.borderColor = color;
      if (previewBtn) previewBtn.style.borderColor = color;
      if (previewInput) previewInput.style.borderColor = color;
    }
  }

  /**
   * Setup page message listeners
   */
  function setupPageMessageListeners() {
    const inputs = document.querySelectorAll('.page-message-input');
    const previewText = document.getElementById('preview-message-text');

    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const page = e.target.dataset.page;
        state.pendingChanges[`pageMessages.${page}`] = e.target.value;
        
        // Update preview with latest value
        if (previewText && e.target.value) {
          previewText.textContent = e.target.value;
        } else if (previewText) {
          previewText.textContent = 'Your custom message will appear here';
        }
      });
    });
  }

  /**
   * Setup color customization listeners (legacy fallback)
   */
  function setupColorListeners() {
    setupGlobalColorListeners();
  }

  /**
   * Handle category change
   */
  function handleCategoryChange(e) {
    const newCategory = e.currentTarget.dataset.category;
    if (newCategory && newCategory !== state.category) {
      state.category = newCategory;
      state.pendingChanges = {};
      
      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.set('category', newCategory);
      window.history.pushState({}, '', url);
      
      // Re-render page
      renderPage();
    }
  }

  /**
   * Handle cancel button
   */
  function handleCancel() {
    if (Object.keys(state.pendingChanges).length > 0) {
      if (!confirm('Discard changes and return to ' + getPageDisplayName(state.referringPage) + '?')) {
        return;
      }
    }
    window.location.href = getBackURL(state.referringPage);
  }

  /**
   * Handle reset to defaults
   */
  function handleReset() {
    if (!window.accountManager) {
      showNotification('Reset Failed', 'Unable to access settings.', 'error');
      return;
    }

    if (!confirm('Reset this category to default values?')) {
      return;
    }

    const defaultCustomization = getDefaultCustomization();
    let success = true;

    // Handle different categories
    if (state.category === 'global-colors' && defaultCustomization.theme) {
      const colorKeys = ['primaryColor', 'accentColor', 'redColor', 'blueColor'];
      colorKeys.forEach(key => {
        if (defaultCustomization.theme[key]) {
          success = window.accountManager.setCustomization(`theme.${key}`, defaultCustomization.theme[key]) && success;
        }
      });
    } else if (state.category === 'themes') {
      // Reset theme mode and animation intensity to defaults
      success = window.accountManager.setCustomization('theme.mode', 'dark') && success;
      success = window.accountManager.setCustomization('theme.animationIntensity', DEFAULT_ANIMATION.INTENSITY) && success;
      applyThemeToDocument('dark');
    } else if (state.category === 'global-backgrounds' && defaultCustomization.theme) {
      if (defaultCustomization.theme.backgroundColor) {
        success = window.accountManager.setCustomization('theme.backgroundColor', defaultCustomization.theme.backgroundColor) && success;
      }
      if (defaultCustomization.theme.secondaryColor) {
        success = window.accountManager.setCustomization('theme.secondaryColor', defaultCustomization.theme.secondaryColor) && success;
      }
    } else if (state.category === 'global-glass' && defaultCustomization.theme) {
      success = window.accountManager.setCustomization('theme.glassOpacity', 0.55) && success;
      success = window.accountManager.setCustomization('theme.glassBlur', 45) && success;
    } else if (state.category === 'preferences' && defaultCustomization.preferences) {
      if (defaultCustomization.preferences.dateFormat) {
        success = window.accountManager.setCustomization('preferences.dateFormat', defaultCustomization.preferences.dateFormat) && success;
      }
      if (defaultCustomization.preferences.currencySymbol) {
        success = window.accountManager.setCustomization('preferences.currencySymbol', defaultCustomization.preferences.currencySymbol) && success;
      }
      if (defaultCustomization.preferences.timezone) {
        success = window.accountManager.setCustomization('preferences.timezone', defaultCustomization.preferences.timezone) && success;
      }
    } else if (state.category === 'page-messages') {
      const currentPrefs = window.accountManager.getCustomization('preferences') || {};
      currentPrefs.pageMessages = {};
      success = window.accountManager.setCustomization('preferences', currentPrefs);
    }

    if (success) {
      showNotification('Reset Complete', 'Values have been reset to defaults.', 'success');
      state.pendingChanges = {};
      setTimeout(() => window.location.reload(), 1000);
    } else {
      showNotification('Reset Failed', 'Failed to reset values.', 'error');
    }
  }

  /**
   * Handle apply changes
   */
  function handleApply() {
    if (!window.accountManager) {
      showNotification('Error', 'Account manager not available', 'error');
      return;
    }

    let success;
    const invalidFields = [];

    // Handle global colors
    if (state.category === 'global-colors') {
      success = applyColorCustomization(invalidFields);
    }
    // Handle theme mode
    else if (state.category === 'themes') {
      success = applyThemeCustomization(invalidFields);
    }
    // Handle backgrounds
    else if (state.category === 'global-backgrounds') {
      success = applyBackgroundCustomization(invalidFields);
    }
    // Handle glass effects
    else if (state.category === 'global-glass') {
      success = applyGlassCustomization(invalidFields);
    }
    // Handle preferences
    else if (state.category === 'preferences') {
      success = applyPreferencesCustomization(invalidFields);
    }
    // Handle page messages
    else if (state.category === 'page-messages') {
      success = applyPageMessagesCustomization(invalidFields);
    }
    // Explicitly mark typography and borders as "coming soon" even though they have live preview
    else if (state.category === 'global-typography' || state.category === 'global-borders') {
      showNotification('Info', 'Full customization for this category is coming soon! Live preview is available but persistence requires future implementation.', 'info');
      return;
    }
    // For other "coming soon" categories, just notify user
    else {
      showNotification('Info', 'Customization for this category is not yet available.', 'info');
      return;
    }

    if (success) {
      // Commit theme changes to markdown files for Python rebuild
      if (window.ThemeCommit && window.ThemeCommit.hasPendingChanges()) {
        window.ThemeCommit.commitThemeChanges().then(() => {
          console.log('[Customization] Theme changes committed to markdown files');
        }).catch(err => {
          console.warn('[Customization] Theme commit warning:', err);
        });
      }
      
      // Trigger background update if background settings changed
      if (state.category === 'global-backgrounds') {
        window.dispatchEvent(new CustomEvent('backgroundChanged'));
      }
      
      showNotification('Changes Applied', 'Your customization has been saved successfully!', 'success');
      state.pendingChanges = {};
      setTimeout(() => {
        window.location.href = getBackURL(state.referringPage);
      }, 1500);
    } else {
      let message = 'Some values are invalid. Please check your inputs.';
      if (invalidFields.length > 0) {
        message = 'The following fields are invalid: ' + invalidFields.join(', ');
      }
      showNotification('Validation Error', message, 'error');
    }
  }

  /**
   * Apply color customization
   */
  function applyColorCustomization(invalidFields) {
    let success = true;
    const colorFields = [
      { id: 'primary-color-text', key: 'theme.primaryColor', name: 'Primary color' },
      { id: 'accent-color-text', key: 'theme.accentColor', name: 'Accent color' },
      { id: 'red-color-text', key: 'theme.redColor', name: 'Red color' },
      { id: 'blue-color-text', key: 'theme.blueColor', name: 'Blue color' },
      { id: 'glow-color-text', key: 'theme.glowColor', name: 'Glow color' }
    ];

    colorFields.forEach(field => {
      const input = document.getElementById(field.id);
      if (input && input.value) {
        if (!isValidColor(input.value)) {
          invalidFields.push(field.name);
          success = false;
        } else {
          const result = window.accountManager.setCustomization(field.key, input.value);
          if (!result) {
            invalidFields.push(field.name);
            success = false;
          }
        }
      }
    });

    // Also save background and border colors if they were changed via presets
    if (state.pendingChanges['theme.backgroundColor']) {
      window.accountManager.setCustomization('theme.backgroundColor', state.pendingChanges['theme.backgroundColor']);
    }
    if (state.pendingChanges['theme.secondaryColor']) {
      window.accountManager.setCustomization('theme.secondaryColor', state.pendingChanges['theme.secondaryColor']);
    }
    if (state.pendingChanges['theme.borderColor']) {
      window.accountManager.setCustomization('theme.borderColor', state.pendingChanges['theme.borderColor']);
    }

    return success;
  }

  /**
   * Apply theme customization (mode and animation intensity)
   */
  function applyThemeCustomization(invalidFields) {
    let success = true;

    // Get theme mode from the active button
    const activeThemeBtn = document.querySelector('.theme-mode-btn.active');
    if (activeThemeBtn) {
      const mode = activeThemeBtn.dataset.mode;
      const result = window.accountManager.setCustomization('theme.mode', mode);
      if (!result) {
        invalidFields.push('Theme mode');
        success = false;
      } else {
        // Apply theme to document
        applyThemeToDocument(mode);
      }
    }

    // Get animation intensity from slider
    const intensitySlider = document.getElementById('animation-intensity');
    if (intensitySlider) {
      const intensity = parseFloat(intensitySlider.value);
      if (intensity >= 0 && intensity <= 1) {
        const result = window.accountManager.setCustomization('theme.animationIntensity', intensity);
        if (!result) {
          invalidFields.push('Animation intensity');
          success = false;
        }
      } else {
        invalidFields.push('Animation intensity (must be 0-1)');
        success = false;
      }
    }

    return success;
  }

  /**
   * Apply background customization
   */
  function applyBackgroundCustomization(invalidFields) {
    let success = true;
    
    // Save background type
    const bgTypeSelect = document.getElementById('background-type');
    if (bgTypeSelect && bgTypeSelect.value) {
      const result = window.accountManager.setCustomization('theme.backgroundType', bgTypeSelect.value);
      if (!result) {
        invalidFields.push('Background type');
        success = false;
      }
    }
    
    const bgFields = [
      { id: 'bg-primary-text', key: 'theme.backgroundColor', name: 'Primary background' },
      { id: 'bg-secondary-text', key: 'theme.secondaryColor', name: 'Secondary background' }
    ];

    bgFields.forEach(field => {
      const input = document.getElementById(field.id);
      if (input && input.value) {
        if (!isValidColor(input.value)) {
          invalidFields.push(field.name);
          success = false;
        } else {
          const result = window.accountManager.setCustomization(field.key, input.value);
          if (!result) {
            invalidFields.push(field.name);
            success = false;
          }
        }
      }
    });

    return success;
  }

  /**
   * Apply glass effects customization
   */
  function applyGlassCustomization(invalidFields) {
    let success = true;

    const opacity = document.getElementById('glass-opacity');
    const blur = document.getElementById('glass-blur');

    if (opacity) {
      const val = parseFloat(opacity.value);
      if (val >= 0.1 && val <= 0.9) {
        const result = window.accountManager.setCustomization('theme.glassOpacity', val);
        if (!result) {
          invalidFields.push('Glass opacity');
          success = false;
        }
      } else {
        invalidFields.push('Glass opacity (must be 0.1-0.9)');
        success = false;
      }
    }

    if (blur) {
      const val = parseInt(blur.value);
      if (val >= 5 && val <= 100) {
        const result = window.accountManager.setCustomization('theme.glassBlur', val);
        if (!result) {
          invalidFields.push('Glass blur');
          success = false;
        }
      } else {
        invalidFields.push('Glass blur (must be 5-100px)');
        success = false;
      }
    }

    return success;
  }

  /**
   * Apply preferences customization
   */
  function applyPreferencesCustomization(invalidFields) {
    let success = true;

    const dateFormat = document.getElementById('date-format');
    const currencySymbol = document.getElementById('currency-symbol');
    const timezone = document.getElementById('timezone');
    const pageMessage = document.getElementById('page-message');

    if (dateFormat) {
      const result = window.accountManager.setCustomization('preferences.dateFormat', dateFormat.value);
      if (!result) {
        invalidFields.push('Date format');
        success = false;
      }
    }

    if (currencySymbol) {
      if (!isValidCurrency(currencySymbol.value)) {
        invalidFields.push('Currency symbol (must be 3-letter code or symbol like $, €, £)');
        success = false;
      } else {
        const result = window.accountManager.setCustomization('preferences.currencySymbol', currencySymbol.value);
        if (!result) {
          invalidFields.push('Currency symbol');
          success = false;
        }
      }
    }

    if (timezone) {
      const result = window.accountManager.setCustomization('preferences.timezone', timezone.value);
      if (!result) {
        invalidFields.push('Timezone');
        success = false;
      }
    }

    if (pageMessage) {
      const currentPrefs = window.accountManager.getCustomization('preferences') || {};
      if (!currentPrefs.pageMessages) {
        currentPrefs.pageMessages = {};
      }
      currentPrefs.pageMessages[state.referringPage] = pageMessage.value.trim();
      const result = window.accountManager.setCustomization('preferences', currentPrefs);
      if (!result) {
        invalidFields.push('Page message');
        success = false;
      }
    }

    return success;
  }

  /**
   * Apply page messages customization
   */
  function applyPageMessagesCustomization(invalidFields) {
    let success = true;
    const inputs = document.querySelectorAll('.page-message-input');
    const currentPrefs = window.accountManager.getCustomization('preferences') || {};
    
    if (!currentPrefs.pageMessages) {
      currentPrefs.pageMessages = {};
    }

    inputs.forEach(input => {
      const page = input.dataset.page;
      const message = input.value.trim();
      currentPrefs.pageMessages[page] = message;
      
      // Queue theme change for commit to markdown files
      if (window.ThemeCommit) {
        window.ThemeCommit.queueThemeChange(`pageMessages.${page}`, message);
      }
    });

    const result = window.accountManager.setCustomization('preferences', currentPrefs);
    if (!result) {
      invalidFields.push('Page messages');
      success = false;
    }

    return success;
  }

  // ===== Utility Functions =====

  /**
   * Apply theme mode to the document
   * @param {string} mode - 'light' or 'dark'
   */
  function applyThemeToDocument(mode) {
    if (mode === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark');
    } else {
      document.documentElement.classList.add('theme-dark');
      document.documentElement.classList.remove('theme-light');
    }
  }

  /**
   * Get page display name
   */
  function getPageDisplayName(pageName) {
    return PAGE_NAMES[pageName] || pageName.charAt(0).toUpperCase() + pageName.slice(1);
  }

  /**
   * Get back URL based on referring page
   */
  function getBackURL(pageName) {
    if (pageName === 'index') {
      return '../index.html';
    }
    return `${pageName}.html`;
  }

  /**
   * Apply live CSS variable update for immediate visual feedback
   * Updates the CSS custom property on the document root
   * @param {string} cssVar - CSS variable name (e.g., '--accent-green')
   * @param {string} value - New value to apply
   */
  function applyLiveCssVariable(cssVar, value) {
    if (!cssVar || !value) return;

    // Ensure cssVar is a valid CSS custom property name to prevent CSS injection
    if (typeof cssVar !== 'string') return;
    const normalizedVar = cssVar.trim();
    if (!normalizedVar.startsWith('--')) return;

    document.documentElement.style.setProperty(normalizedVar, value);
  }

  /**
   * Apply live theme color update with CSS variable synchronization
   * @param {string} themeKey - Theme property key (e.g., 'primaryColor')
   * @param {string} value - Color value to apply
   */
  function applyLiveThemeColor(themeKey, value) {
    const cssVar = CSS_VAR_MAP[themeKey];
    if (cssVar && value) {
      applyLiveCssVariable(cssVar, value);
    }
  }

  /**
   * Validate color string
   */
  function isValidColor(color) {
    if (!color || typeof color !== 'string') return false;

    // Check for hex colors (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color)) {
      return true;
    }

    // Check for rgb/rgba
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color)) {
      return true;
    }

    // Check for hsl/hsla
    if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)$/.test(color)) {
      return true;
    }

    // Check for named colors by creating a test element
    const tempEl = document.createElement('div');
    tempEl.style.color = color;
    return tempEl.style.color !== '';
  }

  /**
   * Validate currency symbol
   */
  function isValidCurrency(value) {
    if (!value || typeof value !== 'string') return false;
    // Check for common currency symbols first (symbols are inherently case-insensitive)
    if (/^[€£¥₹$¢]$/.test(value)) return true;
    // Check for 3-letter currency codes (case-insensitive)
    if (/^[A-Za-z]{3}$/.test(value)) return true;
    return false;
  }

  /**
   * Get default customization values
   */
  function getDefaultCustomization() {
    // Try to get from accountManager first
    if (window.accountManager) {
      if (typeof window.accountManager.getDefaultCustomization === 'function') {
        return window.accountManager.getDefaultCustomization();
      }
      if (typeof window.accountManager._getDefaultCustomization === 'function') {
        return window.accountManager._getDefaultCustomization();
      }
    }

    // Fallback to hardcoded defaults using constants
    return {
      theme: {
        primaryColor: DEFAULT_COLORS.PRIMARY,
        secondaryColor: DEFAULT_COLORS.BG_SECONDARY,
        accentColor: DEFAULT_COLORS.ACCENT,
        backgroundColor: DEFAULT_COLORS.BG_PRIMARY,
        redColor: DEFAULT_COLORS.RED,
        blueColor: DEFAULT_COLORS.BLUE,
        glassOpacity: DEFAULT_GLASS.OPACITY,
        glassBlur: DEFAULT_GLASS.BLUR
      },
      preferences: {
        dateFormat: 'MM/DD/YYYY',
        currencySymbol: '$',
        timezone: 'America/New_York'
      }
    };
  }

  /**
   * Escape HTML to prevent XSS (safe for both content and attribute contexts)
   */
  function escapeHtml(str) {
    if (!str) return '';
    // Use a map for all characters that need escaping in HTML attributes
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    return String(str).replace(/[&<>"'`=/]/g, char => escapeMap[char]);
  }

  /**
   * Show notification
   */
  function showNotification(title, message, type = 'info') {
    if (window.accountManager && window.accountManager.showNotification) {
      window.accountManager.showNotification(title, message, type);
      return;
    }

    const colors = {
      success: DEFAULT_COLORS.PRIMARY,
      warning: DEFAULT_COLORS.ACCENT,
      error: DEFAULT_COLORS.RED,
      info: DEFAULT_COLORS.BLUE
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: #000;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10001;
      font-weight: 600;
      max-width: 400px;
    `;

    // Use textContent instead of innerHTML to prevent XSS
    const titleDiv = document.createElement('div');
    titleDiv.style.fontWeight = '600';
    titleDiv.style.marginBottom = '0.25rem';
    titleDiv.textContent = title;

    const messageDiv = document.createElement('div');
    messageDiv.style.fontSize = '0.875rem';
    messageDiv.style.fontWeight = '400';
    messageDiv.textContent = message;

    notification.appendChild(titleDiv);
    notification.appendChild(messageDiv);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // ===== Export =====
  window.CustomizationPage = {
    init,
    handleApply,
    handleCancel,
    handleReset
  };

  // ===== Auto-Initialize =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
