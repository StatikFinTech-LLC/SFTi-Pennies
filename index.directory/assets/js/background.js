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
    // Semi-transparent black for trail effect
    this.ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set text style
    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = '15px JetBrains Mono, monospace';
    
    // Draw symbols
    for (let i = 0; i < this.drops.length; i++) {
      // Random symbol
      const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
      const x = i * 20;
      const y = this.drops[i] * 20;
      
      this.ctx.fillText(symbol, x, y);
      
      // Reset drop to top randomly
      if (y > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      
      // Increment Y coordinate
      this.drops[i]++;
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
