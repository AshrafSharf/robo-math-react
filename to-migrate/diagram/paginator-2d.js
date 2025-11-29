/**
 * Paginator2D - Controls step-by-step animation for 2D diagrams
 * Similar to the 3D paginator but adapted for 2D visualizations
 */

export class Paginator2D {
  constructor(animatedDiagram, staticDiagram, stepsArray = [], stepDescriptions = {}) {
    this.animatedDiagram = animatedDiagram;
    this.staticDiagram = staticDiagram;
    this.stepsArray = stepsArray;
    this.stepDescriptions = stepDescriptions;
    
    // Generator tracking
    this.currentGenerator = null;
    this.currentIndex = -1; // -1 means not started
    this.isAnimating = false;
    
    // UI elements
    this.container = null;
    this.buttons = {};
    this.textDisplay = null;
    
    // Create UI if we're in a browser environment
    if (typeof document !== 'undefined') {
      this.createUI();
    }
  }
  
  /**
   * Create the paginator UI controls
   */
  createUI() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'paginator-2d';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 20px;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.95);
      padding: 10px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Create text display
    this.textDisplay = document.createElement('div');
    this.textDisplay.style.cssText = `
      min-width: 200px;
      font-size: 14px;
      color: #333;
    `;
    this.textDisplay.textContent = 'Ready to start';
    
    // Create Start/Stop button
    this.buttons.toggle = document.createElement('button');
    this.buttons.toggle.textContent = 'Start';
    this.buttons.toggle.style.cssText = `
      padding: 8px 16px;
      font-size: 14px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #4CAF50;
      color: white;
      transition: background 0.3s;
    `;
    this.buttons.toggle.onmouseover = () => {
      this.buttons.toggle.style.background = this.currentIndex >= 0 ? '#d32f2f' : '#45a049';
    };
    this.buttons.toggle.onmouseout = () => {
      this.buttons.toggle.style.background = this.currentIndex >= 0 ? '#f44336' : '#4CAF50';
    };
    this.buttons.toggle.onclick = () => this.handleToggle();
    
    // Create Next button
    this.buttons.next = document.createElement('button');
    this.buttons.next.textContent = 'Next';
    this.buttons.next.style.cssText = `
      padding: 8px 16px;
      font-size: 14px;
      border: none;
      border-radius: 4px;
      cursor: not-allowed;
      background: #e0e0e0;
      color: #999;
      transition: background 0.3s;
    `;
    this.buttons.next.disabled = true;
    this.buttons.next.onclick = () => this.handleNext();
    
    // Add elements to container
    this.container.appendChild(this.textDisplay);
    this.container.appendChild(this.buttons.toggle);
    this.container.appendChild(this.buttons.next);
    
    // Add to document body
    document.body.appendChild(this.container);
  }
  
  /**
   * Render static diagram (all steps at once)
   */
  renderStaticDiagram() {
    if (this.staticDiagram && this.staticDiagram.renderGenerator) {
      // Clear first
      this.staticDiagram.clearAll();
      
      // Get generator and run through all steps
      const generator = this.staticDiagram.renderGenerator();
      let result = generator.next();
      
      while (!result.done) {
        result = generator.next();
      }
    }
  }
  
  /**
   * Start animated diagram sequence
   */
  start() {
    if (this.animatedDiagram && this.animatedDiagram.renderGenerator) {
      // Clear both diagrams
      this.animatedDiagram.clearAll();
      if (this.staticDiagram) {
        this.staticDiagram.clearAll();
      }
      
      // Get the generator
      this.currentGenerator = this.animatedDiagram.renderGenerator();
      this.currentIndex = 0;
      this.isAnimating = true;
      
      // Update UI
      this.updateUI();
      
      return this.currentGenerator;
    }
    return null;
  }
  
  /**
   * Stop animation and return to static view
   */
  stop() {
    // Stop any current animation
    this.animatedDiagram.stopAnimation();
    
    // Clear animated diagram
    this.animatedDiagram.clearAll();
    
    // Reset state
    this.currentGenerator = null;
    this.currentIndex = -1;
    this.isAnimating = false;
    
    // Restore static diagram
    this.renderStaticDiagram();
    
    // Update UI
    this.updateUI();
  }
  
  /**
   * Advance to next step
   */
  async handleNext() {
    if (!this.currentGenerator || !this.isAnimating) {
      return;
    }
    
    // Advance generator to next yield
    const result = this.currentGenerator.next();
    
    if (!result.done) {
      // Play animations queued since last yield
      await this.animatedDiagram.playNext();
      
      // Update step index
      this.currentIndex++;
      
      // Update text if we have descriptions
      if (this.stepsArray[this.currentIndex] && this.stepDescriptions) {
        const stepKey = this.stepsArray[this.currentIndex];
        if (this.stepDescriptions[stepKey]) {
          this.updateText(this.stepDescriptions[stepKey]);
        }
      } else {
        this.updateText(`Step ${this.currentIndex + 1}`);
      }
    } else {
      // Animation complete
      this.updateText('Animation complete');
      this.buttons.next.disabled = true;
      this.buttons.next.style.background = '#e0e0e0';
      this.buttons.next.style.color = '#999';
      this.buttons.next.style.cursor = 'not-allowed';
    }
  }
  
  /**
   * Handle Start/Stop toggle
   */
  handleToggle() {
    if (this.currentIndex < 0) {
      // Start
      this.start();
    } else {
      // Stop
      this.stop();
    }
  }
  
  /**
   * Update UI state
   */
  updateUI() {
    if (!this.buttons.toggle) return;
    
    if (this.currentIndex >= 0) {
      // Currently running - show Stop button
      this.buttons.toggle.textContent = 'Stop';
      this.buttons.toggle.style.background = '#f44336';
      
      // Enable Next button
      this.buttons.next.disabled = false;
      this.buttons.next.style.background = '#2196F3';
      this.buttons.next.style.color = 'white';
      this.buttons.next.style.cursor = 'pointer';
      this.buttons.next.onmouseover = () => {
        this.buttons.next.style.background = '#1976D2';
      };
      this.buttons.next.onmouseout = () => {
        this.buttons.next.style.background = '#2196F3';
      };
      
      this.updateText('Click Next to advance');
    } else {
      // Not running - show Start button
      this.buttons.toggle.textContent = 'Start';
      this.buttons.toggle.style.background = '#4CAF50';
      
      // Disable Next button
      this.buttons.next.disabled = true;
      this.buttons.next.style.background = '#e0e0e0';
      this.buttons.next.style.color = '#999';
      this.buttons.next.style.cursor = 'not-allowed';
      this.buttons.next.onmouseover = null;
      this.buttons.next.onmouseout = null;
      
      this.updateText('Ready to start');
    }
  }
  
  /**
   * Update display text
   */
  updateText(text) {
    if (this.textDisplay) {
      this.textDisplay.textContent = text;
    }
  }
  
  /**
   * Set up keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowRight':
        case ' ':
          if (!this.buttons.next.disabled) {
            this.handleNext();
            e.preventDefault();
          }
          break;
          
        case 'Enter':
          this.handleToggle();
          e.preventDefault();
          break;
          
        case 'Escape':
          if (this.currentIndex >= 0) {
            this.stop();
            e.preventDefault();
          }
          break;
      }
    });
  }
  
  /**
   * Clean up and remove UI
   */
  dispose() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Stop any running animations
    if (this.isAnimating) {
      this.stop();
    }
  }
}

/**
 * Create a paginator instance
 */
export function createPaginator2D(animatedDiagram, staticDiagram, stepsArray = [], stepDescriptions = {}) {
  const paginator = new Paginator2D(animatedDiagram, staticDiagram, stepsArray, stepDescriptions);
  
  // Set up keyboard navigation
  paginator.setupKeyboardNavigation();
  
  return paginator;
}