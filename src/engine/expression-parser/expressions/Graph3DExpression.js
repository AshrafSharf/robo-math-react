/**
 * Graph3DExpression - creates a 3D graph container using logical coordinate bounds
 *
 * Syntax:
 *   g3d(row1, col1, row2, col2, xRange, yRange, zRange)
 *
 * coordinateSystem can be:
 *   - 'lhs' (default): Left-Hand System - X right, Y forward, Z up
 *   - 'rhs': Right-Hand System - native Three.js coordinates (X right, Y up, Z towards viewer)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { Create3DGraphCommand } from '../../commands/Create3DGraphCommand.js';
import { RangeExpression } from './RangeExpression.js';

export class Graph3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'g3d';

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
        this.zRange = [-10, 10];
        this.xStep = null;
        this.yStep = null;
        this.zStep = null;
        this.xScale = 'linear';
        this.yScale = 'linear';
        this.zScale = 'linear';
        this.showGrid = true;
        this.coordinateSystem = 'lhs'; // Default to LHS coordinate system
        // Reference to created grapher (set by command after init)
        this.grapher = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError('g3d() requires at least 4 arguments: row1, col1, row2, col2');
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
                this.dispatchError(`g3d() argument ${i + 1} must be a number`);
            }
        }

        this.row1 = positionArgs[0];
        this.col1 = positionArgs[1];
        this.row2 = positionArgs[2];
        this.col2 = positionArgs[3];

        // Validate that end bounds are greater than start bounds
        if (this.row2 <= this.row1) {
            this.dispatchError(`g3d() end row (${this.row2}) must be greater than start row (${this.row1})`);
        }
        if (this.col2 <= this.col1) {
            this.dispatchError(`g3d() end col (${this.col2}) must be greater than start col (${this.col1})`);
        }

        // Process remaining args (ranges for x, y, z)
        let rangeIndex = 0;
        for (let i = 4; i < this.subExpressions.length; i++) {
            const expr = this.subExpressions[i];
            expr.resolve(context);

            if (expr instanceof RangeExpression) {
                if (rangeIndex === 0) {
                    this._extractFromRange(expr, 'x');
                } else if (rangeIndex === 1) {
                    this._extractFromRange(expr, 'y');
                } else if (rangeIndex === 2) {
                    this._extractFromRange(expr, 'z');
                }
                rangeIndex++;
            }
        }
    }

    _extractFromRange(rangeExpr, axis) {
        if (axis === 'x') {
            this.xRange = rangeExpr.getRange();
            this.xStep = rangeExpr.getStep();
            this.xScale = rangeExpr.getScale();
        } else if (axis === 'y') {
            this.yRange = rangeExpr.getRange();
            this.yStep = rangeExpr.getStep();
            this.yScale = rangeExpr.getScale();
        } else {
            this.zRange = rangeExpr.getRange();
            this.zStep = rangeExpr.getStep();
            this.zScale = rangeExpr.getScale();
        }
    }

    getName() {
        return Graph3DExpression.NAME;
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
        return new Create3DGraphCommand(
            this.row1, this.col1, this.row2, this.col2,
            {
                xRange: this.xRange,
                yRange: this.yRange,
                zRange: this.zRange,
                xStep: this.xStep,
                yStep: this.yStep,
                zStep: this.zStep,
                xScaleType: this.xScale,
                yScaleType: this.yScale,
                zScaleType: this.zScale,
                showGrid: this.showGrid,
                coordinateSystem: this.coordinateSystem
            },
            this  // Pass expression reference so command can set grapher
        );
    }
}
