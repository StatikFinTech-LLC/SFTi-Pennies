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
let equityCurveChart = null;
let winLossRatioByStrategyChart = null;
let performanceByDayChart = null;
let tickerPerformanceChart = null;
let timeOfDayChart = null;
let rMultipleChart = null;
let portfolioValueDayChart = null;
let portfolioValueWeekChart = null;
let portfolioValueMonthChart = null;
let portfolioValueQuarterChart = null;
let portfolioValueYearChart = null;
let portfolioValue5YearChart = null;
let totalReturnDayChart = null;
let totalReturnWeekChart = null;
let totalReturnMonthChart = null;
let totalReturnQuarterChart = null;
let totalReturnYearChart = null;
let totalReturn5YearChart = null;

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
    
    // Load index.html charts
    loadEquityCurveChart();
    loadWinLossRatioByStrategyChart();
    loadPerformanceByDayChart();
    loadTickerPerformanceChart();
    loadTimeOfDayChart();
    
    // Load Portfolio Value charts (all timeframes)
    loadPortfolioValueDayChart();
    loadPortfolioValueWeekChart();
    loadPortfolioValueMonthChart();
    loadPortfolioValueQuarterChart();
    loadPortfolioValueYearChart();
    loadPortfolioValue5YearChart();
    
    // Load Total Return charts (all timeframes)
    loadTotalReturnDayChart();
    loadTotalReturnWeekChart();
    loadTotalReturnMonthChart();
    loadTotalReturnQuarterChart();
    loadTotalReturnYearChart();
    loadTotalReturn5YearChart();
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
  
  eventBus.on('account:withdrawal-added', () => {
    console.log('[Analytics] Withdrawal added, reloading analytics');
    loadAnalyticsData();
  });
  
  eventBus.on('account:updated', () => {
    console.log('[Analytics] Account updated, reloading analytics');
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
  
  // Advanced metrics
  const sharpeRatioEl = document.getElementById('metric-sharpe-ratio');
  if (sharpeRatioEl) {
    sharpeRatioEl.textContent = (data.sharpe_ratio || 0).toFixed(2);
  }
  
  const avgRMultipleEl = document.getElementById('metric-avg-r-multiple');
  if (avgRMultipleEl && data.r_multiple_distribution) {
    avgRMultipleEl.textContent = `${(data.r_multiple_distribution.avg_r_multiple || 0).toFixed(2)}R`;
  }
  
  const medianRMultipleEl = document.getElementById('metric-median-r-multiple');
  if (medianRMultipleEl && data.r_multiple_distribution) {
    medianRMultipleEl.textContent = `${(data.r_multiple_distribution.median_r_multiple || 0).toFixed(2)}R`;
  }
  
  // Render R-Multiple chart
  if (data.r_multiple_distribution) {
    renderRMultipleChart(data.r_multiple_distribution);
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

// ======================================================================
// Charts from index.html
// ======================================================================

/**
 * Load and render equity curve chart
 */
async function loadEquityCurveChart() {
  const ctx = document.getElementById('equity-curve-chart');
  if (!ctx) return;

  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
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
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
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
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
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
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/ticker-performance-data.json`);
    const data = await response.json();
    
    if (tickerPerformanceChart) {
      tickerPerformanceChart.destroy();
    }

    const options = SFTiChartConfig.getBarChartOptions();
    
    // Override scales for horizontal bar chart
    options.scales.y.ticks.callback = function(value, index, values) {
      return this.getLabelForValue(value);
    };
    
    options.scales.x.ticks.callback = function(value) {
      return '$' + value.toFixed(0);
    };
    
    tickerPerformanceChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        ...options,
        indexAxis: 'y'
      }
    });
  } catch (error) {
    console.log('Ticker performance data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No ticker performance data available yet. Add trades to see performance by ticker.');
  }
}

/**
 * Load and render time of day performance chart
 */
async function loadTimeOfDayChart() {
  const ctx = document.getElementById('time-of-day-chart');
  if (!ctx) return;

  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
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
    console.log('Time of day performance data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No time of day performance data available yet. Add trades with session tags to see performance by time of day.');
  }
}

/**
 * Render R-Multiple Distribution chart
 */
function renderRMultipleChart(rMultipleData) {
  const ctx = document.getElementById('r-multiple-chart');
  if (!ctx || !rMultipleData) return;
  
  if (rMultipleChart) {
    rMultipleChart.destroy();
  }
  
  // Prepare colors based on R-multiple ranges
  const colors = rMultipleData.labels.map(label => {
    if (label.includes('<') || label.includes('-2R to -1R') || label.includes('-1R to 0R')) {
      return '#ff4757';
    } else if (label.includes('0R to 1R')) {
      return '#ffa502';
    } else {
      return '#00ff88';
    }
  });
  
  const chartData = {
    labels: rMultipleData.labels,
    datasets: [{
      label: 'Number of Trades',
      data: rMultipleData.data,
      backgroundColor: colors,
      borderColor: colors,
      borderWidth: 2
    }]
  };
  
  rMultipleChart = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: SFTiChartConfig.getBarChartOptions()
  });
}

// ======================================================================
// Portfolio Value Chart Loading Functions
// ======================================================================

async function loadPortfolioValueDayChart() {
  const ctx = document.getElementById('portfolio-value-day-chart');
  if (!ctx) return;
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/portfolio-value-day.json`);
    const data = await response.json();
    
    if (portfolioValueDayChart) portfolioValueDayChart.destroy();
    
    portfolioValueDayChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Portfolio value day data not available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No portfolio value data available yet.');
  }
}

async function loadPortfolioValueWeekChart() {
  const ctx = document.getElementById('portfolio-value-week-chart');
  if (!ctx) return;
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/portfolio-value-week.json`);
    const data = await response.json();
    
    if (portfolioValueWeekChart) portfolioValueWeekChart.destroy();
    
    portfolioValueWeekChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Portfolio value week data not available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No portfolio value data available yet.');
  }
}

async function loadPortfolioValueMonthChart() {
  const ctx = document.getElementById('portfolio-value-month-chart');
  if (!ctx) return;
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/portfolio-value-month.json`);
    const data = await response.json();
    
    if (portfolioValueMonthChart) portfolioValueMonthChart.destroy();
    
    portfolioValueMonthChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Portfolio value month data not available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No portfolio value data available yet.');
  }
}

