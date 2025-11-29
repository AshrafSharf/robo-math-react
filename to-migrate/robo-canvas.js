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
 *   roboCanvas.text.mathText('x^2', 2, 3);
 *   roboCanvas.diagram.point({x: 0, y: 0});
 */

import { PluginInitializer } from './src/plugins/plugin-initializer.js';
import { PenTracerImpl } from './src/pen/pen-tracer-impl.js';
import { LogicalCoordinateMapper } from './src/mathtext/components/logical-coordinate-mapper.js';
import { Diagram } from './src/diagram/diagram.js';
import { AnimatedDiagram } from './src/diagram/animated-diagram.js';

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
    this.animatedDiagram = null;
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

    // Create separate containers for static and animated diagrams
    this.staticGraphContainer = document.createElement('div');
    this.staticGraphContainer.id = 'static-graph-container';
    this.staticGraphContainer.style.width = '100%';
    this.staticGraphContainer.style.height = '100%';
    this.staticGraphContainer.style.position = 'absolute';
    this.staticGraphContainer.style.top = '0';
    this.staticGraphContainer.style.left = '0';
    this.graphSection.appendChild(this.staticGraphContainer);

    this.animatedGraphContainer = document.createElement('div');
    this.animatedGraphContainer.id = 'animated-graph-container';
    this.animatedGraphContainer.style.width = '100%';
    this.animatedGraphContainer.style.height = '100%';
    this.animatedGraphContainer.style.position = 'absolute';
    this.animatedGraphContainer.style.top = '0';
    this.animatedGraphContainer.style.left = '0';
    this.animatedGraphContainer.style.display = 'none'; // Hidden by default
    this.graphSection.appendChild(this.animatedGraphContainer);

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
   * This is a blocking call that initializes MathJax and other plugins
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
      // Initialize plugins (MathJax, GSAP, etc.)
      console.log('Loading plugins...');
      await PluginInitializer.initialize();
      console.log('Plugins loaded successfully');

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

      // Create diagram instances in separate containers
      console.log('Creating diagram instances...');
      const diagramOptions = {
        ...this.options.graphOptions,
        textSection: this.textSection,
        coordinateMapper: coordinateMapper,
        messageContainer: this.messageContainer
      };
      this.diagram = new Diagram(this.staticGraphContainer, diagramOptions);
      this.animatedDiagram = new AnimatedDiagram(this.animatedGraphContainer, diagramOptions);
      console.log('Diagram instances created');

      this.initialized = true;
      console.log('RoboCanvas initialized successfully');

    } catch (error) {
      console.error('Failed to initialize RoboCanvas:', error);
      throw error;
    }
  }


  /**
   * Switch to using static diagram (instant rendering)
   */
  useStaticDiagram() {
    if (!this.initialized) {
      throw new Error('RoboCanvas not initialized. Call await roboCanvas.init() first.');
    }
    this.animatedGraphContainer.style.display = 'none';
    this.staticGraphContainer.style.display = 'block';
  }

  /**
   * Switch to using animated diagram (queued animations)
   */
  useAnimatedDiagram() {
    if (!this.initialized) {
      throw new Error('RoboCanvas not initialized. Call await roboCanvas.init() first.');
    }
    this.staticGraphContainer.style.display = 'none';
    this.animatedGraphContainer.style.display = 'block';
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
    if (this.diagram) {
      this.diagram.clearAll();
    }
    if (this.animatedDiagram) {
      this.animatedDiagram.clearAll();
    }
  }

  /**
   * Clear only graphics content
   */
  clearGraphics() {
    if (this.diagram) {
      this.diagram.clearAll();
    }
    if (this.animatedDiagram) {
      this.animatedDiagram.clearAll();
    }
  }

  /**
   * Destroy the canvas and clean up resources
   */
  destroy() {
    this.containerElement.innerHTML = '';
    this.initialized = false;
  }
}
