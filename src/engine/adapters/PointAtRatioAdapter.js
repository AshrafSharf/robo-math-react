/**
 * PointAtRatioAdapter - Computes a point at a given ratio along a shape's path
 *
 * Supports: line, vector, circle, arc, polygon
 * Extensible for: plot, triangle (barycentric), etc.
 */

/**
 * Base adapter class with factory method
 */
export class PointAtRatioAdapter {
    constructor(expression) {
        this.expression = expression;
    }

    /**
     * Get point at ratio (0 to 1) along the shape's path
     * @param {number} ratio - 0 = start, 1 = end
     * @returns {{x: number, y: number}}
     */
    getPointAtRatio(ratio) {
        throw new Error('Subclass must implement getPointAtRatio()');
    }

    /**
     * Factory method - creates appropriate adapter for expression type
     * @param {Object} expression - Resolved expression object
     * @returns {PointAtRatioAdapter}
     */
    static for(expression) {
        const type = expression.getName();

        switch (type) {
            case 'line':
            case 'extendline':
            case 'polarline':
            case 'hline':
            case 'vline':
                return new LinePointAtRatioAdapter(expression);

            case 'vector':
            case 'polarvector':
                return new VectorPointAtRatioAdapter(expression);

            case 'circle':
                return new CirclePointAtRatioAdapter(expression);

            case 'arc':
                return new ArcPointAtRatioAdapter(expression);

            case 'polygon':
                return new PolygonPointAtRatioAdapter(expression);

            default:
                throw new Error(`pointatratio() does not support '${type}' shapes yet`);
        }
    }
}

/**
 * Line adapter - linear interpolation between start and end
 */
class LinePointAtRatioAdapter extends PointAtRatioAdapter {
    getPointAtRatio(ratio) {
        const start = this.expression.getStartValue();
        const end = this.expression.getEndValue();

        return {
            x: start[0] + ratio * (end[0] - start[0]),
            y: start[1] + ratio * (end[1] - start[1])
        };
    }
}

/**
 * Vector adapter - same as line (linear interpolation)
 */
class VectorPointAtRatioAdapter extends PointAtRatioAdapter {
    getPointAtRatio(ratio) {
        const start = this.expression.getStartValue();
        const end = this.expression.getEndValue();

        return {
            x: start[0] + ratio * (end[0] - start[0]),
            y: start[1] + ratio * (end[1] - start[1])
        };
    }
}

/**
 * Circle adapter - point at angle along circumference
 * ratio 0 = rightmost point (angle 0)
 * ratio 0.25 = top (angle 90°)
 * ratio 0.5 = leftmost (angle 180°)
 * ratio 0.75 = bottom (angle 270°)
 * ratio 1 = back to start (angle 360°)
 */
class CirclePointAtRatioAdapter extends PointAtRatioAdapter {
    getPointAtRatio(ratio) {
        const center = this.expression.getCenter();
        const radius = this.expression.getRadius();

        // ratio 0-1 maps to angle 0 to 2π
        const angle = ratio * 2 * Math.PI;

        return {
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
        };
    }
}

/**
 * Arc adapter - point along arc path
 * ratio 0 = arc start point
 * ratio 1 = arc end point
 */
class ArcPointAtRatioAdapter extends PointAtRatioAdapter {
    getPointAtRatio(ratio) {
        const arcType = this.expression.getArcType();

        if (arcType === 'center-angle') {
            return this._getPointCenterAngle(ratio);
        } else {
            return this._getPointEndpoint(ratio);
        }
    }

    _getPointCenterAngle(ratio) {
        const data = this.expression.getCenterAngleFormat();
        const center = data.center;
        const radius = data.radius;
        const startAngle = data.startAngle;
        const sweepAngle = data.sweepAngle;

        // Interpolate angle based on ratio
        const angleDegrees = startAngle + ratio * sweepAngle;
        const angleRadians = (angleDegrees * Math.PI) / 180;

        return {
            x: center.x + radius * Math.cos(angleRadians),
            y: center.y + radius * Math.sin(angleRadians)
        };
    }

    _getPointEndpoint(ratio) {
        // For endpoint-based arcs, interpolate along the arc
        // This is a simplified linear interpolation - for true arc interpolation
        // we'd need to compute the arc center first
        const data = this.expression.getEndpointFormat();
        const start = data.start;
        const end = data.end;

        // Simple linear interpolation (approximation)
        // TODO: Implement true arc interpolation for endpoint arcs
        return {
            x: start.x + ratio * (end.x - start.x),
            y: start.y + ratio * (end.y - start.y)
        };
    }
}

/**
 * Polygon adapter - point along perimeter
 * Walks the edges proportionally
 */
class PolygonPointAtRatioAdapter extends PointAtRatioAdapter {
    getPointAtRatio(ratio) {
        const vertices = this.expression.getVertices();

        if (vertices.length < 2) {
            return vertices[0] || { x: 0, y: 0 };
        }

        // Handle edge cases
        if (ratio <= 0) return { x: vertices[0].x, y: vertices[0].y };
        if (ratio >= 1) {
            const last = vertices[vertices.length - 1];
            return { x: last.x, y: last.y };
        }

        // Calculate edge lengths and total perimeter
        const edges = [];
        let totalLength = 0;

        for (let i = 0; i < vertices.length - 1; i++) {
            const dx = vertices[i + 1].x - vertices[i].x;
            const dy = vertices[i + 1].y - vertices[i].y;
            const length = Math.sqrt(dx * dx + dy * dy);
            edges.push({
                start: vertices[i],
                end: vertices[i + 1],
                length: length
            });
            totalLength += length;
        }

        // Find target distance along perimeter
        const targetDistance = ratio * totalLength;

        // Walk edges to find the point
        let accumulatedLength = 0;

        for (const edge of edges) {
            if (accumulatedLength + edge.length >= targetDistance) {
                // Point is on this edge
                const edgeRatio = (targetDistance - accumulatedLength) / edge.length;
                return {
                    x: edge.start.x + edgeRatio * (edge.end.x - edge.start.x),
                    y: edge.start.y + edgeRatio * (edge.end.y - edge.start.y)
                };
            }
            accumulatedLength += edge.length;
        }

        // Fallback to last vertex
        const last = vertices[vertices.length - 1];
        return { x: last.x, y: last.y };
    }
}
