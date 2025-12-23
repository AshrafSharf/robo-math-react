/**
 * FillExpression - Animates fill color of shapes
 *
 * Syntax:
 *   fill(A, "red")               - single shape, named color
 *   fill(A, "#ff0000")           - single shape, hex color
 *   fill(A, "blue", 0.5)         - shape, color, opacity (0-1)
 *   fill(A, B, C, "green")       - multiple shapes, color
 *   fill(A, B, "red", 0.8)       - multiple shapes with opacity
 *
 * Arguments:
 *   - First N args are shape variable references
 *   - Last string arg is the color
 *   - Optional numeric arg after color is opacity (0-1)
 *
 * Note: MathText and TextItem do not support fill - they use stroke for rendering.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { FillCommand } from '../../commands/fill/FillCommand.js';

export class FillExpression extends AbstractNonArithmeticExpression {
    static NAME = 'fill';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.shapeVariableNames = [];
        this.color = '#000000';
        this.opacity = 1;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('fill() requires at least 2 arguments: fill(shape, color)');
        }

        // Resolve all subexpressions
        for (const subExpr of this.subExpressions) {
            subExpr.resolve(context);
        }

        // Find color and opacity from the end of args
        // Last string arg = color
        // Last numeric arg after color = opacity
        let colorIndex = -1;
        let opacityIndex = -1;

        for (let i = this.subExpressions.length - 1; i >= 0; i--) {
            const subExpr = this.subExpressions[i];
            const resolved = this._getResolvedExpression(context, subExpr);
            const name = resolved.getName ? resolved.getName() : null;

            if (name === 'quotedstring' && colorIndex === -1) {
                // This is the color argument
                colorIndex = i;
                this.color = resolved.getStringValue();

                // Check if the next arg (after color in original order) is a number for opacity
                if (i + 1 < this.subExpressions.length) {
                    const nextExpr = this.subExpressions[i + 1];
                    const nextResolved = this._getResolvedExpression(context, nextExpr);
                    const nextValues = nextResolved.getVariableAtomicValues();

                    if (nextValues.length === 1 && typeof nextValues[0] === 'number') {
                        opacityIndex = i + 1;
                        this.opacity = Math.max(0, Math.min(1, nextValues[0])); // Clamp 0-1
                    }
                }
                break;
            }
        }

        if (colorIndex === -1) {
            this.dispatchError('fill() requires a color argument: fill(shape, "red")');
        }

        // All args before color are shape variable references
        this.shapeVariableNames = [];
        for (let i = 0; i < colorIndex; i++) {
            const subExpr = this.subExpressions[i];
            const resolved = this._getResolvedExpression(context, subExpr);

            // Get variable name for registry lookup
            const varName = subExpr.variableName || resolved.variableName;
            if (!varName) {
                this.dispatchError(`fill(): argument ${i + 1} must be a variable reference to a shape`);
            }

            this.shapeVariableNames.push(varName);
        }

        if (this.shapeVariableNames.length === 0) {
            this.dispatchError('fill() requires at least one shape: fill(shape, color)');
        }
    }

    getName() {
        return FillExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        return new FillCommand(this.shapeVariableNames, this.color, this.opacity);
    }

    canPlay() {
        return true;
    }
}
