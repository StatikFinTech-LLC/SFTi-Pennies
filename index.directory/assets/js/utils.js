/**
 * Shared Utilities Module
 * Common functions used across multiple files
 * Exposed globally via window.SFTiUtils
 */

(function() {
  'use strict';

  /**
   * Get base path for the application
   * Works with GitHub Pages and custom domains
   * @returns {string} - Base path (e.g., '/SFTi-Pennies' or '')
   */
  function getBasePath() {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    // For GitHub Pages URLs (username.github.io/repo-name)
    if (pathSegments.length > 0 && window.location.hostname.includes('github.io')) {
      return '/' + pathSegments[0];
    }
    // For custom domains or root deployments
    return '';
  }

  /**
   * Format file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Get broker display name from broker code
   * @param {string} broker - Broker code (e.g., 'ibkr', 'schwab')
   * @returns {string} Full broker name
   */
  function getBrokerName(broker) {
    const names = {
      'ibkr': 'Interactive Brokers (IBKR)',
      'schwab': 'Charles Schwab / TD Ameritrade',
      'robinhood': 'Robinhood',
      'webull': 'Webull'
    };
    return names[broker] || broker;
  }

  /**
   * Get color for P&L value (green for positive, red for negative)
   * @param {number} value - P&L value
   * @returns {object} Object with bg and border colors
   */
  function getPnLColors(value) {
    return {
      bg: value >= 0 ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 71, 87, 0.8)',
      border: value >= 0 ? '#00ff88' : '#ff4757',
      text: value >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
    };
  }

  /**
   * Initialize function when DOM is ready
   * @param {Function} callback - Function to call when DOM is ready
   */
  function onDOMReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  /**
   * Format date as MM:DD:YYYY
   * @param {string} dateStr - Date in YYYY-MM-DD format
   * @returns {string} - Date in MM:DD:YYYY format
   */
  function formatDateForFilename(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${month}:${day}:${year}`;
  }

  /**
   * Calculate year and week number from date (ISO week)
   * @param {Date} date - Date object
   * @returns {string} - Year and week in format "YYYY.WW"
   */
  function getYearWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const thursdayOfTargetWeek = new Date(target.valueOf());
    const year = thursdayOfTargetWeek.getFullYear();
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
    return `${year}.${String(weekNumber).padStart(2, '0')}`;
  }

  /**
   * Load and parse trades data from trades-index.json
   * Efficiently groups trades by week with calculated statistics
   * @returns {Promise<Array>} Array of week objects with trade data and stats
   */
  async function loadTradesByWeek() {
    try {
      const basePath = getBasePath();
      const response = await fetch(`${basePath}/index.directory/trades-index.json`);
      const data = await response.json();
      const trades = data.trades || [];
      
      // Group trades by week using efficient Map
      const weekMap = new Map();
      
      trades.forEach(trade => {
        // Extract week from file path (e.g., "SFTi.Tradez/week.2025.43/...")
        const weekMatch = trade.file_path?.match(/week\.(\d{4})\.(\d{2})/);
        if (weekMatch) {
          const year = weekMatch[1];
          const week = weekMatch[2];
          const weekKey = `${year}.${week}`;
          
          if (!weekMap.has(weekKey)) {
            weekMap.set(weekKey, {
              year,
              week,
              key: weekKey,
              trades: [],
              totalPnL: 0,
              wins: 0,
              losses: 0
            });
          }
          
          const weekData = weekMap.get(weekKey);
          weekData.trades.push(trade);
          
          const pnl = parseFloat(trade.pnl_usd) || 0;
          weekData.totalPnL += pnl;
          if (pnl > 0) weekData.wins++;
          else if (pnl < 0) weekData.losses++;
        }
      });
      
      // Convert to array and sort by date (most recent first)
      return Array.from(weekMap.values()).sort((a, b) => b.key.localeCompare(a.key));
    } catch (error) {
      console.error('Error loading trades by week:', error);
      return [];
    }
  }

  /**
   * Format currency value with sign
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  function formatCurrency(amount) {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
  }

  /**
   * Calculate win rate percentage
   * @param {number} wins - Number of wins
   * @param {number} total - Total number of trades
   * @returns {string} Win rate as percentage string
   */
  function calculateWinRate(wins, total) {
    if (total === 0) return '0.0';
    return ((wins / total) * 100).toFixed(1);
  }

  // Expose utilities globally
  window.SFTiUtils = {
    getBasePath,
    formatFileSize,
    getBrokerName,
    getPnLColors,
    onDOMReady,
    formatDateForFilename,
    getYearWeekNumber,
    loadTradesByWeek,
    formatCurrency,
    calculateWinRate
  };
})();

