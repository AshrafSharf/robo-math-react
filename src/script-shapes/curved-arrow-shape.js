import { CurvedArrowPathGenerator } from '../path-generators/curved-arrow-path-generator.js';
import { TweenablePath } from '../animator/tweenable-path.js';
import { IdUtil } from '../utils/id-util.js';

/**
 * CurvedArrowShape - A curved arrow shape that renders into an SVG element
 *
 * Uses pixel coordinates directly (for annotation layer).
 * Draws arrowhead as inline path (no SVG defs/markers).
 * Supports pen-traced animation via TweenablePath.
 */
export class CurvedArrowShape {
    /**
     * @param {SVGSVGElement} svgElement - The SVG element to render into
     * @param {Object} start - Start point {x, y} (tail)
     * @param {Object} end - End point {x, y} (head)
     * @param {number} curvature - Perpendicular offset for control point
     * @param {Object} options - Styling options
     */
    constructor(svgElement, start, end, curvature = 0, options = {}) {
        this.svgElement = svgElement;
        this.start = start;
        this.end = end;
        this.curvature = curvature;
        this.id = `curved-arrow_${IdUtil.getID()}`;

        // Arrow options
        this.headLength = options.headLength || 10;
        this.headAngle = options.headAngle || Math.PI / 6;

        // Styling
        this.styleObj = {
            'stroke': options.stroke || '#333',
            'stroke-width': options.strokeWidth || 2,
            'fill': 'none',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
        };

        // SVG elements (created in doCreate)
        this.shapeGroup = null;
        this.curvePath = null;
        this.arrowheadPath = null;

        // Generated path data
        this.pathData = null;
    }

    /**
     * Create the SVG elements
     */
    create() {
        this.doCreate();
    }

    doCreate() {
        // Create a group element
        this.shapeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.shapeGroup.setAttribute('id', this.id);

        // Create curve path element
        this.curvePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // Create arrowhead path element
        this.arrowheadPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // Generate paths
        this.generatePaths();

        // Apply styles to both paths
        this._applyStyles(this.curvePath);
        this._applyStyles(this.arrowheadPath);

        // Add paths to group
        this.shapeGroup.appendChild(this.curvePath);
        this.shapeGroup.appendChild(this.arrowheadPath);

        // Add group to SVG
        this.svgElement.appendChild(this.shapeGroup);

        // Initially hidden
        this.hide();
    }

    _applyStyles(element) {
        Object.entries(this.styleObj).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }

    /**
     * Generate the curve and arrowhead paths
     */
    generatePaths() {
        this.pathData = CurvedArrowPathGenerator.generate(
            this.start,
            this.end,
            this.curvature,
            {
                headLength: this.headLength,
                headAngle: this.headAngle
            }
        );

        this.curvePath.setAttribute('d', this.pathData.curvePath);
        this.arrowheadPath.setAttribute('d', this.pathData.arrowheadPath);
    }

    /**
     * Get the endpoint for text positioning
     */
    getEndPoint() {
        return this.end;
    }

    /**
     * Get the tangent angle at the endpoint (for text positioning)
     */
    getTangentAngle() {
        return this.pathData ? this.pathData.tangentAngle : 0;
    }

    /**
     * Render end state (show with full stroke)
     */
    renderEndState() {
        this.doRenderEndState();
    }

    doRenderEndState() {
        this.enableStroke();
        this.show();
    }

    /**
     * Render with pen animation
     * @param {Object} penStartPoint - Starting point for pen (optional)
     * @param {Function} completionHandler - Called when animation completes
     */
    renderWithAnimation(penStartPoint, completionHandler) {
        try {
            const onComplete = () => {
                this.enableStroke();
                completionHandler();
            };

            const tweenablePath = new TweenablePath(this.curvePath);
            this.show();
            this.disableStroke();
            tweenablePath.setSlow();
            tweenablePath.tween(
                onComplete,
                penStartPoint,
                () => this.enableStroke(),
                null
            );
        } catch (e) {
            console.error('CurvedArrowShape: Animation error', e);
            completionHandler();
        }
    }

    /**
     * Hide stroke during animation (progressive reveal)
     */
    disableStroke() {
        this.curvePath.setAttribute('stroke-dasharray', '0,10000');
        this.arrowheadPath.setAttribute('stroke-dasharray', '0,10000');
    }

    /**
     * Show full stroke after animation
     */
    enableStroke() {
        this.curvePath.setAttribute('stroke-dasharray', '0,0');
        this.arrowheadPath.setAttribute('stroke-dasharray', '0,0');
    }

    /**
     * Show the shape
     */
    show() {
        if (this.shapeGroup) {
            this.shapeGroup.style.display = '';
            this.shapeGroup.style.visibility = 'visible';
        }
    }

    /**
     * Hide the shape
     */
    hide() {
        if (this.shapeGroup) {
            this.shapeGroup.style.display = 'none';
        }
    }

    /**
     * Remove from DOM
     */
    remove() {
        if (this.shapeGroup && this.shapeGroup.parentNode) {
            this.shapeGroup.parentNode.removeChild(this.shapeGroup);
        }
        this.shapeGroup = null;
        this.curvePath = null;
        this.arrowheadPath = null;
    }

    /**
     * Update styling
     * @param {Object} newStyleObj - New style properties
     */
    setStyle(newStyleObj) {
        this.styleObj = Object.assign(this.styleObj, newStyleObj);
        if (this.curvePath) {
            this._applyStyles(this.curvePath);
        }
        if (this.arrowheadPath) {
            this._applyStyles(this.arrowheadPath);
        }
    }

    /**
     * Get shape type identifier
     */
    getShapeType() {
        return 'curved-arrow';
    }

    /**
     * Get the path elements for effects
     */
    getPathElements() {
        return [this.curvePath, this.arrowheadPath];
    }

    /**
     * Get shape containers (for compatibility)
     */
    getShapeContainers() {
        return [this.shapeGroup];
    }
}
