/**
 * Virtual Filesystem (VFS) for Personal-Pennies
 * 
 * A true client-side filesystem that mirrors the entire repository structure
 * in IndexedDB. Replaces the legacy bucket-based architecture (trades, media, config, etc.)
 * with a unified Path → File pattern that supports all file types.
 * 
 * Features:
 * - Full repository mirror in IndexedDB
 * - Support for ALL file types (md, js, json, html, css, images, pdfs, etc.)
 * - Binary file support (blob/arraybuffer)
 * - Directory tree structure
 * - CRUD operations on files
 * - Path-based access (e.g., "index.directory/trades/trade-001-SCNX.html")
 * 
 * Storage Format:
 * {
 *   path: "index.directory/SFTi.Tradez/week.2025.45/11:05:2025.1.md",
 *   content: "..." | ArrayBuffer | Blob,
 *   type: "text" | "binary",
 *   mimeType: "text/markdown",
 *   size: 1234,
 *   lastModified: "2025-11-14T18:15:33.806Z",
 *   metadata: { ... }
 * }
 */

// LocalForage instance for VFS
let vfsStore = null;

// Database configuration
const DB_NAME = 'PersonalPenniesVFS';
const STORE_NAME = 'filesystem';
const DB_VERSION = 1;

/**
 * MIME type mapping for common file extensions
 */
const MIME_TYPES = {
  // Text files
  'md': 'text/markdown',
  'txt': 'text/plain',
  'json': 'application/json',
  'html': 'text/html',
  'htm': 'text/html',
  'css': 'text/css',
  'js': 'application/javascript',
  'xml': 'application/xml',
  'csv': 'text/csv',
  'yml': 'text/yaml',
  'yaml': 'text/yaml',
  
  // Images
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'ico': 'image/x-icon',
  
  // Documents
  'pdf': 'application/pdf',
  
  // Other
  'woff': 'font/woff',
  'woff2': 'font/woff2',
  'ttf': 'font/ttf',
  'otf': 'font/otf',
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav'
};

/**
 * Binary file extensions (need blob/arraybuffer storage)
 */
const BINARY_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'ico',
  'pdf', 'woff', 'woff2', 'ttf', 'otf',
  'mp4', 'webm', 'mp3', 'wav'
];

/**
 * Initialize the VFS store
 */
export function initializeVFS() {
  if (typeof window === 'undefined' || !window.localforage) {
    throw new Error('LocalForage is required but not loaded');
  }
  
  vfsStore = window.localforage.createInstance({
    name: DB_NAME,
    version: DB_VERSION,
    storeName: STORE_NAME,
    description: 'Virtual Filesystem for Personal-Pennies'
  });
  
  console.log('[VFS] Virtual filesystem initialized');
  return vfsStore;
}

/**
 * Get MIME type for a file path
 */
