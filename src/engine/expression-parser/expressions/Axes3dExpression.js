/**
 * Axes3dExpression - Bundle axis ranges and grid options for g3d
 *
 * Syntax: axes3d(range3d, grid3d, "option")
 *
 * String options (can appear in any order):
 *   - "gridlines" - show gridlines (default: hidden)
 *   - "nogrid"    - hide everything including axes
 *   - "lhs"       - left-hand coordinate system (default)
 *   - "rhs"       - right-hand coordinate system
 *
 * Examples:
 *   axes3d(range3d(range(-10,10), range(-10,10), range(-5,5)))                    // axes only (default)
 *   axes3d(range3d(...), "gridlines")                                              // axes + gridlines
 *   axes3d(range3d(...), "nogrid")                                                 // nothing
 *   axes3d(range3d(...), "rhs")                                                    // right-hand system
 *   axes3d(range3d(...), grid3d(c(gray)), "gridlines")                            // styled gridlines
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { Range3dExpression } from './Range3dExpression.js';
import { Grid3dExpression } from './Grid3dExpression.js';
import { VariableReferenceExpression } from './VariableReferenceExpression.js';
import { QuotedStringExpression } from './QuotedStringExpression.js';

/**
 * Unwrap a variable reference to get the underlying expression
 */
function unwrapExpression(expr) {
    if (expr instanceof VariableReferenceExpression) {
        return expr.variableValueExpression;
    }
    return expr;
}

export class Axes3dExpression extends AbstractNonArithmeticExpression {
    static NAME = 'axes3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.range3d = null;
        this.grid3d = null;
        // Grid visibility options (defaults: axes shown, gridlines hidden)
        this.showGrid = true;       // show axes
        this.showGridLines = false; // hide gridlines by default
        // Coordinate system (default: lhs)
        this.coordinateSystem = 'lhs';
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('axes3d() requires at least a range3d expression');
        }

        for (const exprRaw of this.subExpressions) {
            exprRaw.resolve(context);
            const expr = unwrapExpression(exprRaw);

            if (expr instanceof Range3dExpression) {
                this.range3d = expr;
            } else if (expr instanceof Grid3dExpression) {
                this.grid3d = expr;
            } else if (expr instanceof QuotedStringExpression) {
                // Handle string options (can appear in any order)
                const option = expr.getStringValue().toLowerCase();
                if (option === 'nogrid') {
                    this.showGrid = false;      // hide everything including axes
                    this.showGridLines = false;
                } else if (option === 'gridlines') {
                    this.showGridLines = true;  // show gridlines
                } else if (option === 'lhs') {
                    this.coordinateSystem = 'lhs';
                } else if (option === 'rhs') {
                    this.coordinateSystem = 'rhs';
                }
            }
        }

        if (!this.range3d) {
            this.dispatchError('axes3d() requires a range3d expression');
        }
    }

    getName() {
        return Axes3dExpression.NAME;
    }

    getRange3d() {
        return this.range3d;
    }

    getXRange() {
        return this.range3d?.getXRange() || null;
    }

    getYRange() {
        return this.range3d?.getYRange() || null;
    }

    getZRange() {
        return this.range3d?.getZRange() || null;
    }

    getGrid3d() {
        return this.grid3d;
    }

    getShowGrid() {
        return this.showGrid;
    }

    getShowGridLines() {
        return this.showGridLines;
    }

    getCoordinateSystem() {
        return this.coordinateSystem;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
