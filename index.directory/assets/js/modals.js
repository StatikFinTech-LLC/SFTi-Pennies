/**
 * Portfolio and Return Modals
 * Handles modal interactions, charts, and account management
 */

// Current timeframe for each modal
let portfolioTimeframe = 'day';
let returnTimeframe = 'day';

// Chart instances
let portfolioChart = null;
let returnChart = null;

/**
 * Open Portfolio Value Modal
 */
function openPortfolioModal() {
  const modal = document.getElementById('portfolio-modal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  
  // Update display values
  updatePortfolioModalDisplay();
  
  // Load chart
  loadPortfolioChart(portfolioTimeframe);
}

/**
 * Close Portfolio Value Modal
 */
function closePortfolioModal() {
  const modal = document.getElementById('portfolio-modal');
  if (!modal) return;
  
  modal.style.display = 'none';
  
  // Destroy chart to free memory
  if (portfolioChart) {
    portfolioChart.destroy();
    portfolioChart = null;
  }
}

/**
 * Open Total Return Modal
 */
function openTotalReturnModal() {
  const modal = document.getElementById('total-return-modal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  
  // Update display values
  updateReturnModalDisplay();
  
  // Load chart
  loadReturnChart(returnTimeframe);
}

/**
 * Close Total Return Modal
 */
function closeTotalReturnModal() {
  const modal = document.getElementById('total-return-modal');
  if (!modal) return;
  
  modal.style.display = 'none';
  
  // Destroy chart to free memory
  if (returnChart) {
    returnChart.destroy();
    returnChart = null;
  }
}

/**
 * Update Portfolio Modal Display Values
 */
function updatePortfolioModalDisplay() {
  if (!window.accountManager || !window.accountManager.config) return;
  
  const balanceDisplay = document.getElementById('modal-balance-display');
  const withdrawalsDisplay = document.getElementById('total-withdrawals');
  
  if (balanceDisplay) {
    const balance = window.accountManager.config.starting_balance || 0;
    balanceDisplay.textContent = `$${window.accountManager.formatCurrency(balance)}`;
  }
  
  if (withdrawalsDisplay) {
    const withdrawals = getTotalWithdrawals();
    withdrawalsDisplay.textContent = `$${window.accountManager.formatCurrency(withdrawals)}`;
  }
}

/**
 * Update Return Modal Display Values
 */
function updateReturnModalDisplay() {
  if (!window.accountManager || !window.accountManager.config) return;
  
  const depositsDisplay = document.getElementById('modal-total-deposits');
  
  if (depositsDisplay) {
    const deposits = window.accountManager.getTotalDeposits();
    depositsDisplay.textContent = `$${window.accountManager.formatCurrency(deposits)}`;
  }
}

/**
 * Get total withdrawals from account config
 */
function getTotalWithdrawals() {
  if (!window.accountManager || !window.accountManager.config || !window.accountManager.config.withdrawals) {
    return 0;
  }
  return window.accountManager.config.withdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);
}

/**
 * Switch Portfolio Timeframe
 */
function switchPortfolioTimeframe(timeframe) {
  portfolioTimeframe = timeframe;
  
  // Update button states
  document.querySelectorAll('#portfolio-modal .timeframe-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`#portfolio-modal .timeframe-btn[data-timeframe="${timeframe}"]`)?.classList.add('active');
  
  // Reload chart
  loadPortfolioChart(timeframe);
}

/**
 * Switch Return Timeframe
 */
function switchReturnTimeframe(timeframe) {
  returnTimeframe = timeframe;
  
  // Update button states
  document.querySelectorAll('#total-return-modal .timeframe-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`#total-return-modal .timeframe-btn[data-timeframe="${timeframe}"]`)?.classList.add('active');
  
  // Reload chart
  loadReturnChart(timeframe);
}

/**
 * Helper function to log chart data consistently
 * @param {string} chartType - Type of chart (e.g., 'Portfolio Chart', 'Total Return Chart')
 * @param {string} timeframe - Timeframe of the data
 * @param {Object} data - Chart data object
 */
function logChartData(chartType, timeframe, data) {
  const dataset = data.datasets[0];
  console.log(`[${chartType}] ${timeframe} data:`, {
    labels: data.labels,
    dataPoints: dataset.data.length,
    firstValue: dataset.data[0],
    lastValue: dataset.data[dataset.data.length - 1]
  });
}

/**
 * Load Portfolio Chart
 */
async function loadPortfolioChart(timeframe) {
  const ctx = document.getElementById('portfolio-chart');
  if (!ctx) return;
  
  // Destroy existing chart
  if (portfolioChart) {
    portfolioChart.destroy();
    portfolioChart = null;
  }
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    
    // Load chart data based on timeframe
    const dataUrl = `${basePath}/index.directory/assets/charts/portfolio-value-${timeframe}.json`;
    console.log(`[Portfolio Chart] Loading ${timeframe} timeframe from ${dataUrl}`);
    const response = await fetch(dataUrl);
    
    if (!response.ok) {
      throw new Error('Chart data not available');
    }
    
    const data = await response.json();
    logChartData('Portfolio Chart', timeframe, data);
    
    // Create chart
    portfolioChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: getPortfolioChartOptions()
    });
    
  } catch (error) {
    console.log('Portfolio chart data not available:', error);
    renderEmptyPortfolioChart(ctx, timeframe);
  }
}

