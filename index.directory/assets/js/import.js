/**
 * Import Page JavaScript
 * Handles CSV upload, broker detection, preview, and import workflow
 * Integrated with EventBus for reactive updates
 * 
 * Note: Backend CSV processing uses Python importers in .github/scripts/importers/
 * This frontend provides UI for file upload, validation, and preview.
 */

// Use utilities from global SFTiUtils

// State management
let uploadedFile = null;
let parsedTrades = [];
let detectedBroker = null;
const eventBus = window.SFTiEventBus;

// DOM elements
const csvFileInput = document.getElementById('csv-file-input');
const csvFileInfo = document.getElementById('csv-file-info');
const csvFilename = document.getElementById('csv-filename');
const csvFilesize = document.getElementById('csv-filesize');
const clearCsvBtn = document.getElementById('clear-csv-btn');
const brokerSelect = document.getElementById('broker-select');
const brokerInfo = document.getElementById('broker-info');
const brokerInfoText = document.getElementById('broker-info-text');
const previewContainer = document.getElementById('preview-container');
const previewPlaceholder = document.getElementById('preview-placeholder');
const previewSummary = document.getElementById('preview-summary');
const previewTableBody = document.getElementById('preview-table-body');
const validateBtn = document.getElementById('validate-btn');
const importBtn = document.getElementById('import-btn');
const downloadMappingBtn = document.getElementById('download-mapping-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const importStatus = document.getElementById('import-status');

/**
 * Initialize event listeners
 */
function initImportPage() {
  csvFileInput?.addEventListener('change', handleFileUpload);
  clearCsvBtn?.addEventListener('click', clearFile);
  brokerSelect?.addEventListener('change', handleBrokerChange);
  validateBtn?.addEventListener('click', handleValidate);
  importBtn?.addEventListener('click', handleImport);
  downloadMappingBtn?.addEventListener('click', handleDownloadMapping);
  exportCsvBtn?.addEventListener('click', handleExportCsv);
}

/**
 * Handle CSV file upload
 */
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  uploadedFile = file;
  
  // Show file info
  csvFilename.textContent = file.name;
  csvFilesize.textContent = SFTiUtils.formatFileSize(file.size);
  csvFileInfo.style.display = 'block';
  
  // Read and parse file
  const reader = new FileReader();
  reader.onload = (e) => {
    const csvContent = e.target.result;
    uploadedFile.content = csvContent;
    
    // Auto-detect broker
    detectedBroker = detectBrokerFromCSV(csvContent);
    
    if (detectedBroker) {
      brokerSelect.value = detectedBroker;
      brokerInfo.style.display = 'block';
      brokerInfoText.textContent = `Detected ${SFTiUtils.getBrokerName(detectedBroker)} format`;
      showStatus(`Auto-detected ${SFTiUtils.getBrokerName(detectedBroker)} CSV format. Click Validate to preview trades.`, 'success');
    } else {
      showStatus('Could not auto-detect broker. Please select manually and click Validate.', 'warning');
    }
    
    validateBtn.disabled = false;
  };
  reader.readAsText(file);
}

/**
 * Detect broker from CSV content
 */
function detectBrokerFromCSV(csvContent) {
  const header = csvContent.split('\n')[0].toLowerCase();
  
  // IBKR detection
  if (header.includes('symbol') && header.includes('date/time') && 
      (header.includes('proceeds') || header.includes('realized p/l'))) {
    return 'ibkr';
  }
  
  // Schwab detection
  if (header.includes('date') && header.includes('action') && header.includes('description')) {
    return 'schwab';
  }
  
  // Robinhood detection
  if (header.includes('activity date') && header.includes('trans code') && header.includes('instrument')) {
    return 'robinhood';
  }
  
  // Webull detection
  if (header.includes('time') && header.includes('side') && header.includes('filled/quantity')) {
    return 'webull';
  }
  
  return null;
}

/**
 * Clear uploaded file
 */
function clearFile() {
  uploadedFile = null;
  parsedTrades = [];
  detectedBroker = null;
  
  csvFileInput.value = '';
  csvFileInfo.style.display = 'none';
  brokerInfo.style.display = 'none';
  previewContainer.style.display = 'none';
  previewPlaceholder.style.display = 'block';
  
  validateBtn.disabled = true;
  importBtn.disabled = true;
  
  hideStatus();
}

/**
 * Handle broker selection change
 */
function handleBrokerChange(event) {
  const broker = event.target.value;
  
  if (broker) {
    detectedBroker = broker;
    brokerInfoText.textContent = `Selected: ${SFTiUtils.getBrokerName(broker)}`;
    brokerInfo.style.display = 'block';
  } else {
    brokerInfo.style.display = 'none';
  }
}

