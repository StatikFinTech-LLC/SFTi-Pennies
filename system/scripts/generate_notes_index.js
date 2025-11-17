#!/usr/bin/env node
/**
 * Generate Notes Index Script
 * Scans the SFTi.Notez directory and creates a JSON index
 * of all markdown files with metadata and excerpts
 * 
 * This is a comprehensive JavaScript translation of generate_notes_index.py with full feature parity.
 * Python's yaml module is replaced with a simple YAML parser for frontmatter.
 */

const fs = require('fs').promises;
const path = require('path');
const { saveJsonFile } = require('./globals_utils');

/**
 * Extract YAML frontmatter from markdown content
 * 
 * Python equivalent: extract_frontmatter(content)
 * Uses: yaml.safe_load() for parsing
 * Note: This is a simple YAML parser - for complex YAML, consider using the 'js-yaml' npm package
 * 
 * @param {string} content - Markdown content
 * @returns {Object} Object with {frontmatter: Object, body: string}
 */
function extractFrontmatter(content) {
    if (!content.startsWith('---')) {
        return { frontmatter: {}, body: content };
    }

    try {
        const parts = content.split('---', 3);
        if (parts.length < 3) {
            return { frontmatter: {}, body: content };
        }

        // Simple YAML parsing for common patterns
        // For more complex YAML, use js-yaml package
        const yamlText = parts[1];
        const frontmatter = {};
        
        const lines = yamlText.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex > 0) {
                const key = trimmed.substring(0, colonIndex).trim();
                let value = trimmed.substring(colonIndex + 1).trim();
                
                // Handle arrays (simple case: [item1, item2])
                if (value.startsWith('[') && value.endsWith(']')) {
                    value = value.substring(1, value.length - 1)
                        .split(',')
                        .map(v => v.trim().replace(/^["']|["']$/g, ''));
                } else {
                    // Remove quotes
                    value = value.replace(/^["']|["']$/g, '');
                }
                
                frontmatter[key] = value;
            }
        }

        const body = parts[2].trim();
        return { frontmatter, body };
    } catch (error) {
        console.log(`Error parsing frontmatter: ${error.message}`);
        return { frontmatter: {}, body: content };
    }
}

/**
 * Extract title from markdown content or filename
 * 
 * Python equivalent: extract_title_from_markdown(content, filename)
 * 
 * @param {string} content - Markdown content
 * @param {string} filename - File name as fallback
 * @returns {string} Title
 */
function extractTitleFromMarkdown(content, filename) {
    // Try to find first H1 heading
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.startsWith('# ')) {
            return line.substring(2).trim();
        } else if (line.startsWith('**') && line.endsWith('**')) {
            // Handle bold text as title
            return line.replace(/\*\*/g, '').trim();
        }
    }

    // Fallback to filename
    return filename.replace('.md', '').replace(/\./g, ' ').replace(/_/g, ' ');
}

/**
 * Extract a short excerpt from markdown content
 * 
 * Python equivalent: extract_excerpt(content, max_length)
 * 
 * @param {string} content - Markdown content
 * @param {number} maxLength - Maximum excerpt length
 * @returns {string} Excerpt
 */
function extractExcerpt(content, maxLength = 150) {
    // Remove headings and get first paragraph
    const lines = content.split('\n');
    const paragraphs = [];

    for (const line of lines) {
        const trimmed = line.trim();
        // Skip headings, horizontal rules, and empty lines
        if (trimmed.startsWith('#') ||
            trimmed.startsWith('---') ||
            trimmed.startsWith('```') ||
            trimmed.startsWith('>') ||
            trimmed.startsWith('<') ||
            !trimmed) {
            continue;
        }

        // Stop at image tags
        if (trimmed.includes('![') || trimmed.includes('<img')) {
            continue;
        }

        paragraphs.push(trimmed);

        // Get first meaningful paragraph
        if (paragraphs.join(' ').length > 50) {
            break;
        }
    }

    let excerpt = paragraphs.join(' ');

    // Truncate if too long
    if (excerpt.length > maxLength) {
        const truncated = excerpt.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        excerpt = truncated.substring(0, lastSpace) + '...';
    }

    return excerpt;
}

/**
 * Find the first image in markdown content for thumbnail
 * 
 * Python equivalent: find_thumbnail(content, note_file)
 * 
 * @param {string} content - Markdown content
 * @param {string} noteFile - Note file path
 * @returns {string|null} Thumbnail path or null
 */
function findThumbnail(content, noteFile) {
    // Look for markdown images
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.includes('![')) {
            // Extract image path from ![alt](path)
            const start = line.indexOf('](') + 2;
            const end = line.indexOf(')', start);
            if (start > 1 && end > start) {
                let imgPath = line.substring(start, end);
                // Convert relative path to absolute from note directory
                if (imgPath.startsWith('../')) {
                    return imgPath.substring(3);  // Remove ../
                } else if (imgPath.startsWith('./')) {
                    return path.dirname(noteFile) + '/' + imgPath.substring(2);
                }
                return imgPath;
            }
        }

        // Look for HTML img tags
        if (line.includes('<img') && line.includes('src=')) {
            const start = line.indexOf('src="') + 5;
            const end = line.indexOf('"', start);
            if (start > 4 && end > start) {
                let imgPath = line.substring(start, end);
                if (imgPath.startsWith('../')) {
                    return imgPath.substring(3);
                }
                return imgPath;
            }
        }
    }

    return null;
}

