/**
 * PDF Renderer with Lazy Loading and Memory Management
 * Handles PDF rendering with smooth scrolling, zoom controls, and efficient memory usage
 * 
 * Features:
 * - Lazy loading: Only renders visible pages
 * - Progressive rendering: Shows pages as they load
 * - Memory management: Cleans up off-screen pages
 * - Optimized for large PDFs (up to 500KB+)
 * 
 * @class PDFRenderer
 */

class PDFRenderer {
  // Configuration constants for memory management and performance
  static MAX_PIXEL_RATIO = 2;          // Maximum device pixel ratio for rendering (prevents excessive memory use)
  static MIN_VIEWPORT_WIDTH = 200;     // Minimum viewport width in pixels (ensures readable text)
  static INTERSECTION_MARGIN = '200px'; // Preload buffer zone for intersection observer
  static UNRENDER_DELAY_MS = 1000;     // Delay before unrendering off-screen pages (ms)
  static MIN_SCALE = 0.1;              // Minimum zoom scale (10%)
  static MAX_SCALE = 5.0;              // Maximum zoom scale (500%)
  
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.pdfjsLib = window.pdfjsLib;
    
    if (!this.container) {
      throw new Error(`Container ${containerId} not found`);
    }
    
    if (!this.pdfjsLib) {
      throw new Error('PDF.js library not loaded');
    }
    
    // Configuration options
    this.options = {
      scale: options.scale || 0.9,
      enableZoom: options.enableZoom !== false,
      enableScroll: options.enableScroll !== false,
      // Lazy loading configuration
      lazyLoad: options.lazyLoad !== false, // Enable by default
      renderBuffer: options.renderBuffer || 2, // Number of pages to render above/below viewport
      maxRenderedPages: options.maxRenderedPages || 5, // Maximum concurrent rendered pages
      ...options
    };
    
    // State management
    this.pdfDoc = null;
    this.currentScale = this.options.scale;
    this.pages = [];
    this.renderedPages = new Map(); // Track rendered page canvases
    this.isRendering = false;
    this.intersectionObserver = null;
    this.renderQueue = [];
    
