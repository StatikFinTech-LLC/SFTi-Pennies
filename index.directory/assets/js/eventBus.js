/**
 * Event Bus - Central event management system
 * Provides reactive updates across the entire application
 * 
 * Events:
 * - account:balance-updated - When starting balance changes
 * - account:deposit-added - When a deposit is added
 * - account:config-loaded - When account config is loaded
 * - trades:loaded - When trades are loaded
 * - trades:updated - When trades data changes
 * - analytics:updated - When analytics are recalculated
 * - stats:updated - When statistics are recalculated
 */

class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to an event (one-time)
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (...args) => {
      callback(...args);
      unsubscribe();
    });
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners[event]) {
      return;
    }
    
    console.log(`[EventBus] Emitting: ${event}`, data);
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in listener for ${event}:`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name
   */
  off(event) {
    delete this.listeners[event];
  }

  /**
   * Remove all listeners
   */
  clear() {
    this.listeners = {};
  }

  /**
   * Get all active events
   */
  getEvents() {
    return Object.keys(this.listeners);
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(event) {
    return this.listeners[event]?.length || 0;
  }
}

// Create global event bus
window.SFTiEventBus = new EventBus();

// Log event bus initialization
console.log('[EventBus] Initialized global event bus');

/**
 * State Manager - Centralized application state
 * Provides reactive state management with automatic persistence
 */
class StateManager {
  constructor() {
    this.state = {
      account: {
        starting_balance: 1000.00,
        deposits: [],
        total_deposits: 0,
        portfolio_value: 0,
        account_opening_date: null
      },
      trades: {
        data: [],
        statistics: {},
        total_pnl: 0
      },
      analytics: {
        data: null,
        loaded: false
      }
    };
    
    this.initialized = false;
  }

  /**
   * Initialize state manager
   */
  async init() {
    console.log('[StateManager] Initializing...');
    
    // Load initial data
    await this.loadAllData();
    
    this.initialized = true;
    window.SFTiEventBus.emit('state:initialized', this.state);
    
    console.log('[StateManager] Initialized', this.state);
  }

  /**
   * Load all data
   */
  async loadAllData() {
    await Promise.all([
      this.loadAccountConfig(),
      this.loadTrades(),
      this.loadAnalytics()
    ]);
  }

  /**
   * Load account configuration
   */
  async loadAccountConfig() {
    try {
      const basePath = SFTiUtils.getBasePath();
      const response = await fetch(`${basePath}/index.directory/account-config.json`);
      
      if (response.ok) {
        const config = await response.json();
        this.updateAccount(config);
      }
    } catch (error) {
      console.warn('[StateManager] Could not load account config:', error);
    }
    
    // Try loading from localStorage
    try {
      const stored = localStorage.getItem('sfti-account-config');
      if (stored) {
        const config = JSON.parse(stored);
        this.updateAccount(config);
      }
    } catch (error) {
      console.warn('[StateManager] Could not load from localStorage:', error);
    }
  }

  /**
   * Load trades data
   */
  async loadTrades() {
    try {
      const basePath = SFTiUtils.getBasePath();
      const response = await fetch(`${basePath}/index.directory/trades-index.json`);
      
      if (response.ok) {
        const data = await response.json();
        this.updateTrades(data);
      }
    } catch (error) {
      console.warn('[StateManager] Could not load trades:', error);
    }
  }

  /**
   * Load analytics data
   */
  async loadAnalytics() {
    try {
      const basePath = SFTiUtils.getBasePath();
      const response = await fetch(`${basePath}/index.directory/assets/charts/analytics-data.json`);
      
      if (response.ok) {
        const data = await response.json();
        this.updateAnalytics(data);
      }
    } catch (error) {
      console.warn('[StateManager] Could not load analytics:', error);
    }
  }

  /**
   * Update account state
   */
  updateAccount(config) {
    const deposits = config.deposits || [];
    const total_deposits = deposits.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    const total_pnl = this.state.trades.total_pnl || 0;
    
    this.state.account = {
      starting_balance: parseFloat(config.starting_balance || 1000),
      deposits: deposits,
      total_deposits: total_deposits,
      portfolio_value: parseFloat(config.starting_balance || 1000) + total_deposits + total_pnl,
      account_opening_date: config.account_opening_date || null
    };
    
    window.SFTiEventBus.emit('account:updated', this.state.account);
  }

  /**
   * Update trades state
   */
  updateTrades(data) {
    const trades = data.trades || [];
    const statistics = data.statistics || {};
    const total_pnl = statistics.total_pnl || 0;
    
    this.state.trades = {
      data: trades,
      statistics: statistics,
      total_pnl: total_pnl
    };
    
    // Recalculate portfolio value
    this.state.account.portfolio_value = 
      this.state.account.starting_balance + 
      this.state.account.total_deposits + 
      total_pnl;
    
    window.SFTiEventBus.emit('trades:updated', this.state.trades);
    window.SFTiEventBus.emit('account:updated', this.state.account);
  }

  /**
   * Update analytics state
   */
  updateAnalytics(data) {
    this.state.analytics = {
      data: data,
      loaded: true
    };
    
    window.SFTiEventBus.emit('analytics:updated', this.state.analytics.data);
  }

  /**
   * Get current state
   */
  getState() {
    return this.state;
  }

  /**
   * Get account state
   */
  getAccount() {
    return this.state.account;
  }

  /**
   * Get trades state
   */
  getTrades() {
    return this.state.trades;
  }

  /**
   * Get analytics state
   */
  getAnalytics() {
    return this.state.analytics;
  }

  /**
   * Refresh all data
   */
  async refresh() {
    console.log('[StateManager] Refreshing all data...');
    await this.loadAllData();
    window.SFTiEventBus.emit('state:refreshed', this.state);
  }
}

// Create global state manager
window.SFTiStateManager = new StateManager();

// Initialize on DOM ready (with fallback if SFTiUtils is missing)
(function(initFn) {
  if (window.SFTiUtils && typeof window.SFTiUtils.onDOMReady === 'function') {
    window.SFTiUtils.onDOMReady(initFn);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFn);
  } else {
    // DOM already loaded
    initFn();
  }
})(async () => {
  await window.SFTiStateManager.init();
});

console.log('[StateManager] Loaded');
