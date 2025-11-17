/**
 * VFS Adapter - Fetch API wrapper for VFS
 * 
 * Provides a fetch()-like API for reading from VFS, making it easy to refactor
 * existing code that uses fetch() to use VFS instead.
 * 
 * Usage:
 *   // Old code:
 *   const response = await fetch('/index.directory/trades-index.json');
 *   const data = await response.json();
 * 
 *   // New code:
 *   const response = await vfsFetch('/index.directory/trades-index.json');
 *   const data = await response.json();
 * 
 * The adapter automatically falls back to regular fetch() if the file is not in VFS.
 */

import * as VFS from './vfs.js';

/**
 * VFS Response - mimics fetch Response API
 */
class VFSResponse {
  constructor(content, options = {}) {
    this.content = content;
    this.ok = options.ok !== undefined ? options.ok : true;
    this.status = options.status || 200;
    this.statusText = options.statusText || 'OK';
    this.headers = new Map(Object.entries(options.headers || {}));
    this.url = options.url || '';
  }
  
  async text() {
    if (typeof this.content === 'string') {
      return this.content;
    }
    
    if (this.content instanceof ArrayBuffer) {
      const decoder = new TextDecoder();
      return decoder.decode(this.content);
    }
    
    if (this.content instanceof Blob) {
      return await this.content.text();
    }
    
    return String(this.content);
  }
  
  async json() {
    const text = await this.text();
    return JSON.parse(text);
  }
  
  async arrayBuffer() {
    if (this.content instanceof ArrayBuffer) {
      return this.content;
    }
    
    if (this.content instanceof Blob) {
      return await this.content.arrayBuffer();
    }
    
    if (typeof this.content === 'string') {
      const encoder = new TextEncoder();
      return encoder.encode(this.content).buffer;
    }
    
    throw new Error('Cannot convert content to ArrayBuffer');
  }
  
  async blob() {
    if (this.content instanceof Blob) {
      return this.content;
    }
    
    if (this.content instanceof ArrayBuffer) {
      const mimeType = this.headers.get('Content-Type') || 'application/octet-stream';
      return new Blob([this.content], { type: mimeType });
    }
    
    if (typeof this.content === 'string') {
      const mimeType = this.headers.get('Content-Type') || 'text/plain';
      return new Blob([this.content], { type: mimeType });
    }
    
    throw new Error('Cannot convert content to Blob');
  }
}

/**
 * Fetch from VFS with automatic fallback to regular fetch
 * 
 * @param {string} url - URL or path to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<VFSResponse|Response>}
 */
export async function vfsFetch(url, options = {}) {
  // Normalize URL to path
  let path = url;
  
  // Remove domain/protocol if present
  if (path.includes('://')) {
    const urlObj = new URL(path);
    path = urlObj.pathname;
  }
  
  // Remove leading slash
  path = VFS.normalizePath(path);
  
  // Try to read from VFS first
  const fileData = await VFS.readFile(path, { metadata: true });
  
  if (fileData) {
    // File found in VFS
    console.log(`[VFS-Adapter] Serving from VFS: ${path}`);
    
    return new VFSResponse(fileData.content, {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': fileData.mimeType,
        'Content-Length': String(fileData.size),
        'Last-Modified': fileData.lastModified,
        'X-Source': 'VFS'
      },
      url: url
    });
  }
  
  // File not in VFS, fall back to regular fetch
  console.log(`[VFS-Adapter] File not in VFS, falling back to fetch: ${path}`);
  
  try {
    return await fetch(url, options);
  } catch (error) {
    // Return 404 response
    return new VFSResponse(null, {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      url: url
    });
  }
}

/**
 * Read JSON from VFS or fetch
 */
export async function readJSON(path) {
  const response = await vfsFetch(path);
  
  if (!response.ok) {
    throw new Error(`Failed to read ${path}: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Read text from VFS or fetch
 */
export async function readText(path) {
  const response = await vfsFetch(path);
  
  if (!response.ok) {
    throw new Error(`Failed to read ${path}: ${response.status} ${response.statusText}`);
  }
  
  return await response.text();
}

/**
 * Write JSON to VFS
 */
export async function writeJSON(path, data, options = {}) {
  const json = JSON.stringify(data, null, options.pretty ? 2 : 0);
  return await VFS.writeFile(path, json, {
    mimeType: 'application/json',
    metadata: options.metadata
  });
}

/**
 * Write text to VFS
 */
export async function writeText(path, text, options = {}) {
  return await VFS.writeFile(path, text, {
    mimeType: options.mimeType || VFS.getMimeType(path),
    metadata: options.metadata
  });
}

/**
 * Check if path exists in VFS or via fetch
 */
export async function exists(path) {
  // First check VFS
  const inVFS = await VFS.fileExists(path);
  if (inVFS) return true;
  
  // Try fetch with HEAD request
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Install VFS adapter as global fetch override (optional)
 * This replaces the global fetch() with vfsFetch()
 * 
 * Use with caution - this affects ALL fetch calls
 */
export function installGlobalVFSFetch() {
  if (typeof window === 'undefined') return;
  
  // Save original fetch
  window._originalFetch = window.fetch;
  
  // Override with VFS fetch
  window.fetch = vfsFetch;
  
  console.log('[VFS-Adapter] Global fetch() overridden with VFS fetch');
}

/**
 * Restore original fetch()
 */
export function restoreOriginalFetch() {
  if (typeof window === 'undefined') return;
  
  if (window._originalFetch) {
    window.fetch = window._originalFetch;
    delete window._originalFetch;
    console.log('[VFS-Adapter] Original fetch() restored');
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.PersonalPenniesVFSAdapter = {
    vfsFetch,
    readJSON,
    readText,
    writeJSON,
    writeText,
    exists,
    installGlobalVFSFetch,
    restoreOriginalFetch
  };
}

console.log('[VFS-Adapter] VFS adapter module loaded');
