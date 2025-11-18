/**
 * Charts JavaScript - Main Homepage Charts
 * Handles all chart types: equity curve, trade distribution, performance by day, ticker performance
 */

// Use utilities from global SFTiUtils and SFTiChartConfig
const basePath = SFTiUtils.getBasePath();

// Chart instances
let equityCurveChart = null;
let winLossRatioByStrategyChart = null;
let performanceByDayChart = null;
let tickerPerformanceChart = null;
let timeOfDayChart = null;
let strategyChart = null;
let setupChart = null;
let winrateChart = null;
let drawdownChart = null;
let rMultipleChart = null;

// Chart options are now imported from chartConfig.js

/**
 * Load and render equity curve chart
 */
async function loadEquityCurveChart() {
  const ctx = document.getElementById('equity-curve-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/equity-curve-data.json`);
    const data = await response.json();
    
    if (equityCurveChart) {
      equityCurveChart.destroy();
    }

    equityCurveChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Equity curve data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No equity curve data available yet. Add trades to see your equity curve.');
  }
}

/**
 * Load and render win/loss ratio by strategy chart
 */
async function loadWinLossRatioByStrategyChart() {
  const ctx = document.getElementById('win-loss-ratio-by-strategy-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/win-loss-ratio-by-strategy-data.json`);
    const data = await response.json();
    
    if (winLossRatioByStrategyChart) {
      winLossRatioByStrategyChart.destroy();
    }

    winLossRatioByStrategyChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        ...SFTiChartConfig.getBarChartOptions(),
        plugins: {
          ...SFTiChartConfig.getBarChartOptions().plugins,
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#e4e4e7',
              font: {
                family: 'Inter',
                size: 12
              },
              usePointStyle: true,
              padding: 15
            }
          }
        },
        scales: {
          ...SFTiChartConfig.getBarChartOptions().scales,
          x: {
            ...SFTiChartConfig.getBarChartOptions().scales.x,
            stacked: true
          },
          y: {
            ...SFTiChartConfig.getBarChartOptions().scales.y,
            stacked: true,
            ticks: {
              ...SFTiChartConfig.getBarChartOptions().scales.y.ticks,
              callback: function(value) {
                return value; // Just show the count
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.log('Win/loss ratio by strategy data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No win/loss ratio data available yet. Add trades to see your strategy performance.');
  }
}

/**
 * Load and render performance by day chart
 */
async function loadPerformanceByDayChart() {
  const ctx = document.getElementById('performance-by-day-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/performance-by-day-data.json`);
    const data = await response.json();
    
    if (performanceByDayChart) {
      performanceByDayChart.destroy();
    }

    performanceByDayChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: SFTiChartConfig.getBarChartOptions()
    });
  } catch (error) {
    console.log('Performance by day data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No performance by day data available yet. Add trades to see daily performance.');
  }
}

/**
 * Load and render ticker performance chart
 */
async function loadTickerPerformanceChart() {
  const ctx = document.getElementById('ticker-performance-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/ticker-performance-data.json`);
    const data = await response.json();
    
    if (tickerPerformanceChart) {
      tickerPerformanceChart.destroy();
    }

    const options = SFTiChartConfig.getBarChartOptions();
    
    // Override scales for horizontal bar chart - Y axis shows ticker labels, X axis shows dollar values
    options.scales.y.ticks.callback = function(value, index, values) {
      // For horizontal bar charts, y-axis shows the labels (ticker names), not values
      // Return the value as-is (it's already the ticker label from data.labels)
      return this.getLabelForValue(value);
    };
    
    // X axis should show dollar amounts for horizontal bar chart
    options.scales.x.ticks.callback = function(value) {
      return '$' + value.toFixed(0);
    };
    
    tickerPerformanceChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        ...options,
        indexAxis: 'y'  // Horizontal bar chart for better ticker label display
      }
    });
  } catch (error) {
    console.log('Ticker performance data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No ticker performance data available yet. Add trades to see performance by ticker.');
  }
}

/**
 * Load and render time of day chart
 */
async function loadTimeOfDayChart() {
  const ctx = document.getElementById('time-of-day-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/time-of-day-performance-data.json`);
    const data = await response.json();
    
    if (timeOfDayChart) {
      timeOfDayChart.destroy();
    }

    timeOfDayChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: SFTiChartConfig.getBarChartOptions()
    });
  } catch (error) {
    console.log('Time of day data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No time of day data available yet.');
  }
}

/**
 * Load and render strategy chart
 */
async function loadStrategyChart() {
  const ctx = document.getElementById('strategy-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/analytics-data.json`);
    const data = await response.json();
    
    if (strategyChart) {
      strategyChart.destroy();
    }

    const strategies = data.by_strategy || {};
    const labels = Object.keys(strategies);
    const values = labels.map(s => strategies[s].total_pnl);
    const colors = values.map(v => v >= 0 ? '#00ff88' : '#ff4757');

    strategyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total P&L ($)',
          data: values,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 2
        }]
      },
      options: SFTiChartConfig.getBarChartOptions()
    });
  } catch (error) {
    console.log('Strategy data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No strategy data available yet.');
  }
}

/**
 * Load and render setup chart
 */
async function loadSetupChart() {
  const ctx = document.getElementById('setup-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/analytics-data.json`);
    const data = await response.json();
    
    if (setupChart) {
      setupChart.destroy();
    }

    const setups = data.by_setup || {};
    const labels = Object.keys(setups);
    const values = labels.map(s => setups[s].total_pnl);
    const colors = values.map(v => v >= 0 ? '#00ff88' : '#ff4757');

    setupChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total P&L ($)',
          data: values,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 2
        }]
      },
      options: SFTiChartConfig.getBarChartOptions()
    });
  } catch (error) {
    console.log('Setup data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No setup data available yet.');
  }
}

