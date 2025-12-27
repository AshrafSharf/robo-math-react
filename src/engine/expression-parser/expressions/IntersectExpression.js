/**
 * Intersect expression - finds intersection points between geometric objects
 *
 * Syntax:
 *   intersect(graph, obj1, obj2)           - returns first intersection point (index 1)
 *   intersect(graph, obj1, obj2, index)    - returns intersection point at given index (1-based)
 *
 * Supported combinations:
 *   - line/vec + line/vec  → 0 or 1 intersection (infinite line semantics)
 *   - line/vec + circle    → 0, 1, or 2 intersections
 *   - circle + circle      → 0, 1, or 2 intersections
 *   - line/vec + polygon   → 0 or more intersections
 *   - plot + plot          → 0 or more intersections (numerical root finding)
 *
 * If no intersection exists or index is out of range, returns NaN coordinates
 * and toCommand() returns NoOpCommand.
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import { PointCommand } from '../../commands/PointCommand.js';
import { NoOpCommand } from '../../commands/NoOpCommand.js';
import { IntersectionUtil } from '../../../geom/IntersectionUtil.js';
import { intersect_error_messages } from '../core/ErrorMessages.js';

// Geometry type constants - expressions implement getGeometryType() returning these
export const GEOMETRY_TYPES = {
    LINE: 'line',       // line, vec, vline, hline, perpl, pll, perpv, plv
    CIRCLE: 'circle',   // circle, arc
    POLYGON: 'polygon', // polygon (and future triangle types)
    ANGLE: 'angle',     // angle, anglex, anglex2, angler, anglert, angleo
    POINT: 'point',     // point
    PLOT: 'plot'        // plot, paraplot
};

export class IntersectExpression extends AbstractArithmeticExpression {
    static NAME = 'intersect';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.point = { x: NaN, y: NaN };
        this.hasValidPoint = false;
        this.graphExpression = null;
    }

    resolve(context) {
        // Validate argument count: 3 or 4 args (graph, obj1, obj2, [index])
        if (this.subExpressions.length < 3 || this.subExpressions.length > 4) {
            this.dispatchError(intersect_error_messages.WRONG_ARG_COUNT(this.subExpressions.length));
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(intersect_error_messages.GRAPH_REQUIRED());
        }

        // Resolve both geometry expressions
        this.subExpressions[1].resolve(context);
        this.subExpressions[2].resolve(context);

        const expr1 = this._getResolvedExpression(context, this.subExpressions[1]);
        const expr2 = this._getResolvedExpression(context, this.subExpressions[2]);

        // Resolve optional index (default: 1)
        let index = 1;
        if (this.subExpressions.length === 4) {
            this.subExpressions[3].resolve(context);
            const indexValues = this.subExpressions[3].getVariableAtomicValues();
            if (indexValues.length !== 1) {
                this.dispatchError(intersect_error_messages.INDEX_NOT_NUMBER());
            }
            index = Math.floor(indexValues[0]);
            if (index < 1) {
                this.dispatchError(intersect_error_messages.INDEX_LESS_THAN_ONE());
            }
        }

        // Calculate intersections
        const intersectionPoints = this._calculateIntersections(expr1, expr2);

        // Select point at index (1-based)
        if (intersectionPoints.length > 0 && index <= intersectionPoints.length) {
            const pt = intersectionPoints[index - 1];
            this.point = { x: pt.x, y: pt.y };
            this.hasValidPoint = true;
        } else {
            // No valid intersection at this index
            this.point = { x: NaN, y: NaN };
            this.hasValidPoint = false;
        }
    }

    /**
     * Calculate intersection points between two expressions
     */
    _calculateIntersections(expr1, expr2) {
        const type1 = this._getGeometryType(expr1);
        const type2 = this._getGeometryType(expr2);

        // Line-Line intersection
        if (type1 === 'line' && type2 === 'line') {
            return this._intersectLineLine(expr1, expr2);
        }

        // Line-Circle intersection (either order)
        if (type1 === 'line' && type2 === 'circle') {
            return this._intersectLineCircle(expr1, expr2);
        }
        if (type1 === 'circle' && type2 === 'line') {
            return this._intersectLineCircle(expr2, expr1);
        }

        // Circle-Circle intersection
        if (type1 === 'circle' && type2 === 'circle') {
            return this._intersectCircleCircle(expr1, expr2);
        }

        // Line-Polygon intersection (either order)
        if (type1 === 'line' && type2 === 'polygon') {
            return this._intersectLinePolygon(expr1, expr2);
        }
        if (type1 === 'polygon' && type2 === 'line') {
            return this._intersectLinePolygon(expr2, expr1);
        }

        // Plot-Plot intersection
        if (type1 === 'plot' && type2 === 'plot') {
            return this._intersectPlotPlot(expr1, expr2);
        }

        // Unsupported combination
        this.dispatchError(intersect_error_messages.INVALID_COMBINATION(
            expr1.getName(), expr2.getName()
        ));
        return [];
    }

    /**
     * Get geometry type category for an expression
     * Expressions should implement getGeometryType() returning GEOMETRY_TYPES constant
     */
    _getGeometryType(expr) {
        if (typeof expr.getGeometryType === 'function') {
            return expr.getGeometryType();
        }
        return null;
    }

    /**
     * Extract line points from line-like expression
     */
    _getLinePoints(expr) {
        // Different expressions have different methods
        if (typeof expr.getLinePoints === 'function') {
            const pts = expr.getLinePoints();
            return { start: pts[0], end: pts[1] };
        }
        if (typeof expr.getVectorPoints === 'function') {
            const pts = expr.getVectorPoints();
            return { start: pts[0], end: pts[1] };
        }
        // Fallback: use getVariableAtomicValues [x1, y1, x2, y2]
        const coords = expr.getVariableAtomicValues();
        return {
            start: { x: coords[0], y: coords[1] },
            end: { x: coords[2], y: coords[3] }
        };
    }

    /**
     * Extract circle data from circle-like expression
     */
    _getCircleData(expr) {
        if (typeof expr.getCenter === 'function' && typeof expr.getRadius === 'function') {
            return {
                center: expr.getCenter(),
                radius: expr.getRadius()
            };
        }
        // Fallback: use getVariableAtomicValues [cx, cy, radius]
        const coords = expr.getVariableAtomicValues();
        return {
            center: { x: coords[0], y: coords[1] },
            radius: coords[2]
        };
    }

    /**
     * Extract polygon vertices from polygon expression
     */
    _getPolygonVertices(expr) {
        if (typeof expr.getVertices === 'function') {
            return expr.getVertices();
        }
        // Fallback: parse from atomic values
        const coords = expr.getVariableAtomicValues();
        const vertices = [];
        for (let i = 0; i < coords.length - 1; i += 2) {
            vertices.push({ x: coords[i], y: coords[i + 1] });
        }
        return vertices;
    }

    /**
     * Line-Line intersection (infinite lines)
     */
    _intersectLineLine(lineExpr1, lineExpr2) {
        const line1 = this._getLinePoints(lineExpr1);
        const line2 = this._getLinePoints(lineExpr2);

        const result = IntersectionUtil.lineLineIntersection(
            line1.start, line1.end,
            line2.start, line2.end
        );

        return result ? [result] : [];
    }

    /**
     * Line-Circle intersection
     */
    _intersectLineCircle(lineExpr, circleExpr) {
        const line = this._getLinePoints(lineExpr);
        const circle = this._getCircleData(circleExpr);

        return IntersectionUtil.lineCircleIntersection(
            line.start, line.end,
            circle.center, circle.radius
        );
    }

    /**
     * Circle-Circle intersection
     */
    _intersectCircleCircle(circleExpr1, circleExpr2) {
        const circle1 = this._getCircleData(circleExpr1);
        const circle2 = this._getCircleData(circleExpr2);

        return IntersectionUtil.circleCircleIntersection(
            circle1.center, circle1.radius,
            circle2.center, circle2.radius
        );
    }

    /**
     * Line-Polygon intersection
     */
    _intersectLinePolygon(lineExpr, polygonExpr) {
        const line = this._getLinePoints(lineExpr);
        const vertices = this._getPolygonVertices(polygonExpr);

        return IntersectionUtil.linePolygonIntersection(
            line.start, line.end,
            vertices
        );
    }

    /**
     * Plot-Plot intersection using numerical root finding
     * Finds where f(x) - g(x) = 0
     */
    _intersectPlotPlot(plotExpr1, plotExpr2) {
        const f1 = plotExpr1.getCompiledFunction();
        const f2 = plotExpr2.getCompiledFunction();

        if (!f1 || !f2) {
            return [];
        }

        // Determine search domain
        const domain1 = plotExpr1.getDomain();
        const domain2 = plotExpr2.getDomain();
        const graphRange = this.graphExpression.xRange;

        // Use intersection of all domains
        let xMin = graphRange[0];
        let xMax = graphRange[1];

        if (domain1.min !== null) xMin = Math.max(xMin, domain1.min);
        if (domain1.max !== null) xMax = Math.min(xMax, domain1.max);
        if (domain2.min !== null) xMin = Math.max(xMin, domain2.min);
        if (domain2.max !== null) xMax = Math.min(xMax, domain2.max);

        // Difference function: where this is zero, plots intersect
        const diff = (x) => {
            try {
                const y1 = f1(x);
                const y2 = f2(x);
                if (!isFinite(y1) || !isFinite(y2)) return NaN;
                return y1 - y2;
            } catch {
                return NaN;
            }
        };

        // Sample to find sign changes (potential roots)
        const numSamples = 500;
        const step = (xMax - xMin) / numSamples;
        const roots = [];
        const tolerance = 1e-10;

        let prevX = xMin;
        let prevY = diff(prevX);

        for (let i = 1; i <= numSamples; i++) {
            const x = xMin + i * step;
            const y = diff(x);

            // Check for sign change or exact zero
            if (isFinite(prevY) && isFinite(y)) {
                if (Math.abs(y) < tolerance) {
                    // Exact hit
                    roots.push(x);
                } else if (prevY * y < 0) {
                    // Sign change - use bisection to find root
                    const root = this._bisectionRoot(diff, prevX, x, tolerance);
                    if (root !== null) {
                        roots.push(root);
                    }
                }
            }

            prevX = x;
            prevY = y;
        }

        // Remove duplicates (within tolerance) and convert to points
        const uniqueRoots = this._removeDuplicates(roots, step * 0.5);

        // Convert x values to intersection points
        return uniqueRoots.map(x => {
            const y = f1(x);
            return { x, y };
        }).filter(pt => isFinite(pt.y));
    }

    /**
     * Bisection method to find root in interval [a, b]
     */
    _bisectionRoot(f, a, b, tolerance, maxIter = 50) {
        let fa = f(a);
        let fb = f(b);

        if (!isFinite(fa) || !isFinite(fb)) return null;
        if (fa * fb > 0) return null;

        for (let i = 0; i < maxIter; i++) {
            const mid = (a + b) / 2;
            const fmid = f(mid);

            if (!isFinite(fmid)) return null;
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
     * Remove duplicate roots within tolerance
     */
    _removeDuplicates(roots, tolerance) {
        if (roots.length === 0) return [];

        const sorted = [...roots].sort((a, b) => a - b);
        const unique = [sorted[0]];

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] - unique[unique.length - 1] > tolerance) {
                unique.push(sorted[i]);
            }
        }

        return unique;
    }

    getName() {
        return IntersectExpression.NAME;
    }

    // getGrapher() inherited from AbstractArithmeticExpression

    getPoint() {
        return this.point;
    }

    getVariableAtomicValues() {
        return [this.point.x, this.point.y];
    }

    getStartValue() {
        return [this.point.x, this.point.y];
    }

    getEndValue() {
        return [this.point.x, this.point.y];
    }

    getFriendlyToStr() {
        if (this.hasValidPoint) {
            return `Intersect(${this.point.x.toFixed(2)}, ${this.point.y.toFixed(2)})`;
        }
        return 'Intersect(none)';
    }

    /**
     * Create command - PointCommand if valid, NoOpCommand if no intersection
     */
    toCommand(options = {}) {
        if (this.hasValidPoint) {
            const mergedOptions = { ...options, ...this.getStyleOptions() };
            return new PointCommand(this.graphExpression, this.point, mergedOptions);
        }
        return new NoOpCommand();
    }

    /**
     * Can play only if we have a valid intersection point
     */
    canPlay() {
        return this.hasValidPoint;
    }
}
