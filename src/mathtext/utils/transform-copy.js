import { Bounds2 } from '../../geom/Bounds2.js';
import { BoundsExtractor } from './bounds-extractor.js';
import { MathTextComponent } from '../components/math-text-component.js';
import { TweenMax, Power2 } from 'gsap';

/**
 * TransformCopy - Extracts bbox-marked sections from MathTextComponent
 * and creates cloned MathTextComponent instances at new pixel coordinates.
 *
 * The clones are identical to the source (same font size, stroke, SVG structure)
 * but positioned at different locations and containing only the bbox section content.
 *
 * Usage:
 * ```javascript
 * const mathText = diagram.mathText('x + \\bbox[0px]{y} = \\bbox[0px]{z}', 0, 0);
 * const transformCopy = new TransformCopy(mathText, parentDOM);
 *
 * // Clone first bbox section to pixel position (200, 300)
 * const clonedComponent = transformCopy.createCloneAt(0, 200, 300);
 * clonedComponent.show(); // Show the cloned math text
 * ```
 */
export class TransformCopy {
  /**
   * @param {MathTextComponent} mathTextComponent - The source math text component
   * @param {HTMLElement} parentDOM - Parent DOM element for cloned components
   */
  constructor(mathTextComponent, parentDOM) {
    this.mathTextComponent = mathTextComponent;
    this.parentDOM = parentDOM || mathTextComponent.parentDOM;
    this.cachedSections = null;
    this.clonedComponents = [];
  }

  /**
   * Extract all bbox-marked sections from the math text component
   * @returns {Array<{bounds: Bounds2, paths: Element[]}>} Array of bbox descriptors
   */
  extractBBoxSections() {
    if (this.cachedSections) {
      return this.cachedSections;
    }

    this.cachedSections = this.mathTextComponent.getBBoxDescriptors();
    return this.cachedSections;
  }

  /**
   * Clear cached sections (call if math text content changes)
   */
  clearCache() {
    this.cachedSections = null;
  }

  /**
   * Clone a specific bbox section to a new pixel position
   * Creates a proper MathTextComponent with identical styling
   *
   * @param {number} bboxIndex - Index of the bbox section to clone
   * @param {number} pixelX - Target x pixel coordinate
   * @param {number} pixelY - Target y pixel coordinate
   * @returns {MathTextComponent} The created MathTextComponent (hidden by default)
   */
  createCloneAt(bboxIndex, pixelX, pixelY) {
    const sections = this.extractBBoxSections();

    if (bboxIndex < 0 || bboxIndex >= sections.length) {
      console.error(`TransformCopy: Invalid bbox index ${bboxIndex}. Available sections: ${sections.length}`);
      return null;
    }

    const section = sections[bboxIndex];
    const { bounds, paths } = section;

    if (!paths || paths.length === 0) {
      console.warn(`TransformCopy: No paths found in bbox section ${bboxIndex}`);
      return null;
    }

    // Get source SVG and clone it
    const sourceSvg = this.mathTextComponent.getMathSVGRoot()[0];
    if (!sourceSvg) {
      console.error('TransformCopy: Source MathTextComponent has no SVG');
      return null;
    }

    // Calculate the internal offset of the bbox content relative to the MathText container
    // This is the offset we need to subtract so content appears at exactly (pixelX, pixelY)
    const containerRect = this.mathTextComponent.containerDOM.getBoundingClientRect();
    const internalOffsetX = bounds.minX - containerRect.left;
    const internalOffsetY = bounds.minY - containerRect.top;

    console.log('TransformCopy: Container rect:', containerRect);
    console.log('TransformCopy: Bounds:', { minX: bounds.minX, minY: bounds.minY });
    console.log('TransformCopy: Internal offset:', { x: internalOffsetX, y: internalOffsetY });

    // Adjust target position to compensate for internal offset
    const adjustedX = pixelX - internalOffsetX;
    const adjustedY = pixelY - internalOffsetY;

    console.log('TransformCopy: Adjusted position:', { x: adjustedX, y: adjustedY });

    // Create a filtered SVG containing only the bbox section paths (no counter-translation needed now)
    const filteredSvg = this.createFilteredSVG(sourceSvg, paths, bounds);

    // Create MathTextComponent from the filtered SVG at adjusted position
    const clonedComponent = MathTextComponent.fromSVGClone(
      filteredSvg,
      adjustedX,
      adjustedY,
      this.parentDOM,
      {
        fontSize: this.mathTextComponent.fontSizeValue,
        stroke: this.mathTextComponent.strokeColor,
        fill: this.mathTextComponent.fillColor
      }
    );

    // Track cloned component
    this.clonedComponents.push(clonedComponent);

    return clonedComponent;
  }

