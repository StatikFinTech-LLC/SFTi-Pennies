/**
 * Trade Pipeline Workflow - Browser-Based Trade Processing
 * 
 * Orchestrates the complete trade processing pipeline in the browser:
 * 1. Parse trades from markdown files
 * 2. Generate analytics
 * 3. Generate charts data
 * 4. Generate summaries
 * 5. Generate trade pages
 * 6. Generate week summaries
 * 7. Generate index
 * 8. Update homepage
 * 9. Optimize images
 * 10. Save results
 * 
 * Python equivalent: .github/workflows/trade_pipeline.yml
 */

/**
 * Trade Pipeline Workflow
 * Executes the complete trade processing pipeline
 */
class TradePipelineWorkflow {
    constructor(workflowEngine, vfs) {
        this.engine = workflowEngine;
        this.vfs = vfs;
        this._registerWorkflow();
    }

    /**
     * Register the trade pipeline workflow
     * @private
     */
    _registerWorkflow() {
        const steps = [
            {
                name: 'parse_trades',
                required: true,
                execute: async (ctx) => {
                    // Import and execute parse_trades.js
                    const { parseTrades } = await import('../scripts/parse_trades.js');
                    const trades = await parseTrades(this.vfs);
                    ctx.trades = trades;
                    return { tradeCount: trades.length, success: true };
                }
            },
            {
                name: 'generate_analytics',
                required: true,
                execute: async (ctx) => {
                    const { generateAnalytics } = await import('../scripts/generate_analytics.js');
                    const analytics = await generateAnalytics(ctx.trades, this.vfs);
                    ctx.analytics = analytics;
                    return { analytics, success: true };
                }
            },
            {
                name: 'generate_charts',
                required: true,
                execute: async (ctx) => {
                    const { generateCharts } = await import('../scripts/generate_charts.js');
                    const charts = await generateCharts(ctx.trades, ctx.analytics, this.vfs);
                    ctx.charts = charts;
                    return { chartCount: Object.keys(charts).length, success: true };
                }
            },
            {
                name: 'generate_summaries',
                required: true,
                execute: async (ctx) => {
                    const { generateSummaries } = await import('../scripts/generate_summaries.js');
                    const summaries = await generateSummaries(ctx.trades, this.vfs);
                    ctx.summaries = summaries;
                    return { summaryCount: Object.keys(summaries).length, success: true };
                }
            },
            {
                name: 'generate_trade_pages',
                required: true,
                execute: async (ctx) => {
                    const { generateTradePages } = await import('../scripts/generate_trade_pages.js');
                    const pages = await generateTradePages(ctx.trades, this.vfs);
                    ctx.tradePages = pages;
                    return { pageCount: pages.length, success: true };
                }
            },
            {
                name: 'generate_week_summaries',
                required: true,
                execute: async (ctx) => {
                    const { generateWeekSummaries } = await import('../scripts/generate_week_summaries.js');
                    const weekSummaries = await generateWeekSummaries(ctx.trades, this.vfs);
                    ctx.weekSummaries = weekSummaries;
                    return { weekCount: Object.keys(weekSummaries).length, success: true };
                }
            },
            {
                name: 'generate_index',
                required: true,
                execute: async (ctx) => {
                    const { generateIndex } = await import('../scripts/generate_index.js');
                    const index = await generateIndex(ctx.trades, this.vfs);
                    ctx.index = index;
                    return { success: true };
                }
            },
            {
                name: 'update_homepage',
                required: true,
                execute: async (ctx) => {
                    const { updateHomepage } = await import('../scripts/update_homepage.js');
                    await updateHomepage(ctx.trades, ctx.analytics, this.vfs);
                    return { success: true };
                }
            },
            {
                name: 'optimize_images',
                required: false,
                execute: async (ctx) => {
                    const { attachMedia } = await import('../scripts/attach_media.js');
                    const result = await attachMedia(ctx.trades, this.vfs);
                    return result;
                }
            },
            {
                name: 'save_results',
                required: true,
                execute: async (ctx) => {
                    // Save all generated data to VFS
                    await this.vfs.writeFile('data/trades-index.json', JSON.stringify(ctx.trades, null, 2));
                    await this.vfs.writeFile('data/analytics.json', JSON.stringify(ctx.analytics, null, 2));
                    await this.vfs.writeFile('data/charts.json', JSON.stringify(ctx.charts, null, 2));
                    return { success: true };
                }
            }
        ];

        this.engine.registerWorkflow('trade_pipeline', steps);
    }

    /**
     * Execute the trade pipeline
     * @param {Object} options - Pipeline options
     * @returns {Promise<Object>} Pipeline results
     */
    async execute(options = {}) {
        return await this.engine.executeWorkflow('trade_pipeline', {
            vfs: this.vfs,
            ...options
        });
    }
}

/**
 * Run the trade pipeline
 * Convenience function that creates workflow engine and executes pipeline
 */
async function runTradePipeline(options = {}) {
    console.log('[TradePipeline] Starting trade pipeline...');
    
    // Import dependencies
    const { WorkflowEngine } = await import('./workflow_engine.js');
    const VFS = window.PersonalPenniesSystem?.VFS;
    
    if (!VFS) {
        throw new Error('VFS not initialized');
    }
    
    // Create workflow engine and pipeline
    const engine = new WorkflowEngine();
    const pipeline = new TradePipelineWorkflow(engine, VFS);
    
    // Execute pipeline
    const results = await pipeline.execute(options);
    
    console.log('[TradePipeline] Pipeline completed:', results);
    return results;
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TradePipelineWorkflow, runTradePipeline };
}

// Browser export
export { TradePipelineWorkflow, runTradePipeline };
