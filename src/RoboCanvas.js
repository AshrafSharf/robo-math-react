/**
 * RoboCanvas
 * Unified canvas system with infinite vertical scroll
 * Jupyter-notebook style: create text and graph cells at any position
 *
 * Layout:
 * - Single scrollable canvas_section with logical coordinate system
 * - Multiple text cells (mathText) and graph cells (graphContainer) can be placed anywhere
 *
 * Usage:
 *   const roboCanvas = new RoboCanvas(document.getElementById('container'));
 *   await roboCanvas.init();
 *   roboCanvas.diagram.mathText('x^2', 2, 3);
 *   const gc = roboCanvas.diagram.graphContainer(0, 5, {width: 600, height: 400});
 *   roboCanvas.diagram.point(gc, {x: 0, y: 0});
 */

import { PenTracerImpl } from './pen/pen-tracer-impl.js';
import { LogicalCoordinateMapper } from './mathtext/components/logical-coordinate-mapper.js';
import { StaticDiagram2d } from './diagram/static-diagram-2d.js';
import { AnimatedDiagram2d } from './diagram/animated-diagram-2d.js';
import { TweenMax, Power2 } from 'gsap';

export class RoboCanvas {
  /**
   * @param {HTMLElement} containerElement - Container div element
   * @param {Object} options - Configuration options
   */
  constructor(containerElement, options = {}) {
    this.containerElement = containerElement;
    this.options = {
      canvasWidth: options.canvasWidth || 1200,  // Default canvas width
      logicalWidth: options.logicalWidth || 8,
      logicalHeight: options.logicalHeight || 200,  // Much taller for vertical scroll
      textOptions: options.textOptions || {
        fontSize: 32,
        stroke: '#000000'
      }
    };

    this.initialized = false;
    this.diagram = null;
    this.isAnimatedMode = false;
    this.penTracer = null;

    // Create layout
    this._createLayout();
  }

  /**
   * Create single scrollable canvas layout (Jupyter-style)
   * @private
   */
  _createLayout() {
    // Clear container
    this.containerElement.innerHTML = '';

    // Use the container element directly as the canvas section
    // CSS handles positioning/overflow via .robo-shell-main-playsurface
    const canvasHeight = this.options.logicalHeight * 100;  // 200 × 100 = 20000px
    this.canvasSection = this.containerElement;
    this.canvasSection.id = 'robo-canvas-section';
    this.canvasSection.style.minHeight = canvasHeight + 'px';
    this.canvasSection.style.position = 'relative';
  }

  /**
   * Initialize the RoboCanvas
   * Must be called before using text or diagram methods
   * Note: PluginInitializer is now called in main.jsx before React renders
   *
   * @returns {Promise} Resolves when initialization is complete
   */
  async init() {
    if (this.initialized) {
      console.warn('RoboCanvas already initialized');
      return;
    }

    console.log('Initializing RoboCanvas...');

    try {
      // Plugins (MathJax, GSAP, etc.) are already initialized in main.jsx
      console.log('Using pre-loaded plugins...');

      // Initialize pen tracer
      console.log('Initializing pen tracer...');
      this.penTracer = new PenTracerImpl(document.body);
      this.penTracer.init();
      console.log('Pen tracer initialized');

      // Create logical coordinate mapper for the entire canvas
      console.log('Creating coordinate mapper...');
      // Use a large pixel height for proper vertical spacing in scrollable canvas
      // 25px per logical unit for both columns and rows
      const PIXELS_PER_UNIT = 25;
      const pixelWidth = this.options.logicalWidth * PIXELS_PER_UNIT;
      const pixelHeight = this.options.logicalHeight * PIXELS_PER_UNIT;
      const coordinateMapper = new LogicalCoordinateMapper(
        pixelWidth,
        pixelHeight,
        this.options.logicalWidth,
        this.options.logicalHeight
      );
      console.log(`Coordinate Mapper: ${this.options.logicalWidth}×${this.options.logicalHeight} logical → ${pixelWidth}×${pixelHeight}px (${PIXELS_PER_UNIT}px per unit)`);

      // Create both diagram instances (no shared Grapher - created on demand)
      console.log('Creating static and animated diagram instances...');
      this.staticDiagram = new StaticDiagram2d(coordinateMapper, this.canvasSection, this);
      this.animatedDiagram = new AnimatedDiagram2d(coordinateMapper, this.canvasSection, this);

      // Start with static diagram
      this.diagram = this.staticDiagram;
      this.isAnimatedMode = false;
      console.log('Diagram instances created');

      this.initialized = true;
      console.log('RoboCanvas initialized successfully');

    } catch (error) {
      console.error('Failed to initialize RoboCanvas:', error);
      throw error;
    }
  }