  /**
   * Clone a bbox section and animate it from original position to target position
   * Creates the clone at the original bbox location, then animates to target
   *
   * @param {number} bboxIndex - Index of the bbox section to clone
   * @param {number} targetX - Target x pixel coordinate
   * @param {number} targetY - Target y pixel coordinate
   * @param {Object} options - Animation options
   * @param {number} options.duration - Animation duration in seconds (default: 0.5)
   * @param {*} options.ease - GSAP easing function (default: Power2.easeOut)
   * @param {Function} options.onComplete - Callback when animation completes
   * @returns {Promise<MathTextComponent>} Promise resolving to the cloned component
   */
  animateCloneTo(bboxIndex, targetX, targetY, options = {}) {
    const {
      duration = 0.5,
      ease = Power2.easeOut,
      onComplete
    } = options;

    const sections = this.extractBBoxSections();

    if (bboxIndex < 0 || bboxIndex >= sections.length) {
      console.error(`TransformCopy: Invalid bbox index ${bboxIndex}. Available sections: ${sections.length}`);
      return Promise.resolve(null);
    }

    const section = sections[bboxIndex];
    const { bounds, paths } = section;

    if (!paths || paths.length === 0) {
      console.warn(`TransformCopy: No paths found in bbox section ${bboxIndex}`);
      return Promise.resolve(null);
    }

    // Get source SVG and clone it
    const sourceSvg = this.mathTextComponent.getMathSVGRoot()[0];
    if (!sourceSvg) {
      console.error('TransformCopy: Source MathTextComponent has no SVG');
      return Promise.resolve(null);
    }

    // Calculate the internal offset of the bbox content relative to the MathText container
    const containerRect = this.mathTextComponent.containerDOM.getBoundingClientRect();
    const internalOffsetX = bounds.minX - containerRect.left;
    const internalOffsetY = bounds.minY - containerRect.top;

    // Get the original position (where the bbox content currently appears on screen)
    // The container's CSS position that makes the bbox appear at its current location
    const sourceContainerLeft = this.mathTextComponent.componentState.left;
    const sourceContainerTop = this.mathTextComponent.componentState.top;

    // Start position: clone at the same visual position as the original
    const startX = sourceContainerLeft;
    const startY = sourceContainerTop;

    // End position: adjusted to place bbox content at target
    const endX = targetX - internalOffsetX;
    const endY = targetY - internalOffsetY;

    console.log('TransformCopy animate: Start:', { x: startX, y: startY });
    console.log('TransformCopy animate: End:', { x: endX, y: endY });

    // Create a filtered SVG containing only the bbox section paths
    const filteredSvg = this.createFilteredSVG(sourceSvg, paths, bounds);

    // Create MathTextComponent at start position
    const clonedComponent = MathTextComponent.fromSVGClone(
      filteredSvg,
      startX,
      startY,
      this.parentDOM,
      {
        fontSize: this.mathTextComponent.fontSizeValue,
        stroke: this.mathTextComponent.strokeColor,
        fill: this.mathTextComponent.fillColor
      }
    );

    // Track cloned component
    this.clonedComponents.push(clonedComponent);

    // Show the clone
    clonedComponent.show();

    // Return a promise that resolves when animation completes
    return new Promise((resolve) => {
      // Animate using GSAP TweenMax
      TweenMax.to(clonedComponent.containerDOM, duration, {
        left: endX + 'px',
        top: endY + 'px',
        ease: ease,
        onComplete: () => {
          if (onComplete) {
            onComplete(clonedComponent);
          }
          resolve(clonedComponent);
        }
      });
    });
  }

