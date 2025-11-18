#!/usr/bin/env node
/**
 * Attach Media Script
 * Validates and reconciles media file references in trade metadata
 * 
 * This script provides media management functionality:
 * 1. Scans index.directory/assets/trade-images/ for images
 * 2. Validates that trade metadata references are correct
 * 3. Updates trade markdown frontmatter with image paths
 * 4. Reports orphaned images (not linked to any trade)
 * 5. Validates image files (existence, format, size)
 * 
 * This is a comprehensive JavaScript translation of attach_media.py with full feature parity.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Scan for trade images in assets/trade-images/
 * 
 * Python equivalent: scan_trade_images()
 * Uses: glob.glob() for file pattern matching
 * 
 * @returns {Object} {trade_id: [image_paths]}
 */
function scanTradeImages() {
    const imagesDir = 'index.directory/assets/trade-images';
    
    if (!fsSync.existsSync(imagesDir)) {
        console.log(`Images directory not found: ${imagesDir}`);
        return {};
    }
    
    const tradeImages = {};
    
    try {
        // Scan subdirectories (organized by trade_id)
        const entries = fsSync.readdirSync(imagesDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (!entry.isDirectory()) {
                continue;
            }
            
            const tradeId = entry.name;
            const tradeDir = path.join(imagesDir, tradeId);
            const images = [];
            
            // Find all image files
            const extensions = ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.webp'];
            for (const ext of extensions) {
                const pattern = path.join(tradeDir, ext);
                const matches = glob.sync(pattern);
                images.push(...matches);
            }
            
            if (images.length > 0) {
                tradeImages[tradeId] = images.sort();
            }
        }
    } catch (error) {
        console.log(`Error scanning images directory: ${error.message}`);
    }
    
    return tradeImages;
}

/**
 * Validate that an image file exists and is accessible
 * 
 * Python equivalent: validate_image_references(trade, image_path)
 * 
 * @param {Object} trade - Trade dictionary
 * @param {string} imagePath - Path to image
 * @returns {Array} [isValid: boolean, message: string|null]
 */
function validateImageReferences(trade, imagePath) {
    if (!fsSync.existsSync(imagePath)) {
        return [false, `Image file does not exist: ${imagePath}`];
    }
    
    // Check file size (warn if > 5MB, but still valid)
    let warningMessage = null;
    try {
        const stats = fsSync.statSync(imagePath);
        const fileSize = stats.size;
        if (fileSize > 5 * 1024 * 1024) {  // 5MB
            warningMessage = `Warning: Large image file (${(fileSize / (1024 * 1024)).toFixed(1)}MB)`;
        }
    } catch (error) {
        return [false, `Cannot read file size: ${error.message}`];
    }
    
    // Verify image format by extension
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(imagePath).toLowerCase();
    if (!validExtensions.includes(ext)) {
        return [false, `Unsupported image format: ${ext}`];
    }
    
    // Check read permissions
    try {
        fsSync.accessSync(imagePath, fsSync.constants.R_OK);
    } catch (error) {
        return [false, `File is not readable: ${imagePath}`];
    }
    
    return [true, warningMessage];
}

/**
 * Update trade markdown frontmatter with image references
 * 
 * Python equivalent: update_trade_metadata(trade_file_path, image_paths)
 * 
 * @param {string} tradeFilePath - Path to trade markdown file
 * @param {Array} imagePaths - List of image paths
 * @returns {boolean} True if successful, False otherwise
 */
function updateTradeMetadata(tradeFilePath, imagePaths) {
    try {
        // Read markdown file
        const content = fsSync.readFileSync(tradeFilePath, 'utf-8');
        
        // Split frontmatter and body
        if (!content.startsWith('---')) {
            console.log(`  ⚠️  No frontmatter found in ${tradeFilePath}`);
            return false;
        }
        
        const parts = content.split('---');
        if (parts.length < 3) {
            console.log(`  ⚠️  Invalid frontmatter format in ${tradeFilePath}`);
            return false;
        }
        
        const frontmatter = parts[1];
        const body = parts.slice(2).join('---');
        
        // Parse YAML-like frontmatter (simple parsing for images field)
        const lines = frontmatter.split('\n');
        const newLines = [];
        let inImagesSection = false;
        let imagesUpdated = false;
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('images:') || trimmed.startsWith('screenshots:')) {
                inImagesSection = true;
                newLines.push('screenshots:');
                // Add image paths
                for (const imgPath of imagePaths) {
                    newLines.push(`  - ${imgPath}`);
                }
                imagesUpdated = true;
            } else if (inImagesSection && (line.startsWith('  -') || !trimmed)) {
                // Skip old image entries
                if (!trimmed) {
                    inImagesSection = false;
                }
                continue;
            } else {
                inImagesSection = false;
                newLines.push(line);
            }
        }
        
        // If no images field existed, add it
        if (!imagesUpdated) {
            newLines.push('screenshots:');
            for (const imgPath of imagePaths) {
                newLines.push(`  - ${imgPath}`);
            }
        }
        
        // Reconstruct file content
        const newFrontmatter = newLines.join('\n');
        const newContent = `---${newFrontmatter}---${body}`;
        
        // Write back to file
        fsSync.writeFileSync(tradeFilePath, newContent, 'utf-8');
        
        console.log(`  ✓ Updated ${tradeFilePath} with ${imagePaths.length} image(s)`);
        return true;
        
    } catch (error) {
        console.log(`  ❌ Error updating ${tradeFilePath}: ${error.message}`);
        return false;
    }
}