export function getMimeType(path) {
  const ext = path.split('.').pop().toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Check if file is binary based on extension
 */
export function isBinaryFile(path) {
  const ext = path.split('.').pop().toLowerCase();
  return BINARY_EXTENSIONS.includes(ext);
}

/**
 * Normalize path (remove leading/trailing slashes, handle ..)
 */
export function normalizePath(path) {
  // Remove leading slash
  path = path.replace(/^\/+/, '');
  
  // Remove trailing slash
  path = path.replace(/\/+$/, '');
  
  // Handle multiple consecutive slashes
  path = path.replace(/\/+/g, '/');
  
  return path;
}

/**
 * Get directory path from file path
 */
export function getDirPath(path) {
  const normalized = normalizePath(path);
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash === -1 ? '' : normalized.substring(0, lastSlash);
}

/**
 * Get filename from path
 */
export function getFileName(path) {
  const normalized = normalizePath(path);
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash === -1 ? normalized : normalized.substring(lastSlash + 1);
}

/**
 * Write a file to VFS
 * 
 * @param {string} path - File path (e.g., "index.directory/trades/trade-001.html")
 * @param {string|ArrayBuffer|Blob} content - File content
 * @param {object} options - Optional metadata
 * @returns {Promise<object>} File metadata
 */
export async function writeFile(path, content, options = {}) {
  if (!vfsStore) throw new Error('VFS not initialized');
  
  const normalizedPath = normalizePath(path);
  const mimeType = options.mimeType || getMimeType(normalizedPath);
  const isBinary = options.binary !== undefined ? options.binary : isBinaryFile(normalizedPath);
  
  const fileData = {
    path: normalizedPath,
    content: content,
    type: isBinary ? 'binary' : 'text',
    mimeType: mimeType,
    size: content.length || content.size || 0,
    lastModified: new Date().toISOString(),
    metadata: options.metadata || {}
  };
  
  await vfsStore.setItem(normalizedPath, fileData);
  console.log(`[VFS] Wrote file: ${normalizedPath} (${fileData.size} bytes, ${fileData.type})`);
  
  return fileData;
}

/**
 * Read a file from VFS
 * 
 * @param {string} path - File path
 * @param {object} options - Read options
 * @returns {Promise<string|ArrayBuffer|Blob|null>} File content or null if not found
 */
export async function readFile(path, options = {}) {
  if (!vfsStore) throw new Error('VFS not initialized');
  
  const normalizedPath = normalizePath(path);
  const fileData = await vfsStore.getItem(normalizedPath);
  
  if (!fileData) {
    console.warn(`[VFS] File not found: ${normalizedPath}`);
    return null;
  }
  
  // Return full metadata if requested
  if (options.metadata) {
    return fileData;
  }
  
  // Return just content by default
  return fileData.content;
}

/**
 * Check if a file exists
 * 
 * @param {string} path - File path
 * @returns {Promise<boolean>}
 */
export async function fileExists(path) {
  if (!vfsStore) throw new Error('VFS not initialized');
  
  const normalizedPath = normalizePath(path);
  const fileData = await vfsStore.getItem(normalizedPath);
  return fileData !== null;
}

/**
 * Delete a file from VFS
 * 
 * @param {string} path - File path
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteFile(path) {
  if (!vfsStore) throw new Error('VFS not initialized');
  
  const normalizedPath = normalizePath(path);
  const exists = await fileExists(normalizedPath);
  
  if (!exists) {
    console.warn(`[VFS] Cannot delete, file not found: ${normalizedPath}`);
    return false;
  }
  
  await vfsStore.removeItem(normalizedPath);
  console.log(`[VFS] Deleted file: ${normalizedPath}`);
  return true;
}

/**
 * List all files in a directory (non-recursive)
 * 
 * @param {string} dirPath - Directory path
 * @param {object} options - List options
 * @returns {Promise<Array>} Array of file paths
 */
export async function listFiles(dirPath = '', options = {}) {
  if (!vfsStore) throw new Error('VFS not initialized');
  
  const normalizedDir = normalizePath(dirPath);
  const prefix = normalizedDir ? normalizedDir + '/' : '';
  const allKeys = await vfsStore.keys();
  
  const files = [];
  
  for (const key of allKeys) {
    // Skip if not in this directory
    if (!key.startsWith(prefix)) continue;
    
    // Get relative path
    const relativePath = key.substring(prefix.length);
    
    // Skip if in subdirectory (non-recursive)
    if (!options.recursive && relativePath.includes('/')) continue;
    
    if (options.metadata) {
      const fileData = await vfsStore.getItem(key);
      files.push(fileData);
    } else {
      files.push(key);
    }
  }
  
  return files;
}

/**
 * List directories in a directory
 * 
 * @param {string} dirPath - Directory path
 * @returns {Promise<Array>} Array of directory names
 */
export async function listDirectories(dirPath = '') {
  if (!vfsStore) throw new Error('VFS not initialized');
  
  const normalizedDir = normalizePath(dirPath);
  const prefix = normalizedDir ? normalizedDir + '/' : '';
  const allKeys = await vfsStore.keys();
  
  const dirs = new Set();
  
  for (const key of allKeys) {
    // Skip if not in this directory
    if (!key.startsWith(prefix)) continue;
    
    // Get relative path
    const relativePath = key.substring(prefix.length);
    
    // Get first directory component
    const slashIndex = relativePath.indexOf('/');
    if (slashIndex !== -1) {
      const dirName = relativePath.substring(0, slashIndex);
      dirs.add(dirName);
    }
  }
  
  return Array.from(dirs).sort();
}

/**
 * Get file metadata without loading content
 * 
 * @param {string} path - File path
 * @returns {Promise<object|null>} File metadata or null if not found
 */
export async function stat(path) {
  if (!vfsStore) throw new Error('VFS not initialized');
  
  const normalizedPath = normalizePath(path);
  const fileData = await vfsStore.getItem(normalizedPath);
  
  if (!fileData) return null;
  
  return {
    path: fileData.path,
    type: fileData.type,
    mimeType: fileData.mimeType,
    size: fileData.size,
    lastModified: fileData.lastModified,
    metadata: fileData.metadata
  };
}

/**
 * Copy a file
 * 
 * @param {string} sourcePath - Source file path
 * @param {string} destPath - Destination file path
 * @returns {Promise<boolean>} True if copied, false if source not found
 */
export async function copyFile(sourcePath, destPath) {
  if (!vfsStore) throw new Error('VFS not initialized');
  
  const sourceData = await readFile(sourcePath, { metadata: true });
  if (!sourceData) return false;
  
  await writeFile(destPath, sourceData.content, {
    mimeType: sourceData.mimeType,
    binary: sourceData.type === 'binary',
    metadata: sourceData.metadata
  });
  
  console.log(`[VFS] Copied file: ${sourcePath} -> ${destPath}`);
  return true;
}

/**
 * Move/rename a file
 * 
 * @param {string} sourcePath - Source file path
 * @param {string} destPath - Destination file path
 * @returns {Promise<boolean>} True if moved, false if source not found
 */
export async function moveFile(sourcePath, destPath) {
  const copied = await copyFile(sourcePath, destPath);
  if (!copied) return false;
  
  await deleteFile(sourcePath);
  console.log(`[VFS] Moved file: ${sourcePath} -> ${destPath}`);
  return true;
}

/**
 * Clear all files (for testing/reset)
 */
export async function clearVFS() {
  if (!vfsStore) throw new Error('VFS not initialized');
  
  await vfsStore.clear();
  console.log('[VFS] Filesystem cleared');
}

/**
 * Export VFS to JSON (for backup)
 * 
 * @returns {Promise<object>} VFS export data
 */
export async function exportVFS() {
  if (!vfsStore) throw new Error('VFS not initialized');
  
  const allKeys = await vfsStore.keys();
  const files = {};
  
  for (const key of allKeys) {
    const fileData = await vfsStore.getItem(key);
    
    // Convert binary content to base64 for JSON export
    if (fileData.type === 'binary' && fileData.content instanceof ArrayBuffer) {
      const uint8Array = new Uint8Array(fileData.content);
      const binaryString = Array.from(uint8Array).map(b => String.fromCharCode(b)).join('');
      fileData.content = btoa(binaryString);
      fileData._base64 = true;
    }
    
    files[key] = fileData;
  }
  
  return {
    version: DB_VERSION,
    exported_at: new Date().toISOString(),
    files: files
  };
}

/**
 * Import VFS from JSON backup
 * 
 * @param {object} exportData - VFS export data
 */
export async function importVFS(exportData) {
  if (!vfsStore) throw new Error('VFS not initialized');
  
  if (!exportData.files) {
    throw new Error('Invalid VFS export data');
  }
  
  let imported = 0;
  
  for (const [path, fileData] of Object.entries(exportData.files)) {
    // Convert base64 back to ArrayBuffer if needed
    if (fileData._base64 && typeof fileData.content === 'string') {
      const binaryString = atob(fileData.content);
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      fileData.content = uint8Array.buffer;
      delete fileData._base64;
    }
    
    await vfsStore.setItem(path, fileData);
    imported++;
  }
  
  console.log(`[VFS] Imported ${imported} files`);
}

/**
 * Get VFS statistics
 */
export async function getVFSStats() {
  if (!vfsStore) throw new Error('VFS not initialized');
  
  const allKeys = await vfsStore.keys();
  let totalSize = 0;
  let textFiles = 0;
  let binaryFiles = 0;
  
  for (const key of allKeys) {
    const fileData = await vfsStore.getItem(key);
    totalSize += fileData.size || 0;
    
    if (fileData.type === 'binary') {
      binaryFiles++;
    } else {
      textFiles++;
    }
  }
  
  return {
    totalFiles: allKeys.length,
    textFiles,
    binaryFiles,
    totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
  };
}

// Initialize on import
if (typeof window !== 'undefined' && window.localforage) {
  initializeVFS();
}

// Export for global access
if (typeof window !== 'undefined') {
  window.PersonalPenniesVFS = {
    // Core operations
    writeFile,
    readFile,
    deleteFile,
    fileExists,
    
    // Directory operations
    listFiles,
    listDirectories,
    
    // File operations
    copyFile,
    moveFile,
    stat,
    
    // Utilities
    getMimeType,
    isBinaryFile,
    normalizePath,
    getDirPath,
    getFileName,
    
    // Bulk operations
    exportVFS,
    importVFS,
    clearVFS,
    getVFSStats,
    
    // Internal
    initializeVFS,
    _store: () => vfsStore
  };
}

console.log('[VFS] Virtual Filesystem module loaded');
