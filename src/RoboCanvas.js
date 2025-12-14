/**
 * RoboCanvas
 * Unified canvas system with infinite vertical scroll
 * Jupyter-notebook style: create text and graph cells at any position
 *
 * Layout:
 * - Single scrollable canvas_section with logical coordinate system
 * - Multiple text cells (mathText) and graph cells (graphContainer) can be placed anywhere
 * - Coordinates use (row, col) ordering - like spreadsheets
 *
 * Usage:
 *   const roboCanvas = new RoboCanvas(document.getElementById('container'));
 *   await roboCanvas.init();
 *   roboCanvas.mathText('x^2', 3, 2);  // row 3, col 2
 *   const gc = roboCanvas.diagram.graphContainer(0, 0, 16, 8);  // bounds: row 0-16, col 0-8
 *   roboCanvas.diagram.point(gc, {x: 0, y: 0});
 */

import { PenTracer } from './pen/pen-tracer.js';
import { LogicalCoordinateMapper } from './mathtext/components/logical-coordinate-mapper.js';
import { Diagram2d } from './diagram/diagram-2d.js';
import { MathTextComponent } from './mathtext/components/math-text-component.js';
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
    this.coordinateMapper = null;
    this.mathTextObjects = [];
    this.penTracer = null;
    this.annotationLayer = null;

    // Create layout
    this._createLayout();
  }

  /**
   * Create single scrollable canvas layout (Jupyter-style)
   * @private
   */
  _createLayout() {
    // Note: Don't clear innerHTML - React manages children (AnnotationLayer, GridOverlay)
    // Just set up the canvas section properties
    const canvasHeight = this.options.logicalHeight * 100;  // 200 × 100 = 20000px
    this.canvasSection = this.containerElement;
    this.canvasSection.id = 'robo-canvas-section';
    this.canvasSection.style.minHeight = canvasHeight + 'px';
    this.canvasSection.style.position = 'relative';
  }

  /**
   * Set the annotation layer SVG element (called by React)
   * @param {SVGSVGElement} svgElement
   */
  setAnnotationLayer(svgElement) {
    this.annotationLayer = svgElement;
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
      this.penTracer = new PenTracer(document.body);
      this.penTracer.init();
      console.log('Pen tracer initialized');

      // Create logical coordinate mapper for the entire canvas
      console.log('Creating coordinate mapper...');
      // Use a large pixel height for proper vertical spacing in scrollable canvas
      // 25px per logical unit for both columns and rows
      const PIXELS_PER_UNIT = 25;
      const pixelWidth = this.options.logicalWidth * PIXELS_PER_UNIT;
      const pixelHeight = this.options.logicalHeight * PIXELS_PER_UNIT;
      this.coordinateMapper = new LogicalCoordinateMapper(
        pixelWidth,
        pixelHeight,
        this.options.logicalWidth,
        this.options.logicalHeight
      );
      console.log(`Coordinate Mapper: ${this.options.logicalWidth}×${this.options.logicalHeight} logical → ${pixelWidth}×${pixelHeight}px (${PIXELS_PER_UNIT}px per unit)`);

      // Create single diagram instance
      console.log('Creating diagram instance...');
      this.diagram = new Diagram2d(this.coordinateMapper, this.canvasSection, this);
      console.log('Diagram instance created');

      this.initialized = true;
      console.log('RoboCanvas initialized successfully');

    } catch (error) {
      console.error('Failed to initialize RoboCanvas:', error);
      throw error;
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
    // Clear mathText objects
    this.mathTextObjects.forEach(obj => obj.remove?.());
    this.mathTextObjects = [];
  }

  // ============= MATH TEXT METHODS =============

  /**
   * Create a MathTextComponent at logical coordinates
   * @param {string} text - LaTeX mathematical expression
   * @param {number} row - Logical row coordinate
   * @param {number} col - Logical column coordinate
   * @param {Object} options - Rendering options {fontSize, stroke, fill}
   * @returns {MathTextComponent} Math text component
   */
  mathText(text, row, col, options = {}) {
    const mathComponent = new MathTextComponent(
      text,
      row,
      col,
      this.coordinateMapper,
      this.canvasSection,
      {
        fontSize: options.fontSize || 32,
        stroke: options.stroke || '#000000',
        fill: options.fill || '#000000'
      }
    );

    mathComponent.hide();
    mathComponent.disableStroke();
    this.mathTextObjects.push(mathComponent);
    return mathComponent;
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
   * Get the annotation layer SVG
   * @returns {SVGSVGElement}
   */
  getAnnotationLayer() {
    return this.annotationLayer;
  }

  /**
   * Destroy the canvas and clean up resources
   */
  destroy() {
    this.penTracer?.destroy();
    this.penTracer = null;
    this.staticDiagram?.destroy();
    this.animatedDiagram?.destroy();
    this.staticDiagram = null;
    this.animatedDiagram = null;
    this.diagram = null;
    // Don't clear innerHTML - React manages children (AnnotationLayer, GridOverlay)
    // Just clear our reference
    this.annotationLayer = null;
    this.initialized = false;
  }
}