/**
 * Find images that are not linked to any trade
 * 
 * Python equivalent: find_orphaned_images(trade_images, trades)
 * 
 * @param {Object} tradeImages - {trade_id: [image_paths]}
 * @param {Array} trades - List of trade dictionaries
 * @returns {Array} List of orphaned image paths
 */
function findOrphanedImages(tradeImages, trades) {
    // Get all trade IDs from trades
    const tradeIds = new Set();
    for (const t of trades) {
        const tradeNum = t.trade_number || 0;
        const tradeId = `trade-${String(tradeNum).padStart(3, '0')}`;
        tradeIds.add(tradeId);
    }
    
    const orphaned = [];
    for (const [tradeId, images] of Object.entries(tradeImages)) {
        if (!tradeIds.has(tradeId)) {
            orphaned.push(...images);
        }
    }
    
    return orphaned;
}

/**
 * Generate a validation report HTML file
 * 
 * Python equivalent: generate_validation_report(trade_images, trades, orphaned, updated_files)
 * 
 * @param {Object} tradeImages - {trade_id: [image_paths]}
 * @param {Array} trades - List of trade dictionaries
 * @param {Array} orphaned - List of orphaned image paths
 * @param {Array} updatedFiles - List of updated trade files
 * @returns {string} Path to generated report
 */
