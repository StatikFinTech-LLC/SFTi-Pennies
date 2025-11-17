#!/usr/bin/env node
/**
 * Test Imports Script
 * Validates that all JavaScript files are properly wired with global awareness and accessibility
 * Tests for silent failures in imports and functions
 * 
 * This is a comprehensive JavaScript translation of test_imports.py with full feature parity.
 */

const path = require('path');
const fs = require('fs');

// Constants
const ERROR_MESSAGE_MAX_LENGTH = 100;

/**
 * Test if a JavaScript file can be imported without errors
 * 
 * Python equivalent: test_file_import(file_path, base_dir)
 * Uses: importlib.util for dynamic imports
 * Note: JavaScript uses require() for dynamic imports
 * 
 * @param {string} filePath - Path to JavaScript file relative to base_dir
 * @param {string} baseDir - Base directory containing the JavaScript files
 * @returns {Object} Object with {success: boolean, message: string}
 */
function testFileImport(filePath, baseDir) {
    try {
        const fullPath = path.join(baseDir, filePath);
        
        if (!fs.existsSync(fullPath)) {
            return { success: false, message: `File not found: ${filePath}` };
        }
        
        // Try to require the module
        const module = require(fullPath);
        
        return { success: true, message: `Successfully imported ${filePath}` };
        
    } catch (error) {
        const errorMsg = error.message.substring(0, ERROR_MESSAGE_MAX_LENGTH);
        return { success: false, message: `Error importing ${filePath}: ${errorMsg}` };
    }
}

/**
 * Test utils.js functions are accessible
 * 
 * Python equivalent: test_utils_functions()
 */
function testUtilsFunctions() {
    try {
        const utils = require('./utils');
        
        const requiredFunctions = ['loadTradesIndex', 'loadAccountConfig'];
        
        for (const funcName of requiredFunctions) {
            if (!(funcName in utils)) {
                return { success: false, message: `Missing function: utils.${funcName}` };
            }
            if (typeof utils[funcName] !== 'function') {
                return { success: false, message: `Not callable: utils.${funcName}` };
            }
        }
        
        return { success: true, message: 'All utils functions accessible' };
    } catch (error) {
        return { success: false, message: `Error testing utils: ${error.message}` };
    }
}

/**
 * Test importers package is properly wired
 * 
 * Python equivalent: test_importers_package()
 */
function testImportersPackage() {
    try {
        const importers = require('./importers/index');
        
        // Check registry functions
        const requiredAttrs = ['BROKER_REGISTRY', 'registerBroker', 'getImporter', 'listBrokers'];
        
        for (const attr of requiredAttrs) {
            if (!(attr in importers)) {
                return { success: false, message: `Missing attribute: importers.${attr}` };
            }
        }
        
        // Check all brokers are registered
        const expectedBrokers = ['ibkr', 'schwab', 'robinhood', 'webull'];
        const registeredBrokers = importers.listBrokers();
        
        for (const broker of expectedBrokers) {
            if (!registeredBrokers.includes(broker)) {
                return { success: false, message: `Broker not registered: ${broker}` };
            }
            
            const importer = importers.getImporter(broker);
            if (importer === null) {
                return { success: false, message: `Cannot get importer for: ${broker}` };
            }
        }
        
        return { success: true, message: `All brokers registered: ${registeredBrokers.join(', ')}` };
    } catch (error) {
        return { success: false, message: `Error testing importers: ${error.message}` };
    }
}

/**
 * Test BaseImporter class
 * 
 * Python equivalent: test_base_importer()
 */
function testBaseImporter() {
    try {
        const { BaseImporter } = require('./importers/base_importer');
        
        const requiredMethods = [
            'detectFormat', 'parseCsv', 'validateTrade',
            'getBrokerName', 'getSupportedFormats', 'getSampleMapping'
        ];
        
        for (const method of requiredMethods) {
            if (!(method in BaseImporter.prototype)) {
                return { success: false, message: `Missing method: BaseImporter.${method}` };
            }
        }
        
        return { success: true, message: `BaseImporter has all ${requiredMethods.length} required methods` };
    } catch (error) {
        return { success: false, message: `Error testing BaseImporter: ${error.message}` };
    }
}

