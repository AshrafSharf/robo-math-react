/**
 * CanvasBoundsAdapter - Abstracts bounds retrieval for different item types
 *
 * Provides a unified interface for getting canvas bounds (Bounds2) from
 * various item types: SVG shapes, MathText, KaTeX, Grapher, and 3D objects.
 *
 * Follows the same factory pattern as ShapeVisibilityAdapter.
 */
import { Bounds2 } from '../geom/Bounds2.js';

/**
 * Position shorthand mapping to Bounds2 property names
 */
export const POSITION_MAP = {
  tl: 'leftTop',
  tr: 'rightTop',
  bl: 'leftBottom',
  br: 'rightBottom',
  mt: 'centerTop',
  mb: 'centerBottom',
  ml: 'leftCenter',
  mr: 'rightCenter',
  c: 'center'
};

export class CanvasBoundsAdapter {
  /**
   * Detect item type and return appropriate adapter
   * @param {Object} item - The item to get bounds from
   * @returns {CanvasBoundsAdapter}
   */
  static for(item) {
    if (!item) {
      return new NullBoundsAdapter();
    }

    // Check for KatexTextItem (has katexComponent and getCanvasBounds)
    if (item.katexComponent && typeof item.getCanvasBounds === 'function') {
      return new KatexTextItemBoundsAdapter(item);
    }

    // Check for TextItem (has mathComponent and getCanvasBounds)
    if (item.mathComponent && typeof item.getCanvasBounds === 'function') {
      return new TextItemBoundsAdapter(item);
    }

    // Check for MathTextComponent (has containerDOM and getCanvasBounds)
    if (item.containerDOM && typeof item.getCanvasBounds === 'function') {
      return new MathTextBoundsAdapter(item);
    }

    // Check for KatexComponent (has containerDOM and componentState with position)
    if (item.containerDOM && item.componentState) {
      return new KatexComponentBoundsAdapter(item);
    }

    // Check for SVG shape (has shapeGroup with SVG.js node)
    if (item.shapeGroup && item.shapeGroup.node) {
      return new SVGShapeBoundsAdapter(item);
    }

    // Check for Grapher (has graphSheet and getPosition)
    if (item.graphSheet && typeof item.getPosition === 'function') {
      return new GrapherBoundsAdapter(item);
    }

    // Check for 3D shape (has Three.js mesh/object3D)
    if (item.mesh || item.object3D) {
      return new ThreeJSBoundsAdapter(item);
    }

    // Check for raw SVG element with node
    if (item.node && item.node instanceof SVGElement) {
      return new SVGElementBoundsAdapter(item);
    }

    // Unknown type - return null adapter
    console.warn('CanvasBoundsAdapter: Unknown item type', item);
    return new NullBoundsAdapter();
  }
}

/**
 * Base adapter interface
 */
class BaseBoundsAdapter {
  constructor(item) {
    this.item = item;
  }

  /**
   * Get canvas bounds for the item
   * @returns {Bounds2|null}
   */
  getBounds() {
    throw new Error('Not implemented');
  }

  /**
   * Get a specific position point from bounds
   * @param {string} position - Position shorthand (tl, mr, c, etc.)
   * @returns {Vector2|null}
   */
  getPosition(position) {
    const bounds = this.getBounds();
    if (!bounds || bounds.isEmpty()) return null;

    const methodName = POSITION_MAP[position];
    if (!methodName) {
      console.warn(`CanvasBoundsAdapter: Unknown position "${position}"`);
      return null;
    }

    return bounds[methodName];
  }
}

/**
 * Adapter for KatexTextItem
 */
class KatexTextItemBoundsAdapter extends BaseBoundsAdapter {
  getBounds() {
    return this.item.getCanvasBounds();
  }
}

/**
 * Adapter for TextItem (MathJax-based text items)
 */
class TextItemBoundsAdapter extends BaseBoundsAdapter {
  getBounds() {
    return this.item.getCanvasBounds();
  }
}

/**
 * Adapter for MathTextComponent
 */
class MathTextBoundsAdapter extends BaseBoundsAdapter {
  getBounds() {
    if (typeof this.item.getCanvasBounds === 'function') {
      return this.item.getCanvasBounds();
    }

    // Fallback: compute from containerDOM
    const container = this.item.containerDOM;
    if (!container) return Bounds2.NOTHING;

    const rect = container.getBoundingClientRect();
    return Bounds2.rect(rect.left, rect.top, rect.width, rect.height);
  }
}

/**
 * Adapter for KatexComponent and MathTextComponent
 * Uses componentState for position and measures DOM for size
 * Handles hidden elements by temporarily showing them for measurement
 */
