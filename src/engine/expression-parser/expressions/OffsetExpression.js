/**
 * OffsetExpression (Parallel Vector) - creates a parallel vector through a point
 *
 * Syntax:
 *   offset(graph, line/vec, point)          - parallel to line/vec, through point, same length
 *   offset(graph, line/vec, point, length)  - parallel to line/vec, through point, custom length
 *
 * Uses LineUtil.parallelThrough for calculation, renders as vector (arrow)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { VectorCommand } from '../../commands/VectorCommand.js';
import { LineCommand } from '../../commands/LineCommand.js';
import { LineUtil } from '../../../geom/LineUtil.js';

export class OffsetExpression extends AbstractNonArithmeticExpression {
    static NAME = 'offset';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2]
        this.graphExpression = null;
        this.inputType = 'vec'; // 'vec' or 'line'
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(`offset() needs arguments.\nUsage: offset(g, line, point)`);
        }

        // First arg is graph reference - resolve and store the actual expression
        this.subExpressions[0].resolve(context);
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        // Detect input type from second argument (line/vec)
        this.subExpressions[1].resolve(context);
        const sourceExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        this.inputType = sourceExpr.getName() === 'line' ? 'line' : 'vec';

        // Collect all atomic values from remaining subexpressions
        const allCoords = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            if (i > 1) this.subExpressions[i].resolve(context);
            const atomicValues = this.subExpressions[i].getVariableAtomicValues();
            for (let j = 0; j < atomicValues.length; j++) {
                allCoords.push(atomicValues[j]);
            }
        }

        // Validate and set default length
        this._validateAndSetLength(allCoords);

        if (allCoords.length !== 7) {
            this.dispatchError(`offset() needs 6 coordinates.\nGot ${allCoords.length - 1}, need: line(4) + point(2)`);
        }

        // Extract coordinates: x1, y1, x2, y2, px, py, length
        const refLine = {
            start: { x: allCoords[0], y: allCoords[1] },
            end: { x: allCoords[2], y: allCoords[3] }
        };
        const point = { x: allCoords[4], y: allCoords[5] };
        const length = allCoords[6];

        // Use LineUtil.parallelThrough to create the parallel
        const parallelLine = LineUtil.parallelThrough(
            refLine.start,
            refLine.end,
            point,
            length
        );

        this.coordinates = [parallelLine.start.x, parallelLine.start.y, parallelLine.end.x, parallelLine.end.y];
    }

    _validateAndSetLength(coords) {
        if (coords.length === 7) {
            // Length provided, ensure it's not zero
            if (coords[6] === 0) {
                coords[6] = 1;
            }
        } else if (coords.length === 6) {
            // No length provided, use default
            coords.push(null); // null means use reference line length
        }
    }


    // getGrapher() inherited from AbstractNonArithmeticExpression

    getName() {
        return OffsetExpression.NAME;
    }

    /**
     * Get geometry type for intersection detection
     * @returns {string} 'line'
     */
    getGeometryType() {
        return 'line';
    }

    getVariableAtomicValues() {
        return this.coordinates.slice(0, 4);
    }

    asVector() {
        return {
            x: this.coordinates[2] - this.coordinates[0],
            y: this.coordinates[3] - this.coordinates[1]
        };
    }

    magnitude() {
        const dx = this.coordinates[2] - this.coordinates[0];
        const dy = this.coordinates[3] - this.coordinates[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    getVectorPoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1] },
            { x: this.coordinates[2], y: this.coordinates[3] }
        ];
    }

    getVector() {
        return {
            start: { x: this.coordinates[0], y: this.coordinates[1] },
            end: { x: this.coordinates[2], y: this.coordinates[3] }
        };
    }

    getStartValue() {
        return [this.coordinates[0], this.coordinates[1]];
    }

    getEndValue() {
        return [this.coordinates[2], this.coordinates[3]];
    }

    getFriendlyToStr() {
        const pts = this.getVectorPoints();
        return `offset[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
    }

    toCommand(options = {}) {
        const pts = this.getVectorPoints();
        if (this.inputType === 'line') {
            return new LineCommand(this.graphExpression, pts[0], pts[1], options);
        }
        return new VectorCommand(this.graphExpression, pts[0], pts[1], options);
    }

    canPlay() {
        return true;
    }
}
