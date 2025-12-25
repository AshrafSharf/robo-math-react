/**
 * AreaBetweenCommand - Command for rendering the area between two plot curves
 *
 * Creates a filled polygon between the two curves.
 * Intersection points are found automatically using numerical methods.
 */
import { BaseCommand } from './BaseCommand.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class AreaBetweenCommand extends BaseCommand {
    /**
     * Create an area between command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Function} compiledFunction1 - Pre-compiled function f1(x) => y for first curve
     * @param {Function} compiledFunction2 - Pre-compiled function f2(x) => y for second curve
     * @param {string} fillColor - Fill color (default 'blue')
     * @param {number} fillOpacity - Fill opacity 0-1 (default 0.3)
     * @param {Object} options - Additional options
     */
    constructor(graphExpression, compiledFunction1, compiledFunction2, fillColor = 'blue', fillOpacity = 0.3, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.compiledFunction1 = compiledFunction1;
        this.compiledFunction2 = compiledFunction2;
        this.fillColor = fillColor;
        this.fillOpacity = fillOpacity;
        this.samples = options.samples || 200;
    }

    /**
     * Create area polygon shape via diagram
     * @returns {Promise}
     */
    async doInit() {
        // Clear any existing shape before creating new one
        this.clear();

        // Resolve grapher from expression
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('areabetween'));
            err.expressionId = this.expressionId;
            throw err;
        }

        if (typeof this.graphExpression.getGrapher !== 'function') {
            const varName = this.graphExpression.variableName || 'first argument';
            const err = new Error(common_error_messages.INVALID_GRAPH_TYPE(varName));
            err.expressionId = this.expressionId;
            throw err;
        }

        this.graphContainer = this.graphExpression.getGrapher();
        if (!this.graphContainer) {
            const varName = this.graphExpression.variableName || 'graph';
            const err = new Error(common_error_messages.GRAPH_NOT_INITIALIZED(varName));
            err.expressionId = this.expressionId;
            throw err;
        }

        // Get x range from graph
        const xEnds = this.graphContainer.xends();
        const graphXMin = xEnds.min;
        const graphXMax = xEnds.max;

        // Find intersection points
        const intersections = this._findIntersections(graphXMin, graphXMax);

        if (intersections.length < 2) {
            // No enclosed region - need at least 2 intersection points
            return;
        }

        // Use first two intersections as bounds
        const xmin = intersections[0];
        const xmax = intersections[1];

        // Sample points from both functions
        const vertices = this._generateVertices(xmin, xmax);

        const options = {
            label: this.labelName,
            fill: this.fillColor,
            fillOpacity: this.fillOpacity,
            strokeWidth: 0  // No stroke on the filled area
        };

        // Use polygon to draw the filled area
        this.commandResult = this.diagram2d.polygon(
            this.graphContainer,
            vertices,
            this.fillColor,
            options
        );
    }

    /**
     * Find intersection points of the two curves using numerical methods
     * @param {number} xmin - Minimum x to search
     * @param {number} xmax - Maximum x to search
     * @returns {Array<number>} Array of x values where curves intersect
     */
    _findIntersections(xmin, xmax) {
        const intersections = [];
        const searchSamples = 1000;
        const step = (xmax - xmin) / searchSamples;

        // Difference function: d(x) = f1(x) - f2(x)
        const diff = (x) => {
            const y1 = this.compiledFunction1(x);
            const y2 = this.compiledFunction2(x);
            if (!isFinite(y1) || !isFinite(y2)) return NaN;
            return y1 - y2;
        };

        let prevX = xmin;
        let prevD = diff(xmin);

        for (let i = 1; i <= searchSamples; i++) {
            const x = xmin + i * step;
            const d = diff(x);

            // Check for sign change (zero crossing)
            if (isFinite(prevD) && isFinite(d) && prevD * d < 0) {
                // Refine using bisection
                const intersection = this._bisect(diff, prevX, x);
                if (intersection !== null) {
                    intersections.push(intersection);
                }
            }

            prevX = x;
            prevD = d;
        }

        return intersections;
    }

    /**
     * Bisection method to find root of function
     * @param {Function} f - Function to find root of
     * @param {number} a - Left bound
     * @param {number} b - Right bound
     * @returns {number|null} Root x value or null if not found
     */
    _bisect(f, a, b) {
        const tolerance = 1e-10;
        const maxIterations = 50;

        let fa = f(a);
        let fb = f(b);

        if (fa * fb > 0) return null;

        for (let i = 0; i < maxIterations; i++) {
            const mid = (a + b) / 2;
            const fmid = f(mid);

            if (Math.abs(fmid) < tolerance || (b - a) / 2 < tolerance) {
                return mid;
            }

            if (fa * fmid < 0) {
                b = mid;
                fb = fmid;
            } else {
                a = mid;
                fa = fmid;
            }
        }

        return (a + b) / 2;
    }

    /**
     * Generate polygon vertices for the area between the two curves
     * @param {number} xmin - Start x
     * @param {number} xmax - End x
     * @returns {Array<{x: number, y: number}>}
     */
    _generateVertices(xmin, xmax) {
        const vertices = [];
        const step = (xmax - xmin) / this.samples;

        // Pre-generate x values
        const xValues = [];
        for (let x = xmin; x <= xmax; x += step) {
            xValues.push(x);
        }
        if (xValues[xValues.length - 1] < xmax) {
            xValues.push(xmax);
        }

        // Sample curve1 at all x values
        const curve1Points = [];
        for (const x of xValues) {
            const y = this.compiledFunction1(x);
            if (isFinite(y)) {
                curve1Points.push({ x, y });
            }
        }

        // Sample curve2 at all x values
        const curve2Points = [];
        for (const x of xValues) {
            const y = this.compiledFunction2(x);
            if (isFinite(y)) {
                curve2Points.push({ x, y });
            }
        }

        // Build polygon: curve1 forward, then curve2 reversed
        vertices.push(...curve1Points);
        vertices.push(...curve2Points.reverse());

        // Close polygon
        if (vertices.length > 0) {
            vertices.push({ x: vertices[0].x, y: vertices[0].y });
        }

        return vertices;
    }

    /**
     * Get label position at center of the area
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        // Get intersections to find midpoint
        const xEnds = this.graphContainer?.xends();
        if (!xEnds) return { x: 0, y: 0 };

        const intersections = this._findIntersections(xEnds.min, xEnds.max);
        if (intersections.length < 2) return { x: 0, y: 0 };

        const midX = (intersections[0] + intersections[1]) / 2;
        const y1 = this.compiledFunction1(midX);
        const y2 = this.compiledFunction2(midX);
        return { x: midX, y: (y1 + y2) / 2 };
    }

    /**
     * Replay animation - clear old shape, recreate, then animate
     * @returns {Promise}
     */
    async playSingle() {
        // Clear old shape and recreate with current data
        await this.doInit();

        if (!this.commandResult) return;

        const shapeContainers = this.commandResult.getShapeContainers();
        if (!shapeContainers || shapeContainers.length === 0) return;

        return new Promise((resolve) => {
            shapeContainers.forEach(container => {
                const node = container.node;
                TweenMax.fromTo(node, 0.5,
                    { opacity: 0 },
                    { opacity: 1, ease: Power2.easeOut, onComplete: resolve }
                );
            });
        });
    }

    /**
     * Direct play - clear old shape, recreate, then show
     */
    doDirectPlay() {
        // doInit already called clear(), so shape is recreated fresh
        if (this.commandResult) {
            this.commandResult.renderEndState();
            this.commandResult.show();
        }
    }
}
