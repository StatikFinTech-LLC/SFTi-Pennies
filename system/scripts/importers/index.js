#!/usr/bin/env node
/**
 * Broker CSV Importers Package
 * Registry and management for broker-specific CSV importers
 * 
 * This module provides a centralized registry for broker-specific CSV importers,
 * allowing easy registration, retrieval, and listing of supported brokers.
 * 
 * This is a comprehensive JavaScript translation of importers/__init__.py with full feature parity.
 */

// Registry of available broker importers
const BROKER_REGISTRY = {};

/**
 * Register a broker importer
 * 
 * Python equivalent: register_broker(name, importer_class)
 * 
 * @param {string} name - Broker name (e.g., 'ibkr', 'schwab')
 * @param {class} importerClass - Importer class that extends BaseImporter
 */
function registerBroker(name, importerClass) {
    BROKER_REGISTRY[name.toLowerCase()] = importerClass;
}

/**
 * Get importer instance for a broker
 * 
 * Python equivalent: get_importer(broker_name)
 * 
 * @param {string} brokerName - Broker name
 * @returns {Object|null} BaseImporter instance or null if not found
 */
function getImporter(brokerName) {
    const importerClass = BROKER_REGISTRY[brokerName.toLowerCase()];
    if (importerClass) {
        return new importerClass();
    }
    return null;
}

/**
 * List all registered brokers
 * 
 * Python equivalent: list_brokers()
 * 
 * @returns {Array} List of broker names
 */
function listBrokers() {
    return Object.keys(BROKER_REGISTRY);
}

// Import and register broker implementations
// All broker importers are now available
try {
    const IBKRImporter = require('./ibkr');
    registerBroker('ibkr', IBKRImporter);
} catch (error) {
    console.log('Note: IBKR importer not yet available');
}

try {
    const SchwabImporter = require('./schwab');
    registerBroker('schwab', SchwabImporter);
} catch (error) {
    console.log('Note: Schwab importer not yet available');
}

try {
    const RobinhoodImporter = require('./robinhood');
    registerBroker('robinhood', RobinhoodImporter);
} catch (error) {
    console.log('Note: Robinhood importer not yet available');
}

try {
    const WebullImporter = require('./webull');
    registerBroker('webull', WebullImporter);
} catch (error) {
    console.log('Note: Webull importer not yet available');
}

module.exports = {
    BROKER_REGISTRY,
    registerBroker,
    getImporter,
    listBrokers
};
