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
    const response = await fetch(dataUrl);
    
    if (!response.ok) {
      throw new Error('Chart data not available');
    }
    
    const data = await response.json();
    
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
    const response = await fetch(dataUrl);
    
    if (!response.ok) {
      throw new Error('Chart data not available');
    }
    
    const data = await response.json();
    
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
  const modals = ['portfolio-modal', 'total-return-modal', 'withdrawal-modal', 'deposit-modal'];
  
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
    }
  });
});