    this.initializeContainer();
  }

  /**
   * Initialize the PDF container
   */
  initializeContainer() {
    this.container.innerHTML = '';
    this.container.className = 'pdf-viewer-container';
    
    // Create scroll container
    this.scrollContainer = document.createElement('div');
    this.scrollContainer.className = 'pdf-scroll-container';
    
    // Create controls if enabled
    if (this.options.enableZoom) {
      this.createControls();
    }
    
    this.container.appendChild(this.scrollContainer);
  }

  /**
   * Create zoom and navigation controls
   */
  createControls() {
    const controls = document.createElement('div');
    controls.className = 'pdf-controls';
    controls.innerHTML = `
      <button class="pdf-control-btn pdf-zoom-out" title="Zoom Out">−</button>
      <span class="pdf-zoom-level">100%</span>
      <button class="pdf-control-btn pdf-zoom-in" title="Zoom In">+</button>
      <button class="pdf-control-btn pdf-fit-width" title="Fit Width">⬌</button>
    `;
    
    this.container.insertBefore(controls, this.container.firstChild);
    
    // Bind control events
    controls.querySelector('.pdf-zoom-in').addEventListener('click', () => this.zoomIn());
    controls.querySelector('.pdf-zoom-out').addEventListener('click', () => this.zoomOut());
    controls.querySelector('.pdf-fit-width').addEventListener('click', () => this.fitToWidth());
  }

  /**
   * Load PDF from URL with progressive loading
   * Uses lazy loading to handle large PDFs efficiently
   * @param {string} url - URL of the PDF file
   * @returns {Promise<PDFDocumentProxy>}
   */
  async loadPDF(url) {
    // Edge case: Validate URL parameter
    if (!url || typeof url !== 'string' || url.trim() === '') {
      const error = new Error('Invalid PDF URL: URL must be a non-empty string');
      console.error('=== PDF Load Failed ===');
      console.error('Error:', error);
      this.scrollContainer.innerHTML = `
        <div class="pdf-error">
          <p>Error loading PDF</p>
          <p class="pdf-error-details">${error.message}</p>
        </div>
      `;
      throw error;
    }
    
    if (this.isRendering) {
      console.warn('PDF is already being rendered');
      return;
    }
    
    this.isRendering = true;
    this.scrollContainer.innerHTML = '<div class="pdf-loading">Loading PDF...</div>';
    
    try {
      console.log('=== Starting PDF Load ===');
      console.log('URL:', url);
      console.log('Lazy loading enabled:', this.options.lazyLoad);
      
      // Create loading task with progress callback
      const loadingTask = this.pdfjsLib.getDocument({
        url: url,
        // Optimize for streaming large files
        disableAutoFetch: true,
        disableStream: false,
        disableRange: false
      });
      
      // Show loading progress
      loadingTask.onProgress = (progress) => {
        if (progress.total > 0) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          this.updateLoadingProgress(percent);
        }
      };
      
      this.pdfDoc = await loadingTask.promise;
      
      // Edge case: Validate PDF document
      if (!this.pdfDoc || !this.pdfDoc.numPages || this.pdfDoc.numPages === 0) {
        throw new Error('Invalid PDF: Document has no pages');
      }
      
      console.log('PDF loaded successfully!');
      console.log('- Pages:', this.pdfDoc.numPages);
      console.log('- Fingerprint:', this.pdfDoc.fingerprints);
      
      // Calculate responsive initial scale
      await this.calculateInitialScale();
      
      // Use lazy loading for better performance with large PDFs
      if (this.options.lazyLoad) {
        await this.setupLazyLoading();
      } else {
        await this.renderAllPages();
      }
      
      this.isRendering = false;
      console.log('=== PDF Load Complete ===');
      return this.pdfDoc;
    } catch (error) {
      this.isRendering = false;
      console.error('=== PDF Load Failed ===');
      console.error('Error:', error);
      this.scrollContainer.innerHTML = `
        <div class="pdf-error">
          <p>Error loading PDF</p>
          <p class="pdf-error-details">${error.message}</p>
          <p style="font-size: 0.9em; margin-top: 1rem;">Check browser console for details</p>
        </div>
      `;
      throw error;
    }
  }
  
  /**
   * Update loading progress indicator
   * @param {number} percent - Progress percentage (0-100)
   */
  updateLoadingProgress(percent) {
    const loadingEl = this.scrollContainer.querySelector('.pdf-loading');
    if (loadingEl) {
      loadingEl.innerHTML = `
        Loading PDF... ${percent}%
        <div style="width: 100%; height: 4px; background: rgba(0,255,136,0.2); border-radius: 2px; margin-top: 0.5rem;">
          <div style="width: ${percent}%; height: 100%; background: var(--accent-green); border-radius: 2px; transition: width 0.3s;"></div>
        </div>
      `;
    }
  }

  /**
   * Calculate initial scale based on viewport width for responsive display
   * Handles edge cases for extreme screen sizes and invalid dimensions
   */
  async calculateInitialScale() {
    if (!this.pdfDoc) return;
    
    try {
      const page = await this.pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      
      // Edge case: Validate viewport dimensions
      if (!viewport || !viewport.width || viewport.width <= 0) {
        console.warn('Invalid viewport dimensions, using default scale');
        this.currentScale = this.options.scale;
        return;
      }
      
      // Get screen dimensions
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Edge case: Validate screen dimensions
      if (!screenWidth || screenWidth <= 0 || !screenHeight || screenHeight <= 0) {
        console.warn('Invalid screen dimensions, using default scale');
        this.currentScale = this.options.scale;
        return;
      }
      
      // Calculate available width for PDF
      // On mobile, modal is 95% of viewport width, minus padding
      // On desktop, use actual container width
      let availableWidth;
      
      if (screenWidth < 768) {
        // Mobile: use viewport-based calculation for more accurate fit
        // Modal is 95% width, container has 20px padding each side
        availableWidth = (screenWidth * 0.95) - 40;
      } else {
        // Tablet/Desktop: use actual container width minus padding
        availableWidth = this.scrollContainer.clientWidth - 40;
      }
      
      // Edge case: Ensure minimum available width
      availableWidth = Math.max(availableWidth, PDFRenderer.MIN_VIEWPORT_WIDTH);
      
      // Calculate scale to fit width
      const fitWidthScale = availableWidth / viewport.width;
      
      // Edge case: Clamp scale to reasonable bounds
      const clampedScale = Math.max(PDFRenderer.MIN_SCALE, Math.min(PDFRenderer.MAX_SCALE, fitWidthScale));
      
      // Apply responsive scaling
      if (screenWidth < 768) {
        // Mobile: use fit-to-width directly (no reduction)
        this.currentScale = clampedScale;
      } else if (screenWidth < 1024) {
        // Tablet: use fit-to-width, cap at 1.2
        this.currentScale = Math.min(fitWidthScale, 1.2);
      } else {
        // Desktop: use fit-to-width with small margin or configured scale
        this.currentScale = Math.min(fitWidthScale * 0.95, this.options.scale);
      }
      
      // Update zoom level display
      const zoomLevel = this.container.querySelector('.pdf-zoom-level');
      if (zoomLevel) {
        zoomLevel.textContent = `${Math.round(this.currentScale * 100)}%`;
      }
      
      console.log(`Initial scale calculated: ${this.currentScale.toFixed(3)} (fit: ${fitWidthScale.toFixed(3)}, screen: ${screenWidth}px, available: ${availableWidth}px, PDF width: ${viewport.width}px)`);
    } catch (error) {
      console.error('Error calculating initial scale:', error);
      this.currentScale = this.options.scale;
    }
  }

  /**
   * Set up lazy loading with Intersection Observer
   * Creates page placeholders and observes them for rendering
   */
  async setupLazyLoading() {
    this.scrollContainer.innerHTML = '';
    this.pages = [];
    this.renderedPages.clear();
    
    console.log('Setting up lazy loading for', this.pdfDoc.numPages, 'pages');
    
    // Create Intersection Observer for lazy loading
    this.setupIntersectionObserver();
    
    const numPages = this.pdfDoc.numPages;
    
    // Create placeholder containers for all pages
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const pageContainer = await this.createPagePlaceholder(pageNum);
      this.scrollContainer.appendChild(pageContainer);
      
      this.pages.push({
        number: pageNum,
        container: pageContainer,
        canvas: null,
        page: null,
        isRendered: false,
        isVisible: false
      });
    }
    
    console.log('Lazy loading setup complete. Page placeholders created.');
  }
  
  /**
   * Set up Intersection Observer to detect visible pages
   * Triggers rendering when pages enter the viewport
   */
  setupIntersectionObserver() {
    // Clean up existing observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    // Create observer with buffer zone (render before page is fully visible)
    const options = {
      root: this.scrollContainer,
      rootMargin: PDFRenderer.INTERSECTION_MARGIN, // Preload buffer zone
      threshold: 0.01 // Trigger as soon as 1% is visible
    };
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const pageNum = parseInt(entry.target.dataset.pageNumber, 10);
        const pageData = this.pages.find(p => p.number === pageNum);
        
        // Edge case: Invalid page number or page data not found
        if (!pageData || isNaN(pageNum)) return;
        
        if (entry.isIntersecting) {
          // Page is visible or near viewport
          pageData.isVisible = true;
          this.queuePageRender(pageNum);
        } else {
          // Page is far from viewport
          pageData.isVisible = false;
          this.maybeUnrenderPage(pageNum);
        }
      });
    }, options);
    
    console.log('Intersection Observer created with 200px margin');
  }
  
  /**
   * Create a placeholder container for a page
   * @param {number} pageNum - Page number
   * @returns {Promise<HTMLElement>}
   */
  async createPagePlaceholder(pageNum) {
    const page = await this.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: this.currentScale });
    
    // Create page container with calculated dimensions
    const pageContainer = document.createElement('div');
    pageContainer.className = 'pdf-page-container pdf-page-placeholder';
    pageContainer.dataset.pageNumber = pageNum;
    pageContainer.style.width = Math.floor(viewport.width) + 'px';
    pageContainer.style.height = Math.floor(viewport.height) + 'px';
    pageContainer.style.margin = '10px auto';
    pageContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    pageContainer.style.position = 'relative';
    pageContainer.style.display = 'flex';
    pageContainer.style.alignItems = 'center';
    pageContainer.style.justifyContent = 'center';
    
    // Add page number label
    const pageLabel = document.createElement('div');
    pageLabel.className = 'pdf-page-label';
    pageLabel.textContent = `Page ${pageNum}`;
    pageLabel.style.color = 'var(--text-dim)';
    pageLabel.style.fontSize = '0.875rem';
    pageContainer.appendChild(pageLabel);
    
    // Observe this container
    this.intersectionObserver.observe(pageContainer);
    
    return pageContainer;
  }
  
  /**
   * Queue a page for rendering
   * @param {number} pageNum - Page number to render
   */
  queuePageRender(pageNum) {
    const pageData = this.pages.find(p => p.number === pageNum);
    
    // Skip if already rendered or queued
    if (!pageData || pageData.isRendered || this.renderQueue.includes(pageNum)) {
      return;
    }
    
    // Add to render queue
    this.renderQueue.push(pageNum);
    
    // Process queue
    this.processRenderQueue();
  }
  
  /**
   * Process the render queue
   * Renders pages one at a time to avoid memory issues
   */
  async processRenderQueue() {
    // Only process if not already rendering
    if (this.isRendering || this.renderQueue.length === 0) {
      return;
    }
    
    this.isRendering = true;
    
    // Render pages in queue
    while (this.renderQueue.length > 0) {
      const pageNum = this.renderQueue.shift();
      const pageData = this.pages.find(p => p.number === pageNum);
      
      // Skip if page is no longer visible or already rendered
      if (!pageData || !pageData.isVisible || pageData.isRendered) {
        continue;
      }
      
      // Check if we've hit the concurrent render limit
      if (this.renderedPages.size >= this.options.maxRenderedPages) {
        // Clean up furthest off-screen page
        await this.cleanupDistantPages(pageNum);
      }
      
      // Render the page
      await this.renderPage(pageNum);
    }
    
    this.isRendering = false;
  }
  
  /**
   * Clean up pages that are far from the viewport
   * Frees memory by removing canvases of distant pages
   * @param {number} currentPageNum - Current page being viewed
   */
  async cleanupDistantPages(currentPageNum) {
    const buffer = this.options.renderBuffer;
    
    // Find pages that are far from current page and not visible
    for (const [pageNum, canvas] of this.renderedPages.entries()) {
      const pageData = this.pages.find(p => p.number === pageNum);
      const distance = Math.abs(pageNum - currentPageNum);
      
      // Remove if far from current page and not visible
      if (distance > buffer && pageData && !pageData.isVisible) {
        await this.unrenderPage(pageNum);
        console.log(`Cleaned up page ${pageNum} to free memory`);
        break; // Only clean up one at a time
      }
    }
  }
  
  /**
   * Unrender a page to free memory
   * @param {number} pageNum - Page number to unrender
   */
  async unrenderPage(pageNum) {
    const pageData = this.pages.find(p => p.number === pageNum);
    if (!pageData || !pageData.isRendered) return;
    
    // Remove canvas but keep placeholder
    const canvas = pageData.canvas;
    if (canvas && canvas.parentNode) {
      canvas.remove();
    }
    
    // Update state
    pageData.isRendered = false;
    pageData.canvas = null;
    this.renderedPages.delete(pageNum);
    
    // Re-add placeholder content
    const label = pageData.container.querySelector('.pdf-page-label');
    if (!label) {
      const pageLabel = document.createElement('div');
      pageLabel.className = 'pdf-page-label';
      pageLabel.textContent = `Page ${pageNum}`;
      pageLabel.style.color = 'var(--text-dim)';
      pageLabel.style.fontSize = '0.875rem';
      pageData.container.appendChild(pageLabel);
    }
  }
  
  /**
   * Check if a page should be unrendered
   * @param {number} pageNum - Page number
   */
  maybeUnrenderPage(pageNum) {
    // Only unrender if we have many rendered pages
    if (this.renderedPages.size > this.options.maxRenderedPages) {
      setTimeout(() => {
        const pageData = this.pages.find(p => p.number === pageNum);
        if (pageData && !pageData.isVisible && pageData.isRendered) {
          this.unrenderPage(pageNum);
        }
      }, PDFRenderer.UNRENDER_DELAY_MS); // Delay before cleanup
    }
  }

  /**
   * Render all PDF pages for smooth scrolling
   * LEGACY: Use setupLazyLoading for better performance with large PDFs
   */
  async renderAllPages() {
    this.scrollContainer.innerHTML = '';
    this.pages = [];
    this.renderedPages.clear();
    
    const numPages = this.pdfDoc.numPages;
    console.log('Rendering all pages (legacy mode):', numPages);
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      await this.renderPage(pageNum);
    }
    
    console.log('All pages rendered');
  }

  /**
   * Render a single page with memory-efficient settings
   * @param {number} pageNum - Page number to render
   */
  async renderPage(pageNum) {
    try {
      const pageData = this.pages.find(p => p.number === pageNum);
      
      // Skip if already rendered
      if (pageData && pageData.isRendered) {
        return;
      }
      
      const page = await this.pdfDoc.getPage(pageNum);
      
      // Get or create page container
      let pageContainer;
      if (pageData) {
        pageContainer = pageData.container;
        // Clear placeholder content
        const label = pageContainer.querySelector('.pdf-page-label');
        if (label) label.remove();
        pageContainer.style.backgroundColor = 'transparent';
      } else {
        pageContainer = document.createElement('div');
        pageContainer.className = 'pdf-page-container';
        pageContainer.dataset.pageNumber = pageNum;
        pageContainer.style.margin = '10px auto';
      }
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', {
        alpha: false, // Disable alpha channel for better performance
        willReadFrequently: false
      });
      
      // Calculate scale with device pixel ratio for high-DPI displays
      // Use moderate scaling to balance quality and memory usage
      const devicePixelRatio = window.devicePixelRatio || 1;
      const outputScale = Math.min(devicePixelRatio, PDFRenderer.MAX_PIXEL_RATIO);
      const viewport = page.getViewport({ scale: this.currentScale });
      
      // Set canvas size at higher resolution for crisp rendering
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      
      // Scale canvas display size to match viewport
      canvas.style.width = Math.floor(viewport.width) + 'px';
      canvas.style.height = Math.floor(viewport.height) + 'px';
      canvas.style.display = 'block';
      
      // Apply transform to scale the rendering context
      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
      
      // Render page to canvas with optimized settings for memory efficiency
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        transform: transform,
        // Optimization flags to reduce memory usage and improve performance
        intent: 'display',                    // Optimize for screen display vs. printing
        enableWebGL: false,                   // Disable WebGL to avoid memory issues
        renderInteractiveForms: false         // Skip form rendering for static PDFs
      };
      
      await page.render(renderContext).promise;
      
      // Add to container if not already added
      if (!pageData) {
        const pageLabel = document.createElement('div');
        pageLabel.className = 'pdf-page-label';
        pageLabel.textContent = `Page ${pageNum}`;
        
        pageContainer.appendChild(canvas);
        pageContainer.appendChild(pageLabel);
        this.scrollContainer.appendChild(pageContainer);
        
        this.pages.push({
          number: pageNum,
          container: pageContainer,
          canvas: canvas,
          page: page,
          isRendered: true,
          isVisible: true
        });
      } else {
        pageContainer.appendChild(canvas);
        pageData.canvas = canvas;
        pageData.page = page;
        pageData.isRendered = true;
      }
      
      // Track rendered page
      this.renderedPages.set(pageNum, canvas);
      
      console.log(`Page ${pageNum} rendered successfully (${canvas.width}x${canvas.height}px)`);
      
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
      
      // Show error placeholder
      const pageData = this.pages.find(p => p.number === pageNum);
      if (pageData) {
        pageData.container.innerHTML = `
          <div style="color: var(--accent-red); padding: 2rem; text-align: center;">
            Error rendering page ${pageNum}
          </div>
        `;
      }
    }
  }

  /**
   * Zoom in
   */
  zoomIn() {
    this.setScale(this.currentScale * 1.2);
  }

  /**
   * Zoom out
   */
  zoomOut() {
    this.setScale(this.currentScale / 1.2);
  }

  /**
   * Fit to width
   */
  fitToWidth() {
    if (!this.pdfDoc || this.pages.length === 0) return;
    
    const containerWidth = this.scrollContainer.clientWidth - 40; // Account for padding
    const firstPage = this.pages[0].page;
    const viewport = firstPage.getViewport({ scale: 1 });
    const scale = containerWidth / viewport.width;
    
    this.setScale(scale);
  }

  /**
   * Set zoom scale and re-render visible pages
   * @param {number} newScale - New scale factor
   */
  async setScale(newScale) {
    newScale = Math.max(0.5, Math.min(3, newScale)); // Limit between 50% and 300%
    
    if (newScale === this.currentScale) return;
    
    this.currentScale = newScale;
    
    // Update zoom level display
    const zoomLevel = this.container.querySelector('.pdf-zoom-level');
    if (zoomLevel) {
      zoomLevel.textContent = `${Math.round(newScale * 100)}%`;
    }
    
    console.log(`Scaling to ${Math.round(newScale * 100)}%`);
    
    // If using lazy loading, recreate placeholders with new dimensions
    if (this.options.lazyLoad) {
      // Clear current render queue
      this.renderQueue = [];
      
      // Disconnect observer temporarily
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
      }
      
      // Update all page containers with new dimensions
      for (const pageData of this.pages) {
        const page = await this.pdfDoc.getPage(pageData.number);
        const viewport = page.getViewport({ scale: this.currentScale });
        
        pageData.container.style.width = Math.floor(viewport.width) + 'px';
        pageData.container.style.height = Math.floor(viewport.height) + 'px';
        
        // Clear rendered content
        if (pageData.isRendered) {
          await this.unrenderPage(pageData.number);
        }
      }
      
      // Reconnect observer
      this.setupIntersectionObserver();
      
      // Re-observe all containers
      this.pages.forEach(pageData => {
        this.intersectionObserver.observe(pageData.container);
      });
      
      // Trigger re-render of visible pages
      this.pages.forEach(pageData => {
        if (pageData.isVisible) {
          this.queuePageRender(pageData.number);
        }
      });
      
    } else {
      // Legacy mode: re-render all pages
      await this.renderAllPages();
    }
  }

  /**
   * Get current page number based on scroll position
   */
  getCurrentPage() {
    const scrollTop = this.scrollContainer.scrollTop;
    const containerHeight = this.scrollContainer.clientHeight;
    
    for (let i = 0; i < this.pages.length; i++) {
      const page = this.pages[i];
      const rect = page.container.getBoundingClientRect();
      
      if (rect.top >= 0 && rect.top < containerHeight / 2) {
        return i + 1;
      }
    }
    
    return 1;
  }

  /**
   * Scroll to specific page
   */
  scrollToPage(pageNum) {
    if (pageNum < 1 || pageNum > this.pages.length) return;
    
    const pageContainer = this.pages[pageNum - 1].container;
    pageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Destroy the renderer and clean up resources
   * Properly releases memory and disconnects observers
   */
  destroy() {
    console.log('Destroying PDF renderer and cleaning up resources');
    
    // Disconnect intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    
    // Clear render queue
    this.renderQueue = [];
    
    // Clean up all rendered canvases
    this.renderedPages.forEach((canvas, pageNum) => {
      if (canvas && canvas.parentNode) {
        canvas.remove();
      }
    });
    this.renderedPages.clear();
    
    // Clean up page data
    this.pages.forEach(pageData => {
      if (pageData.canvas && pageData.canvas.parentNode) {
        pageData.canvas.remove();
      }
      pageData.canvas = null;
      pageData.page = null;
    });
    this.pages = [];
    
    // Destroy PDF document
    if (this.pdfDoc) {
      this.pdfDoc.destroy();
      this.pdfDoc = null;
    }
    
    // Clear container
    if (this.scrollContainer) {
      this.scrollContainer.innerHTML = '';
    }
    
    // Reset state
    this.isRendering = false;
    
    console.log('PDF renderer destroyed successfully');
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.PDFRenderer = PDFRenderer;
}