/**
 * Load Return Chart
 */
async function loadReturnChart(timeframe) {
  const ctx = document.getElementById('return-chart');
  if (!ctx) return;
  
  // Destroy existing chart
  if (returnChart) {
    returnChart.destroy();
    returnChart = null;
  }
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    
    // Load chart data based on timeframe
    const dataUrl = `${basePath}/index.directory/assets/charts/total-return-${timeframe}.json`;
    console.log(`[Total Return Chart] Loading ${timeframe} timeframe from ${dataUrl}`);
    const response = await fetch(dataUrl);
    
    if (!response.ok) {
      throw new Error('Chart data not available');
    }
    
    const data = await response.json();
    logChartData('Total Return Chart', timeframe, data);
    
    // Create chart
    returnChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: getReturnChartOptions()
    });
    
  } catch (error) {
    console.log('Return chart data not available:', error);
    renderEmptyReturnChart(ctx, timeframe);
  }
}

/**
 * Get Portfolio Chart Options
 */
function getPortfolioChartOptions() {
  const baseOptions = window.SFTiChartConfig?.getCommonChartOptions() ?? getDefaultChartOptions();
  
  return {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: {
        display: false
      },
      tooltip: {
        ...baseOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            return `Portfolio Value: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    }
  };
}

/**
 * Get Return Chart Options
 */
function getReturnChartOptions() {
  const baseOptions = window.SFTiChartConfig?.getCommonChartOptions() ?? getDefaultChartOptions();
  
  return {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: {
        display: false
      },
      tooltip: {
        ...baseOptions.plugins.tooltip,
        borderColor: '#00d4ff',
        callbacks: {
          label: function(context) {
            return `Total Return: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales.y,
        ticks: {
          ...baseOptions.scales.y.ticks,
          callback: function(value) {
            return `${value.toFixed(0)}%`;
          }
        }
      }
    }
  };
}

/**
 * Default Chart Options (fallback)
 */
function getDefaultChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#e4e4e7',
          font: {
            family: 'JetBrains Mono',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#0a0e27',
        titleColor: '#e4e4e7',
        bodyColor: '#e4e4e7',
        borderColor: '#00ff88',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(161, 161, 170, 0.2)'
        },
        ticks: {
          color: '#e4e4e7',
          font: {
            family: 'JetBrains Mono'
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(161, 161, 170, 0.2)'
        },
        ticks: {
          color: '#e4e4e7',
          font: {
            family: 'JetBrains Mono'
          }
        }
      }
    }
  };
}

/**
 * Render Empty Portfolio Chart
 */
function renderEmptyPortfolioChart(ctx, timeframe) {
  const message = `No portfolio data available for ${timeframe}. Add trades to see your portfolio value over time.`;
  
  if (typeof Chart === 'undefined') {
    console.error('Chart.js not loaded');
    return;
  }
  
  const chartOptions = getPortfolioChartOptions();
  
  portfolioChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Portfolio Value',
        data: [],
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)'
      }]
    },
    options: {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        title: {
          display: true,
          text: message,
          color: '#a1a1aa',
          font: {
            family: 'Inter',
            size: 14
          }
        }
      }
    }
  });
}

/**
 * Render Empty Return Chart
 */
function renderEmptyReturnChart(ctx, timeframe) {
  const message = `No return data available for ${timeframe}. Add trades to see your total return over time.`;
  
  if (typeof Chart === 'undefined') {
    console.error('Chart.js not loaded');
    return;
  }
  
  const chartOptions = getReturnChartOptions();
  
  returnChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Total Return %',
        data: [],
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.1)'
      }]
    },
    options: {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        title: {
          display: true,
          text: message,
          color: '#a1a1aa',
          font: {
            family: 'Inter',
            size: 14
          }
        }
      }
    }
  });
}

/**
 * Edit Balance in Modal
 */
function editModalBalance() {
  const display = document.getElementById('modal-balance-display');
  const input = document.getElementById('modal-balance-input');
  
  if (!display || !input || !window.accountManager) return;
  
  const currentValue = window.accountManager.config.starting_balance;
  
  display.style.display = 'none';
  input.style.display = 'block';
  input.value = currentValue;
  input.focus();
  input.select();
}

