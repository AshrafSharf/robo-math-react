/**
 * Graph2DExpression - creates a 2D graph container
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { Create2DGraphCommand } from '../../commands/Create2DGraphCommand.js';

export class Graph2DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'g2d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // Resolved values
        this.row = 0;
        this.col = 0;
        this.width = 600;
        this.height = 400;
        this.xRange = [-10, 10];
        this.yRange = [-10, 10];
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

        // Required: row, col, width, height
        if (values.length < 4) {
            this.dispatchError('2d() requires at least 4 arguments: row, col, width, height');
        }

        this.row = values[0];
        this.col = values[1];
        this.width = values[2];
        this.height = values[3];

        // Optional: xMin, xMax (indices 4, 5)
        if (values.length >= 6) {
            this.xRange = [values[4], values[5]];
        }

        // Optional: yMin, yMax (indices 6, 7)
        if (values.length >= 8) {
            this.yRange = [values[6], values[7]];
        }

        // Optional: showGrid (index 8, 0=false, non-zero=true)
        if (values.length >= 9) {
            this.showGrid = values[8] !== 0;
        }
    }

    getName() {
        return Graph2DExpression.NAME;
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
        return new Create2DGraphCommand(
            this.row, this.col, this.width, this.height,
            { xRange: this.xRange, yRange: this.yRange, showGrid: this.showGrid },
            this  // Pass expression reference so command can set grapher
        );
    }
}
