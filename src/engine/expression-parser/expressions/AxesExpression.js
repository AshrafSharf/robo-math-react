/**
 * AxesExpression - Bundle axis ranges and grid options for g2d
 *
 * Syntax: axes(xRange, yRange), axes(xRange, yRange, grid), axes(xRange, yRange, "option")
 *
 * String options (can appear in any order):
 *   - "gridlines" - show gridlines (default: hidden)
 *   - "nogrid"    - hide everything including axes
 *
 * Examples:
 *   axes(range(-10,10), range(-5,5))                          // axes only (default)
 *   axes(range(-10,10), range(-5,5), "gridlines")             // axes + gridlines
 *   axes(range(-10,10), range(-5,5), "nogrid")                // nothing
 *   axes(range(-10,10), range(-5,5), grid(c(gray)), "gridlines")  // styled gridlines
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { RangeExpression } from './RangeExpression.js';
import { GridExpression } from './GridExpression.js';
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

export class AxesExpression extends AbstractNonArithmeticExpression {
    static NAME = 'axes';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.xRange = null;
        this.yRange = null;
        this.grid = null;
        // Grid visibility options (defaults: axes shown, gridlines hidden)
        this.showGrid = true;       // show axes
        this.showGridLines = false; // hide gridlines by default
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('axes() requires at least xRange and yRange');
        }

        let rangeIndex = 0;
        for (const exprRaw of this.subExpressions) {
            exprRaw.resolve(context);
            const expr = unwrapExpression(exprRaw);

            if (expr instanceof RangeExpression) {
                if (rangeIndex === 0) {
                    this.xRange = expr;
                } else if (rangeIndex === 1) {
                    this.yRange = expr;
                }
                rangeIndex++;
            } else if (expr instanceof GridExpression) {
                this.grid = expr;
            } else if (expr instanceof QuotedStringExpression) {
                // Handle string options (can appear in any order)
                const option = expr.getStringValue().toLowerCase();
                if (option === 'nogrid') {
                    this.showGrid = false;      // hide everything including axes
                    this.showGridLines = false;
                } else if (option === 'gridlines') {
                    this.showGridLines = true;  // show gridlines
                }
            }
        }

        if (!this.xRange || !this.yRange) {
            this.dispatchError('axes() requires two range expressions for x and y axes');
        }
    }

    getName() {
        return AxesExpression.NAME;
    }

    getXRange() {
        return this.xRange;
    }

    getYRange() {
        return this.yRange;
    }

    getGrid() {
        return this.grid;
    }

    getShowGrid() {
        return this.showGrid;
    }

    getShowGridLines() {
        return this.showGridLines;
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
