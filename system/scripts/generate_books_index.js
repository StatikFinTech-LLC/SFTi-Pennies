#!/usr/bin/env node
/**
 * Generate Books Index Script
 * Scans the Informational.Bookz directory and creates a JSON index
 * of all PDF files with metadata
 * 
 * This is a comprehensive JavaScript translation of generate_books_index.py with full feature parity.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { saveJsonFile } = require('./globals_utils');

/**
 * Extract a readable title from the filename
 * 
 * Python equivalent: extract_book_title(filename)
 * 
 * @param {string} filename - PDF filename
 * @returns {string} Formatted title
 */
function extractBookTitle(filename) {
    // Remove .pdf extension and replace underscores with spaces
    const title = filename.replace('.pdf', '').replace(/_/g, ' ');
    return title;
}

/**
 * Scan the books directory for PDF files
 * 
 * Python equivalent: scan_books_directory(directory)
 * 
 * @param {string} directory - Directory to scan
 * @returns {Promise<Array>} List of book dictionaries
 */
async function scanBooksDirectory(directory = 'index.directory/Informational.Bookz') {
    const books = [];

    try {
        await fs.access(directory);
    } catch (error) {
        console.log(`Directory ${directory} not found`);
        return books;
    }

    // Get all PDF files
    const files = await fs.readdir(directory);
    const pdfFiles = files.filter(f => f.endsWith('.pdf'));

    for (const pdfFile of pdfFiles.sort()) {
        const filePath = path.join(directory, pdfFile);
        const fileStat = await fs.stat(filePath);

        const book = {
            title: extractBookTitle(pdfFile),
            file: filePath,
            filename: pdfFile,
            size: fileStat.size,
            size_mb: Math.round(fileStat.size / (1024 * 1024) * 100) / 100,
            modified: new Date(fileStat.mtime).toISOString(),
            // Note: Cover images can be added manually or generated
            cover: null,
        };

        books.push(book);
        console.log(`Found book: ${book.title}`);
    }

    return books;
}

/**
 * Main execution function
 * 
 * Python equivalent: main()
 */
async function main() {
    console.log('Generating books index...');

    // Scan the books directory
    const books = await scanBooksDirectory();

    let output;
    if (!books || books.length === 0) {
        console.log('No books found');
        // Create empty index
        output = {
            books: [],
            total_count: 0,
            generated_at: new Date().toISOString(),
            version: '1.0',
        };
    } else {
        console.log(`Found ${books.length} book(s)`);

        output = {
            books: books,
            total_count: books.length,
            generated_at: new Date().toISOString(),
            version: '1.0',
        };
    }

    // Write JSON index
    const outputFile = 'index.directory/books-index.json';
    await saveJsonFile(outputFile, output);

    console.log(`Books index written to ${outputFile}`);
    console.log(`Total books: ${output.total_count}`);
}

// Run main if executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

module.exports = { main, scanBooksDirectory, extractBookTitle };

// ES Module exports for browser compatibility
export { main as generateBooksIndex, main as generate, scanBooksDirectory, extractBookTitle };
