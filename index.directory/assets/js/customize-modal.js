/**
 * Customize Modal Component
 * Dynamically injects the customization modal into all pages
 * Follows the glowing-bubbles pattern for consistency
 */

(function() {
  'use strict';
  
  /**
   * Initialize customize modal
   * Determines the correct path and injects modal HTML
   */
  function initCustomizeModal() {
    // Check if modal already exists to prevent duplicates
    const existingModal = document.getElementById('customize-modal');
    if (existingModal) {
      return;
    }
    
    // Determine base path robustly based on current location
    const pathParts = window.location.pathname.split('/').filter(part => part !== '');
    let basePath = '';
    
    // Find the index of 'index.directory' in the path
    const indexDirIdx = pathParts.indexOf('index.directory');
    
    if (indexDirIdx !== -1) {
      // We are inside index.directory
      const afterIndexDir = pathParts.length - (indexDirIdx + 1) - 1;
      
      if (afterIndexDir <= 0) {
        // At root of index.directory
        basePath = '';
      } else {
        // In subdirectory of index.directory
        basePath = '../'.repeat(afterIndexDir);
      }
    } else {
      // At site root
      basePath = 'index.directory/';
    }
    
    // Create modal HTML with correct asset paths
    const modalHTML = `
      <div id="customize-modal" class="modal-overlay" style="display: none;">
        <div class="modal-container" style="max-width: 700px; width: 95%;">
          <div class="modal-header">
            <h3 style="margin: 0; color: var(--accent-green); display: flex; align-items: center; gap: 0.5rem;">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Customize Your Journal
            </h3>
            <button onclick="closeCustomizeModal()" class="modal-close" title="Close">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">
            Personalize your trading journal with custom colors, themes, and preferences.
          </p>
          
          <!-- Layout Toggle Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <p style="color: var(--text-secondary); margin: 0; font-size: 0.875rem;">
              Select a category to customize
            </p>
            <button id="category-layout-toggle" class="layout-toggle-btn" title="Switch Layout">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
            </button>
          </div>
          
          <!-- Customization Categories Grid -->
          <div class="customize-categories-container" data-layout="grid" style="margin-bottom: 1.5rem;">
            
            <!-- Color Customization Card -->
            <div class="customize-category-card" tabindex="0" role="button" aria-label="Customize colors" data-category="colors">
              <img src="${basePath}assets/img/colors-icon.svg" alt="Colors" style="width: 48px; height: 48px; margin-bottom: 0.5rem;" />
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">Colors</h4>
              <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary);">Customize accent colors and theme</p>
            </div>
            
            <!-- Theme Customization Card -->
            <div class="customize-category-card" tabindex="0" role="button" aria-label="Customize themes" data-category="themes">
              <img src="${basePath}assets/img/themes-icon.svg" alt="Themes" style="width: 48px; height: 48px; margin-bottom: 0.5rem;" />
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">Themes</h4>
              <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary);">Light/Dark mode and effects</p>
            </div>
            
            <!-- Preferences Card -->
            <div class="customize-category-card" tabindex="0" role="button" aria-label="Customize preferences" data-category="preferences">
              <img src="${basePath}assets/img/preferences-icon.svg" alt="Preferences" style="width: 48px; height: 48px; margin-bottom: 0.5rem;" />
              <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">Preferences</h4>
              <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary);">Date format, currency, timezone</p>
            </div>
            
          </div>
          
          <!-- Customization Content Area (dynamically populated) -->
          <div id="customize-content" style="display: none; padding: 1.5rem; background: var(--bg-tertiary); border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
            <!-- Content will be dynamically inserted here -->
          </div>
          
          <!-- Action Buttons -->
          <div id="customize-actions" style="display: none; justify-content: flex-end; gap: 1rem;">
            <button onclick="cancelCustomization()" class="btn-secondary">
              Cancel
            </button>
            <button onclick="resetCustomization()" class="btn-secondary" style="border-color: var(--accent-yellow); color: var(--accent-yellow);">
              Reset to Default
            </button>
            <button onclick="applyCustomization()" class="btn-primary">
              Apply Changes
            </button>
          </div>
          
        </div>
      </div>
    `;
    
    // Insert modal into the page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize modal event listeners after DOM insertion
    initModalEventListeners();
  }
  
  /**
   * Initialize event listeners for the modal
   * Called after modal HTML is injected into DOM
   */
  function initModalEventListeners() {
    // Setup category cards
    const categoryCards = document.querySelectorAll('.customize-category-card');
    categoryCards.forEach(setupCategoryCard);
    
    // Setup layout toggle
    const layoutToggleBtn = document.getElementById('category-layout-toggle');
    if (layoutToggleBtn) {
      layoutToggleBtn.addEventListener('click', toggleCategoryLayout);
    }
    
    // Initialize layout from localStorage if container exists
    const customizeCategoriesContainer = document.querySelector('.customize-categories-container');
    if (customizeCategoriesContainer) {
      initializeCategoryLayout();
    }
  }
  
  /**
   * Setup individual category card
   */
  function setupCategoryCard(card) {
    const category = card.dataset.category;
    
    // Click handler
    card.addEventListener('click', () => handleCategorySelection(category));
    
    // Keyboard handler for accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCategorySelection(category);
      }
    });
  }
  
  /**
   * Handle category selection - navigate to customization page
   */
  function handleCategorySelection(category) {
    // Determine if we're in index.directory or at root
    const pathParts = window.location.pathname.split('/').filter(part => part !== '');
    const inIndexDirectory = pathParts.includes('index.directory');
    
    const encodedCategory = encodeURIComponent(category);
    
    // Get current page name for HTML-specific customizations
    const currentPage = getCurrentPageName();
    const pageParam = currentPage ? `&page=${encodeURIComponent(currentPage)}` : '';
    
    if (inIndexDirectory) {
      // Already in index.directory, use relative path
      window.location.href = `customization.html?category=${encodedCategory}${pageParam}`;
    } else {
      // From root, navigate to index.directory
      const basePath = window.SFTiUtils ? SFTiUtils.getBasePath() : '';
      window.location.href = `${basePath}/index.directory/customization.html?category=${encodedCategory}${pageParam}`;
    }
  }
  
  /**
   * Get current page name for HTML-specific customization
   * @returns {string} Page name (e.g., 'index', 'analytics', 'add-trade')
   */
  function getCurrentPageName() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    if (!filename || filename === '') {
      return 'index';
    }
    
    // Remove .html extension
    return filename.replace('.html', '');
  }
  
  /**
   * Toggle between grid and list layout
   */
  function toggleCategoryLayout() {
    const container = document.querySelector('.customize-categories-container');
    if (!container) return;
    
    const currentLayout = container.dataset.layout || 'grid';
    const newLayout = currentLayout === 'grid' ? 'list' : 'grid';
    
    container.dataset.layout = newLayout;
    
    // Save to localStorage
    try {
      localStorage.setItem('customize-category-layout', newLayout);
    } catch (e) {
      console.warn('Could not save layout preference:', e);
    }
    
    // Update toggle button icon
    updateLayoutToggleButton(newLayout);
  }
  
  /**
   * Initialize layout from localStorage
   */
  function initializeCategoryLayout() {
    const container = document.querySelector('.customize-categories-container');
    if (!container) return;
    
    try {
      const savedLayout = localStorage.getItem('customize-category-layout') || 'grid';
      container.dataset.layout = savedLayout;
      updateLayoutToggleButton(savedLayout);
    } catch (e) {
      console.warn('Could not load layout preference:', e);
      container.dataset.layout = 'grid';
    }
  }
  
  /**
   * Update layout toggle button icon
   */
  function updateLayoutToggleButton(layout) {
    const toggleBtn = document.getElementById('category-layout-toggle');
    if (!toggleBtn) return;
    
    if (layout === 'grid') {
      toggleBtn.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
        </svg>
      `;
      toggleBtn.title = 'Switch to List View';
    } else {
      toggleBtn.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
        </svg>
      `;
      toggleBtn.title = 'Switch to Grid View';
    }
  }
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomizeModal);
  } else {
    initCustomizeModal();
  }
})();
