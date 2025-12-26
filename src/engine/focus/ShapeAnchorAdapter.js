/**
 * ShapeAnchorAdapter - Abstracts anchor position calculation for different shape types
 *
 * Provides a unified interface for getting anchor positions (for focus indicators)
 * that works with SVGScriptShape, MathTextComponent, TextItem, TextItemCollection, and 3D objects.
 */

/**
 * Get adapter for shape type
 * @param {Object} shape - The shape object
 * @param {HTMLElement} canvasSection - Canvas section element for coordinate calculation
 * @returns {BaseAnchorAdapter}
 */
export function ShapeAnchorAdapter(shape, canvasSection) {
  if (!shape) {
    return new NullAnchorAdapter();
  }

  // Check for SVGScriptShape (has shapeGroup with SVG.js node)
  if (shape.shapeGroup && shape.shapeGroup.node) {
    return new SVGShapeAnchorAdapter(shape, canvasSection);
  }

  // Check for MathTextComponent (has containerDOM)
  if (shape.containerDOM) {
    return new MathTextAnchorAdapter(shape, canvasSection);
  }

  // Check for TextItem (has mathComponent and selectionUnit)
  if (shape.mathComponent && shape.selectionUnit) {
    return new TextItemAnchorAdapter(shape, canvasSection);
  }

  // Check for TextItemCollection (has items array and get method)
  if (shape.items && Array.isArray(shape.items) && typeof shape.get === 'function') {
    return new TextItemCollectionAnchorAdapter(shape, canvasSection);
  }

  // Check for 3D shape (Three.js Object3D)
  if (shape.isObject3D || (shape.mesh && shape.mesh.isObject3D)) {
    return new ThreeJSAnchorAdapter(shape);
  }

  // Check for shape with position property (3D-like)
  if (shape.position && typeof shape.position.z === 'number') {
    return new ThreeJSAnchorAdapter(shape);
  }

  // Check for generic shapes with node that has getBoundingClientRect
  if (shape.node && typeof shape.node.getBoundingClientRect === 'function') {
    return new GenericNodeAnchorAdapter(shape, canvasSection);
  }

  // Check for TextItem with getCanvasBounds
  if (shape.getCanvasBounds) {
    return new CanvasBoundsAnchorAdapter(shape, canvasSection);
  }

  return new NullAnchorAdapter();
}

/**
 * Base adapter interface
 */
class BaseAnchorAdapter {
  constructor(shape, canvasSection) {
    this.shape = shape;
    this.canvasSection = canvasSection;
  }

  /**
   * Get 2D anchor position (canvas-relative coordinates)
   * @returns {{x: number, y: number}|null}
   */
  getAnchor2D() {
    return null;
  }

  /**
   * Get 3D position
   * @returns {{x: number, y: number, z: number}|null}
   */
  getPosition3D() {
    return null;
  }

  /**
   * Check if this is a 3D shape
   * @returns {boolean}
   */
  is3D() {
    return false;
  }

  /**
   * Check if shape is visible and can have an indicator
   * @returns {boolean}
   */
  isVisible() {
    return false;
  }

  /**
   * Helper to get canvas-relative coordinates from a bounding rect (center-top)
   * @param {DOMRect} bbox - Bounding rect from getBoundingClientRect
   * @returns {{x: number, y: number}}
   * @protected
   */
  _toCanvasCoords(bbox) {
    if (!this.canvasSection) return null;
    const canvasRect = this.canvasSection.getBoundingClientRect();
    return {
      x: (bbox.left + bbox.width / 2) - canvasRect.left + this.canvasSection.scrollLeft,
      y: bbox.top - canvasRect.top + this.canvasSection.scrollTop
    };
  }

  /**
   * Helper to get canvas-relative coordinates at the mid-top of bounding rect
   * @param {DOMRect} bbox - Bounding rect from getBoundingClientRect
   * @returns {{x: number, y: number}}
   * @protected
   */
  _toCanvasCoordsMidTop(bbox) {
    if (!this.canvasSection) return null;
    const canvasRect = this.canvasSection.getBoundingClientRect();
    return {
      x: (bbox.left + bbox.width / 2) - canvasRect.left + this.canvasSection.scrollLeft,
      y: bbox.top - canvasRect.top + this.canvasSection.scrollTop
    };
  }
}

