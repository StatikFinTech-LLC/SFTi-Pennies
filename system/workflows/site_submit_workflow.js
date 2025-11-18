/**
 * Site Submit Workflow - Browser-Based Trade Submission
 * 
 * Orchestrates trade submission workflow in the browser:
 * 1. Validate submission data
 * 2. Generate trade markdown
 * 3. Upload images
 * 4. Create branch (if needed)
 * 5. Commit changes
 * 6. Create pull request (if enabled)
 * 
 * Python equivalent: .github/workflows/site-submit.yml
 */

/**
 * Site Submit Workflow
 * Executes trade submission from browser forms
 */
class SiteSubmitWorkflow {
    constructor(workflowEngine, vfs) {
        this.engine = workflowEngine;
        this.vfs = vfs;
        this._registerWorkflow();
    }

    /**
     * Register the site submit workflow
     * @private
     */
    _registerWorkflow() {
        const steps = [
            {
                name: 'validate_submission',
                required: true,
                execute: async (ctx) => {
                    const requiredFields = ['ticker', 'entry_date', 'entry_price', 'exit_price', 
                                          'position_size', 'direction'];
                    
                    const missing = requiredFields.filter(field => !ctx.trade[field]);
                    
                    if (missing.length > 0) {
                        throw new Error(`Missing required fields: ${missing.join(', ')}`);
                    }
                    
                    return { validated: true, success: true };
                }
            },
            {
                name: 'generate_markdown',
                required: true,
                execute: async (ctx) => {
                    const { renderTradeTemplate } = await import('../templates/template_engine.js');
                    const markdown = await renderTradeTemplate(ctx.trade);
                    ctx.markdown = markdown;
                    return { length: markdown.length, success: true };
                }
            },
            {
                name: 'upload_images',
                required: false,
                execute: async (ctx) => {
                    if (!ctx.images || ctx.images.length === 0) {
                        return { uploaded: 0, success: true };
                    }
                    
                    const imagePaths = [];
                    for (const image of ctx.images) {
                        // Generate unique filename
                        const timestamp = Date.now();
                        const filename = `${ctx.trade.ticker}_${timestamp}_${image.name}`;
                        const filepath = `assets/trade-images/${filename}`;
                        
                        // Save image to VFS
                        await this.vfs.writeFile(filepath, image.data);
                        imagePaths.push(filepath);
                    }
                    
                    ctx.imagePaths = imagePaths;
                    ctx.trade.images = imagePaths;
                    
                    return { uploaded: imagePaths.length, success: true };
                }
            },
            {
                name: 'save_trade',
                required: true,
                execute: async (ctx) => {
                    // Generate filename
                    const date = ctx.trade.entry_date.replace(/\//g, '-');
                    const filename = `${date}.${ctx.trade.ticker}.md`;
                    const filepath = `trades/${filename}`;
                    
                    // If images were uploaded, update markdown with image references
                    let markdown = ctx.markdown;
                    if (ctx.imagePaths && ctx.imagePaths.length > 0) {
                        const { renderTradeTemplate } = await import('../templates/template_engine.js');
                        markdown = await renderTradeTemplate(ctx.trade);
                    }
                    
                    // Save trade file
                    await this.vfs.writeFile(filepath, markdown);
                    
                    ctx.savedPath = filepath;
                    return { filepath, success: true };
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
                        // Index doesn't exist yet
                    }
                    
                    // Add new trade
                    const exists = tradesIndex.some(t => 
                        t.ticker === ctx.trade.ticker && 
                        t.entry_date === ctx.trade.entry_date
                    );
                    
                    if (!exists) {
                        tradesIndex.push(ctx.trade);
                    }
                    
                    // Save index
                    await this.vfs.writeFile('data/trades-index.json', JSON.stringify(tradesIndex, null, 2));
                    
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
                    
                    // Trigger trade pipeline
                    const { TradePipelineWorkflow } = await import('./trade_pipeline.js');
                    const pipeline = new TradePipelineWorkflow(this.engine, this.vfs);
                    const result = await pipeline.execute();
                    
                    return { pipelineResult: result, success: true };
                }
            },
            {
                name: 'create_pull_request',
                required: false,
                execute: async (ctx) => {
                    if (!ctx.createPR) {
                        return { skipped: true, success: true };
                    }
                    
                    // This would integrate with GitHub API if credentials available
                    // For now, just prepare PR metadata
                    const prData = {
                        title: `Add trade: ${ctx.trade.ticker} on ${ctx.trade.entry_date}`,
                        body: `**Trade Details:**\n- Ticker: ${ctx.trade.ticker}\n- P&L: $${ctx.trade.pnl_usd} (${ctx.trade.pnl_percent}%)\n- Direction: ${ctx.trade.direction}`,
                        branch: `trade/${ctx.trade.ticker}-${Date.now()}`,
                        files: [ctx.savedPath, ...(ctx.imagePaths || [])]
                    };
                    
                    ctx.prData = prData;
                    
                    return { prData, success: true };
                }
            }
        ];

        this.engine.registerWorkflow('site_submit', steps);
    }

    /**
     * Execute the site submit workflow
     * @param {Object} trade - Trade data from form
     * @param {Array} images - Image files (optional)
     * @param {Object} options - Submit options
     * @returns {Promise<Object>} Submit results
     */
    async execute(trade, images = [], options = {}) {
        return await this.engine.executeWorkflow('site_submit', {
            trade,
            images,
            vfs: this.vfs,
            ...options
        });
    }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SiteSubmitWorkflow };
}