/**
 * Main test execution
 * 
 * Python equivalent: main()
 */
function main() {
    console.log('='.repeat(70));
    console.log('JavaScript Import and Accessibility Test');
    console.log('='.repeat(70));
    
    // Get base directory
    const baseDir = __dirname;
    process.chdir(baseDir);
    
    // List of all JavaScript files to test
    const jsFiles = [
        'utils.js',
        'globals_utils.js',
        'navbar_template.js',
        'parse_trades.js',
        'import_csv.js',
        'export_csv.js',
        'generate_analytics.js',
        'generate_charts.js',
        'generate_index.js',
        'generate_summaries.js',
        'generate_trade_pages.js',
        'generate_week_summaries.js',
        'generate_books_index.js',
        'generate_notes_index.js',
        'update_homepage.js',
        'normalize_schema.js',
        'attach_media.js',
        'importers/index.js',
        'importers/base_importer.js',
        'importers/ibkr.js',
        'importers/schwab.js',
        'importers/robinhood.js',
        'importers/webull.js'
    ];
    
    // Test 1: Import all JavaScript files
    console.log('\n[Test 1] Testing all JavaScript file imports...');
    console.log('-'.repeat(70));
    
    const failedTests = [];
    for (const filePath of jsFiles) {
        const { success, message } = testFileImport(filePath, baseDir);
        const status = success ? '✓' : '✗';
        console.log(`${status} ${filePath}`);
        
        if (!success) {
            failedTests.push(message);
        }
    }
    
    // Test 2: Test utils functions
    console.log('\n[Test 2] Testing utils.js functions...');
    console.log('-'.repeat(70));
    let result = testUtilsFunctions();
    let status = result.success ? '✓' : '✗';
    console.log(`${status} ${result.message}`);
    if (!result.success) {
        failedTests.push(result.message);
    }
    
    // Test 3: Test importers package (skip if not implemented yet)
    console.log('\n[Test 3] Testing importers package...');
    console.log('-'.repeat(70));
    result = testImportersPackage();
    status = result.success ? '✓' : '✗';
    console.log(`${status} ${result.message}`);
    if (!result.success) {
        failedTests.push(result.message);
    }
    
    // Test 4: Test BaseImporter (skip if not implemented yet)
    console.log('\n[Test 4] Testing BaseImporter class...');
    console.log('-'.repeat(70));
    result = testBaseImporter();
    status = result.success ? '✓' : '✗';
    console.log(`${status} ${result.message}`);
    if (!result.success) {
        failedTests.push(result.message);
    }
    
    // Print results
    console.log('\n' + '='.repeat(70));
    console.log('TEST RESULTS');
    console.log('='.repeat(70));
    const successfulImports = jsFiles.filter(f => testFileImport(f, baseDir).success).length;
    console.log(`Total files tested: ${jsFiles.length}`);
    console.log(`Successful imports: ${successfulImports}`);
    console.log(`Failed tests: ${failedTests.length}`);
    
    if (failedTests.length > 0) {
        console.log('\n⚠️  Failed tests:');
        failedTests.forEach((failure, i) => {
            console.log(`  ${i + 1}. ${failure}`);
        });
        console.log('\n' + '='.repeat(70));
        process.exit(1);
    } else {
        console.log('\n' + '='.repeat(70));
        console.log('✓✓✓ ALL TESTS PASSED! ✓✓✓');
        console.log('='.repeat(70));
        console.log('✓ All JavaScript files are properly wired');
        console.log('✓ Global awareness and accessibility verified');
        console.log('✓ No silent failures detected');
        console.log('='.repeat(70));
        process.exit(0);
    }
}

// Run main if executed directly
if (require.main === module) {
    main();
}

module.exports = {
    testFileImport,
    testUtilsFunctions,
    testImportersPackage,
    testBaseImporter,
    main
};
