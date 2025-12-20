import { TweenablePath } from '../animator/tweenable-path.js';
import { IdUtil } from '../utils/id-util.js';

/**
 * AnnotationCircleShape - An ellipse shape drawn around a TextItem bounds
 *
 * Uses pixel coordinates directly (for annotation layer).
 * Supports pen-traced animation via TweenablePath.
 */
export class AnnotationCircleShape {
    /**
     * @param {SVGSVGElement} svgElement - The SVG element to render into
     * @param {Bounds2} bounds - The bounds to draw ellipse around
     * @param {Object} options - Styling options
     */
    constructor(svgElement, bounds, options = {}) {
        this.svgElement = svgElement;
        this.bounds = bounds;
        this.id = `annotation-circle_${IdUtil.getID()}`;

        // Padding around bounds
        this.padding = options.padding || 8;

        // Styling
        this.styleObj = {
            'stroke': options.stroke || '#333',
            'stroke-width': options.strokeWidth || 1.5,
            'fill': 'none',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
        };

        // SVG elements
        this.shapeGroup = null;
        this.ellipsePath = null;
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

        // Create ellipse as path (for animation compatibility)
        this.ellipsePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // Generate ellipse path
        this.generatePath();

        // Apply styles
        this._applyStyles(this.ellipsePath);

        // Add to group
        this.shapeGroup.appendChild(this.ellipsePath);

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
     * Generate ellipse path from bounds
     */
    generatePath() {
        const cx = this.bounds.centerX;
        const cy = this.bounds.centerY;
        const rx = (this.bounds.width / 2) + this.padding;
        const ry = (this.bounds.height / 2) + this.padding;

        // Create ellipse as a path using arc commands
        // M cx-rx, cy  - start at left
        // A rx,ry 0 1,1 cx+rx,cy - arc to right (top half)
        // A rx,ry 0 1,1 cx-rx,cy - arc back to left (bottom half)
        const pathData = `M ${cx - rx},${cy} A ${rx},${ry} 0 1,1 ${cx + rx},${cy} A ${rx},${ry} 0 1,1 ${cx - rx},${cy}`;

        this.ellipsePath.setAttribute('d', pathData);
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

            const tweenablePath = new TweenablePath(this.ellipsePath);
            this.show();
            this.disableStroke();
            tweenablePath.setFast();
            tweenablePath.tween(
                onComplete,
                penStartPoint,
                () => this.enableStroke(),
                null
            );
        } catch (e) {
            console.error('AnnotationCircleShape: Animation error', e);
            completionHandler();
        }
    }

    /**
     * Hide stroke during animation
     */
    disableStroke() {
        this.ellipsePath.setAttribute('stroke-dasharray', '0,10000');
    }

    /**
     * Show full stroke after animation
     */
    enableStroke() {
        this.ellipsePath.setAttribute('stroke-dasharray', '0,0');
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
        this.ellipsePath = null;
    }

    /**
     * Get shape type identifier
     */
    getShapeType() {
        return 'annotation-circle';
    }
}
