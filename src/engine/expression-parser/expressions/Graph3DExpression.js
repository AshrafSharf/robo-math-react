/**
 * Graph3DExpression - creates a 3D graph container using logical coordinate bounds
 *
 * Syntax:
 *   g3d(row1, col1, row2, col2, axes3d(...))
 *   g3d(row1, col1, row2, col2, xRange, yRange, zRange)
 *
 * coordinateSystem can be:
 *   - 'lhs' (default): Left-Hand System - X right, Y forward, Z up
 *   - 'rhs': Right-Hand System - native Three.js coordinates (X right, Y up, Z towards viewer)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { Create3DGraphCommand } from '../../commands/Create3DGraphCommand.js';
import { RangeExpression } from './RangeExpression.js';
import { Axes3dExpression } from './Axes3dExpression.js';
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
        this.showGridLines = false;  // default: gridlines hidden
        this.gridColor = null;
        this.gridStrokeWidth = null;
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

        // Process remaining args (axes3d or ranges for x, y, z)
        if (this.subExpressions.length > 4) {
            const arg5Raw = this.subExpressions[4];
            arg5Raw.resolve(context);
            const arg5 = unwrapExpression(arg5Raw);

            if (arg5 instanceof Axes3dExpression) {
                // g3d(r1, c1, r2, c2, axes3d(...))
                this._extractFromAxes3d(arg5);
            } else if (arg5 instanceof RangeExpression) {
                // g3d(r1, c1, r2, c2, xRange, yRange, zRange)
                this._extractFromRange(arg5, 'x');
                let rangeIndex = 1;
                for (let i = 5; i < this.subExpressions.length; i++) {
                    const exprRaw = this.subExpressions[i];
                    exprRaw.resolve(context);
                    const expr = unwrapExpression(exprRaw);
                    if (expr instanceof RangeExpression) {
                        if (rangeIndex === 1) {
                            this._extractFromRange(expr, 'y');
                        } else if (rangeIndex === 2) {
                            this._extractFromRange(expr, 'z');
                        }
                        rangeIndex++;
                    }
                }
            }
        }
    }

    _extractFromAxes3d(axes3dExpr) {
        const xRange = axes3dExpr.getXRange();
        const yRange = axes3dExpr.getYRange();
        const zRange = axes3dExpr.getZRange();
        const grid3d = axes3dExpr.getGrid3d();

        if (xRange) {
            this._extractFromRange(xRange, 'x');
        }
        if (yRange) {
            this._extractFromRange(yRange, 'y');
        }
        if (zRange) {
            this._extractFromRange(zRange, 'z');
        }
        if (grid3d) {
            this.gridColor = grid3d.getColor();
            this.gridStrokeWidth = grid3d.getStrokeWidth();
        }

        // Extract grid visibility options
        this.showGrid = axes3dExpr.getShowGrid();
        this.showGridLines = axes3dExpr.getShowGridLines();
        this.coordinateSystem = axes3dExpr.getCoordinateSystem();
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
                showGridLines: this.showGridLines,
                gridColor: this.gridColor,
                gridStrokeWidth: this.gridStrokeWidth,
                coordinateSystem: this.coordinateSystem
            },
            this  // Pass expression reference so command can set grapher
        );
    }
}
