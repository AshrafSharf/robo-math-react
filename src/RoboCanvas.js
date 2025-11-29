/**
 * RoboCanvas
 * Unified canvas system that combines text and graphics
 *
 * Layout:
 * - Left 40%: Text area with logical coordinate system (8×16 grid)
 * - Right 60%: Graphics area using GraphContainer
 *
 * Usage:
 *   const roboCanvas = new RoboCanvas(document.getElementById('container'));
 *   await roboCanvas.init();
 *   roboCanvas.diagram.mathText('x^2', 2, 3);
 *   roboCanvas.diagram.point({x: 0, y: 0});
 */

import { PenTracerImpl } from './pen/pen-tracer-impl.js';
import { LogicalCoordinateMapper } from './mathtext/components/logical-coordinate-mapper.js';
import { Diagram } from './diagram/diagram.js';
import { AnimatedDiagram } from './diagram/animated-diagram.js';
import { Grapher } from './blocks/grapher.js';

export class RoboCanvas {
  /**
   * @param {HTMLElement} containerElement - Container div element
   * @param {Object} options - Configuration options
   */
  constructor(containerElement, options = {}) {
    this.containerElement = containerElement;
    this.options = {
      textWidthPercent: options.textWidthPercent || 40,
      graphWidthPercent: options.graphWidthPercent || 60,
      logicalWidth: options.logicalWidth || 8,
      logicalHeight: options.logicalHeight || 16,
      graphOptions: options.graphOptions || {
        showGrid: true,
        xRange: [-10, 10],
        yRange: [-10, 10]
      },
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
   * Create the split layout (text 40% / graph 60%)
   * @private
   */
  _createLayout() {
    // Clear container
    this.containerElement.innerHTML = '';

    // Set container styles
    this.containerElement.style.display = 'flex';
    this.containerElement.style.width = '100%';
    this.containerElement.style.height = '100%';
    this.containerElement.style.overflow = 'hidden';

    // Create text section (left)
    this.textSection = document.createElement('div');
    this.textSection.id = 'robo-canvas-text-section';
    this.textSection.style.width = `${this.options.textWidthPercent}%`;
    this.textSection.style.height = '100%';
    this.textSection.style.position = 'relative';
    this.textSection.style.backgroundColor = '#f9f9f9';
    this.textSection.style.borderRight = '2px solid #ccc';
    this.containerElement.appendChild(this.textSection);

    // Create graph section (right)
    this.graphSection = document.createElement('div');
    this.graphSection.id = 'robo-canvas-graph-section';
    this.graphSection.style.width = `${this.options.graphWidthPercent}%`;
    this.graphSection.style.height = '100%';
    this.graphSection.style.position = 'relative';
    this.graphSection.style.backgroundColor = '#ffffff';
    this.containerElement.appendChild(this.graphSection);

    // Create single graph container
    this.graphContainer = document.createElement('div');
    this.graphContainer.id = 'graph-container';
    this.graphContainer.style.width = '100%';
    this.graphContainer.style.height = '100%';
    this.graphContainer.style.position = 'absolute';
    this.graphContainer.style.top = '0';
    this.graphContainer.style.left = '0';
    this.graphSection.appendChild(this.graphContainer);

    // Create shared message container
    this.messageContainer = document.createElement('div');
    this.messageContainer.id = 'robo-canvas-message-container';
    this.messageContainer.className = 'message-container';
    this.messageContainer.style.position = 'absolute';
    this.messageContainer.style.top = '0';
    this.messageContainer.style.left = '0';
    this.messageContainer.style.width = '100%';
    this.messageContainer.style.height = '100%';
    this.messageContainer.style.pointerEvents = 'none';
    this.graphSection.appendChild(this.messageContainer);
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

      // Create logical coordinate mapper
      console.log('Creating coordinate mapper...');
      const textRect = this.textSection.getBoundingClientRect();
      const coordinateMapper = new LogicalCoordinateMapper(
        textRect.width,
        textRect.height,
        this.options.logicalWidth,
        this.options.logicalHeight
      );

      // Get the actual dimensions of the container
      const containerRect = this.containerElement.getBoundingClientRect();
      console.log('🔧 Container dimensions:', containerRect.width, 'x', containerRect.height);

      // Calculate graph section dimensions (60% of container width)
      const graphWidth = containerRect.width * (this.options.graphWidthPercent / 100);
      const graphHeight = containerRect.height;
      console.log('🔧 Graph section dimensions:', graphWidth, 'x', graphHeight);

      // Create Grapher options (includes dimensions and graph settings)
      const grapherOptions = {
        ...this.options.graphOptions,
        width: graphWidth,
        height: graphHeight
      };

      // Create single Grapher instance
      console.log('Creating Grapher instance...');
      this.grapher = new Grapher(this.graphContainer, grapherOptions);
      console.log('Grapher created');

      // Create diagram options (for text section and message container)
      const diagramOptions = {
        textSection: this.textSection,
        coordinateMapper: coordinateMapper,
        messageContainer: this.messageContainer
      };

      // Create both diagram instances sharing the same Grapher
      console.log('Creating static and animated diagram instances...');
      this.staticDiagram = new Diagram(this.grapher, diagramOptions);
      this.animatedDiagram = new AnimatedDiagram(this.grapher, diagramOptions);

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
   * Get text section element
   * @returns {HTMLElement}
   */
  getTextSection() {
    return this.textSection;
  }

  /**
   * Get graph section element
   * @returns {HTMLElement}
   */
  getGraphSection() {
    return this.graphSection;
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
   * Clear only graphics content
   */
  clearGraphics() {
    // Clear the current active diagram
    if (this.diagram) {
      this.diagram.clearAll();
    }
  }

  /**
   * Destroy the canvas and clean up resources
   */
  destroy() {
    // Destroy the Grapher (which cleans up SVG and shapes)
    if (this.grapher && this.grapher.destroy) {
      this.grapher.destroy();
    }

    // Clean up references
    this.staticDiagram = null;
    this.animatedDiagram = null;
    this.diagram = null;
    this.grapher = null;

    // Clear the container
    this.containerElement.innerHTML = '';
    this.initialized = false;
  }
}