/**
 * Load and render win rate chart
 */
async function loadWinRateChart() {
  const ctx = document.getElementById('winrate-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/analytics-data.json`);
    const data = await response.json();
    
    if (winrateChart) {
      winrateChart.destroy();
    }

    const strategies = data.by_strategy || {};
    const labels = Object.keys(strategies);
    const winRates = labels.map(s => strategies[s].win_rate || 0);

    winrateChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Win Rate (%)',
          data: winRates,
          backgroundColor: '#00d4ff',
          borderColor: '#00d4ff',
          borderWidth: 2
        }]
      },
      options: {
        ...SFTiChartConfig.getBarChartOptions(),
        scales: {
          ...SFTiChartConfig.getBarChartOptions().scales,
          y: {
            ...SFTiChartConfig.getBarChartOptions().scales.y,
            ticks: {
              ...SFTiChartConfig.getBarChartOptions().scales.y.ticks,
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.log('Win rate data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No win rate data available yet.');
  }
}

/**
 * Load and render drawdown chart
 */
async function loadDrawdownChart() {
  const ctx = document.getElementById('drawdown-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/analytics-data.json`);
    const data = await response.json();
    
    if (drawdownChart) {
      drawdownChart.destroy();
    }

    const ddData = data.drawdown_series || { labels: [], values: [] };

    drawdownChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ddData.labels,
        datasets: [{
          label: 'Drawdown ($)',
          data: ddData.values,
          borderColor: '#ff4757',
          backgroundColor: 'rgba(255, 71, 87, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Drawdown data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No drawdown data available yet.');
  }
}

/**
 * Load and render R-Multiple chart
 */
async function loadRMultipleChart() {
  const ctx = document.getElementById('r-multiple-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/analytics-data.json`);
    const data = await response.json();
    
    if (rMultipleChart) {
      rMultipleChart.destroy();
    }

    const rData = data.r_multiple_distribution || { labels: [], data: [] };
    const colors = rData.labels.map(label => {
      if (label.includes('<') || label.includes('-2R to -1R') || label.includes('-1R to 0R')) {
        return '#ff4757';
      } else if (label.includes('0R to 1R')) {
        return '#ffa502';
      } else {
        return '#00ff88';
      }
    });

    rMultipleChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: rData.labels,
        datasets: [{
          label: 'Number of Trades',
          data: rData.data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 2
        }]
      },
      options: SFTiChartConfig.getBarChartOptions()
    });
  } catch (error) {
    console.log('R-Multiple data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No R-Multiple data available yet.');
  }
}

// renderEmptyChart is now imported from chartConfig.js

/**
 * Switch between chart views
 */
function switchChart(chartType) {
  // Hide all chart containers
  document.querySelectorAll('.chart-container').forEach(container => {
    container.style.display = 'none';
  });

  // Show selected chart container
  const selectedContainer = document.getElementById(`${chartType}-container`);
  if (selectedContainer) {
    selectedContainer.style.display = 'block';
  }

  // Load the selected chart if not already loaded
  switch(chartType) {
    case 'equity-curve':
      if (!equityCurveChart) loadEquityCurveChart();
      break;
    case 'win-loss-ratio-by-strategy':
      if (!winLossRatioByStrategyChart) loadWinLossRatioByStrategyChart();
      break;
    case 'performance-by-day':
      if (!performanceByDayChart) loadPerformanceByDayChart();
      break;
    case 'ticker-performance':
      if (!tickerPerformanceChart) loadTickerPerformanceChart();
      break;
    case 'time-of-day':
      if (!timeOfDayChart) loadTimeOfDayChart();
      break;
    case 'strategy':
      if (!strategyChart) loadStrategyChart();
      break;
    case 'setup':
      if (!setupChart) loadSetupChart();
      break;
    case 'winrate':
      if (!winrateChart) loadWinRateChart();
      break;
    case 'drawdown':
      if (!drawdownChart) loadDrawdownChart();
      break;
    case 'r-multiple':
      if (!rMultipleChart) loadRMultipleChart();
      break;
  }
}

/**
 * Initialize charts on page load
 */
function initCharts() {
  // Load equity curve by default
  loadEquityCurveChart();

  // Set up desktop custom dropdown
  const desktopButton = document.getElementById('chart-selector-button');
  const desktopMenu = document.getElementById('chart-selector-menu');
  const desktopText = document.getElementById('chart-selector-text');
  
  if (desktopButton && desktopMenu) {
    // Toggle dropdown
    desktopButton.addEventListener('click', () => {
      const isExpanded = desktopButton.getAttribute('aria-expanded') === 'true';
      desktopButton.setAttribute('aria-expanded', !isExpanded);
      desktopMenu.classList.toggle('show');
    });
    
    // Handle option selection
    desktopMenu.querySelectorAll('.chart-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const value = option.getAttribute('data-value');
        const text = option.textContent;
        
        // Update button text
        desktopText.textContent = text;
        
        // Mark as active
        desktopMenu.querySelectorAll('.chart-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Close dropdown
        desktopButton.setAttribute('aria-expanded', 'false');
        desktopMenu.classList.remove('show');
        
        // Switch chart
        switchChart(value);
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!desktopButton.contains(e.target) && !desktopMenu.contains(e.target)) {
        desktopButton.setAttribute('aria-expanded', 'false');
        desktopMenu.classList.remove('show');
      }
    });
  }
  
  // Set up mobile native select
  const mobileSelect = document.getElementById('chart-selector-mobile');
  if (mobileSelect) {
    mobileSelect.addEventListener('change', (e) => {
      switchChart(e.target.value);
    });
  }
}

// Initialize when DOM is ready
SFTiUtils.onDOMReady(initCharts);
