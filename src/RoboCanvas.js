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
import { Diagram } from './diagram/diagram.js';
import { AnimatedDiagram } from './diagram/animated-diagram.js';

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

    // Note: Container positioning and overflow are handled by CSS (.robo-shell-main-playsurface)
    // We only need to ensure the canvas section is properly sized for scrolling

    // Create single canvas section (scrollable)
    // Height will be very tall (logicalHeight × 100px) to support scrolling
    const canvasHeight = this.options.logicalHeight * 100;  // 200 × 100 = 20000px
    this.canvasSection = document.createElement('div');
    this.canvasSection.id = 'robo-canvas-section';
    this.canvasSection.style.width = this.options.canvasWidth + 'px';
    this.canvasSection.style.height = canvasHeight + 'px';  // Fixed large height
    this.canvasSection.style.position = 'relative';
    this.canvasSection.style.backgroundColor = '#f9f9f9';
    this.containerElement.appendChild(this.canvasSection);
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
      // Each logical row should be ~100px apart for comfortable layout
      const pixelHeight = this.options.logicalHeight * 100;  // 200 rows × 100px = 20000px
      const coordinateMapper = new LogicalCoordinateMapper(
        this.options.canvasWidth,  // 1200px width
        pixelHeight,               // 20000px height (scrollable)
        this.options.logicalWidth,  // 8 columns
        this.options.logicalHeight  // 200 rows
      );
      console.log(`Coordinate Mapper: ${this.options.logicalWidth}×${this.options.logicalHeight} logical → ${this.options.canvasWidth}×${pixelHeight}px (${pixelHeight / this.options.logicalHeight}px per row)`);

      // Create diagram options (canvasSection replaces textSection)
      const diagramOptions = {
        canvasSection: this.canvasSection,
        coordinateMapper: coordinateMapper,
        roboCanvas: this  // Pass reference for auto-scrolling
      };

      // Create both diagram instances (no shared Grapher - created on demand)
      console.log('Creating static and animated diagram instances...');
      this.staticDiagram = new Diagram(diagramOptions);
      this.animatedDiagram = new AnimatedDiagram(diagramOptions);

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
      // Clear current diagram content
      this.diagram.clearAll();

      // Switch pointer to static diagram
      this.diagram = this.staticDiagram;

      // Explicitly disable animation mode (defensive - staticDiagram may inherit this method)
      if (this.diagram.setAnimateMode) {
        this.diagram.setAnimateMode(false);
      }

      this.isAnimatedMode = false;
      console.log('✅ Switched to static diagram');
      console.log('✅ this.diagram is now:', this.diagram.constructor.name);
    }
  }

  /**
   * Switch to animated mode (queued animations)
   */
  useAnimatedDiagram() {
    if (!this.initialized) {
      throw new Error('RoboCanvas not initialized. Call await roboCanvas.init() first.');
    }

    if (!this.isAnimatedMode) {
      // Clear current diagram content
      this.diagram.clearAll();

      // Switch pointer to animated diagram
      this.diagram = this.animatedDiagram;

      // Explicitly enable animation mode
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
    // Clear the current active diagram
    if (this.diagram) {
      this.diagram.clearAll();
    }
  }

  /**
   * Scroll to a component smoothly using exact position calculation
   * @param {Object} component - Component to scroll to (mathText or Grapher)
   * @param {Object} options - Scroll options {position: 'center'|'top'|'bottom', offset: number}
   */
  scrollToComponent(component, options = {}) {
    const element = this._getComponentElement(component);
    if (!element) {
      console.warn('scrollToComponent: No element found for component', component);
      return;
    }

    // Calculate exact scroll position using getBoundingClientRect
    const elementRect = element.getBoundingClientRect();
    const containerRect = this.containerElement.getBoundingClientRect();

    // Calculate target scroll position
    let targetScrollTop;
    const position = options.position || 'center';
    const offset = options.offset || 0;

    switch (position) {
      case 'top':
        targetScrollTop = this.containerElement.scrollTop + elementRect.top - containerRect.top + offset;
        break;
      case 'bottom':
        targetScrollTop = this.containerElement.scrollTop + elementRect.bottom - containerRect.bottom + offset;
        break;
      case 'center':
      default:
        // Center the element in the viewport
        const elementCenter = elementRect.top + elementRect.height / 2;
        const containerCenter = containerRect.top + containerRect.height / 2;
        targetScrollTop = this.containerElement.scrollTop + (elementCenter - containerCenter) + offset;
        break;
    }

    console.log(`📜 Scrolling to component: current=${this.containerElement.scrollTop}, target=${targetScrollTop}`);

    // Smooth scroll to calculated position
    this.containerElement.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  }

  /**
   * Get DOM element from component (helper method)
   * @private
   */
  _getComponentElement(component) {
    // MathTextComponent has containerDOM
    if (component && component.containerDOM) {
      return component.containerDOM;
    }
    // Grapher has containerDOM through its parent
    else if (component && component.getContainerDOM) {
      return component.getContainerDOM();
    }
    // Graph container wrapper {grapher, containerDiv}
    else if (component && component.containerDiv) {
      return component.containerDiv;
    }
    return null;
  }

  /**
   * Destroy the canvas and clean up resources
   */
  destroy() {
    // Destroy both diagram instances (they will clean up their graphContainers)
    if (this.staticDiagram && this.staticDiagram.destroy) {
      this.staticDiagram.destroy();
    }
    if (this.animatedDiagram && this.animatedDiagram.destroy) {
      this.animatedDiagram.destroy();
    }

    // Clean up references
    this.staticDiagram = null;
    this.animatedDiagram = null;
    this.diagram = null;

    // Clear the container
    this.containerElement.innerHTML = '';
    this.initialized = false;
  }
}
