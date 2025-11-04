/**
 * Analytics Page JavaScript
 * Loads analytics data from analytics-data.json and renders advanced charts and metrics
 * Fails gracefully if analytics-data.json is not available
 * 
 * Performance Optimizations:
 * - Reduced duplicate map operations on arrays
 * - Pre-computed color arrays for chart rendering
 * - Efficient template string building for tables
 */

// Use utilities from global SFTiUtils and SFTiChartConfig

// State
let analyticsData = null;

// DOM elements
const metricTotalReturn = document.getElementById('metric-total-return');
const metricAvgReturn = document.getElementById('metric-avg-return');
const metricExpectancy = document.getElementById('metric-expectancy');
const metricProfitFactor = document.getElementById('metric-profit-factor');
const metricAvgRisk = document.getElementById('metric-avg-risk');
const metricAvgPosition = document.getElementById('metric-avg-position');
const metricMaxDrawdown = document.getElementById('metric-max-drawdown');
const metricKelly = document.getElementById('metric-kelly');
const metricWinStreak = document.getElementById('metric-win-streak');
const metricLossStreak = document.getElementById('metric-loss-streak');
const strategyTableBody = document.getElementById('strategy-table-body');

// Charts
let strategyChart = null;
let setupChart = null;
let winrateChart = null;
let drawdownChart = null;

/**
 * Initialize analytics page
 */
async function initAnalytics() {
  try {
    // Load analytics-data.json
    await loadAnalyticsData();
    
    // Setup event listeners for reactive updates
    setupAnalyticsEventListeners();
    
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}

/**
 * Load analytics data
 */
async function loadAnalyticsData() {
  try {
    const response = await fetch('assets/charts/analytics-data.json');
    if (response.ok) {
      analyticsData = await response.json();
      console.log('Loaded analytics data from file');
    } else {
      console.error('Analytics data not found');
      analyticsData = null;
    }
  } catch (fetchError) {
    console.error('Error fetching analytics data:', fetchError);
    analyticsData = null;
  }
  
  // Update display only if we have data
  if (analyticsData) {
    updateMetrics(analyticsData);
    renderStrategyChart(analyticsData);
    renderSetupChart(analyticsData);
    renderWinRateChart(analyticsData);
    renderDrawdownChart(analyticsData);
    renderStrategyTable(analyticsData);
  }
}

/**
 * Setup event listeners for reactive updates
 */
function setupAnalyticsEventListeners() {
  const eventBus = window.SFTiEventBus;
  if (!eventBus) return;
  
  // Listen for account changes
  eventBus.on('account:balance-updated', () => {
    console.log('[Analytics] Account balance updated, reloading analytics');
    loadAnalyticsData();
  });
  
  eventBus.on('account:deposit-added', () => {
    console.log('[Analytics] Deposit added, reloading analytics');
    loadAnalyticsData();
  });
  
  // Listen for trades updates
  eventBus.on('trades:updated', () => {
    console.log('[Analytics] Trades updated, reloading analytics');
    loadAnalyticsData();
  });
  
  // Listen for analytics updates
  eventBus.on('analytics:updated', (data) => {
    console.log('[Analytics] Analytics updated, refreshing display');
    analyticsData = data;
    updateMetrics(analyticsData);
    renderStrategyChart(analyticsData);
    renderSetupChart(analyticsData);
    renderWinRateChart(analyticsData);
    renderDrawdownChart(analyticsData);
    renderStrategyTable(analyticsData);
  });
}

/**
 * Update metrics display
 */
function updateMetrics(data) {
  if (!data) return;
  
  // Returns metrics
  const returns = data.returns || {};
  const totalReturn = returns.total_return_percent || 0;
  const avgReturn = returns.avg_return_percent || 0;
  const avgRisk = returns.avg_risk_percent || 0;
  const avgPosition = returns.avg_position_size_percent || 0;
  
  // Update percentage-based metrics with color coding
  if (metricTotalReturn) {
    metricTotalReturn.textContent = `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`;
    metricTotalReturn.style.color = totalReturn >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  }
  
  if (metricAvgReturn) {
    metricAvgReturn.textContent = `${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(4)}%`;
    metricAvgReturn.style.color = avgReturn >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  }
  
  if (metricAvgRisk) {
    metricAvgRisk.textContent = `${avgRisk.toFixed(3)}%`;
  }
  
  if (metricAvgPosition) {
    metricAvgPosition.textContent = `${avgPosition.toFixed(2)}%`;
  }
  
  // Dollar-based metrics
  if (metricExpectancy) {
    const expectancy = data.expectancy || 0;
    metricExpectancy.textContent = `$${expectancy.toFixed(2)}`;
    metricExpectancy.style.color = expectancy >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  }
  
  if (metricProfitFactor) {
    metricProfitFactor.textContent = data.profit_factor?.toFixed(2) || '0.00';
  }
  
  // Drawdown with both dollar and percentage
  if (metricMaxDrawdown) {
    const ddDollars = Math.abs(data.max_drawdown || 0);
    const ddPercent = Math.abs(data.max_drawdown_percent || 0);
    metricMaxDrawdown.textContent = `$${ddDollars.toFixed(2)} (${ddPercent.toFixed(2)}%)`;
  }
  
  if (metricKelly) {
    metricKelly.textContent = `${(data.kelly_criterion || 0).toFixed(1)}%`;
  }
  
  if (metricWinStreak) {
    metricWinStreak.textContent = data.max_win_streak || '0';
  }
  
  if (metricLossStreak) {
    metricLossStreak.textContent = data.max_loss_streak || '0';
  }
}

/**
 * Render performance by strategy chart
 */
function renderStrategyChart(data) {
  const ctx = document.getElementById('strategy-chart');
  if (!ctx || !data.by_strategy) return;
  
  const strategies = Object.keys(data.by_strategy);
  const pnls = strategies.map(s => data.by_strategy[s].total_pnl);
  
  // Pre-compute colors once instead of in map
  const colors = pnls.map(p => SFTiUtils.getPnLColors(p));
  
  if (strategyChart) strategyChart.destroy();
  
  strategyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: strategies,
      datasets: [{
        label: 'Total P&L ($)',
        data: pnls,
        backgroundColor: colors.map(c => c.bg),
        borderColor: colors.map(c => c.border),
        borderWidth: 2
      }]
    },
    options: SFTiChartConfig.getBarChartOptions()
  });
}

