/**
 * Graph2DExpression - creates a 2D graph container using logical coordinate bounds
 *
 * Syntax:
 *   g2d(row1, col1, row2, col2, axes)
 *   g2d(row1, col1, row2, col2, xRange, yRange)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { Create2DGraphCommand } from '../../commands/Create2DGraphCommand.js';
import { RangeExpression } from './RangeExpression.js';
import { AxesExpression } from './AxesExpression.js';
import { VariableReferenceExpression } from './VariableReferenceExpression.js';

/**
 * Unwrap a variable reference to get the underlying expression
 */
function unwrapExpression(expr) {
    if (expr instanceof VariableReferenceExpression) {
        return expr.variableValueExpression;
    }
    return expr;
}

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
        this.xStep = null;
        this.yStep = null;
        this.xScale = 'linear';
        this.yScale = 'linear';
        this.showGrid = true;
        this.gridColor = null;
        this.gridStrokeWidth = null;
        // Reference to created grapher (set by command after init)
        this.grapher = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError('g2d() requires at least 4 arguments: row1, col1, row2, col2');
        }

        // Resolve first 4 args for position
        const positionArgs = [];
        for (let i = 0; i < 4; i++) {
            const expr = this.subExpressions[i];
            expr.resolve(context);
            const values = expr.getVariableAtomicValues();
            if (values.length > 0 && typeof values[0] === 'number') {
                positionArgs.push(values[0]);
            } else {
                this.dispatchError(`g2d() argument ${i + 1} must be a number`);
            }
        }

        this.row1 = positionArgs[0];
        this.col1 = positionArgs[1];
        this.row2 = positionArgs[2];
        this.col2 = positionArgs[3];

        // Validate that end bounds are greater than start bounds
        if (this.row2 <= this.row1) {
            this.dispatchError(`g2d() end row (${this.row2}) must be greater than start row (${this.row1})`);
        }
        if (this.col2 <= this.col1) {
            this.dispatchError(`g2d() end col (${this.col2}) must be greater than start col (${this.col1})`);
        }

        // Process remaining args (axes, ranges, etc.)
        if (this.subExpressions.length > 4) {
            const arg5Raw = this.subExpressions[4];
            arg5Raw.resolve(context);
            const arg5 = unwrapExpression(arg5Raw);

            if (arg5 instanceof AxesExpression) {
                // g2d(r1, c1, r2, c2, axes(...))
                this._extractFromAxes(arg5);
            } else if (arg5 instanceof RangeExpression) {
                // g2d(r1, c1, r2, c2, xRange, yRange)
                this._extractFromRange(arg5, 'x');
                if (this.subExpressions.length > 5) {
                    const arg6Raw = this.subExpressions[5];
                    arg6Raw.resolve(context);
                    const arg6 = unwrapExpression(arg6Raw);
                    if (arg6 instanceof RangeExpression) {
                        this._extractFromRange(arg6, 'y');
                    }
                }
            }
        }
    }

    _extractFromAxes(axesExpr) {
        const xRange = axesExpr.getXRange();
        const yRange = axesExpr.getYRange();
        const grid = axesExpr.getGrid();

        if (xRange) {
            this._extractFromRange(xRange, 'x');
        }
        if (yRange) {
            this._extractFromRange(yRange, 'y');
        }
        if (grid) {
            this.gridColor = grid.getColor();
            this.gridStrokeWidth = grid.getStrokeWidth();
        }
    }

    _extractFromRange(rangeExpr, axis) {
        if (axis === 'x') {
            this.xRange = rangeExpr.getRange();
            this.xStep = rangeExpr.getStep();
            this.xScale = rangeExpr.getScale();
        } else {
            this.yRange = rangeExpr.getRange();
            this.yStep = rangeExpr.getStep();
            this.yScale = rangeExpr.getScale();
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
            this.row1, this.col1, this.row2, this.col2,
            {
                xRange: this.xRange,
                yRange: this.yRange,
                xStep: this.xStep,
                yStep: this.yStep,
                xScaleType: this.xScale,
                yScaleType: this.yScale,
                showGrid: this.showGrid,
                gridColor: this.gridColor,
                gridStrokeWidth: this.gridStrokeWidth,
            },
            this  // Pass expression reference so command can set grapher
        );
    }
}