/**
 * Save Balance from Modal
 */
function saveModalBalance() {
  const display = document.getElementById('modal-balance-display');
  const input = document.getElementById('modal-balance-input');
  
  if (!display || !input || !window.accountManager) return;
  
  const newValue = parseFloat(input.value);
  if (isNaN(newValue) || newValue < 0) {
    alert('Please enter a valid positive number');
    input.focus();
    return;
  }
  
  window.accountManager.updateStartingBalance(newValue);
  
  input.style.display = 'none';
  display.style.display = 'inline';
  display.textContent = `$${window.accountManager.formatCurrency(newValue)}`;
}

/**
 * Show Withdrawal Modal
 */
function showWithdrawalModal() {
  const modal = document.getElementById('withdrawal-modal');
  if (!modal) return;
  
  // Set default date to today
  const dateInput = document.getElementById('withdrawal-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  
  modal.style.display = 'flex';
}

/**
 * Close Withdrawal Modal
 */
function closeWithdrawalModal() {
  const modal = document.getElementById('withdrawal-modal');
  if (!modal) return;
  
  modal.style.display = 'none';
  
  // Clear form
  const form = document.getElementById('withdrawal-form');
  if (form) {
    form.reset();
  }
}

/**
 * Add Withdrawal
 */
function addWithdrawal(event) {
  event.preventDefault();
  
  const amount = document.getElementById('withdrawal-amount').value;
  const date = document.getElementById('withdrawal-date').value;
  const note = document.getElementById('withdrawal-note').value;
  
  if (!amount || !date || !window.accountManager) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Add withdrawal to config
  if (!window.accountManager.config.withdrawals) {
    window.accountManager.config.withdrawals = [];
  }
  
  window.accountManager.config.withdrawals.push({
    amount: parseFloat(amount),
    date: date,
    note: note,
    timestamp: new Date().toISOString()
  });
  
  // Sort withdrawals by date
  window.accountManager.config.withdrawals.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Save config
  window.accountManager.saveConfig(false);
  
  // Update display
  updatePortfolioModalDisplay();
  
  // Close modal
  closeWithdrawalModal();
  
  // Emit event
  if (window.SFTiEventBus) {
    window.SFTiEventBus.emit('account:withdrawal-added', {
      amount: parseFloat(amount),
      date: date,
      total_withdrawals: getTotalWithdrawals()
    });
  }
  
  // Show notification
  showNotification('Withdrawal Added', `Withdrawal of $${parseFloat(amount).toFixed(2)} recorded successfully!`, 'success');
}

/**
 * Show Deposit Modal from Return Modal
 */
function showDepositModalFromReturn() {
  // Close the return modal first
  closeTotalReturnModal();
  
  // Open deposit modal
  showDepositModal();
}

/**
 * Show Deposit Modal (keep existing function for backward compatibility)
 */
function showDepositModal() {
  const modal = document.getElementById('deposit-modal');
  if (!modal) return;
  
  // Set default date to today
  const dateInput = document.getElementById('deposit-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  
  modal.style.display = 'flex';
}

/**
 * Close Deposit Modal
 */
function closeDepositModal() {
  const modal = document.getElementById('deposit-modal');
  if (!modal) return;
  
  modal.style.display = 'none';
  
  // Clear form
  const form = document.getElementById('deposit-form');
  if (form) {
    form.reset();
  }
}

/**
 * Add Deposit (updated to work with modal)
 */
function addDeposit(event) {
  event.preventDefault();
  
  const amount = document.getElementById('deposit-amount').value;
  const date = document.getElementById('deposit-date').value;
  const note = document.getElementById('deposit-note').value;
  
  if (!amount || !date || !window.accountManager) {
    alert('Please fill in all required fields');
    return;
  }
  
  window.accountManager.addDeposit(amount, date, note);
  
  // Update modal display if return modal is open
  updateReturnModalDisplay();
  
  closeDepositModal();
  
  // Show notification
  showNotification('Deposit Added', `Deposit of $${parseFloat(amount).toFixed(2)} added successfully!`, 'success');
}

/**
 * Show Notification
 */
function showNotification(title, message, type = 'info') {
  // Use accountManager's notification if available
  if (window.accountManager && window.accountManager.showNotification) {
    window.accountManager.showNotification(title, message, type);
    return;
  }
  
  // Fallback notification
  const colors = {
    success: '#00ff88',
    warning: '#ffd93d',
    error: '#ff4757',
    info: '#00d4ff'
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
  notification.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 0.25rem;">${title}</div>
    <div style="font-size: 0.875rem; font-weight: 400;">${message}</div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Close modals on background click
document.addEventListener('DOMContentLoaded', () => {
  const modals = ['portfolio-modal', 'total-return-modal', 'withdrawal-modal', 'deposit-modal', 'customize-modal'];
  
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          // Close the specific modal
          if (modalId === 'portfolio-modal') closePortfolioModal();
          else if (modalId === 'total-return-modal') closeTotalReturnModal();
          else if (modalId === 'withdrawal-modal') closeWithdrawalModal();
          else if (modalId === 'deposit-modal') closeDepositModal();
          else if (modalId === 'customize-modal') closeCustomizeModal();
        }
      });
    }
  });
  
  // Close modals on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePortfolioModal();
      closeTotalReturnModal();
      closeWithdrawalModal();
      closeDepositModal();
      closeCustomizeModal();
      closeTradePnLModal();
      closeAvgPnLModal();
    }
  });
  
  // Add click event listeners for clickable stat cards
  const tradePnLCard = document.getElementById('trade-pnl-card');
  if (tradePnLCard) {
    tradePnLCard.addEventListener('click', openTradePnLModal);
  }
  
  const avgPnLCard = document.getElementById('avg-pnl-card');
  if (avgPnLCard) {
    avgPnLCard.addEventListener('click', openAvgPnLModal);
  }
  
  // Add event listeners for customization category cards
  const handleCategorySelection = (category) => {
    // Navigate to customization.html with category and page parameters
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const encodedCategory = encodeURIComponent(category);
    
    // Get current page name to pass to customization page
    const currentPage = window.SFTiUtils ? SFTiUtils.getCurrentPageName() : 'index';
    const pageParam = `&page=${encodeURIComponent(currentPage)}`;
    
    window.location.href = `${basePath}/index.directory/customization.html?category=${encodedCategory}${pageParam}`;
  };
  
  const setupCategoryCard = (card) => {
    const category = card.dataset.category;
    
    // Click handler
    card.addEventListener('click', () => handleCategorySelection(category));
    
    // Keyboard handler for accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCategorySelection(category);
      }
    });
  };
  
  // Setup all category cards
  document.querySelectorAll('.customize-category-card').forEach(setupCategoryCard);
  
  // Setup layout toggle for category cards
  const layoutToggleBtn = document.getElementById('category-layout-toggle');
  if (layoutToggleBtn) {
    layoutToggleBtn.addEventListener('click', toggleCategoryLayout);
  }
  
  // Initialize layout from localStorage if the customize categories container is present
  const customizeCategoriesContainer = document.querySelector('.customize-categories-container');
  if (customizeCategoriesContainer) {
    initializeCategoryLayout();
  }
});