  /**
   * Create a filtered SVG containing only the specified paths
   * Preserves all SVG attributes, structure, and scale
   * Applies counter-translation so bbox content starts at (0, 0)
   *
   * @param {SVGSVGElement} sourceSvg - The source SVG element
   * @param {Element[]} pathsToInclude - Array of path elements to include
   * @param {Bounds2} bounds - Bounds of the section (used for position offset)
   * @returns {SVGSVGElement} Filtered SVG element
   */
  createFilteredSVG(sourceSvg, pathsToInclude, bounds) {
    // Clone the entire SVG structure
    const clonedSvg = sourceSvg.cloneNode(true);

    // Get nodepath attributes of paths to include
    const includedNodePaths = new Set();
    pathsToInclude.forEach(path => {
      const nodepath = path.getAttribute('nodepath');
      if (nodepath) {
        includedNodePaths.add(nodepath);
      }
    });

    // Find all paths in cloned SVG
    const allPaths = clonedSvg.querySelectorAll('path[nodepath]');

    // Hide paths that are not in the bbox section (don't remove to preserve structure)
    allPaths.forEach(path => {
      const nodepath = path.getAttribute('nodepath');
      if (!includedNodePaths.has(nodepath)) {
        // Hide by making invisible but keeping in DOM
        path.style.display = 'none';
        path.style.visibility = 'hidden';
      }
    });

    // No SVG-level transform needed - offset is handled at CSS level in createCloneAt()
    return clonedSvg;
  }

  /**
   * Clone all bbox sections to new positions with specified spacing
   * @param {number} startX - Starting x pixel coordinate
   * @param {number} startY - Starting y pixel coordinate
   * @param {Object} options - Configuration options
   * @param {number} options.horizontalSpacing - Horizontal gap between clones (default: 20)
   * @param {number} options.verticalSpacing - Vertical gap between clones (default: 0)
   * @param {string} options.direction - 'horizontal' or 'vertical' (default: 'horizontal')
   * @returns {MathTextComponent[]} Array of created MathTextComponents
   */
  createAllClonesAt(startX, startY, options = {}) {
    const {
      horizontalSpacing = 20,
      verticalSpacing = 0,
      direction = 'horizontal'
    } = options;

    const sections = this.extractBBoxSections();
    const components = [];

    let currentX = startX;
    let currentY = startY;

    sections.forEach((section, index) => {
      const component = this.createCloneAt(index, currentX, currentY);

      if (component) {
        components.push(component);

        // Update position for next clone based on section bounds
        if (direction === 'horizontal') {
          currentX += section.bounds.width + horizontalSpacing;
        } else {
          currentY += section.bounds.height + verticalSpacing;
        }
      }
    });

    return components;
  }

  /**
   * Get the number of bbox sections available
   * @returns {number} Number of bbox sections
   */
  getSectionCount() {
    return this.extractBBoxSections().length;
  }

  /**
   * Get bounds for a specific bbox section
   * @param {number} bboxIndex - Index of the bbox section
   * @returns {Bounds2|null} Bounds of the section, or null if invalid index
   */
  getSectionBounds(bboxIndex) {
    const sections = this.extractBBoxSections();
    if (bboxIndex < 0 || bboxIndex >= sections.length) {
      return null;
    }
    return sections[bboxIndex].bounds;
  }

  /**
   * Get all cloned components created by this TransformCopy instance
   * @returns {MathTextComponent[]} Array of cloned components
   */
  getClonedComponents() {
    return this.clonedComponents;
  }

  /**
   * Remove all cloned components from DOM
   */
  clearClones() {
    this.clonedComponents.forEach(component => {
      if (component.containerDOM && component.containerDOM.parentNode) {
        component.containerDOM.parentNode.removeChild(component.containerDOM);
      }
    });
    this.clonedComponents = [];
  }

  /**
   * Calculate bounds in SVG internal coordinates (not CTM/screen coordinates)
   * Uses getBBox() which returns coordinates in the element's local coordinate system
   *
   * @param {Element[]} paths - Array of path elements
   * @returns {{minX: number, minY: number, maxX: number, maxY: number}} Bounds in SVG coords
   */
  calculateSVGBounds(paths) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    paths.forEach(path => {
      try {
        const bbox = path.getBBox();
        minX = Math.min(minX, bbox.x);
        minY = Math.min(minY, bbox.y);
        maxX = Math.max(maxX, bbox.x + bbox.width);
        maxY = Math.max(maxY, bbox.y + bbox.height);
      } catch (e) {
        // getBBox can throw if element is not rendered
        console.warn('TransformCopy: Could not get bbox for path', e);
      }
    });

    return { minX, minY, maxX, maxY };
  }
}
