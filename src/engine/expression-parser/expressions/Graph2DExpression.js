/**
 * Graph2DExpression - creates a 2D graph container using logical coordinate bounds
 *
 * Syntax: g2d(row1, col1, row2, col2, [xMin, xMax, yMin, yMax, showGrid])
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { Create2DGraphCommand } from '../../commands/Create2DGraphCommand.js';

export class Graph2DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'g2d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // Resolved values - bounds-based
        this.row1 = 0;
        this.col1 = 0;
        this.row2 = 10;
        this.col2 = 8;
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

        // Required: row1, col1, row2, col2
        if (values.length < 4) {
            this.dispatchError('g2d() requires at least 4 arguments: row1, col1, row2, col2');
        }

        this.row1 = values[0];
        this.col1 = values[1];
        this.row2 = values[2];
        this.col2 = values[3];

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
        // Use options range if provided, otherwise use expression values
        const xRange = (options.xMin !== undefined && options.xMax !== undefined)
            ? [options.xMin, options.xMax]
            : this.xRange;
        const yRange = (options.yMin !== undefined && options.yMax !== undefined)
            ? [options.yMin, options.yMax]
            : this.yRange;

        return new Create2DGraphCommand(
            this.row1, this.col1, this.row2, this.col2,
            {
                xRange,
                yRange,
                showGrid: options.showGrid !== undefined ? options.showGrid : this.showGrid,
                xScaleType: options.xScaleType,
                yScaleType: options.yScaleType,
                xDivisions: options.xDivisions,
                yDivisions: options.yDivisions,
                xLogBase: options.xLogBase,
                yLogBase: options.yLogBase,
                xPiMultiplier: options.xPiMultiplier,
                yPiMultiplier: options.yPiMultiplier,
            },
            this  // Pass expression reference so command can set grapher
        );
    }
}