// ======================================================================
// Trade P&L Modal Functions (Monthly Returns Heatmap)
// ======================================================================

/**
 * Open Trade P&L Modal with Monthly Returns Heatmap
 */
function openTradePnLModal() {
  const modal = document.getElementById('trade-pnl-modal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  
  // Generate and display the heatmap
  generateMonthlyReturnsHeatmap();
}

/**
 * Close Trade P&L Modal
 */
function closeTradePnLModal() {
  const modal = document.getElementById('trade-pnl-modal');
  if (!modal) return;
  
  modal.style.display = 'none';
}

/**
 * Generate Monthly Returns Heatmap
 */
async function generateMonthlyReturnsHeatmap() {
  const container = document.getElementById('monthly-returns-heatmap');
  if (!container) return;
  
  try {
    // Load trades data
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/trades-index.json`);
    
    if (!response.ok) {
      throw new Error('Trades data not available');
    }
    
    const data = await response.json();
    const trades = data.trades || [];
    
    if (trades.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No trades available yet. Add trades to see your monthly returns.</p>';
      return;
    }
    
    // Calculate monthly returns
    const monthlyReturns = {};
    
    trades.forEach(trade => {
      const exitDate = trade.exit_date || trade.entry_date;
      if (!exitDate) return;
      
      try {
        const date = new Date(exitDate);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11
        
        const key = `${year}-${month}`;
        
        if (!monthlyReturns[key]) {
          monthlyReturns[key] = {
            year: year,
            month: month,
            pnl: 0,
            trades: 0
          };
        }
        
        monthlyReturns[key].pnl += trade.pnl_usd || 0;
        monthlyReturns[key].trades += 1;
      } catch (e) {
        console.warn('Failed to parse trade date:', exitDate);
      }
    });
    
    // Convert to array and get account starting balance for percentage calculation
    const accountConfig = await loadAccountConfig();
    const startingBalance = accountConfig.starting_balance || 1000;
    
    // Convert to percentages and organize by year and month
    const returnsArray = Object.values(monthlyReturns).map(item => ({
      ...item,
      returnPct: (item.pnl / startingBalance) * 100
    }));
    
    // Get unique years
    const years = [...new Set(returnsArray.map(item => item.year))].sort();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate heatmap HTML
    let html = '<table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.875rem;">';
    html += '<thead><tr style="background-color: var(--bg-tertiary);">';
    html += '<th style="padding: 0.75rem; text-align: left; color: var(--text-secondary);">Year</th>';
    months.forEach(month => {
      html += `<th style="padding: 0.75rem; text-align: center; color: var(--text-secondary);">${month}</th>`;
    });
    html += '<th style="padding: 0.75rem; text-align: center; color: var(--text-secondary); font-weight: 700;">YTD</th>';
    html += '</tr></thead><tbody>';
    
    // Calculate stats
    let bestMonth = { value: -Infinity, label: '' };
    let worstMonth = { value: Infinity, label: '' };
    let totalReturn = 0;
    let monthCount = 0;
    let positiveMonthCount = 0;
    
    years.forEach(year => {
      html += '<tr>';
      html += `<td style="padding: 0.75rem; font-weight: 700; color: var(--text-primary);">${year}</td>`;
      
      let ytd = 0;
      
      months.forEach((monthName, monthIndex) => {
        const key = `${year}-${monthIndex}`;
        const monthData = monthlyReturns[key];
        
        if (monthData) {
          const returnPct = (monthData.pnl / startingBalance) * 100;
          ytd += returnPct;
          totalReturn += returnPct;
          monthCount++;
          
          if (returnPct > 0) positiveMonthCount++;
          
          if (returnPct > bestMonth.value) {
            bestMonth = { value: returnPct, label: `${monthName} ${year}` };
          }
          if (returnPct < worstMonth.value) {
            worstMonth = { value: returnPct, label: `${monthName} ${year}` };
          }
          
          const color = returnPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
          const bgOpacity = Math.min(Math.abs(returnPct) / 10, 0.5);
          const bgColor = returnPct >= 0 ? `rgba(0, 255, 136, ${bgOpacity})` : `rgba(255, 71, 87, ${bgOpacity})`;
          
          html += `<td style="padding: 0.75rem; text-align: center; background: ${bgColor}; color: ${color}; font-weight: 600;" title="${monthData.trades} trades">${returnPct.toFixed(1)}%</td>`;
        } else {
          html += '<td style="padding: 0.75rem; text-align: center; color: var(--text-secondary);">-</td>';
        }
      });
      
      const ytdColor = ytd >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
      html += `<td style="padding: 0.75rem; text-align: center; font-weight: 700; color: ${ytdColor};">${ytd.toFixed(1)}%</td>`;
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    container.innerHTML = html;
    
    // Update summary stats
    document.getElementById('best-month').textContent = bestMonth.value === -Infinity ? 'N/A' : `+${bestMonth.value.toFixed(1)}% (${bestMonth.label})`;
    document.getElementById('worst-month').textContent = worstMonth.value === Infinity ? 'N/A' : `${worstMonth.value.toFixed(1)}% (${worstMonth.label})`;
    document.getElementById('avg-monthly-return').textContent = monthCount > 0 ? `${(totalReturn / monthCount).toFixed(1)}%` : '0%';
    document.getElementById('positive-months').textContent = `${positiveMonthCount}/${monthCount}`;
    
  } catch (error) {
    console.error('Error generating monthly returns heatmap:', error);
    container.innerHTML = '<p style="text-align: center; color: var(--accent-red); padding: 2rem;">Error loading monthly returns data.</p>';
  }
}

/**
 * Helper to load account config
 */
async function loadAccountConfig() {
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/account-config.json`);
    
    if (!response.ok) {
      return { starting_balance: 1000 };
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Could not load account config:', error);
    return { starting_balance: 1000 };
  }
}

// ======================================================================
// Average P&L Modal Functions (Avg Win $ / Avg Loss $)
// ======================================================================

/**
 * Open Average P&L Modal
 */
function openAvgPnLModal() {
  const modal = document.getElementById('avg-pnl-modal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  
  // Load and display the data
  loadAvgWinLossData();
}

/**
 * Close Average P&L Modal
 */
function closeAvgPnLModal() {
  const modal = document.getElementById('avg-pnl-modal');
  if (!modal) return;
  
  modal.style.display = 'none';
}

/**
 * Load Average Win/Loss Data
 */
async function loadAvgWinLossData() {
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/trades-index.json`);
    
    if (!response.ok) {
      throw new Error('Trades data not available');
    }
    
    const data = await response.json();
    const stats = data.statistics || {};
    
    // Get win/loss averages
    const avgWin = stats.avg_winner || 0;
    const avgLoss = Math.abs(stats.avg_loser || 0);
    const winCount = stats.winning_trades || 0;
    const lossCount = stats.losing_trades || 0;
    
    // Calculate win/loss ratio
    const winLossRatio = avgLoss > 0 ? (avgWin / avgLoss) : 0;
    
    // Update modal displays
    document.getElementById('modal-avg-win').textContent = `$${avgWin.toFixed(2)}`;
    document.getElementById('modal-avg-loss').textContent = `$${avgLoss.toFixed(2)}`;
    document.getElementById('modal-win-count').textContent = winCount;
    document.getElementById('modal-loss-count').textContent = lossCount;
    document.getElementById('modal-win-loss-ratio').textContent = winLossRatio.toFixed(2);
    document.getElementById('modal-win-loss-ratio-text').textContent = `${winLossRatio.toFixed(2)}x`;
    
  } catch (error) {
    console.error('Error loading avg win/loss data:', error);
  }
}

// ======================================================================
// Customize Modal Functions
// ======================================================================

/**
 * Open Customize Modal
 */
function openCustomizeModal() {
  const modal = document.getElementById('customize-modal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  
  // Reset to category selection view
  hideCustomizationContent();
}

/**
 * Close Customize Modal
 */
function closeCustomizeModal() {
  const modal = document.getElementById('customize-modal');
  if (!modal) return;
  
  modal.style.display = 'none';
  
  // Reset content area
  hideCustomizationContent();
}

/**
 * Hide customization content area and show category cards
 */
function hideCustomizationContent() {
  const contentArea = document.getElementById('customize-content');
  const actionsArea = document.getElementById('customize-actions');
  
  if (contentArea) contentArea.style.display = 'none';
  if (actionsArea) actionsArea.style.display = 'none';
}

/**
 * Show customization content area
 */
function showCustomizationContent() {
  const contentArea = document.getElementById('customize-content');
  const actionsArea = document.getElementById('customize-actions');
  
  if (contentArea) contentArea.style.display = 'block';
  if (actionsArea) actionsArea.style.display = 'flex';
}

/**
 * Show Color Customization
 */
function showColorCustomization() {
  const contentArea = document.getElementById('customize-content');
  if (!contentArea || !window.accountManager) return;
  
  const customization = window.accountManager.getCustomization('theme') || {};
  
  contentArea.innerHTML = `
    <h4 style="margin: 0 0 1rem 0; color: var(--accent-green);">Color Customization</h4>
    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.875rem;">
      Customize the primary accent colors used throughout your journal.
    </p>
    
    <div style="display: grid; gap: 1rem;">
      <div>
        <label for="custom-primary-color" style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">
          Primary Color (Accent Green)
        </label>
        <input type="color" id="custom-primary-color" value="${customization.primaryColor || '#00ff88'}" 
               aria-label="Primary color (Accent Green) picker"
               style="width: 100%; height: 50px; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; background: var(--bg-secondary);">
      </div>
      
      <div>
        <label for="custom-accent-color" style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">
          Accent Color (Yellow)
        </label>
        <input type="color" id="custom-accent-color" value="${customization.accentColor || '#ffd93d'}" 
               aria-label="Accent color (Yellow) picker"
               style="width: 100%; height: 50px; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; background: var(--bg-secondary);">
      </div>
    </div>
  `;
  
  showCustomizationContent();
}

/**
 * Show Theme Customization
 */
function showThemeCustomization() {
  const contentArea = document.getElementById('customize-content');
  if (!contentArea) return;
  
  contentArea.innerHTML = `
    <h4 style="margin: 0 0 1rem 0; color: var(--accent-green);">Theme Customization</h4>
    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.875rem;">
      Theme options coming soon. Stay tuned for light/dark mode toggles and glass effect controls.
    </p>
  `;
  
  showCustomizationContent();
}

/**
 * Show Preferences Customization
 */
function showPreferencesCustomization() {
  const contentArea = document.getElementById('customize-content');
  if (!contentArea || !window.accountManager) return;
  
  const preferences = window.accountManager.getCustomization('preferences') || {};
  
  contentArea.innerHTML = `
    <h4 style="margin: 0 0 1rem 0; color: var(--accent-green);">Preferences</h4>
    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.875rem;">
      Customize date format, currency symbol, and timezone settings.
    </p>
    
    <div style="display: grid; gap: 1rem;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">
          Date Format
        </label>
        <select id="custom-date-format" style="width: 100%; padding: 0.75rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono);">
          <option value="MM/DD/YYYY" ${preferences.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY (US)</option>
          <option value="DD/MM/YYYY" ${preferences.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY (European)</option>
          <option value="YYYY-MM-DD" ${preferences.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD (ISO)</option>
        </select>
      </div>
      
      <div>
        <label for="custom-currency-symbol" style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">
          Currency Symbol
        </label>
        <input type="text" id="custom-currency-symbol" maxlength="3" value="${preferences.currencySymbol || '$'}" 
               pattern="^([A-Z]{3}|[€£¥₹$¢])$" 
               title="Enter a 3-letter currency code (e.g., USD, EUR, GBP) or a symbol like $, €, £, ¥, ₹, ¢"
               style="width: 100%; padding: 0.75rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono);" 
               placeholder="$"
               oninput="if(/^[A-Za-z]+$/.test(this.value)) this.value = this.value.toUpperCase().slice(0, 3)">
      </div>
      
      <div>
        <label for="custom-timezone" style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">
          Timezone
        </label>
        <select id="custom-timezone"
                style="width: 100%; padding: 0.75rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono);">
          <option value="America/New_York" ${(!preferences.timezone || preferences.timezone === 'America/New_York') ? 'selected' : ''}>America/New_York (Eastern)</option>
          <option value="America/Chicago" ${preferences.timezone === 'America/Chicago' ? 'selected' : ''}>America/Chicago (Central)</option>
          <option value="America/Denver" ${preferences.timezone === 'America/Denver' ? 'selected' : ''}>America/Denver (Mountain)</option>
          <option value="America/Los_Angeles" ${preferences.timezone === 'America/Los_Angeles' ? 'selected' : ''}>America/Los_Angeles (Pacific)</option>
          <option value="Europe/London" ${preferences.timezone === 'Europe/London' ? 'selected' : ''}>Europe/London</option>
          <option value="Europe/Berlin" ${preferences.timezone === 'Europe/Berlin' ? 'selected' : ''}>Europe/Berlin</option>
          <option value="Europe/Paris" ${preferences.timezone === 'Europe/Paris' ? 'selected' : ''}>Europe/Paris</option>
          <option value="Asia/Tokyo" ${preferences.timezone === 'Asia/Tokyo' ? 'selected' : ''}>Asia/Tokyo</option>
          <option value="Asia/Shanghai" ${preferences.timezone === 'Asia/Shanghai' ? 'selected' : ''}>Asia/Shanghai</option>
          <option value="Asia/Hong_Kong" ${preferences.timezone === 'Asia/Hong_Kong' ? 'selected' : ''}>Asia/Hong_Kong</option>
          <option value="Asia/Singapore" ${preferences.timezone === 'Asia/Singapore' ? 'selected' : ''}>Asia/Singapore</option>
          <option value="Asia/Kolkata" ${preferences.timezone === 'Asia/Kolkata' ? 'selected' : ''}>Asia/Kolkata</option>
          <option value="Australia/Sydney" ${preferences.timezone === 'Australia/Sydney' ? 'selected' : ''}>Australia/Sydney</option>
          <option value="UTC" ${preferences.timezone === 'UTC' ? 'selected' : ''}>UTC</option>
        </select>
      </div>
    </div>
  `;
  
  showCustomizationContent();
}

/**
 * Apply customization changes for the currently visible customization view.
 *
 * This function inspects the presence of specific input elements in the
 * customization modal to infer which type(s) of customization are active:
 * - If both `#custom-primary-color` and `#custom-accent-color` are present,
 *   it treats the view as theme customization and updates
 *   `theme.primaryColor` and `theme.accentColor`.
 * - If any of `#custom-date-format`, `#custom-currency-symbol`, or
 *   `#custom-timezone` are present, it treats the view as preferences
 *   customization and updates the corresponding `preferences.*` keys.
 *
 * All updates are performed through `window.accountManager.setCustomization`.
 * A cumulative `success` flag tracks whether every attempted update
 * succeeds. On overall success, a success notification is shown and the
 * customize modal is closed; on failure, an error notification is shown.
 * If `window.accountManager` is not available, an error notification is
 * shown and no changes are attempted.
 *
 * @returns {void} This function does not return a value; it performs side
 *   effects by updating account customizations and showing notifications.
 */
function applyCustomization() {
  if (!window.accountManager) {
    showNotification('Error', 'Account manager not available', 'error');
    return;
  }
  
  // Determine which customization is active and apply changes
  const primaryColorInput = document.getElementById('custom-primary-color');
  const accentColorInput = document.getElementById('custom-accent-color');
  const dateFormatInput = document.getElementById('custom-date-format');
  const currencySymbolInput = document.getElementById('custom-currency-symbol');
  const timezoneInput = document.getElementById('custom-timezone');
  
  let success = true;
  const invalidFields = [];
  
  // Apply color customizations
  if (primaryColorInput && accentColorInput) {
    const resultPrimary = window.accountManager.setCustomization('theme.primaryColor', primaryColorInput.value);
    const resultAccent = window.accountManager.setCustomization('theme.accentColor', accentColorInput.value);
    
    if (!resultPrimary) {
      invalidFields.push('Primary color');
    }
    if (!resultAccent) {
      invalidFields.push('Accent color');
    }
    
    success = resultPrimary && resultAccent && success;
  }
  
  // Apply preference customizations
  if (dateFormatInput) {
    const resultDateFormat = window.accountManager.setCustomization('preferences.dateFormat', dateFormatInput.value);
    if (!resultDateFormat) {
      invalidFields.push('Date format');
    }
    success = resultDateFormat && success;
  }
  if (currencySymbolInput) {
    const resultCurrencySymbol = window.accountManager.setCustomization('preferences.currencySymbol', currencySymbolInput.value);
    if (!resultCurrencySymbol) {
      invalidFields.push('Currency symbol');
    }
    success = resultCurrencySymbol && success;
  }
  if (timezoneInput) {
    const resultTimezone = window.accountManager.setCustomization('preferences.timezone', timezoneInput.value);
    if (!resultTimezone) {
      invalidFields.push('Timezone');
    }
    success = resultTimezone && success;
  }
  
  if (success) {
    showNotification('Customization Applied', 'Your changes have been saved successfully!', 'success');
    closeCustomizeModal();
  } else {
    let message = 'Some customization values are invalid. Please check your inputs.';
    if (invalidFields.length > 0) {
      message = 'The following customization fields are invalid: ' + invalidFields.join(', ') + '. Please review these values.';
    }
    showNotification('Validation Error', message, 'error');
  }
}

/**
 * Cancel Customization Changes
 */
function cancelCustomization() {
  closeCustomizeModal();
}

/**
 * Toggle Category Layout between grid and list view
 */
function toggleCategoryLayout() {
  const container = document.querySelector('.customize-categories-container');
  if (!container) return;
  
  const currentLayout = container.dataset.layout || 'grid';
  const newLayout = currentLayout === 'grid' ? 'list' : 'grid';
  
  container.dataset.layout = newLayout;
  
  // Save to localStorage
  try {
    localStorage.setItem('customize-category-layout', newLayout);
  } catch (e) {
    console.warn('Could not save layout preference:', e);
  }
  
  // Update toggle button icon
  updateLayoutToggleButton(newLayout);
}

/**
 * Initialize Category Layout from localStorage
 */
function initializeCategoryLayout() {
  const container = document.querySelector('.customize-categories-container');
  if (!container) return;
  
  try {
    const savedLayout = localStorage.getItem('customize-category-layout') || 'grid';
    container.dataset.layout = savedLayout;
    updateLayoutToggleButton(savedLayout);
  } catch (e) {
    console.warn('Could not load layout preference:', e);
    container.dataset.layout = 'grid';
  }
}

/**
 * Update Layout Toggle Button Icon
 */
function updateLayoutToggleButton(layout) {
  const toggleBtn = document.getElementById('category-layout-toggle');
  if (!toggleBtn) return;
  
  if (layout === 'grid') {
    toggleBtn.innerHTML = `
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
      </svg>
    `;
    toggleBtn.title = 'Switch to List View';
  } else {
    toggleBtn.innerHTML = `
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
      </svg>
    `;
    toggleBtn.title = 'Switch to Grid View';
  }
}

/**
 * Reset Customization to Defaults
 */
function resetCustomization() {
  if (!window.accountManager) return;

  if (!confirm('Are you sure you want to reset all customizations to default values?')) {
    return;
  }

  // Get default customization from accountManager instead of hardcoding
  const defaultCustomization = window.accountManager._getDefaultCustomization();

  let success = true;

  // Apply theme defaults
  if (defaultCustomization && defaultCustomization.theme) {
    if (typeof defaultCustomization.theme.primaryColor !== 'undefined') {
      success = window.accountManager.setCustomization('theme.primaryColor', defaultCustomization.theme.primaryColor) && success;
    }
    if (typeof defaultCustomization.theme.accentColor !== 'undefined') {
      success = window.accountManager.setCustomization('theme.accentColor', defaultCustomization.theme.accentColor) && success;
    }
  }

  // Apply preference defaults
  if (defaultCustomization && defaultCustomization.preferences) {
    if (typeof defaultCustomization.preferences.dateFormat !== 'undefined') {
      success = window.accountManager.setCustomization('preferences.dateFormat', defaultCustomization.preferences.dateFormat) && success;
    }
    if (typeof defaultCustomization.preferences.currencySymbol !== 'undefined') {
      success = window.accountManager.setCustomization('preferences.currencySymbol', defaultCustomization.preferences.currencySymbol) && success;
    }
    if (typeof defaultCustomization.preferences.timezone !== 'undefined') {
      success = window.accountManager.setCustomization('preferences.timezone', defaultCustomization.preferences.timezone) && success;
    }
  }
  if (success) {
    showNotification('Reset Complete', 'Customizations have been reset to default values.', 'success');
    closeCustomizeModal();
  } else {
    showNotification('Reset Failed', 'Failed to reset customizations.', 'error');
  }
}
