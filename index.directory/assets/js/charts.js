/**
 * Charts JavaScript - Main Homepage Charts
 * Handles all chart types: equity curve, trade distribution, performance by day, ticker performance
 */

// Use utilities from global SFTiUtils and SFTiChartConfig
const basePath = SFTiUtils.getBasePath();

// Chart instances
let equityCurveChart = null;
let tradeDistributionChart = null;
let performanceByDayChart = null;
let tickerPerformanceChart = null;

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
 * Load and render trade distribution chart
 */
async function loadTradeDistributionChart() {
  const ctx = document.getElementById('trade-distribution-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/trade-distribution-data.json`);
    const data = await response.json();
    
    if (tradeDistributionChart) {
      tradeDistributionChart.destroy();
    }

    tradeDistributionChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: SFTiChartConfig.getBarChartOptions()
    });
  } catch (error) {
    console.log('Trade distribution data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No trade distribution data available yet. Add trades to see your distribution.');
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
    case 'trade-distribution':
      if (!tradeDistributionChart) loadTradeDistributionChart();
      break;
    case 'performance-by-day':
      if (!performanceByDayChart) loadPerformanceByDayChart();
      break;
    case 'ticker-performance':
      if (!tickerPerformanceChart) loadTickerPerformanceChart();
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
