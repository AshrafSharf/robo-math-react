/**
 * ExpressionFocusManager - Event-driven manager for expression focus indicators
 *
 * Listens for 'robo:expression-focus' and 'robo:expression-blur' events
 * and displays visual indicators pointing to the focused shape.
 *
 * Standalone module - no direct dependencies on other application code.
 */
import { FocusIndicator2D } from './FocusIndicator2D.js';
import { FocusIndicator3D } from './FocusIndicator3D.js';
import { ShapeAnchorAdapter } from './ShapeAnchorAdapter.js';

// Event names
export const FOCUS_EVENT = 'robo:expression-focus';
export const BLUR_EVENT = 'robo:expression-blur';

export class ExpressionFocusManager {
  constructor() {
    this.indicator2D = null;
    this.indicator3D = null;
    this.currentShape = null;
    this.isStarted = false;

    // Bind event handlers
    this.boundHandleFocus = this._handleFocus.bind(this);
    this.boundHandleBlur = this._handleBlur.bind(this);
  }

  /**
   * Start listening for focus events
   */
  start() {
    if (this.isStarted) return;

    document.addEventListener(FOCUS_EVENT, this.boundHandleFocus);
    document.addEventListener(BLUR_EVENT, this.boundHandleBlur);
    this.isStarted = true;
  }

  /**
   * Stop listening for focus events and cleanup
   */
  stop() {
    if (!this.isStarted) return;

    document.removeEventListener(FOCUS_EVENT, this.boundHandleFocus);
    document.removeEventListener(BLUR_EVENT, this.boundHandleBlur);
    this.clearFocus();
    this.isStarted = false;
  }

  /**
   * Handle focus event
   * @param {CustomEvent} event - Focus event with detail
   * @private
   */
  _handleFocus(event) {
    const { shape, annotationLayer, canvasSection, scene3d } = event.detail;

    // Always clear previous indicator first
    this.clearFocus();

    // Skip if no shape or shape is not visible
    if (!shape || !this._isVisibleShape(shape)) {
      return;
    }

    this.currentShape = shape;

    // Determine if 3D or 2D shape and show appropriate indicator
    if (this._is3DShape(shape) && scene3d) {
      this._showIndicator3D(shape, scene3d);
    } else if (annotationLayer && canvasSection) {
      this._showIndicator2D(shape, annotationLayer, canvasSection);
    }
  }

  /**
   * Handle blur event
   * @private
   */
  _handleBlur() {
    this.clearFocus();
  }

  /**
   * Show 2D indicator for SVG shapes
   * @param {Object} shape - The shape object
   * @param {SVGElement} annotationLayer - Annotation SVG layer
   * @param {HTMLElement} canvasSection - Canvas section element
   * @private
   */
  _showIndicator2D(shape, annotationLayer, canvasSection) {
    // Clear any existing 3D indicator
    if (this.indicator3D) {
      this.indicator3D.remove();
      this.indicator3D = null;
    }

    // Get shape anchor position using adapter
    const adapter = ShapeAnchorAdapter(shape, canvasSection);
    const anchor = adapter.getAnchor2D();
    if (!anchor) return;

    // Create indicator if not exists
    if (!this.indicator2D || !this.indicator2D.isAttached()) {
      this.indicator2D = new FocusIndicator2D();
      this.indicator2D.create(annotationLayer);
    }

    // Update indicator position
    this.indicator2D.update(anchor.x, anchor.y);
    this.indicator2D.show();
  }

  /**
   * Show 3D indicator for Three.js shapes
   * @param {Object} shape - The shape object (mesh or object with position)
   * @param {THREE.Scene} scene - Three.js scene
   * @private
   */
  _showIndicator3D(shape, scene) {
    // Clear any existing 2D indicator
    if (this.indicator2D) {
      this.indicator2D.remove();
      this.indicator2D = null;
    }

    // Get 3D position using adapter
    const adapter = ShapeAnchorAdapter(shape, null);
    const position = adapter.getPosition3D();
    if (!position) return;

    // Create indicator if not exists
    if (!this.indicator3D || !this.indicator3D.isAttached()) {
      this.indicator3D = new FocusIndicator3D();
      this.indicator3D.create(scene);
    }

    // Update indicator position
    this.indicator3D.update(position);
    this.indicator3D.show();
  }

  /**
   * Clear the current focus indicator
   */
  clearFocus() {
    if (this.indicator2D) {
      this.indicator2D.remove();
      this.indicator2D = null;
    }
    if (this.indicator3D) {
      this.indicator3D.remove();
      this.indicator3D = null;
    }
    this.currentShape = null;
  }

  /**
   * Check if shape is a 3D shape
   * @param {Object} shape - The shape object
   * @returns {boolean}
   * @private
   */
  _is3DShape(shape) {
    const adapter = ShapeAnchorAdapter(shape, null);
    return adapter.is3D();
  }

  /**
   * Check if shape is visible and can have an indicator
   * @param {Object} shape - The shape object
   * @returns {boolean}
   * @private
   */
  _isVisibleShape(shape) {
    if (!shape) return false;

    // Grapher/graph container - not a drawable shape
    if (shape.graphsheet2d && !shape.shapeGroup) return false;

    // Use adapter to check visibility (adapter handles visibility for each shape type)
    const adapter = ShapeAnchorAdapter(shape, null);
    return adapter.isVisible();
  }
}