/**
 * Adapter for SVG shapes (SVGScriptShape and subclasses)
 */
class SVGShapeAnchorAdapter extends BaseAnchorAdapter {
  getAnchor2D() {
    const node = this.shape.shapeGroup.node;
    if (!node) return null;

    // Temporarily show if hidden (display:none) to get accurate bounding rect
    const wasHidden = node.style.display === 'none';
    if (wasHidden) {
      node.style.display = '';
    }

    const bbox = node.getBoundingClientRect();

    // Restore hidden state
    if (wasHidden) {
      node.style.display = 'none';
    }

    return this._toCanvasCoords(bbox);
  }

  isVisible() {
    if (this.shape.visible === false) return false;
    return true;
  }
}

/**
 * Adapter for MathTextComponent (math text labels)
 */
class MathTextAnchorAdapter extends BaseAnchorAdapter {
  getAnchor2D() {
    // Get the SVG element inside containerDOM
    const container = this.shape.containerDOM;
    if (!container) return null;

    const svg = container.querySelector('svg');
    if (svg) {
      const bbox = svg.getBoundingClientRect();
      return this._toCanvasCoordsMidTop(bbox);
    }

    // Fallback to container
    const bbox = container.getBoundingClientRect();
    return this._toCanvasCoordsMidTop(bbox);
  }

  isVisible() {
    const container = this.shape.containerDOM;
    if (!container) return false;
    const style = window.getComputedStyle(container);
    return style.display !== 'none';
  }
}

/**
 * Adapter for TextItem (extracted portion of MathTextComponent)
 */
class TextItemAnchorAdapter extends BaseAnchorAdapter {
  getAnchor2D() {
    // Get SVG paths from TextItem and calculate bbox
    const paths = this._getSVGPaths();
    if (paths && paths.length > 0) {
      const bbox = this._calculateBBoxFromPaths(paths);
      if (bbox) {
        // Use top-left for text elements
        return this._toCanvasCoordsMidTop(bbox);
      }
    }

    // Fallback: use mathComponent's SVG
    if (this.shape.mathComponent && this.shape.mathComponent.containerDOM) {
      const svg = this.shape.mathComponent.containerDOM.querySelector('svg');
      if (svg) {
        const bbox = svg.getBoundingClientRect();
        return this._toCanvasCoordsMidTop(bbox);
      }
    }

    return null;
  }

  /**
   * Get SVG paths from TextItem
   * @returns {Element[]}
   * @private
   */
  _getSVGPaths() {
    // TextItem has mathComponent.mathGraphNode.collectNodesBySelectionUnit
    if (this.shape.mathComponent &&
        this.shape.mathComponent.mathGraphNode &&
        this.shape.selectionUnit) {
      const nodes$ = [];
      this.shape.mathComponent.mathGraphNode.collectNodesBySelectionUnit(
        nodes$,
        [this.shape.selectionUnit]
      );
      return nodes$.map(n => n[0]);
    }
    return null;
  }