/**
 * Render performance by setup chart
 */
function renderSetupChart(data) {
  const ctx = document.getElementById('setup-chart');
  if (!ctx || !data.by_setup) return;
  
  const setups = Object.keys(data.by_setup);
  const pnls = setups.map(s => data.by_setup[s].total_pnl);
  
  // Pre-compute colors once instead of in map
  const colors = pnls.map(p => SFTiUtils.getPnLColors(p));
  
  if (setupChart) setupChart.destroy();
  
  setupChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: setups,
      datasets: [{
        label: 'Total P&L ($)',
        data: pnls,
        backgroundColor: colors.map(c => c.bg),
        borderColor: colors.map(c => c.border),
        borderWidth: 2
      }]
    },
    options: SFTiChartConfig.getBarChartOptions()
  });
}

/**
 * Render win rate chart
 */
function renderWinRateChart(data) {
  const ctx = document.getElementById('winrate-chart');
  if (!ctx || !data.by_strategy) return;
  
  const strategies = Object.keys(data.by_strategy);
  const winRates = strategies.map(s => data.by_strategy[s].win_rate);
  
  if (winrateChart) winrateChart.destroy();
  
  // Get base options and customize for percentage display
  const options = SFTiChartConfig.getBarChartOptions('#ffd700');
  const customOptions = {
    ...options,
    scales: {
      ...options.scales,
      y: {
        ...options.scales.y,
        max: 100,
        ticks: {
          ...options.scales.y.ticks,
          callback: value => value + '%'
        }
      }
    }
  };
  
  winrateChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: strategies,
      datasets: [{
        label: 'Win Rate (%)',
        data: winRates,
        backgroundColor: 'rgba(255, 215, 0, 0.8)',
        borderColor: '#ffd700',
        borderWidth: 2
      }]
    },
    options: customOptions
  });
}

/**
 * Render drawdown chart
 */
function renderDrawdownChart(data) {
  const ctx = document.getElementById('drawdown-chart');
  if (!ctx || !data.drawdown_series) return;
  
  if (drawdownChart) drawdownChart.destroy();
  
  drawdownChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.drawdown_series.labels,
      datasets: [{
        label: 'Drawdown ($)',
        data: data.drawdown_series.values,
        borderColor: '#ff4757',
        backgroundColor: 'rgba(255, 71, 87, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#ff4757'
      }]
    },
    options: SFTiChartConfig.getLineChartOptions('#ff4757')
  });
}

/**
 * Render strategy breakdown table
 */
function renderStrategyTable(data) {
  if (!data.by_strategy) return;
  
  const rows = Object.keys(data.by_strategy).map(strategy => {
    const stats = data.by_strategy[strategy];
    return `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.75rem;"><strong>${strategy}</strong></td>
        <td style="padding: 0.75rem; text-align: right;">${stats.total_trades}</td>
        <td style="padding: 0.75rem; text-align: right;">${stats.win_rate.toFixed(1)}%</td>
        <td style="padding: 0.75rem; text-align: right; color: ${stats.avg_pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
          $${stats.avg_pnl.toFixed(2)}
        </td>
        <td style="padding: 0.75rem; text-align: right; color: ${stats.total_pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
          $${stats.total_pnl.toFixed(2)}
        </td>
        <td style="padding: 0.75rem; text-align: right; color: var(--accent-yellow);">
          $${stats.expectancy.toFixed(2)}
        </td>
      </tr>
    `;
  }).join('');
  
  strategyTableBody.innerHTML = rows;
}

// Initialize on DOM ready
SFTiUtils.onDOMReady(initAnalytics);
