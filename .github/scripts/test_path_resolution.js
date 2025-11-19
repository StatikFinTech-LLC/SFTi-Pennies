#!/usr/bin/env node

/**
 * Automated Path Resolution Tests
 * 
 * This test suite validates the path resolution logic used in notes.html and books.html
 * It ensures that paths are correctly transformed from JSON format to fetch-ready format.
 */

const assert = require('assert');

// Simulate the path cleaning logic from books.html and notes.html
function cleanFilePath(filepath) {
  let cleanPath = filepath.replace(/^\/+/, '');
  if (cleanPath.startsWith('index.directory/')) {
    cleanPath = cleanPath.substring('index.directory/'.length);
  }
  return './' + cleanPath;
}

function cleanImagePath(imgPath) {
  let cleanSrc = imgPath.replace(/^\/+/, '');
  if (cleanSrc.startsWith('../')) {
    cleanSrc = cleanSrc.substring(3);
  }
  return './' + cleanSrc;
}

// Test data
const testCases = {
  notes: [
    {
      input: 'index.directory/SFTi.Notez/7.Step.Frame.md',
      expected: './SFTi.Notez/7.Step.Frame.md',
      description: 'Note with index.directory prefix'
    },
    {
      input: 'SFTi.Notez/GSTRWT.md',
      expected: './SFTi.Notez/GSTRWT.md',
      description: 'Note without prefix'
    },
    {
      input: '/index.directory/SFTi.Notez/Trade.Plan.md',
      expected: './SFTi.Notez/Trade.Plan.md',
      description: 'Note with leading slash and prefix'
    }
  ],
  books: [
    {
      input: 'index.directory/Informational.Bookz/10_Patterns.pdf',
      expected: './Informational.Bookz/10_Patterns.pdf',
      description: 'Book with index.directory prefix'
    },
    {
      input: 'Informational.Bookz/20_Strategies.pdf',
      expected: './Informational.Bookz/20_Strategies.pdf',
      description: 'Book without prefix'
    },
    {
      input: '/index.directory/Informational.Bookz/Penny_Corse.pdf',
      expected: './Informational.Bookz/Penny_Corse.pdf',
      description: 'Book with leading slash and prefix'
    }
  ],
  images: [
    {
      input: '../assets/sfti.notez.assets/7.step.framework.assets/Step.1.png',
      expected: './assets/sfti.notez.assets/7.step.framework.assets/Step.1.png',
      description: 'Image with ../ prefix'
    },
    {
      input: 'assets/sfti.notez.assets/trade.plan.assets/Trade_Plan.png',
      expected: './assets/sfti.notez.assets/trade.plan.assets/Trade_Plan.png',
      description: 'Image without ../ prefix'
    },
    {
      input: '/assets/some-image.png',
      expected: './assets/some-image.png',
      description: 'Image with leading slash'
    }
  ]
};

// Edge cases for directory structure changes
const edgeCases = [
  {
    input: 'index.directory/index.directory/nested.md',
    expected: './index.directory/nested.md',
    description: 'Double nested index.directory (edge case)'
  },
  {
    input: '',
    expected: './',
    description: 'Empty path'
  },
  {
    input: '//multiple///slashes/file.pdf',
    expected: './multiple///slashes/file.pdf',
    description: 'Multiple leading slashes'
  }
];

// Run tests
let passed = 0;
let failed = 0;

console.log('🧪 Running Automated Path Resolution Tests\n');
console.log('═'.repeat(60));

// Test notes
console.log('\n📝 Testing Note File Paths:');
testCases.notes.forEach(test => {
  const result = cleanFilePath(test.input);
  try {
    assert.strictEqual(result, test.expected);
    console.log(`  ✅ ${test.description}`);
    console.log(`     Input:    ${test.input}`);
    console.log(`     Expected: ${test.expected}`);
    console.log(`     Got:      ${result}\n`);
    passed++;
  } catch (error) {
    console.log(`  ❌ ${test.description}`);
    console.log(`     Input:    ${test.input}`);
    console.log(`     Expected: ${test.expected}`);
    console.log(`     Got:      ${result}\n`);
    failed++;
  }
});

// Test books
console.log('\n📚 Testing Book File Paths:');
testCases.books.forEach(test => {
  const result = cleanFilePath(test.input);
  try {
    assert.strictEqual(result, test.expected);
    console.log(`  ✅ ${test.description}`);
    console.log(`     Input:    ${test.input}`);
    console.log(`     Expected: ${test.expected}`);
    console.log(`     Got:      ${result}\n`);
    passed++;
  } catch (error) {
    console.log(`  ❌ ${test.description}`);
    console.log(`     Input:    ${test.input}`);
    console.log(`     Expected: ${test.expected}`);
    console.log(`     Got:      ${result}\n`);
    failed++;
  }
});

// Test images
console.log('\n🖼️  Testing Image Paths:');
testCases.images.forEach(test => {
  const result = cleanImagePath(test.input);
  try {
    assert.strictEqual(result, test.expected);
    console.log(`  ✅ ${test.description}`);
    console.log(`     Input:    ${test.input}`);
    console.log(`     Expected: ${test.expected}`);
    console.log(`     Got:      ${result}\n`);
    passed++;
  } catch (error) {
    console.log(`  ❌ ${test.description}`);
    console.log(`     Input:    ${test.input}`);
    console.log(`     Expected: ${test.expected}`);
    console.log(`     Got:      ${result}\n`);
    failed++;
  }
});

// Test edge cases
console.log('\n⚠️  Testing Edge Cases:');
edgeCases.forEach(test => {
  const result = cleanFilePath(test.input);
  try {
    assert.strictEqual(result, test.expected);
    console.log(`  ✅ ${test.description}`);
    console.log(`     Input:    "${test.input}"`);
    console.log(`     Expected: ${test.expected}`);
    console.log(`     Got:      ${result}\n`);
    passed++;
  } catch (error) {
    console.log(`  ❌ ${test.description}`);
    console.log(`     Input:    "${test.input}"`);
    console.log(`     Expected: ${test.expected}`);
    console.log(`     Got:      ${result}\n`);
    failed++;
  }
});

// Summary
console.log('═'.repeat(60));
console.log('\n📊 Test Results:');
console.log(`   Total:  ${passed + failed}`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! Path resolution logic is working correctly.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the path resolution logic.');
  process.exit(1);
}