  /**
   * Calculate bounding box from array of SVG paths
   * @param {Element[]} paths
   * @returns {DOMRect|null}
   * @private
   */
  _calculateBBoxFromPaths(paths) {
    if (!paths || paths.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    paths.forEach(path => {
      const pathRect = path.getBoundingClientRect();
      minX = Math.min(minX, pathRect.left);
      minY = Math.min(minY, pathRect.top);
      maxX = Math.max(maxX, pathRect.right);
      maxY = Math.max(maxY, pathRect.bottom);
    });

    return {
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  isVisible() {
    // Check if parent mathComponent's containerDOM is displayed
    if (this.shape.mathComponent && this.shape.mathComponent.containerDOM) {
      const container = this.shape.mathComponent.containerDOM;
      const style = window.getComputedStyle(container);
      return style.display !== 'none';
    }
    return true;
  }
}

/**
 * Adapter for TextItemCollection (collection of TextItems)
 */
class TextItemCollectionAnchorAdapter extends BaseAnchorAdapter {
  getAnchor2D() {
    // Get all SVG paths from all items and calculate combined bbox
    const allPaths = this._getAllSVGPaths();
    if (allPaths && allPaths.length > 0) {
      const bbox = this._calculateBBoxFromPaths(allPaths);
      if (bbox) {
        // Use top-left for text elements
        return this._toCanvasCoordsMidTop(bbox);
      }
    }

    // Fallback: use first item's mathComponent's SVG
    const items = this.shape.getAll();
    if (items && items.length > 0) {
      const firstItem = items[0];
      if (firstItem.mathComponent && firstItem.mathComponent.containerDOM) {
        const svg = firstItem.mathComponent.containerDOM.querySelector('svg');
        if (svg) {
          const bbox = svg.getBoundingClientRect();
          return this._toCanvasCoordsMidTop(bbox);
        }
      }
    }

    return null;
  }

  /**
   * Get all SVG paths from all TextItems in the collection
   * @returns {Element[]}
   * @private
   */
  _getAllSVGPaths() {
    const items = this.shape.getAll();
    if (!items || items.length === 0) return null;

    const allPaths = [];
    items.forEach(textItem => {
      if (textItem.mathComponent &&
          textItem.mathComponent.mathGraphNode &&
          textItem.selectionUnit) {
        const nodes$ = [];
        textItem.mathComponent.mathGraphNode.collectNodesBySelectionUnit(
          nodes$,
          [textItem.selectionUnit]
        );
        allPaths.push(...nodes$.map(n => n[0]));
      }
    });
    return allPaths;
  }

  /**
   * Calculate bounding box from array of SVG paths
   * @param {Element[]} paths
   * @returns {DOMRect|null}
   * @private
   */
  _calculateBBoxFromPaths(paths) {
    if (!paths || paths.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    paths.forEach(path => {
      const pathRect = path.getBoundingClientRect();
      minX = Math.min(minX, pathRect.left);
      minY = Math.min(minY, pathRect.top);
      maxX = Math.max(maxX, pathRect.right);
      maxY = Math.max(maxY, pathRect.bottom);
    });

    return {
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  isVisible() {
    const items = this.shape.getAll();
    if (!items || items.length === 0) return false;

    // Check if first item's mathComponent is displayed
    const firstItem = items[0];
    if (firstItem.mathComponent && firstItem.mathComponent.containerDOM) {
      const container = firstItem.mathComponent.containerDOM;
      const style = window.getComputedStyle(container);
      return style.display !== 'none';
    }
    return true;
  }
}

/**
 * Adapter for Three.js 3D objects
 */
class ThreeJSAnchorAdapter extends BaseAnchorAdapter {
  constructor(shape) {
    super(shape, null);
  }

  getPosition3D() {
    // Handle Three.js Object3D (mesh, group, etc.)
    if (this.shape.position && typeof this.shape.position.x === 'number') {
      return {
        x: this.shape.position.x,
        y: this.shape.position.y,
        z: this.shape.position.z
      };
    }

    // Handle shape with getMeshCenter method
    if (this.shape.getMeshCenter) {
      return this.shape.getMeshCenter();
    }

    // Handle shape with mesh property
    if (this.shape.mesh && this.shape.mesh.position) {
      return {
        x: this.shape.mesh.position.x,
        y: this.shape.mesh.position.y,
        z: this.shape.mesh.position.z
      };
    }

    // Handle shape with userData containing position
    if (this.shape.userData && this.shape.userData.position) {
      return this.shape.userData.position;
    }

    return null;
  }

  is3D() {
    return true;
  }

  isVisible() {
    if (this.shape.visible === false) return false;
    return true;
  }
}

/**
 * Adapter for shapes with generic node element
 */
class GenericNodeAnchorAdapter extends BaseAnchorAdapter {
  getAnchor2D() {
    const bbox = this.shape.node.getBoundingClientRect();
    return this._toCanvasCoords(bbox);
  }

  isVisible() {
    return true;
  }
}

/**
 * Adapter for shapes with getCanvasBounds method
 */
class CanvasBoundsAnchorAdapter extends BaseAnchorAdapter {
  getAnchor2D() {
    const bounds = this.shape.getCanvasBounds(this.canvasSection);
    if (bounds) {
      return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y
      };
    }
    return null;
  }

  isVisible() {
    return true;
  }
}

/**
 * Null adapter for unknown/missing shapes
 */
class NullAnchorAdapter extends BaseAnchorAdapter {
  constructor() {
    super(null, null);
  }
}
