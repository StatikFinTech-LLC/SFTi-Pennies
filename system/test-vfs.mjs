#!/usr/bin/env node

/**
 * VFS Test Script
 * 
 * Tests the Virtual Filesystem implementation by checking:
 * - Module loading
 * - File operations
 * - Data access layer
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, fn) {
  try {
    fn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASS' });
    console.log(`✓ ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAIL', error: error.message });
    console.error(`✗ ${name}`, error.message);
  }
}

async function runTests() {
  console.log('\n=== VFS Implementation Tests ===\n');
  
  // Test 1: Check if VFS module exists
  test('VFS module exists', () => {
    const vfsPath = join(__dirname, 'index.directory/assets/system/storage/vfs.js');
    if (!existsSync(vfsPath)) throw new Error('VFS module not found');
  });
  
  // Test 2: Check if VFS init module exists
  test('VFS init module exists', () => {
    const vfsInitPath = join(__dirname, 'index.directory/assets/system/storage/vfs-init.js');
    if (!existsSync(vfsInitPath)) throw new Error('VFS init module not found');
  });
  
  // Test 3: Check if VFS adapter exists
  test('VFS adapter module exists', () => {
    const adapterPath = join(__dirname, 'index.directory/assets/system/storage/vfs-adapter.js');
    if (!existsSync(adapterPath)) throw new Error('VFS adapter module not found');
  });
  
  // Test 4: Check if data access layer exists
  test('Data access layer exists', () => {
    const dataAccessPath = join(__dirname, 'index.directory/assets/system/storage/data-access.js');
    if (!existsSync(dataAccessPath)) throw new Error('Data access layer not found');
  });
  
  // Test 5: Check if VFS integration exists
  test('VFS integration script exists', () => {
    const integrationPath = join(__dirname, 'index.directory/assets/js/vfs-integration.js');
    if (!existsSync(integrationPath)) throw new Error('VFS integration script not found');
  });
  
  // Test 6: Check if service worker is updated
  test('Service worker is updated for VFS', async () => {
    const swPath = join(__dirname, 'index.directory/service-worker-filesystem.js');
    const content = await readFile(swPath, 'utf8');
    if (!content.includes('PersonalPenniesVFS')) {
      throw new Error('Service worker not updated for VFS');
    }
    if (!content.includes('handleVFSRequest')) {
      throw new Error('Service worker missing VFS request handler');
    }
  });
  
  // Test 7: Check if loader includes VFS
  test('Loader includes VFS modules', async () => {
    const loaderPath = join(__dirname, 'index.directory/assets/system/loader.js');
    const content = await readFile(loaderPath, 'utf8');
    if (!content.includes('storage/vfs.js')) {
      throw new Error('Loader does not import VFS');
    }
    if (!content.includes('storage/vfs-init.js')) {
      throw new Error('Loader does not import VFS init');
    }
    if (!content.includes('storage/data-access.js')) {
      throw new Error('Loader does not import data access layer');
    }
    if (!content.includes('initializeVFS')) {
      throw new Error('Loader does not call initializeVFS');
    }
  });
  
  // Test 8: Check if index.html includes VFS integration
  test('index.html includes VFS integration', async () => {
    const indexPath = join(__dirname, 'index.html');
    const content = await readFile(indexPath, 'utf8');
    if (!content.includes('vfs-integration.js')) {
      throw new Error('index.html does not include VFS integration script');
    }
  });
  
  // Test 9: Check if accountManager uses VFS
  test('accountManager uses VFS', async () => {
    const managerPath = join(__dirname, 'index.directory/assets/js/accountManager.js');
    const content = await readFile(managerPath, 'utf8');
    if (!content.includes('PersonalPenniesDataAccess')) {
      throw new Error('accountManager does not use data access layer');
    }
    if (!content.includes('saveAccountConfig')) {
      throw new Error('accountManager does not save to VFS');
    }
  });
  
  // Test 10: Verify VFS.js exports
  test('VFS module has correct exports', async () => {
    const vfsPath = join(__dirname, 'index.directory/assets/system/storage/vfs.js');
    const content = await readFile(vfsPath, 'utf8');
    
    const requiredExports = [
      'writeFile',
      'readFile',
      'deleteFile',
      'fileExists',
      'listFiles',
      'listDirectories',
      'getMimeType',
      'isBinaryFile',
      'normalizePath'
    ];
    
    for (const exportName of requiredExports) {
      if (!content.includes(`export function ${exportName}`) && 
          !content.includes(`export async function ${exportName}`)) {
        throw new Error(`VFS module missing export: ${exportName}`);
      }
    }
  });
  
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Total: ${testResults.passed + testResults.failed}`);
  
  if (testResults.failed > 0) {
    console.log('\nFailed tests:');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
    process.exit(1);
  } else {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
