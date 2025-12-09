/**
 * PLL (Parallel Line) expression - creates a parallel line through a point
 *
 * Syntax:
 *   pll(graph, line, point)          - parallel to line, through point
 *   pll(graph, line, point, length)  - with custom length
 *   pll(graph, x1, y1, x2, y2, px, py)        - using raw coordinates
 *   pll(graph, x1, y1, x2, y2, px, py, len)   - with length
 *
 * Collects 6 coordinates (line + point) or 7 (line + point + length)
 * Uses LineUtil.parallelThrough for calculation
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { LineCommand } from '../../commands/LineCommand.js';
import { LineUtil } from '../../../geom/LineUtil.js';

export class PLLExpression extends AbstractNonArithmeticExpression {
    static NAME = 'pll';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = []; // [x1, y1, x2, y2] - the result parallel line
        this.graphExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError(`pll() needs arguments.\nUsage: pll(g, line, point)`);
        }

        // First arg is graph reference
        this.subExpressions[0].resolve(context);
        this.graphExpression = this.subExpressions[0];

        // Collect all atomic values from remaining subexpressions
        const allCoords = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const atomicValues = this.subExpressions[i].getVariableAtomicValues();
            for (let j = 0; j < atomicValues.length; j++) {
                allCoords.push(atomicValues[j]);
            }
        }

        // Validate and set default length
        this._validateAndSetLength(allCoords);

        if (allCoords.length !== 7) {
            this.dispatchError(`pll() needs 6 coordinates.\nGot ${allCoords.length - 1}, need: line(4) + point(2)`);
        }

        // Extract coordinates: x1, y1, x2, y2, px, py, length
        const refLine = {
            start: { x: allCoords[0], y: allCoords[1] },
            end: { x: allCoords[2], y: allCoords[3] }
        };
        const point = { x: allCoords[4], y: allCoords[5] };
        const length = allCoords[6];

        // Use LineUtil.parallelThrough to create the parallel line
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

    getGrapher() {
        if (this.graphExpression && typeof this.graphExpression.getGrapher === 'function') {
            return this.graphExpression.getGrapher();
        }
        return null;
    }

    getName() {
        return PLLExpression.NAME;
    }

    getVariableAtomicValues() {
        return this.coordinates.slice(0, 4);
    }

    getLinePoints() {
        return [
            { x: this.coordinates[0], y: this.coordinates[1] },
            { x: this.coordinates[2], y: this.coordinates[3] }
        ];
    }

    getLine() {
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
        const pts = this.getLinePoints();
        return `PLL[(${pts[0].x}, ${pts[0].y}) -> (${pts[1].x}, ${pts[1].y})]`;
    }

    toCommand(options = {}) {
        const pts = this.getLinePoints();
        return new LineCommand(this.graphExpression, pts[0], pts[1], options);
    }

    canPlay() {
        return true;
    }
}
