/**
 * Bundle Entry Point
 * 
 * This module serves as the main entry point for the JavaScript bundle.
 * It imports and configures the libraries used for PDF and Markdown rendering,
 * then exposes them globally on the window object for use throughout the application.
 * 
 * @module main
 * @see {@link https://mozilla.github.io/pdf.js/ PDF.js Documentation}
 * @see {@link https://marked.js.org/ Marked.js Documentation}
 * @see {@link https://highlightjs.org/ Highlight.js Documentation}
 */

import { marked } from 'marked';
import * as pdfjsLib from 'pdfjs-dist';
import hljs from 'highlight.js';

/**
 * Marked.js library for Markdown parsing
 * @type {typeof marked}
 * @global
 */
window.marked = marked;

/**
 * PDF.js library for PDF rendering
 * @type {typeof import('pdfjs-dist')}
 * @global
 */
window.pdfjsLib = pdfjsLib;

/**
 * Highlight.js library for syntax highlighting
 * @type {typeof hljs}
 * @global
 */
window.hljs = hljs;