  /**
   * Switch to static mode (instant rendering, no animations)
   */
  useStaticDiagram() {
    if (!this.initialized) {
      throw new Error('RoboCanvas not initialized. Call await roboCanvas.init() first.');
    }

    if (this.isAnimatedMode) {
      this.diagram.clearAll();
      this.diagram = this.staticDiagram;
      this.isAnimatedMode = false;
      console.log('✅ Switched to static diagram');
      console.log('✅ this.diagram is now:', this.diagram.constructor.name);
    }
  }

  /**
   * Switch to animated mode (queued animations)
   * @param {boolean} clearCanvas - Whether to clear canvas when switching (default: true)
   */
  useAnimatedDiagram(clearCanvas = true) {
    if (!this.initialized) {
      throw new Error('RoboCanvas not initialized. Call await roboCanvas.init() first.');
    }

    if (!this.isAnimatedMode) {
      if (clearCanvas) {
        this.diagram.clearAll();
      }
      this.diagram = this.animatedDiagram;
      this.diagram.setAnimateMode(true);
      this.isAnimatedMode = true;
      console.log('✅ Switched to animated diagram');
      console.log('✅ this.diagram is now:', this.diagram.constructor.name);
      console.log('✅ this.diagram.animateMode:', this.diagram.animateMode);
    }
  }


  /**
   * Get container element
   * @returns {HTMLElement}
   */
  getContainer() {
    return this.containerElement;
  }

  /**
   * Get canvas section element (parent for all content)
   * @returns {HTMLElement}
   */
  getCanvasSection() {
    return this.canvasSection;
  }

  /**
   * Clear all content (text and graphics)
   */
  clearAll() {
    this.diagram.clearAll();
  }

  /**
   * Scroll to a component smoothly using exact position calculation
   * @param {Object} component - Component to scroll to (mathText or Grapher)
   * @param {Object} options - Scroll options {position: 'center'|'top'|'bottom', offset: number}
   * @returns {Promise} Resolves when scroll animation completes
   */
  scrollToComponent(component, options = {}) {
    return new Promise((resolve) => {
      const element = component.containerDOM;

      // Get current scroll state
      const currentScroll = this.containerElement.scrollTop;
      const containerHeight = this.containerElement.clientHeight;
      const maxScrollTop = this.containerElement.scrollHeight - containerHeight;

      // Parse the CSS top value directly (we set it via inline styles)
      // offsetTop doesn't work reliably with position:absolute, so use getComputedStyle
      const computedStyle = window.getComputedStyle(element);
      const cssTop = computedStyle.top;
      const elementAbsoluteTop = parseFloat(cssTop) || 0;  // Parse "100px" -> 100
      const elementHeight = element.offsetHeight;

      console.log(`📍 Element: ${element.id}, cssTop=${cssTop}, parsed=${elementAbsoluteTop}`);
      console.log(`📍 Element info: height=${elementHeight}`);
      console.log(`📍 Container: scrollTop=${currentScroll}, height=${containerHeight}, maxScroll=${maxScrollTop}`);

      // Calculate target scroll position
      let targetScrollTop;
      const position = options.position || 'center';
      const offset = options.offset || 0;

      switch (position) {
        case 'top':
          targetScrollTop = elementAbsoluteTop + offset;
          break;
        case 'bottom':
          targetScrollTop = elementAbsoluteTop + elementHeight - containerHeight + offset;
          break;
        case 'center':
        default:
          // Center the element in the viewport
          const elementCenter = elementAbsoluteTop + elementHeight / 2;
          const viewportCenter = containerHeight / 2;
          targetScrollTop = elementCenter - viewportCenter + offset;
          break;
      }

      // Clamp target to valid scroll range
      targetScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

      const scrollDistance = Math.abs(targetScrollTop - currentScroll);
      const direction = targetScrollTop > currentScroll ? 'DOWN' : 'UP';

      console.log(`📜 Scroll ${direction}: current=${currentScroll}, target=${targetScrollTop}, distance=${scrollDistance}px`);

      // If already close enough (within 50px), skip scrolling - resolve immediately
      if (scrollDistance < 50) {
        console.log('📜 Already close enough, skipping scroll');
        resolve();
        return;
      }

      // Use GSAP for smooth scroll with proper completion callback
      TweenMax.to(this.containerElement, 0.5, {
        scrollTop: targetScrollTop,
        ease: Power2.easeInOut,
        onComplete: () => {
          console.log(`📜 Scroll ${direction} complete: final position=${this.containerElement.scrollTop}`);
          // Wait for browser repaint before resolving
          // This ensures getBoundingClientRect() returns fresh coordinates
          requestAnimationFrame(() => {
            console.log('📜 Browser repainted, coordinates now stable');
            resolve();
          });
        }
      });
    });
  }

  /**
   * Destroy the canvas and clean up resources
   */
  destroy() {
    this.staticDiagram?.destroy();
    this.animatedDiagram?.destroy();
    this.staticDiagram = null;
    this.animatedDiagram = null;
    this.diagram = null;
    this.containerElement.innerHTML = '';
    this.initialized = false;
  }
}
