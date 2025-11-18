/**
 * Import Workflow - Browser-Based CSV Import Orchestration
 * 
 * Orchestrates CSV import workflow in the browser:
 * 1. Load CSV file
 * 2. Detect broker
 * 3. Parse and validate trades
 * 4. Generate markdown files
 * 5. Update trades index
 * 6. Trigger trade pipeline
 * 
 * Python equivalent: .github/workflows/import.yml
 */

/**
 * Import Workflow
 * Executes CSV import and triggers trade pipeline
 */
class ImportWorkflow {
    constructor(workflowEngine, vfs) {
        this.engine = workflowEngine;
        this.vfs = vfs;
        this._registerWorkflow();
    }

    /**
     * Register the import workflow
     * @private
     */
    _registerWorkflow() {
        const steps = [
            {
                name: 'load_csv',
                required: true,
                execute: async (ctx) => {
                    if (!ctx.csvContent) {
                        throw new Error('CSV content is required');
                    }
                    return { fileSize: ctx.csvContent.length, success: true };
                }
            },
            {
                name: 'detect_broker',
                required: true,
                execute: async (ctx) => {
                    const { getImporter } = await import('../scripts/importers/index.js');
                    
                    // Try to detect broker from CSV content
                    const brokers = ['ibkr', 'schwab', 'robinhood', 'webull'];
                    let detectedBroker = null;
                    
                    for (const broker of brokers) {
                        try {
                            const importer = getImporter(broker);
                            if (importer && importer.detectFormat(ctx.csvContent)) {
                                detectedBroker = broker;
                                break;
                            }
                        } catch (e) {
                            // Continue checking other brokers
                        }
                    }
                    
                    if (!detectedBroker && ctx.broker) {
                        detectedBroker = ctx.broker;
                    }
                    
                    if (!detectedBroker) {
                        throw new Error('Could not detect broker format');
                    }
                    
                    ctx.detectedBroker = detectedBroker;
                    return { broker: detectedBroker, success: true };
                }
            },
            {
                name: 'parse_csv',
                required: true,
                execute: async (ctx) => {
                    const { getImporter } = await import('../scripts/importers/index.js');
                    const importer = getImporter(ctx.detectedBroker);
                    
                    if (!importer) {
                        throw new Error(`Importer for ${ctx.detectedBroker} not found`);
                    }
                    
                    const trades = importer.parseCsv(ctx.csvContent);
                    ctx.parsedTrades = trades;
                    return { tradeCount: trades.length, success: true };
                }
            },
            {
                name: 'validate_trades',
                required: true,
                execute: async (ctx) => {
                    const { getImporter } = await import('../scripts/importers/index.js');
                    const importer = getImporter(ctx.detectedBroker);
                    
                    const validTrades = [];
                    const errors = [];
                    
                    for (const trade of ctx.parsedTrades) {
                        const [isValid, tradeErrors] = importer.validateTrade(trade);
                        if (isValid) {
                            validTrades.push(trade);
                        } else {
                            errors.push({ trade, errors: tradeErrors });
                        }
                    }
                    
                    ctx.validTrades = validTrades;
                    ctx.validationErrors = errors;
                    
                    if (validTrades.length === 0) {
                        throw new Error('No valid trades found');
                    }
                    
                    return { 
                        validCount: validTrades.length, 
                        errorCount: errors.length,
                        success: true 
                    };
                }
            },
            {
                name: 'generate_markdown',
                required: true,
                execute: async (ctx) => {
                    const { renderTradeTemplate } = await import('../templates/template_engine.js');
                    
                    const files = [];
                    for (const trade of ctx.validTrades) {
                        const markdown = await renderTradeTemplate(trade);
                        const filename = `${trade.entry_date}.${trade.ticker}.md`;
                        files.push({ filename, content: markdown });
                    }
                    
                    ctx.markdownFiles = files;
                    return { fileCount: files.length, success: true };
                }
            },
            {
                name: 'save_trades',
                required: true,
                execute: async (ctx) => {
                    const outputDir = ctx.outputDir || 'trades';
                    
                    for (const file of ctx.markdownFiles) {
                        const filepath = `${outputDir}/${file.filename}`;
                        await this.vfs.writeFile(filepath, file.content);
                    }
                    
                    return { savedCount: ctx.markdownFiles.length, success: true };
                }
            },
            {
                name: 'update_index',
                required: true,
                execute: async (ctx) => {
                    // Load existing trades index
                    let tradesIndex = [];
                    try {
                        const indexContent = await this.vfs.readFile('data/trades-index.json');
                        tradesIndex = JSON.parse(indexContent);
                    } catch (e) {
                        // Index doesn't exist yet, start fresh
                    }
                    
                    // Add new trades to index
                    for (const trade of ctx.validTrades) {
                        // Check for duplicates
                        const exists = tradesIndex.some(t => 
                            t.ticker === trade.ticker && 
                            t.entry_date === trade.entry_date
                        );
                        
                        if (!exists) {
                            tradesIndex.push(trade);
                        }
                    }
                    
                    // Save updated index
                    await this.vfs.writeFile('data/trades-index.json', JSON.stringify(tradesIndex, null, 2));
                    
                    ctx.updatedIndex = tradesIndex;
                    return { totalTrades: tradesIndex.length, success: true };
                }
            },
            {
                name: 'trigger_pipeline',
                required: false,
                execute: async (ctx) => {
                    if (ctx.skipPipeline) {
                        return { skipped: true, success: true };
                    }
                    
                    // Trigger trade pipeline workflow
                    const { TradePipelineWorkflow } = await import('./trade_pipeline.js');
                    const pipeline = new TradePipelineWorkflow(this.engine, this.vfs);
                    const result = await pipeline.execute();
                    
                    return { pipelineResult: result, success: true };
                }
            }
        ];

        this.engine.registerWorkflow('import', steps);
    }

    /**
     * Execute the import workflow
     * @param {string} csvContent - CSV file content
     * @param {Object} options - Import options
     * @returns {Promise<Object>} Import results
     */
    async execute(csvContent, options = {}) {
        return await this.engine.executeWorkflow('import', {
            csvContent,
            vfs: this.vfs,
            ...options
        });
    }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImportWorkflow };
}