class KatexComponentBoundsAdapter extends BaseBoundsAdapter {
  getBounds() {
    const state = this.item.componentState;
    const container = this.item.containerDOM;

    if (!state || !container) return Bounds2.NOTHING;

    // Get position from componentState (canvas coordinates)
    const left = state.left || 0;
    const top = state.top || 0;

    // Get size - handle hidden elements
    let width = 0;
    let height = 0;

    // Try stored size first
    if (state.size && state.size.width > 0 && state.size.height > 0) {
      width = state.size.width;
      height = state.size.height;
    } else {
      // Element might be hidden - temporarily show to measure
      const wasHidden = container.style.display === 'none';
      const prevVisibility = container.style.visibility;
      const prevPosition = container.style.position;

      if (wasHidden) {
        // Use visibility:hidden to measure without visual flash
        container.style.display = 'block';
        container.style.visibility = 'hidden';
        container.style.position = 'absolute';
      }

      // Measure
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      // Also update componentState.size for future use
      if (!state.size || state.size.width === 0) {
        state.size = { width, height };
      }

      // Restore hidden state
      if (wasHidden) {
        container.style.display = 'none';
        container.style.visibility = prevVisibility;
        container.style.position = prevPosition;
      }
    }

    return Bounds2.rect(left, top, width, height);
  }
}

/**
 * Adapter for SVG shapes (SVGScriptShape and subclasses)
 * Uses CTM transformation to get accurate canvas bounds
 */
class SVGShapeBoundsAdapter extends BaseBoundsAdapter {
  getBounds() {
    const node = this.item.shapeGroup.node;
    if (!node) return Bounds2.NOTHING;

    return this.getBoundsInCTMUnits(node);
  }

  /**
   * Get bounds transformed by CTM (Current Transformation Matrix)
   * Based on BoundsExtractor.getBoundsInCTMUnits
   */
  getBoundsInCTMUnits(element) {
    try {
      const bbox = element.getBBox();
      const ctm = element.getCTM();

      if (ctm) {
        // Top-left corner
        const x1 = bbox.x * ctm.a + bbox.y * ctm.c + ctm.e;
        const y1 = bbox.x * ctm.b + bbox.y * ctm.d + ctm.f;

        // Bottom-right corner
        const x2 = (bbox.x + bbox.width) * ctm.a + (bbox.y + bbox.height) * ctm.c + ctm.e;
        const y2 = (bbox.x + bbox.width) * ctm.b + (bbox.y + bbox.height) * ctm.d + ctm.f;

        // Normalize bounds (SVG can have inverted Y-axis)
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        return new Bounds2(minX, minY, maxX, maxY);
      }
    } catch (e) {
      console.warn('CanvasBoundsAdapter: Error getting SVG bounds', e);
    }

    return Bounds2.NOTHING;
  }
}

/**
 * Adapter for raw SVG elements
 */
class SVGElementBoundsAdapter extends BaseBoundsAdapter {
  getBounds() {
    const node = this.item.node;
    if (!node) return Bounds2.NOTHING;

    try {
      const bbox = node.getBBox();
      const ctm = node.getCTM();

      if (ctm) {
        const x1 = bbox.x * ctm.a + bbox.y * ctm.c + ctm.e;
        const y1 = bbox.x * ctm.b + bbox.y * ctm.d + ctm.f;
        const x2 = (bbox.x + bbox.width) * ctm.a + (bbox.y + bbox.height) * ctm.c + ctm.e;
        const y2 = (bbox.x + bbox.width) * ctm.b + (bbox.y + bbox.height) * ctm.d + ctm.f;

        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        return new Bounds2(minX, minY, maxX, maxY);
      }
    } catch (e) {
      console.warn('CanvasBoundsAdapter: Error getting SVG element bounds', e);
    }

    return Bounds2.NOTHING;
  }
}

/**
 * Adapter for Grapher
 */
class GrapherBoundsAdapter extends BaseBoundsAdapter {
  getBounds() {
    const position = this.item.getPosition();
    const graphSheet = this.item.graphSheet;

    if (!position || !graphSheet) return Bounds2.NOTHING;

    // Get dimensions from graphSheet
    const width = graphSheet.viewWidth || 0;
    const height = graphSheet.viewHeight || 0;

    return Bounds2.rect(position.left, position.top, width, height);
  }
}

/**
 * Adapter for Three.js 3D objects
 * Computes 2D screen bounds from 3D bounding box
 */
class ThreeJSBoundsAdapter extends BaseBoundsAdapter {
  getBounds() {
    const mesh = this.item.mesh || this.item.object3D;
    if (!mesh) return Bounds2.NOTHING;

    try {
      // Get the Three.js geometry bounding box
      if (mesh.geometry) {
        mesh.geometry.computeBoundingBox();
        const box3 = mesh.geometry.boundingBox;

        if (box3) {
          // For now, project to 2D by ignoring Z
          // A more accurate implementation would use the camera to project
          return new Bounds2(box3.min.x, box3.min.y, box3.max.x, box3.max.y);
        }
      }

      // Fallback for groups/scenes without geometry
      if (typeof mesh.computeScreenSpaceBoundingBox === 'function') {
        return mesh.computeScreenSpaceBoundingBox();
      }
    } catch (e) {
      console.warn('CanvasBoundsAdapter: Error getting 3D bounds', e);
    }

    return Bounds2.NOTHING;
  }
}

/**
 * Null adapter for unknown/missing items
 */
class NullBoundsAdapter extends BaseBoundsAdapter {
  constructor() {
    super(null);
  }

  getBounds() {
    return Bounds2.NOTHING;
  }

  getPosition(position) {
    return null;
  }
}