/**
 * Scan the notes directory for markdown files
 * 
 * Python equivalent: scan_notes_directory(directory)
 * 
 * @param {string} directory - Directory to scan
 * @returns {Promise<Array>} List of note dictionaries
 */
async function scanNotesDirectory(directory = 'index.directory/SFTi.Notez') {
    const notes = [];

    try {
        await fs.access(directory);
    } catch (error) {
        console.log(`Directory ${directory} not found`);
        return notes;
    }

    // Get all markdown files except README.md
    // Note: README.md is intentionally excluded as it's a navigational/documentation file,
    // not an actual trading note with content meant to be displayed as a card
    const files = await fs.readdir(directory);
    const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'README.md');

    for (const mdFile of mdFiles.sort()) {
        const filePath = path.join(directory, mdFile);

        try {
            const content = await fs.readFile(filePath, 'utf-8');

            // Extract frontmatter and body
            const { frontmatter, body } = extractFrontmatter(content);

            // Extract title
            const title = frontmatter.title || extractTitleFromMarkdown(content, mdFile);

            // Extract excerpt
            const excerpt = extractExcerpt(body);

            // Find thumbnail
            const thumbnail = findThumbnail(content, filePath);

            // File stats
            const fileStat = await fs.stat(filePath);

            const note = {
                title: title,
                file: filePath,
                filename: mdFile,
                excerpt: excerpt,
                thumbnail: thumbnail,
                size: fileStat.size,
                modified: new Date(fileStat.mtime).toISOString(),
                tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
            };

            notes.push(note);
            console.log(`Found note: ${note.title}`);

        } catch (error) {
            console.log(`Error processing ${mdFile}: ${error.message}`);
            continue;
        }
    }

    return notes;
}

/**
 * Main execution function
 * 
 * Python equivalent: main()
 */
async function main() {
    console.log('Generating notes index...');

    // Scan the notes directory
    const notes = await scanNotesDirectory();

    let output;
    if (!notes || notes.length === 0) {
        console.log('No notes found');
        // Create empty index
        output = {
            notes: [],
            total_count: 0,
            generated_at: new Date().toISOString(),
            version: '1.0',
        };
    } else {
        console.log(`Found ${notes.length} note(s)`);

        output = {
            notes: notes,
            total_count: notes.length,
            generated_at: new Date().toISOString(),
            version: '1.0',
        };
    }

    // Write JSON index
    const outputFile = 'index.directory/notes-index.json';
    await saveJsonFile(outputFile, output);

    console.log(`Notes index written to ${outputFile}`);
    console.log(`Total notes: ${output.total_count}`);
}

// Run main if executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

module.exports = {
    main,
    scanNotesDirectory,
    extractFrontmatter,
    extractTitleFromMarkdown,
    extractExcerpt,
    findThumbnail
};

// ES Module exports for browser compatibility
export { main as generateNotesIndex, main as generate, scanNotesDirectory, extractExcerpt, findThumbnail };
