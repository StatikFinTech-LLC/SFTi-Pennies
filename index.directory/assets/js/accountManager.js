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
    
    // Apply customizations from config
    this._applyCSSCustomProperties();
    
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
      this._applyCSSCustomProperties();
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
        // Ensure customization exists
        if (!this.config.customization) {
          this.config.customization = this._getDefaultCustomization();
        }
      } else {
        // Create default config
        this.config = {
          starting_balance: 1000.00,
          deposits: [],
          withdrawals: [],
          account_opening_date: null,
          notes: "Starting balance is your initial capital. Add deposits separately to track internal investments.",
          version: "1.0",
          last_updated: new Date().toISOString(),
          customization: this._getDefaultCustomization()
        };
      }
      
      // Ensure account_opening_date field exists (for backward compatibility)
      if (this.config.account_opening_date === undefined) {
        this.config.account_opening_date = null;
      }
    } catch (error) {
      console.warn('Could not load account config, using defaults:', error);
      this.config = {
        starting_balance: 1000.00,
        deposits: [],
        withdrawals: [],
        account_opening_date: null,
        notes: "Starting balance is your initial capital. Add deposits separately to track internal investments.",
        version: "1.0",
        last_updated: new Date().toISOString(),
        customization: this._getDefaultCustomization()
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
   * Get total withdrawals
   */
  getTotalWithdrawals() {
    if (!this.config || !this.config.withdrawals) return 0;
    return this.config.withdrawals.reduce((sum, withdrawal) => sum + parseFloat(withdrawal.amount || 0), 0);
  }

  /**
   * Calculate current portfolio value
   * Portfolio = Starting Balance + Deposits - Withdrawals + Trade P&L
   */
  calculatePortfolioValue(tradePnL) {
    const starting = parseFloat(this.config.starting_balance || 0);
    const deposits = this.getTotalDeposits();
    const withdrawals = this.getTotalWithdrawals();
    const pnl = parseFloat(tradePnL || 0);
    return starting + deposits - withdrawals + pnl;
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
   * Get customization settings
   * @param {string} key - Optional key to get specific customization value (e.g., 'theme.primaryColor')
   * @returns {any} The customization value or entire customization object if no key provided
   */
  getCustomization(key = null) {
    // Ensure customization object exists
    if (!this.config.customization) {
      this.config.customization = this._getDefaultCustomization();
    }
    
    // If no key specified, return entire customization object
    if (!key) {
      return this.config.customization;
    }
    
    // Support dot notation for nested keys (e.g., 'theme.primaryColor')
    const keys = key.split('.');
    let value = this.config.customization;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
  
  /**
   * Set customization settings
   * @param {string|object} keyOrObject - Key path (e.g., 'theme.primaryColor') or entire customization object
   * @param {any} value - Value to set (only used if first param is a key)
   * @returns {boolean} True if validation passed and value was set
   */
  setCustomization(keyOrObject, value = undefined) {
    // Ensure customization object exists
    if (!this.config.customization) {
      this.config.customization = this._getDefaultCustomization();
    }
    
    let customizationToSet;
    
    // If first argument is an object, replace entire customization
    // Note: null check is important since typeof null === 'object' in JavaScript
    if (typeof keyOrObject === 'object' && keyOrObject !== null && value === undefined) {
      customizationToSet = keyOrObject;
      
      // Validate entire customization object
      const validation = this._validateCustomization(customizationToSet);
      if (!validation.valid) {
        console.error('Customization validation failed:', validation.errors);
        return false;
      }
      
      // Replace entire customization structure (no merging - this is intentional)
      // If partial updates are needed, use dot notation instead
      this.config.customization = customizationToSet;
    } else {
      // Set specific key using dot notation
      const keys = keyOrObject.split('.');
      
      // Validate the specific value
      const validation = this._validateCustomizationValue(keyOrObject, value);
      if (!validation.valid) {
        console.error(`Validation failed for ${keyOrObject}:`, validation.errors);
        return false;
      }
      
      // Navigate to the parent object
      let current = this.config.customization;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || current[key] === null || typeof current[key] !== 'object' || Array.isArray(current[key])) {
          current[key] = {};
        }
        current = current[key];
      }
      
      // Set the final value
      current[keys[keys.length - 1]] = value;
    }
    
    // Save configuration
    this.saveConfig(false);
    
    // Emit customization updated event
    if (this.eventBus) {
      this.eventBus.emit('customization:updated', this.config.customization);
    }
    
    // Apply CSS custom properties if theme was updated
    this._applyCSSCustomProperties();
    
    return true;
  }
  
  /**
   * Validate customization object
   * @private
   */
  _validateCustomization(customization) {
    const errors = [];
    
    if (!customization || typeof customization !== 'object') {
      errors.push('Customization must be an object');
      return { valid: false, errors };
    }
    
    // Validate theme if present
    if (customization.theme) {
      if (typeof customization.theme !== 'object') {
        errors.push('theme must be an object');
      } else {
        // Validate color values
        const colorFields = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor'];
        for (const field of colorFields) {
          if (customization.theme[field]) {
            if (!this._isValidColor(customization.theme[field])) {
              errors.push(`theme.${field} must be a valid color (hex, rgb, or named color)`);
            }
          }
        }
      }
    }
    
    // Validate preferences if present
    if (customization.preferences) {
      if (typeof customization.preferences !== 'object') {
        errors.push('preferences must be an object');
      } else {
        // Validate date format
        if (customization.preferences.dateFormat) {
          const validFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
          if (!validFormats.includes(customization.preferences.dateFormat)) {
            errors.push(`preferences.dateFormat must be one of: ${validFormats.join(', ')}`);
          }
        }
        
        // Validate currency symbol
        if (customization.preferences.currencySymbol) {
          if (typeof customization.preferences.currencySymbol !== 'string' || 
              customization.preferences.currencySymbol.length < 1 ||
              customization.preferences.currencySymbol.length > 3) {
            errors.push('preferences.currencySymbol must be a string with 1-3 characters');
          }
        }
        
        // Validate timezone
        if (customization.preferences.timezone) {
          if (typeof customization.preferences.timezone !== 'string') {
            errors.push('preferences.timezone must be a string');
          }
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate a specific customization value
   * @private
   */
  _validateCustomizationValue(key, value) {
    const errors = [];
    
    // Reject null and undefined values explicitly
    if (value === null || value === undefined) {
      errors.push(`${key} cannot be null or undefined`);
      return { valid: false, errors };
    }
    
    // Color validation for theme colors
    if (key.startsWith('theme.') && key.includes('Color')) {
      if (!this._isValidColor(value)) {
        errors.push(`${key} must be a valid color (hex, rgb, or named color)`);
      }
    }
    
    // Date format validation
    if (key === 'preferences.dateFormat') {
      const validFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
      if (!validFormats.includes(value)) {
        errors.push(`dateFormat must be one of: ${validFormats.join(', ')}`);
      }
    }
    
    // Currency symbol validation
    if (key === 'preferences.currencySymbol') {
      if (typeof value !== 'string' || value.length < 1 || value.length > 3) {
        errors.push('currencySymbol must be a string with 1-3 characters');
      }
    }
    
    // Timezone validation
    if (key === 'preferences.timezone') {
      if (typeof value !== 'string') {
        errors.push('timezone must be a string');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Check if a string is a valid CSS color
   * @private
   */
  _isValidColor(color) {
    if (typeof color !== 'string') return false;
    
    // Check hex color (3, 4, 6, or 8 digits for alpha channel support)
    if (/^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color)) return true;
    
    // Check rgb/rgba with value range validation (allow optional spaces before commas)
    const rgbMatch = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([\d.]+)\s*)?\)$/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      const a = rgbMatch[5] ? parseFloat(rgbMatch[5]) : 1;
      return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 1;
    }
    
    // Check hsl/hsla with value range validation (allow optional spaces before commas)
    const hslMatch = color.match(/^hsla?\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(,\s*([\d.]+)\s*)?\)$/i);
    if (hslMatch) {
      const h = parseInt(hslMatch[1]);
      const s = parseFloat(hslMatch[2]);
      const l = parseFloat(hslMatch[3]);
      const a = hslMatch[5] ? parseFloat(hslMatch[5]) : 1;
      return h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100 && a >= 0 && a <= 1;
    }
    
    // Check named colors (basic set)
    const namedColors = [
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
      'gray', 'grey', 'orange', 'purple', 'pink', 'brown', 'transparent'
    ];
    if (namedColors.includes(color.toLowerCase())) return true;
    
    return false;
  }
  
  /**
   * Get default customization object
   * @private
   */
  _getDefaultCustomization() {
    return {
      theme: {
        primaryColor: '#00ff88',
        secondaryColor: '#0a0e27',  // Intentionally same as backgroundColor - matches design system
        accentColor: '#ffd93d',
        backgroundColor: '#0a0e27'  // Intentionally same as secondaryColor - matches design system
      },
      preferences: {
        dateFormat: 'MM/DD/YYYY',
        currencySymbol: '$',
        timezone: 'America/New_York'
      }
    };
  }
  
  /**
   * Apply CSS custom properties from customization
   * @private
   */
  _applyCSSCustomProperties() {
    if (!this.config.customization || !this.config.customization.theme) {
      return;
    }
    
    const theme = this.config.customization.theme;
    const root = document.documentElement;
    
    // Apply theme mode (light/dark)
    if (theme.mode) {
      if (theme.mode === 'light') {
        root.classList.add('theme-light');
        root.classList.remove('theme-dark');
      } else {
        root.classList.add('theme-dark');
        root.classList.remove('theme-light');
      }
    }
    
    // Map customization colors to CSS custom properties
    if (theme.primaryColor) {
      root.style.setProperty('--accent-green', theme.primaryColor);
    }
    if (theme.secondaryColor) {
      root.style.setProperty('--bg-primary', theme.secondaryColor);
    }
    if (theme.accentColor) {
      root.style.setProperty('--accent-yellow', theme.accentColor);
    }
    if (theme.backgroundColor) {
      root.style.setProperty('--bg-secondary', theme.backgroundColor);
    }
    if (theme.redColor) {
      root.style.setProperty('--accent-red', theme.redColor);
    }
    if (theme.blueColor) {
      root.style.setProperty('--accent-blue', theme.blueColor);
    }
    if (theme.borderColor) {
      root.style.setProperty('--border-color', theme.borderColor);
    }
    if (theme.glowColor) {
      root.style.setProperty('--glow-color', theme.glowColor);
    }
    if (theme.glassOpacity) {
      root.style.setProperty('--glass-opacity-light', theme.glassOpacity);
    }
    if (theme.glassBlur) {
      root.style.setProperty('--glass-blur-medium', `${theme.glassBlur}px`);
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
