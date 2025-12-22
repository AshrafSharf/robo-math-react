import { Bounds2 } from '../../geom/Bounds2.js';

/**
 * TextItem - Represents a single extracted part of a MathTextComponent
 *
 * Created by select/selectexcept expressions to capture specific regions
 * of math text that can be animated later with write().
 *
 * This is a pure data class. For operations, use:
 * - MathTextMoveEffect(textItem, ...) - animated move
 * - MathTextRectEffect(textItem, ...) - animated annotation rect
 * - mathComponent.cloneTextItemTo(textItem, ...) - static clone
 */
export class TextItem {
    /**
     * @param {MathTextComponent} mathComponent - Parent MathTextComponent
     * @param {SelectionUnit} selectionUnit - SelectionUnit with fragmentPaths
     * @param {Bounds2} bounds - Bounding box coordinates
     */
    constructor(mathComponent, selectionUnit, bounds) {
        this.mathComponent = mathComponent;
        this.selectionUnit = selectionUnit;
        this.bounds = bounds;
    }

    /**
     * Get the fragment paths for animation
     * @returns {Array<string>} Array of fragment IDs
     */
    getFragmentPaths() {
        return this.selectionUnit.toFragmentPaths();
    }

    /**
     * Get the parent MathTextComponent
     * @returns {MathTextComponent}
     */
    getMathComponent() {
        return this.mathComponent;
    }

    /**
     * Get the bounding box
     * @returns {Bounds2}
     */
    getBounds() {
        return this.bounds;
    }

    /**
     * Get the selection unit
     * @returns {SelectionUnit}
     */
    getSelectionUnit() {
        return this.selectionUnit;
    }

    // ===== FACADE METHODS =====

    /**
     * Get the actual SVG path elements for this TextItem
     * Facade method that hides the internal implementation details
     * @returns {Element[]} Array of SVG path elements
     */
    getSVGPaths() {
        const nodes$ = [];
        this.mathComponent.mathGraphNode.collectNodesBySelectionUnit(nodes$, [this.selectionUnit]);
        return nodes$.map(n => n[0]);
    }

    /**
     * Get bounds relative to the mathComponent container (client coordinates)
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    getClientBounds() {
        const paths = this.getSVGPaths();
        if (!paths || paths.length === 0) {
            return null;
        }

        // Calculate bounds from paths using getBoundingClientRect
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        paths.forEach(path => {
            const pathRect = path.getBoundingClientRect();
            minX = Math.min(minX, pathRect.left);
            minY = Math.min(minY, pathRect.top);
            maxX = Math.max(maxX, pathRect.right);
            maxY = Math.max(maxY, pathRect.bottom);
        });

        // Convert to mathText container-relative coordinates
        const containerRect = this.mathComponent.containerDOM.getBoundingClientRect();

        return {
            x: minX - containerRect.left,
            y: minY - containerRect.top,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * Get bounds relative to a canvas section (for annotation layer positioning)
     * @param {HTMLElement} canvasSection - The canvas section element
     * @returns {Bounds2} Bounds2 object with canvas-relative coordinates
     */
    getCanvasBounds(canvasSection) {
        const clientBounds = this.getClientBounds();
        if (!clientBounds) {
            return null;
        }

        // Get the mathText container's position in the canvas (its CSS left/top values)
        const containerLeft = this.mathComponent.componentState.left || 0;
        const containerTop = this.mathComponent.componentState.top || 0;

        // Add container position to get canvas-relative coordinates
        const x = containerLeft + clientBounds.x;
        const y = containerTop + clientBounds.y;
        return new Bounds2(x, y, x + clientBounds.width, y + clientBounds.height);
    }

    // ===== SVG METHODS =====

    /**
     * Get a cloned SVG with only this TextItem's paths (others removed)
     * Used for creating independent animated copies
     * @returns {SVGSVGElement|null} Cloned SVG element or null if no paths
     */
    getClonedSVG() {
        const paths = this.getSVGPaths();
        if (!paths || paths.length === 0) {
            return null;
        }

        const sourceSvg = this.mathComponent.getMathSVGRoot()[0];
        if (!sourceSvg) {
            return null;
        }

        // Clone the entire SVG structure
        const clonedSvg = sourceSvg.cloneNode(true);

        // Get nodepath attributes of paths to include
        const includedNodePaths = new Set();
        paths.forEach(path => {
            const nodepath = path.getAttribute('nodepath');
            if (nodepath) {
                includedNodePaths.add(nodepath);
            }
        });

        // Remove paths that are not included
        const allPaths = clonedSvg.querySelectorAll('path[nodepath]');
        allPaths.forEach(path => {
            const nodepath = path.getAttribute('nodepath');
            if (!includedNodePaths.has(nodepath)) {
                path.remove();
            }
        });

        return clonedSvg;
    }

    /**
     * Get a filtered SVG containing only this TextItem's paths
     * Used by MathTextComponent for cloning
     * @returns {SVGSVGElement|null} Filtered SVG element or null if no paths
     */
    getFilteredSVG() {
        const paths = this.getSVGPaths();
        if (!paths || paths.length === 0) {
            return null;
        }

        const sourceSvg = this.mathComponent.getMathSVGRoot()[0];
        if (!sourceSvg) {
            return null;
        }

        return this._createFilteredSVG(sourceSvg, paths);
    }

    // ===== PRIVATE HELPERS =====

    /**
     * Create a filtered SVG containing only the specified paths
     * @param {SVGSVGElement} sourceSvg - The source SVG element
     * @param {Element[]} pathsToInclude - Array of path elements to include
     * @returns {SVGSVGElement} Filtered SVG element
     * @private
     */
    _createFilteredSVG(sourceSvg, pathsToInclude) {
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

        // Hide paths that are not included
        allPaths.forEach(path => {
            const nodepath = path.getAttribute('nodepath');
            if (!includedNodePaths.has(nodepath)) {
                path.style.display = 'none';
                path.style.visibility = 'hidden';
            }
        });

        return clonedSvg;
    }
}
