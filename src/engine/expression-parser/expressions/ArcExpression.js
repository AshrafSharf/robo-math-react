/**
 * Arc expression - represents a 2D arc
 *
 * Supports two input formats:
 * 1. arc(graph, centerX, centerY, radius, startAngle, sweepAngle)
 *    - 5 values: center point, radius, and angles in degrees
 * 2. arc(graph, startX, startY, endX, endY, rx, ry)
 *    - 6 values: start point, end point, and ellipse radii
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { ArcCommand } from '../../commands/ArcCommand.js';
import { arc_error_messages } from '../core/ErrorMessages.js';

export class ArcExpression extends AbstractNonArithmeticExpression {
    static NAME = 'arc';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = [];
        this.arcType = null; // 'center-angle' or 'endpoint'
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(arc_error_messages.MISSING_ARGS());
        }

        // First arg must be graph
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError(arc_error_messages.GRAPH_REQUIRED());
        }

        // Remaining args are coordinates
        this.coordinates = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);

            const resultExpression = this.subExpressions[i];
            const atomicValues = resultExpression.getVariableAtomicValues();

            for (let j = 0; j < atomicValues.length; j++) {
                this.coordinates.push(atomicValues[j]);
            }
        }

        // Determine arc type based on number of coordinates
        if (this.coordinates.length === 5) {
            // arc(g, centerX, centerY, radius, startAngle, sweepAngle)
            this.arcType = 'center-angle';
        } else if (this.coordinates.length === 6) {
            // arc(g, startX, startY, endX, endY, rx, ry)
            this.arcType = 'endpoint';
        } else {
            this.dispatchError(arc_error_messages.WRONG_COORD_COUNT(this.coordinates.length));
        }
    }

    // getGrapher() inherited from AbstractNonArithmeticExpression

    getName() {
        return ArcExpression.NAME;
    }

    /**
     * Get geometry type for intersection detection
     * @returns {string} 'circle'
     */
    getGeometryType() {
        return 'circle';
    }

    getVariableAtomicValues() {
        return this.coordinates.slice();
    }

    /**
     * Get arc as center-angle format
     * Returns: { center: {x, y}, radius, startAngle, sweepAngle }
     */
    getCenterAngleFormat() {
        if (this.arcType === 'center-angle') {
            return {
                center: { x: this.coordinates[0], y: this.coordinates[1] },
                radius: this.coordinates[2],
                startAngle: this.coordinates[3],
                sweepAngle: this.coordinates[4]
            };
        }
        // Convert from endpoint format
        // This is a simplified conversion - for a full implementation,
        // you'd need to calculate the arc center from the endpoints
        throw new Error('Conversion from endpoint to center-angle not implemented');
    }

    /**
     * Get arc as endpoint format
     * Returns: { start: {x, y}, end: {x, y}, rx, ry }
     */
    getEndpointFormat() {
        if (this.arcType === 'endpoint') {
            return {
                start: { x: this.coordinates[0], y: this.coordinates[1] },
                end: { x: this.coordinates[2], y: this.coordinates[3] },
                rx: this.coordinates[4],
                ry: this.coordinates[5]
            };
        }

        // Convert from center-angle format
        if (this.arcType === 'center-angle') {
            const center = { x: this.coordinates[0], y: this.coordinates[1] };
            const radius = this.coordinates[2];
            const startAngle = this.coordinates[3];
            const sweepAngle = this.coordinates[4];
            const endAngle = startAngle + sweepAngle;

            // Convert angles to radians
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            return {
                start: {
                    x: center.x + radius * Math.cos(startRad),
                    y: center.y + radius * Math.sin(startRad)
                },
                end: {
                    x: center.x + radius * Math.cos(endRad),
                    y: center.y + radius * Math.sin(endRad)
                },
                rx: radius,
                ry: radius
            };
        }

        throw new Error('Unknown arc type');
    }

    /**
     * Get arc center point
     */
    getCenter() {
        if (this.arcType === 'center-angle') {
            return { x: this.coordinates[0], y: this.coordinates[1] };
        }
        throw new Error('Center not directly available for endpoint-based arcs');
    }

    /**
     * Get arc radius (for circular arcs)
     */
    getRadius() {
        if (this.arcType === 'center-angle') {
            return this.coordinates[2];
        }
        // For elliptical arcs, return average of rx and ry
        return (this.coordinates[4] + this.coordinates[5]) / 2;
    }

    /**
     * Get arc angles
     * Returns: { start, sweep } in degrees
     */
    getAngles() {
        if (this.arcType === 'center-angle') {
            return {
                start: this.coordinates[3],
                sweep: this.coordinates[4]
            };
        }
        throw new Error('Angles not directly available for endpoint-based arcs');
    }

    /**
     * Get start point of the arc
     */
    getStartValue() {
        const ep = this.getEndpointFormat();
        return [ep.start.x, ep.start.y];
    }

    /**
     * Get end point of the arc
     */
    getEndValue() {
        const ep = this.getEndpointFormat();
        return [ep.end.x, ep.end.y];
    }

    /**
     * Check if this arc is circular (rx === ry)
     */
    isCircular() {
        if (this.arcType === 'center-angle') {
            return true;
        }
        return this.coordinates[4] === this.coordinates[5];
    }

    /**
     * Get arc type
     * @returns {string} 'center-angle' or 'endpoint'
     */
    getArcType() {
        return this.arcType;
    }

    /**
     * Get friendly string representation
     */
    getFriendlyToStr() {
        if (this.arcType === 'center-angle') {
            const center = this.getCenter();
            const radius = this.getRadius();
            const angles = this.getAngles();
            return `Arc[center(${center.x}, ${center.y}), r=${radius}, ${angles.start}° to ${angles.start + angles.sweep}°]`;
        }
        const ep = this.getEndpointFormat();
        return `Arc[(${ep.start.x}, ${ep.start.y}) to (${ep.end.x}, ${ep.end.y}), rx=${ep.rx}, ry=${ep.ry}]`;
    }

    /**
     * Create an ArcCommand from this expression
     * @param {Object} options - Command options {strokeWidth}
     * @returns {ArcCommand}
     */
    toCommand(options = {}) {
        const ep = this.getEndpointFormat();
        return new ArcCommand(this.graphExpression, ep.start, ep.end, ep.rx, ep.ry, options);
    }

    /**
     * Arcs can be played (animated)
     * @returns {boolean}
     */
    canPlay() {
        return true;
    }
}
