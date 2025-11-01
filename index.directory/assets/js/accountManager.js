/**
 * Account Manager
 * Handles starting balance, deposits, and portfolio value calculations
 * Integrated with EventBus for reactive updates
 */

class AccountManager {
  constructor() {
    this.config = null;
    this.basePath = SFTiUtils.getBasePath();
    this.initialized = false;
    this.eventBus = window.SFTiEventBus;
  }

  /**
   * Initialize account manager
   */
  async init() {
    await this.loadConfig();
    this.updateDisplay();
    this.setupEventListeners();
    this.initialized = true;
    
    // Emit initial account loaded event
    if (this.eventBus) {
      this.eventBus.emit('account:config-loaded', this.config);
    }
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (!this.eventBus) return;
    
    // Listen for trades updates to recalculate portfolio value
    this.eventBus.on('trades:updated', (trades) => {
      this.updateDisplay();
    });
    
    // Listen for state refresh requests
    this.eventBus.on('state:refreshed', () => {
      this.loadConfig();
      this.updateDisplay();
    });
  }

  /**
   * Load account configuration from JSON file
   */
  async loadConfig() {
    try {
      const response = await fetch(`${this.basePath}/index.directory/account-config.json`);
      if (response.ok) {
        this.config = await response.json();
        // Ensure withdrawals array exists
        if (!this.config.withdrawals) {
          this.config.withdrawals = [];
        }
      } else {
        // Create default config
        this.config = {
          starting_balance: 1000.00,
          deposits: [],
          withdrawals: [],
          notes: "Starting balance is your initial capital. Add deposits separately to track internal investments.",
          version: "1.0",
          last_updated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('Could not load account config, using defaults:', error);
      this.config = {
        starting_balance: 1000.00,
        deposits: [],
        withdrawals: [],
        notes: "Starting balance is your initial capital. Add deposits separately to track internal investments.",
        version: "1.0",
        last_updated: new Date().toISOString()
      };
    }
  }

  /**
   * Save account configuration
   * Saves to localStorage and commits to repository via GitHub API
   * Uses exact same pattern as trade submission in app.js
   */
  async saveConfig(isDeposit = false) {
    try {
      this.config.last_updated = new Date().toISOString();
      
      // Save to localStorage for immediate UI updates
      localStorage.setItem('sfti-account-config', JSON.stringify(this.config));
      console.log('Account config saved to localStorage');
      
      // Commit to repository (throws error if fails - just like trade submission)
      await this.commitConfigToRepo(isDeposit);
      
      // If we reach here, commit was successful
      this.showNotification(
        'Changes Saved!',
        'Account config committed. Changes will appear in 1-5 minutes.',
        'success',
        5000
      );
      
    } catch (error) {
      console.error('Error saving config:', error);
      // Show error just like trade submission does
      this.showNotification(
        'Failed to Save',
        `Failed to commit changes: ${error.message}`,
        'error',
        5000
      );
    }
  }
  
  /**
   * Commit account-config.json to repository via GitHub API
   * Uses EXACT same pattern as trade submission in app.js
   */
  async commitConfigToRepo(isDeposit = false) {
    // Get or create auth instance (same approach as add-trade.html)
    let auth = window.tradingJournal?.auth;
    
    // If tradingJournal isn't available yet, create a temporary auth instance
    if (!auth) {
      console.log('[AccountManager] tradingJournal.auth not available, creating temporary auth instance');
      auth = new GitHubAuth();
    }
    
    // Check authentication (throw error if not authenticated - just like trade submission)
    if (!auth.isAuthenticated()) {
      throw new Error('Not authenticated. Please sign in with your GitHub token.');
    }
    
    console.log('[AccountManager] Committing account-config.json to repository...');
    
    const filePath = 'index.directory/account-config.json';
    const content = JSON.stringify(this.config, null, 2);
    // Use EXACT same encoding as trade submission
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    // Determine commit message based on action type
    const commitMessage = isDeposit ? 'Added Deposit to account' : 'Adjusted account base total';
    
    // Use the same uploadFile method that add-trade.html uses
    // This will throw an error if it fails - let it bubble up to saveConfig
    await auth.uploadFile(filePath, encodedContent, commitMessage);
    
    console.log('[AccountManager] Successfully committed account-config.json');
    // Note: The workflow will trigger automatically because it watches this file path
  }
  
  /**
   * Show notification to user
   */
  showNotification(title, message, type = 'info', duration = 5000) {
    const colors = {
      success: 'var(--accent-green)',
      warning: 'var(--accent-yellow)',
      error: 'var(--accent-red)',
      info: 'var(--accent-blue)'
    };
    
    const icons = {
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      warning: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
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
      z-index: 10000;
      max-width: 400px;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: start; gap: 0.75rem;">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink: 0; margin-top: 2px;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${icons[type] || icons.info}"/>
        </svg>
        <div>
          <div style="font-weight: 600; margin-bottom: 0.25rem;">${title}</div>
          <div style="font-size: 0.875rem;">${message}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  /**
   * Load config from localStorage if available (for client-side persistence)
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('sfti-account-config');
      if (stored) {
        const localConfig = JSON.parse(stored);
        // Merge with server config, preferring localStorage values
        this.config = { ...this.config, ...localConfig };
        console.log('Loaded account config from localStorage');
      }
    } catch (error) {
      console.warn('Could not load from localStorage:', error);
    }
  }

  /**
   * Update display elements (now updates modal displays if open)
   */
  updateDisplay() {
    // Load from localStorage first (client-side changes)
    this.loadFromLocalStorage();
    
    // Update modal displays if modals are open
    if (window.updatePortfolioModalDisplay) {
      window.updatePortfolioModalDisplay();
    }
    if (window.updateReturnModalDisplay) {
      window.updateReturnModalDisplay();
    }
  }

  /**
   * Get total deposits
   */
  getTotalDeposits() {
    if (!this.config || !this.config.deposits) return 0;
    return this.config.deposits.reduce((sum, deposit) => sum + parseFloat(deposit.amount || 0), 0);
  }

  /**
   * Calculate current portfolio value
   * Portfolio = Starting Balance + Deposits + Trade P&L
   */
  calculatePortfolioValue(tradePnL) {
    const starting = parseFloat(this.config.starting_balance || 0);
    const deposits = this.getTotalDeposits();
    const pnl = parseFloat(tradePnL || 0);
    return starting + deposits + pnl;
  }

  /**
   * Update starting balance
   */
  updateStartingBalance(newBalance) {
    this.config.starting_balance = parseFloat(newBalance);
    this.saveConfig(false); // false = not a deposit, balance adjustment
    this.updateDisplay();
    
    // Emit balance updated event
    if (this.eventBus) {
      this.eventBus.emit('account:balance-updated', {
        starting_balance: this.config.starting_balance,
        total_deposits: this.getTotalDeposits()
      });
    }
  }

  /**
   * Add a deposit
   */
  addDeposit(amount, date, note = '') {
    if (!this.config.deposits) {
      this.config.deposits = [];
    }
    
    this.config.deposits.push({
      amount: parseFloat(amount),
      date: date,
      note: note,
      timestamp: new Date().toISOString()
    });
    
    // Sort deposits by date
    this.config.deposits.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    this.saveConfig(true); // true = is a deposit
    this.updateDisplay();
    
    // Emit deposit added event
    if (this.eventBus) {
      this.eventBus.emit('account:deposit-added', {
        amount: parseFloat(amount),
        date: date,
        total_deposits: this.getTotalDeposits()
      });
    }
  }

  /**
   * Format currency with commas
   */
  formatCurrency(value) {
    return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

// Initialize global account manager on window object
window.accountManager = null;

// Initialize when DOM is ready
SFTiUtils.onDOMReady(async () => {
  window.accountManager = new AccountManager();
  await window.accountManager.init();
});
