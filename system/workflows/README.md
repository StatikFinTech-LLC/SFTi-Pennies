# System Workflows - Browser-Based JavaScript Implementation

This directory contains browser-executable JavaScript workflow orchestration that automates the trade processing pipeline **entirely in the browser**, with no server or GitHub Actions required.

## Overview

The workflow system provides a complete automation pipeline that runs client-side, using the VFS (Virtual File System) for storage and executing all processing steps in the browser.

## Files

### Core Engine
- **`workflow_engine.js`** - Generic workflow execution engine
  - Step-by-step execution with progress tracking
  - Event-driven architecture
  - Error handling and rollback support
  - Fully async/await based

### Workflows
- **`trade_pipeline.js`** - 10-step trade processing pipeline
- **`import_workflow.js`** - CSV import with broker auto-detection
- **`site_submit_workflow.js`** - Browser-based trade submission

## Usage

### Trade Pipeline Workflow

```javascript
// Initialize VFS and workflow engine
import { VFS } from '../storage/vfs.js';
import { WorkflowEngine } from './workflow_engine.js';
import { TradePipelineWorkflow } from './trade_pipeline.js';

const vfs = new VFS();
await vfs.init();

const engine = new WorkflowEngine();
const pipeline = new TradePipelineWorkflow(engine, vfs);

// Add progress listeners
engine.on('onStepStart', (data) => {
    console.log(`Starting step: ${data.step} (${data.stepNumber}/${data.totalSteps})`);
});

engine.on('onStepComplete', (data) => {
    console.log(`Completed step: ${data.step}`, data.result);
});

// Execute pipeline
const result = await pipeline.execute();
console.log('Pipeline complete:', result);
```

### Import Workflow

```javascript
import { ImportWorkflow } from './import_workflow.js';

const engine = new WorkflowEngine();
const importWorkflow = new ImportWorkflow(engine, vfs);

// Read CSV file from user upload
const csvContent = await readFileFromUpload();

// Execute import
const result = await importWorkflow.execute(csvContent, {
    broker: 'ibkr',  // Optional: auto-detected if not provided
    outputDir: 'trades',
    skipPipeline: false  // Trigger trade pipeline after import
});

console.log(`Imported ${result.results.validate_trades.result.validCount} trades`);
```

### Site Submit Workflow

```javascript
import { SiteSubmitWorkflow } from './site_submit_workflow.js';

const engine = new WorkflowEngine();
const submitWorkflow = new SiteSubmitWorkflow(engine, vfs);

// Collect trade data from form
const trade = {
    ticker: 'AAPL',
    entry_date: '2024-01-15',
    entry_price: 180.50,
    exit_price: 182.75,
    direction: 'LONG',
    position_size: 100
    // ... other fields
};

// Upload images if any
const images = [
    { name: 'screenshot1.png', data: imageBlob1 },
    { name: 'screenshot2.png', data: imageBlob2 }
];

// Execute submission
const result = await submitWorkflow.execute(trade, images, {
    createPR: false,  // Set to true for PR workflow
    skipPipeline: false
});

console.log('Trade submitted:', result.results.save_trade.result.filepath);
```

## Workflow Steps

### Trade Pipeline (10 steps)
1. **parse_trades** - Parse markdown files with YAML frontmatter
2. **generate_analytics** - Calculate advanced metrics (Sharpe, Kelly, etc.)
3. **generate_charts** - Generate Chart.js data
4. **generate_summaries** - Create period summaries (week/month/year)
5. **generate_trade_pages** - Generate individual trade HTML pages
6. **generate_week_summaries** - Generate week folder summaries
7. **generate_index** - Create master index
8. **update_homepage** - Update homepage with latest data
9. **optimize_images** - Validate and optimize trade images
10. **save_results** - Save all generated data to VFS

### Import Workflow (8 steps)
1. **load_csv** - Validate CSV content
2. **detect_broker** - Auto-detect broker format (IBKR/Schwab/Robinhood/Webull)
3. **parse_csv** - Parse CSV using broker-specific importer
4. **validate_trades** - Validate with broker-specific rules
5. **generate_markdown** - Create trade markdown files from template
6. **save_trades** - Save markdown files to VFS
7. **update_index** - Update trades-index.json
8. **trigger_pipeline** - Execute trade pipeline

### Site Submit Workflow (7 steps)
1. **validate_submission** - Validate required fields
2. **generate_markdown** - Render trade template
3. **upload_images** - Save images to VFS
4. **save_trade** - Save trade markdown file
5. **update_index** - Update trades index
6. **trigger_pipeline** - Execute trade pipeline
7. **create_pull_request** - Create PR metadata (optional)

## Event System

All workflows emit events you can listen to:

```javascript
const engine = new WorkflowEngine();

engine.on('onWorkflowStart', (data) => {
    console.log('Workflow started:', data.workflow);
});

engine.on('onStepStart', (data) => {
    console.log(`Step ${data.stepNumber}/${data.totalSteps}: ${data.step}`);
    // Update progress bar in UI
});

engine.on('onStepComplete', (data) => {
    console.log('Step completed:', data.step, data.result);
});

engine.on('onStepError', (data) => {
    console.error('Step failed:', data.step, data.error);
});

engine.on('onWorkflowComplete', (data) => {
    console.log('Workflow complete!', data);
});

engine.on('onWorkflowError', (data) => {
    console.error('Workflow failed:', data.error);
});
```

## Integration with System Scripts

All workflows use the JavaScript scripts from `../scripts/`:
- `parse_trades.js`
- `generate_analytics.js`
- `generate_charts.js`
- `generate_summaries.js`
- `generate_trade_pages.js`
- `generate_week_summaries.js`
- `generate_index.js`
- `update_homepage.js`
- `attach_media.js`
- `import_csv.js`
- Broker importers from `../scripts/importers/`

## Integration with Templates

Workflows use the template engine from `../templates/`:
- `template_engine.js` - Template rendering engine
- `trade_template.js` - Trade markdown template
- `weekly_summary_template.js` - Weekly summary template

## Python Migration

These JavaScript workflows replace:
- `.github/workflows/trade_pipeline.yml` → `trade_pipeline.js`
- `.github/workflows/import.yml` → `import_workflow.js`
- `.github/workflows/site-submit.yml` → `site_submit_workflow.js`

All functionality is preserved with 100% feature parity, but now runs entirely in the browser using the VFS for storage.