/**
 * Handle validate button click
 */
async function handleValidate() {
  if (!uploadedFile || !uploadedFile.content) {
    showStatus('Please upload a CSV file first.', 'error');
    return;
  }
  
  if (!detectedBroker) {
    showStatus('Please select a broker.', 'error');
    return;
  }
  
  showStatus('Validating CSV and parsing trades...', 'info');
  validateBtn.disabled = true;
  
  try {
    // Parse CSV content
    const trades = parseCSVForBroker(uploadedFile.content, detectedBroker);
    
    if (trades.length === 0) {
      showStatus('No valid trades found in CSV. Please check the format.', 'warning');
      parsedTrades = [];
      previewPlaceholder.style.display = 'block';
      previewContainer.style.display = 'none';
      return;
    }
    
    parsedTrades = trades;
    displayPreview(trades);
    
    showStatus(`Successfully parsed ${trades.length} trade(s). Review and click Import to add to journal.`, 'success');
    importBtn.disabled = false;
    
  } catch (error) {
    showStatus(`Error parsing CSV: ${error.message}`, 'error');
    console.error('Parse error:', error);
  } finally {
    validateBtn.disabled = false;
  }
}

/**
 * Parse CSV content based on broker
 */
function parseCSVForBroker(csvContent, broker) {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const trades = [];
  
  // Simple parsing for demonstration
  // In production, this would use the broker-specific parsers
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < headers.length) continue;
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    // Basic validation - check for required fields
    if (row.symbol || row.ticker || row.instrument) {
      const ticker = (row.symbol || row.ticker || row.instrument || '').toUpperCase();
      if (ticker) {
        trades.push({
          status: 'valid',
          ticker: ticker,
          entry_date: row['entry_date'] || row['date'] || row['activity date'] || row['trade date'] || '',
          entry_price: parseFloat(row['entry_price'] || row['price'] || row['t. price'] || 0),
          exit_date: row['exit_date'] || '',
          exit_price: parseFloat(row['exit_price'] || 0),
          position_size: parseInt(row['quantity'] || row['position_size'] || row['qty'] || 0),
          direction: 'LONG',
          pnl_usd: parseFloat(row['realized p/l'] || row['pnl_usd'] || 0),
          broker: SFTiUtils.getBrokerName(broker)
        });
      }
    }
  }
  
  return trades;
}

/**
 * Handle import button click
 */
