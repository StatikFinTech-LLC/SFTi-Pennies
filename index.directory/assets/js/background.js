/**
 * SFTi-Pennies Trading Journal - Background Animation
 * Creates different background styles based on user customization
 */

// Use utilities from global SFTiUtils

class BackgroundAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    this.animationFrameId = null;
    
    // Animation parameters
    this.columns = Math.floor(this.canvas.width / 20);
    this.drops = new Array(this.columns).fill(1);
    // Matrix-style digital rain characters: numbers, letters, and special symbols
    this.symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?/~`'.split('');
    
    // Animation intensity constants
    this.BASE_RESET_THRESHOLD = 0.975;
    this.INTENSITY_ADJUSTMENT = 0.02;
    
    // Cached animation intensity
    this.cachedIntensity = 1.0;
    this.cachedDropSpeed = 3;
    this.cachedResetThreshold = this.BASE_RESET_THRESHOLD;
    this.lastIntensityUpdate = Date.now();
    
    // Bind methods
    this.animate = this.animate.bind(this);
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.updateBackground = this.updateBackground.bind(this);
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.columns = Math.floor(this.canvas.width / 20);
      this.drops = new Array(this.columns).fill(1);
    });
    
    // Initialize background based on saved settings
    this.updateBackground();
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  updateBackground() {
    // Get background type from accountManager
    let bgType = 'digital-rain'; // default
    if (window.accountManager) {
      const theme = window.accountManager.getCustomization('theme');
      if (theme && theme.backgroundType) {
        bgType = theme.backgroundType;
      }
    }
    
    // Stop any existing animation
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Apply background based on type
    switch (bgType) {
      case 'digital-rain':
        this.canvas.style.display = 'block';
        this.animate();
        break;
      case 'gradient':
        this.canvas.style.display = 'none';
        this.applyGradientBackground();
        break;
      case 'solid':
        this.canvas.style.display = 'none';
        this.applySolidBackground();
        break;
      default:
        this.canvas.style.display = 'block';
        this.animate();
    }
  }
  
  applyGradientBackground() {
    // Apply gradient to body
    const bgPrimary = this.getBackgroundColor('primary');
    const bgSecondary = this.getBackgroundColor('secondary');
    document.body.style.background = `linear-gradient(135deg, ${bgPrimary} 0%, ${bgSecondary} 100%)`;
    document.body.style.backgroundAttachment = 'fixed';
  }
  
  applySolidBackground() {
    // Apply solid color to body
    const bgPrimary = this.getBackgroundColor('primary');
    document.body.style.background = bgPrimary;
    document.body.style.backgroundImage = 'none';
  }
  
  getBackgroundColor(type) {
    const defaults = {
      primary: '#0a0e27',
      secondary: '#0f1429'
    };
    
    if (!window.accountManager) return defaults[type];
    
    const theme = window.accountManager.getCustomization('theme');
    if (!theme) return defaults[type];
    
    if (type === 'primary') {
      return theme.backgroundColor || defaults.primary;
    } else if (type === 'secondary') {
      return theme.secondaryColor || defaults.secondary;
    }
    
    return defaults[type];
  }
  
  animate() {
    // Get animation intensity (0.0 to 1.0) - check every second for changes
    const now = Date.now();
    if (now - this.lastIntensityUpdate > 1000) {
      let intensity = 1.0;
      if (window.accountManager) {
        const theme = window.accountManager.getCustomization('theme');
        if (theme && typeof theme.animationIntensity === 'number') {
          intensity = theme.animationIntensity;
        }
      }
      
      // Update cached values if intensity changed
      if (intensity !== this.cachedIntensity) {
        this.cachedIntensity = intensity;
        this.cachedDropSpeed = Math.max(1, Math.round(1 + (intensity * 2)));
        this.cachedResetThreshold = this.BASE_RESET_THRESHOLD + (this.INTENSITY_ADJUSTMENT * (1 - intensity));
      }
      this.lastIntensityUpdate = now;
    }
    
    const intensity = this.cachedIntensity;
    
    // Skip animation if intensity is 0
    if (intensity === 0) {
      this.ctx.fillStyle = 'rgba(10, 14, 39, 1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }
    
    // Adjust trail effect based on intensity
    const trailOpacity = 0.05 * intensity;
    this.ctx.fillStyle = `rgba(10, 14, 39, ${trailOpacity})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set text style with intensity-based opacity
    this.ctx.fillStyle = `rgba(0, 255, 136, ${intensity})`;
    this.ctx.font = '15px JetBrains Mono, monospace';
    
    // Use cached drop speed
    const dropSpeed = this.cachedDropSpeed;
    
    // Draw symbols
    for (let i = 0; i < this.drops.length; i++) {
      // Random symbol
      const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
      const x = i * 20;
      const y = this.drops[i] * 20;
      
      this.ctx.fillText(symbol, x, y);
      
      // Reset drop to top randomly (use cached threshold)
      if (y > this.canvas.height && Math.random() > this.cachedResetThreshold) {
        this.drops[i] = 0;
      }
      
      // Increment Y coordinate based on speed
      this.drops[i] += dropSpeed;
    }
    
    this.animationFrameId = requestAnimationFrame(this.animate);
  }
}

// Initialize when DOM is loaded
let backgroundAnimationInstance;
SFTiUtils.onDOMReady(() => {
  backgroundAnimationInstance = new BackgroundAnimation('bg-canvas');
  
  // Listen for background changes from customization page
  window.addEventListener('backgroundChanged', () => {
    if (backgroundAnimationInstance) {
      backgroundAnimationInstance.updateBackground();
    }
  });
});