function generateValidationReport(tradeImages, trades, orphaned, updatedFiles) {
    const totalImages = Object.values(tradeImages).reduce((sum, imgs) => sum + imgs.length, 0);
    
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Generate linked images section
    const linkedImagesHtml = Object.entries(tradeImages).map(([tradeId, images]) => `
            <div class="trade-item">
                <strong>${tradeId}</strong> (${images.length} image${images.length !== 1 ? 's' : ''})
                <div class="image-list">
                    ${images.map(img => `<div class="image-item">• ${img}</div>`).join('')}
                </div>
            </div>
            `).join('');
    
    // Generate orphaned images section
    let orphanedSection;
    if (orphaned.length > 0) {
        orphanedSection = `
        <div class="section">
            <h2 class="warning">⚠️ Orphaned Images</h2>
            <p style="color: #9ca3af; margin-bottom: 1rem;">
                These images are not linked to any trade. They may be from deleted trades or incorrectly named directories.
            </p>
            <div class="image-list">
                ${orphaned.map(img => `<div class="image-item warning">• ${img}</div>`).join('')}
            </div>
        </div>
        `;
    } else {
        orphanedSection = `<div class="section"><h2 class="success">✓ No Orphaned Images</h2><p style="color: #9ca3af;">All images are properly linked to trades.</p></div>`;
    }
    
    // Generate updated files section
    let updatedFilesSection = '';
    if (updatedFiles.length > 0) {
        updatedFilesSection = `
        <div class="section">
            <h2 class="success">✓ Updated Trade Files</h2>
            <div class="image-list">
                ${updatedFiles.map(f => `<div class="image-item success">• ${f}</div>`).join('')}
            </div>
        </div>
        `;
    }
    
    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Media Validation Report - SFTi-Pennies</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #0a0e1a;
            color: #e4e4e7;
            padding: 2rem;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #00ff88;
            margin-bottom: 0.5rem;
        }
        .summary {
            background: #1a1f2e;
            padding: 1.5rem;
            border-radius: 8px;
            margin: 1.5rem 0;
            border-left: 4px solid #00ff88;
        }
        .stat {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
        }
        .stat-label {
            color: #9ca3af;
        }
        .stat-value {
            font-weight: 600;
            color: #00ff88;
        }
        .section {
            background: #1a1f2e;
            padding: 1.5rem;
            border-radius: 8px;
            margin: 1.5rem 0;
        }
        .section h2 {
            color: #ffd700;
            margin-bottom: 1rem;
        }
        .trade-item {
            background: #0f1420;
            padding: 1rem;
            border-radius: 6px;
            margin: 0.75rem 0;
        }
        .image-list {
            margin-top: 0.5rem;
            padding-left: 1rem;
        }
        .image-item {
            color: #9ca3af;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.875rem;
            padding: 0.25rem 0;
        }
        .warning {
            color: #ff4757;
        }
        .success {
            color: #00ff88;
        }
        .timestamp {
            color: #9ca3af;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📸 Media Validation Report</h1>
        <p class="timestamp">Generated: ${timestamp}</p>
        
        <div class="summary">
            <h2 style="margin-top: 0;">Summary</h2>
            <div class="stat">
                <span class="stat-label">Total Images:</span>
                <span class="stat-value">${totalImages}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Trades with Images:</span>
                <span class="stat-value">${Object.keys(tradeImages).length}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Orphaned Images:</span>
                <span class="stat-value ${orphaned.length > 0 ? 'warning' : 'success'}">${orphaned.length}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Updated Files:</span>
                <span class="stat-value">${updatedFiles.length}</span>
            </div>
        </div>
        
        <div class="section">
            <h2>✓ Linked Images</h2>
            ${linkedImagesHtml}
        </div>
        
        ${orphanedSection}
        
        ${updatedFilesSection}
    </div>
</body>
</html>
`;
    
    // Write report to file
    const reportPath = 'index.directory/media-validation-report.html';
    fsSync.writeFileSync(reportPath, reportHtml, 'utf-8');
    
    console.log(`\n✓ Generated validation report: ${reportPath}`);
    return reportPath;
}

/**
 * Main execution function
 * 
 * Python equivalent: main()
 */
function main() {
    console.log('='.repeat(60));
    console.log('SFTi-Pennies Media Attachment Validator');
    console.log('='.repeat(60));
    
    // Scan for images
    console.log('\n[Step 1/4] Scanning for trade images...');
    const tradeImages = scanTradeImages();
    
    if (Object.keys(tradeImages).length === 0) {
        console.log('No trade images found in index.directory/assets/trade-images/');
        console.log('Images should be organized in subdirectories like:');
        console.log('  index.directory/assets/trade-images/trade-001/screenshot1.png');
        console.log('  index.directory/assets/trade-images/trade-001/screenshot2.png');
        return;
    }
    
    const totalImages = Object.values(tradeImages).reduce((sum, imgs) => sum + imgs.length, 0);
    console.log(`Found ${totalImages} image(s) across ${Object.keys(tradeImages).length} trade(s)`);
    
    for (const [tradeId, images] of Object.entries(tradeImages)) {
        console.log(`  ${tradeId}: ${images.length} image(s)`);
    }
    
    // Load trades
    console.log('\n[Step 2/4] Loading trades index...');
    let trades = [];
    try {
        const content = fsSync.readFileSync('index.directory/trades-index.json', 'utf-8');
        const indexData = JSON.parse(content);
        trades = indexData.trades || [];
        console.log(`Loaded ${trades.length} trade(s)`);
    } catch (error) {
        console.log('Error: trades-index.json not found');
        return;
    }
    
    // Find orphaned images
    console.log('\n[Step 3/4] Checking for orphaned images...');
    const orphaned = findOrphanedImages(tradeImages, trades);
    
    if (orphaned.length > 0) {
        console.log(`⚠️  Found ${orphaned.length} orphaned image(s):`);
        for (const img of orphaned) {
            console.log(`  - ${img}`);
        }
    } else {
        console.log('✓ No orphaned images found');
    }
    
    // Update trade metadata
    console.log('\n[Step 4/4] Updating trade metadata...');
    const updatedFiles = [];
    
    for (const trade of trades) {
        const tradeNumber = trade.trade_number || 0;
        const tradeId = `trade-${String(tradeNumber).padStart(3, '0')}`;
        
        if (tradeId in tradeImages) {
            // Find trade markdown file
            const pattern = `index.directory/SFTi.Tradez/**/trade-${String(tradeNumber).padStart(3, '0')}*.md`;
            const tradeFiles = glob.sync(pattern);
            
            if (tradeFiles.length > 0) {
                const tradeFile = tradeFiles[0];
                // Convert image paths to relative paths from trade file location
                const relativeImages = [];
                for (const imgPath of tradeImages[tradeId]) {
                    // Make path relative to trade file
                    const relPath = path.relative(path.dirname(tradeFile), imgPath);
                    relativeImages.push(relPath);
                }
                
                if (updateTradeMetadata(tradeFile, relativeImages)) {
                    updatedFiles.push(tradeFile);
                }
            } else {
                console.log(`  ⚠️  Trade file not found for ${tradeId}`);
            }
        }
    }
    
    // Generate validation report
    console.log('\n[Report] Generating validation report...');
    const reportPath = generateValidationReport(tradeImages, trades, orphaned, updatedFiles);
    
    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log(`  Total images: ${totalImages}`);
    console.log(`  Linked trades: ${Object.keys(tradeImages).length}`);
    console.log(`  Orphaned images: ${orphaned.length}`);
    console.log(`  Updated files: ${updatedFiles.length}`);
    console.log(`  Report: ${reportPath}`);
    console.log('='.repeat(60));
}

// Run main if executed directly
if (require.main === module) {
    main();
}

module.exports = {
    main,
    scanTradeImages,
    validateImageReferences,
    updateTradeMetadata,
    findOrphanedImages,
    generateValidationReport
};

// ES Module exports for browser compatibility
export { main,scanTradeImages,validateImageReferences,updateTradeMetadata,findOrphanedImages,generateValidationReport };
