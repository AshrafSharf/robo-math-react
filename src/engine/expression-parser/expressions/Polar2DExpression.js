/**
 * Polar2DExpression - creates a 2D polar coordinate graph container
 *
 * Syntax: p2d(row1, col1, row2, col2, [rMax, showGrid])
 *
 * Parameters:
 * - row1, col1: Top-left corner in logical coordinates
 * - row2, col2: Bottom-right corner in logical coordinates
 * - rMax: Maximum radius (default: 10)
 * - showGrid: 1 to show grid, 0 to hide (default: 1)
 *
 * The polar grid displays:
 * - Concentric circles for r values
 * - Radial lines for θ values (0 to 2π)
 * - Angle labels in π notation
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { CreatePolar2DGraphCommand } from '../../commands/CreatePolar2DGraphCommand.js';

export class Polar2DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'p2d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // Resolved values - bounds-based
        this.row1 = 0;
        this.col1 = 0;
        this.row2 = 10;
        this.col2 = 8;
        this.rMax = 10;
        this.showGrid = true;
        // Reference to created grapher (set by command after init)
        this.grapher = null;
    }

    resolve(context) {
        // Extract all numeric values from subExpressions
        const values = [];
        for (const expr of this.subExpressions) {
            expr.resolve(context);
            values.push(...expr.getVariableAtomicValues());
        }

        // Required: row1, col1, row2, col2
        if (values.length < 4) {
            this.dispatchError('p2d() requires at least 4 arguments: row1, col1, row2, col2');
        }

        this.row1 = values[0];
        this.col1 = values[1];
        this.row2 = values[2];
        this.col2 = values[3];

        // Optional: rMax (index 4)
        if (values.length >= 5) {
            this.rMax = values[4];
        }

        // Optional: showGrid (index 5, 0=false, non-zero=true)
        if (values.length >= 6) {
            this.showGrid = values[5] !== 0;
        }
    }

    getName() {
        return Polar2DExpression.NAME;
    }

    getGrapher() {
        return this.grapher;
    }

    setGrapher(grapher) {
        this.grapher = grapher;
    }

    getVariableAtomicValues() {
        // Graph doesn't contribute coordinates - it's a container, not a geometric value
        return [];
    }

    toCommand(options = {}) {
        return new CreatePolar2DGraphCommand(
            this.row1, this.col1, this.row2, this.col2,
            {
                rMax: options.rMax || this.rMax,
                showGrid: this.showGrid,
                radialLines: options.radialLines,
                concentricCircles: options.concentricCircles,
                angleLabels: options.angleLabels
            },
            this  // Pass expression reference so command can set grapher
        );
    }
}