async function loadPortfolioValueQuarterChart() {
  const ctx = document.getElementById('portfolio-value-quarter-chart');
  if (!ctx) return;
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/portfolio-value-quarter.json`);
    const data = await response.json();
    
    if (portfolioValueQuarterChart) portfolioValueQuarterChart.destroy();
    
    portfolioValueQuarterChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Portfolio value quarter data not available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No portfolio value data available yet.');
  }
}

async function loadPortfolioValueYearChart() {
  const ctx = document.getElementById('portfolio-value-year-chart');
  if (!ctx) return;
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/portfolio-value-year.json`);
    const data = await response.json();
    
    if (portfolioValueYearChart) portfolioValueYearChart.destroy();
    
    portfolioValueYearChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Portfolio value year data not available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No portfolio value data available yet.');
  }
}

async function loadPortfolioValue5YearChart() {
  const ctx = document.getElementById('portfolio-value-5year-chart');
  if (!ctx) return;
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/portfolio-value-5year.json`);
    const data = await response.json();
    
    if (portfolioValue5YearChart) portfolioValue5YearChart.destroy();
    
    portfolioValue5YearChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Portfolio value 5year data not available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No portfolio value data available yet.');
  }
}

// ======================================================================
// Total Return Chart Loading Functions
// ======================================================================

async function loadTotalReturnDayChart() {
  const ctx = document.getElementById('total-return-day-chart');
  if (!ctx) return;
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/total-return-day.json`);
    const data = await response.json();
    
    if (totalReturnDayChart) totalReturnDayChart.destroy();
    
    totalReturnDayChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Total return day data not available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No total return data available yet.');
  }
}

async function loadTotalReturnWeekChart() {
  const ctx = document.getElementById('total-return-week-chart');
  if (!ctx) return;
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/total-return-week.json`);
    const data = await response.json();
    
    if (totalReturnWeekChart) totalReturnWeekChart.destroy();
    
    totalReturnWeekChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Total return week data not available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No total return data available yet.');
  }
}

async function loadTotalReturnMonthChart() {
  const ctx = document.getElementById('total-return-month-chart');
  if (!ctx) return;
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/total-return-month.json`);
    const data = await response.json();
    
    if (totalReturnMonthChart) totalReturnMonthChart.destroy();
    
    totalReturnMonthChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Total return month data not available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No total return data available yet.');
  }
}

async function loadTotalReturnQuarterChart() {
  const ctx = document.getElementById('total-return-quarter-chart');
  if (!ctx) return;
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/total-return-quarter.json`);
    const data = await response.json();
    
    if (totalReturnQuarterChart) totalReturnQuarterChart.destroy();
    
    totalReturnQuarterChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Total return quarter data not available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No total return data available yet.');
  }
}

async function loadTotalReturnYearChart() {
  const ctx = document.getElementById('total-return-year-chart');
  if (!ctx) return;
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/total-return-year.json`);
    const data = await response.json();
    
    if (totalReturnYearChart) totalReturnYearChart.destroy();
    
    totalReturnYearChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Total return year data not available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No total return data available yet.');
  }
}

async function loadTotalReturn5YearChart() {
  const ctx = document.getElementById('total-return-5year-chart');
  if (!ctx) return;
  
  try {
    const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
    const response = await fetch(`${basePath}/index.directory/assets/charts/total-return-5year.json`);
    const data = await response.json();
    
    if (totalReturn5YearChart) totalReturn5YearChart.destroy();
    
    totalReturn5YearChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Total return 5year data not available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No total return data available yet.');
  }
}

// Initialize on DOM ready
SFTiUtils.onDOMReady(initAnalytics);
