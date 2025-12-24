/**
 * StrokeWidthExpression - Animates stroke width of shapes
 *
 * Syntax:
 *   strokewidth(A, 2)               - single shape, width value
 *   strokewidth(A, B, C, 3)         - multiple shapes, width
 *
 * Arguments:
 *   - First N args are shape variable references
 *   - Last numeric arg is the stroke width
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { StrokeWidthCommand } from '../../commands/strokewidth/StrokeWidthCommand.js';

export class StrokeWidthExpression extends AbstractNonArithmeticExpression {
    static NAME = 'strokewidth';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.shapeVariableNames = [];
        this.width = 1;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('strokewidth() requires at least 2 arguments: strokewidth(shape, width)');
        }

        // Resolve all subexpressions
        for (const subExpr of this.subExpressions) {
            subExpr.resolve(context);
        }

        // Find width from the end of args (last numeric arg)
        let widthIndex = -1;

        for (let i = this.subExpressions.length - 1; i >= 0; i--) {
            const subExpr = this.subExpressions[i];
            const resolved = this._getResolvedExpression(context, subExpr);
            const values = resolved.getVariableAtomicValues();

            if (values.length === 1 && typeof values[0] === 'number') {
                widthIndex = i;
                this.width = Math.max(0, values[0]); // Ensure non-negative
                break;
            }
        }

        if (widthIndex === -1) {
            this.dispatchError('strokewidth() requires a width argument: strokewidth(shape, 2)');
        }

        // All args before width are shape variable references
        this.shapeVariableNames = [];
        for (let i = 0; i < widthIndex; i++) {
            const subExpr = this.subExpressions[i];
            const resolved = this._getResolvedExpression(context, subExpr);

            // Get variable name for registry lookup
            const varName = subExpr.variableName || resolved.variableName;
            if (!varName) {
                this.dispatchError(`strokewidth(): argument ${i + 1} must be a variable reference to a shape`);
            }

            this.shapeVariableNames.push(varName);
        }

        if (this.shapeVariableNames.length === 0) {
            this.dispatchError('strokewidth() requires at least one shape: strokewidth(shape, width)');
        }
    }

    getName() {
        return StrokeWidthExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        return new StrokeWidthCommand(this.shapeVariableNames, this.width);
    }

    canPlay() {
        return true;
    }
}