async function handleImport() {
  if (!parsedTrades || parsedTrades.length === 0) {
    showStatus('No trades to import. Please validate first.', 'error');
    return;
  }
  
  showStatus(`Preparing to import ${parsedTrades.length} trade(s)...`, 'info');
  importBtn.disabled = true;
  
  try {
    // In production, this would create CSV in import/ directory and trigger workflow
    // For now, provide instructions
    
    const instructions = `To complete import:\n\n1. Save CSV to 'import/' directory\n2. git add import/file.csv && git commit && git push\n3. Import workflow will auto-process trades\n\nDownloading CSV for you...`;
    
    showStatus(instructions, 'info');
    
    // Download CSV as convenience
    if (uploadedFile && uploadedFile.content) {
      const blob = new Blob([uploadedFile.content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `import-${detectedBroker}-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      showStatus('CSV downloaded. Place in import/ directory and push to complete.', 'success');
      
      // Emit event that CSV import was initiated
      if (eventBus) {
        eventBus.emit('trades:csv-downloaded', {
          broker: detectedBroker,
          trade_count: parsedTrades.length,
          timestamp: new Date().toISOString()
        });
        console.log('[Import] CSV download initiated, event emitted');
      }
    }
    
  } catch (error) {
    showStatus(`Error: ${error.message}`, 'error');
  } finally {
    importBtn.disabled = false;
  }
}

/**
 * Handle download sample mapping
 */
function handleDownloadMapping() {
  const broker = detectedBroker || brokerSelect.value;
  
  if (!broker) {
    showStatus('Please select a broker first.', 'error');
    return;
  }
  
  // Generate broker-specific field mapping
  const mappings = {
    'ibkr': {
      'Symbol': 'ticker',
      'Date/Time': 'entry_date + entry_time',
      'Quantity': 'position_size',
      'T. Price': 'entry_price / exit_price',
      'Proceeds': 'calculated from price * quantity',
      'Comm/Fee': 'commission',
      'Realized P/L': 'pnl_usd'
    },
    'schwab': {
      'Symbol': 'ticker',
      'Date': 'entry_date',
      'Action': 'BUY/SELL indicator',
      'Quantity': 'position_size',
      'Price': 'entry_price / exit_price',
      'Amount': 'total transaction value'
    },
    'robinhood': {
      'Instrument': 'ticker',
      'Activity Date': 'entry_date',
      'Trans Code': 'transaction type',
      'Quantity': 'position_size',
      'Price': 'entry_price / exit_price'
    },
    'webull': {
      'Ticker': 'ticker',
      'Time': 'entry_date + entry_time',
      'Side': 'BUY/SELL indicator',
      'Filled/Quantity': 'position_size',
      'Price': 'entry_price / exit_price'
    }
  };
  
  const mapping = {
    broker: SFTiUtils.getBrokerName(broker),
    fields: mappings[broker] || {},
    notes: `Field mapping for ${SFTiUtils.getBrokerName(broker)} CSV format. These mappings show how broker CSV columns are converted to the standard trade format.`
  };
  
  const blob = new Blob([JSON.stringify(mapping, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${broker}-field-mapping.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showStatus('Sample mapping downloaded.', 'info');
}

/**
 * Handle export to CSV
 */
async function handleExportCsv() {
  try {
    showStatus('Loading trades data...', 'info');
    
    // Try to fetch trades-index.json
    const response = await fetch('trades-index.json');
    if (!response.ok) {
      showStatus('No trades data found to export. trades-index.json not available.', 'warning');
      return;
    }
    
    const tradesData = await response.json();
    const trades = tradesData.trades || [];
    
    if (trades.length === 0) {
      showStatus('No trades found to export.', 'warning');
      return;
    }
    
    // Convert trades to CSV
    const headers = [
      'trade_number', 'ticker', 'entry_date', 'entry_time', 'entry_price',
      'exit_date', 'exit_time', 'exit_price', 'position_size', 'direction',
      'strategy', 'broker', 'pnl_usd', 'pnl_percent'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    for (const trade of trades) {
      const row = headers.map(header => {
        const value = trade[header] || '';
        // Escape values that contain commas
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      });
      csvContent += row.join(',') + '\n';
    }
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sfti-pennies-trades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showStatus(`Exported ${trades.length} trade(s) to CSV.`, 'success');
    
  } catch (error) {
    showStatus(`Error exporting trades: ${error.message}`, 'error');
    console.error('Export error:', error);
  }
}

/**
 * Display preview of parsed trades
 */
function displayPreview(trades) {
  if (!trades || trades.length === 0) {
    previewContainer.style.display = 'none';
    previewPlaceholder.style.display = 'block';
    return;
  }
  
  // Show preview
  previewPlaceholder.style.display = 'none';
  previewContainer.style.display = 'block';
  
  // Update summary
  const validCount = trades.filter(t => t.status === 'valid').length;
  const invalidCount = trades.length - validCount;
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl_usd || 0), 0);
  
  previewSummary.innerHTML = `
    <div class="preview-summary-item">
      <div class="preview-summary-label">Total Trades</div>
      <div class="preview-summary-value">${trades.length}</div>
    </div>
    <div class="preview-summary-item">
      <div class="preview-summary-label">Valid</div>
      <div class="preview-summary-value" style="color: var(--accent-green);">${validCount}</div>
    </div>
    <div class="preview-summary-item">
      <div class="preview-summary-label">Invalid</div>
      <div class="preview-summary-value" style="color: var(--accent-red);">${invalidCount}</div>
    </div>
    <div class="preview-summary-item">
      <div class="preview-summary-label">Total P&L</div>
      <div class="preview-summary-value" style="color: ${totalPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
        $${totalPnl.toFixed(2)}
      </div>
    </div>
  `;
  
  // Update table
  previewTableBody.innerHTML = trades.map(trade => `
    <tr>
      <td>
        <span class="trade-status-badge ${trade.status}">
          ${trade.status}
        </span>
      </td>
      <td><strong>${trade.ticker}</strong></td>
      <td>${trade.entry_date}</td>
      <td>$${trade.entry_price?.toFixed(2)}</td>
      <td>${trade.exit_date}</td>
      <td>$${trade.exit_price?.toFixed(2)}</td>
      <td>${trade.position_size}</td>
      <td>${trade.direction}</td>
      <td style="color: ${trade.pnl_usd >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
        $${trade.pnl_usd?.toFixed(2)}
      </td>
    </tr>
  `).join('');
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
  importStatus.style.display = 'block';
  importStatus.className = `import-status ${type}`;
  
  const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  importStatus.querySelector('.import-status-icon').textContent = icon;
  importStatus.querySelector('.import-status-message').textContent = message;
}

/**
 * Hide status message
 */
function hideStatus() {
  importStatus.style.display = 'none';
}

/**
 * Get broker display name (alias for getBrokerName from utils)
 */
// Removed - now using SFTiUtils.getBrokerName directly

// Initialize on DOM ready
SFTiUtils.onDOMReady(initImportPage);
