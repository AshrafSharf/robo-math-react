/**
 * PosExpression - Repositions g2d, mathtext, and g3d containers by delta row/col
 *
 * Syntax:
 *   pos(G, 2, 3)           - shift G by dRow=2, dCol=3
 *   pos(G, T, 2, 3)        - shift G and T by dRow=2, dCol=3
 *   pos(G, T, M, 2, 3)     - shift G, T, and M by dRow=2, dCol=3
 *
 * The last two arguments are always dRow and dCol (in logical coordinates).
 * All preceding arguments are variable references to containers.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PosCommand } from '../../commands/reposition/PosCommand.js';

export class PosExpression extends AbstractNonArithmeticExpression {
    static NAME = 'pos';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.shapeVariableNames = [];
        this.dRow = 0;
        this.dCol = 0;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('pos() requires at least 3 arguments: pos(container, dRow, dCol)');
        }

        // Resolve all subexpressions
        for (const subExpr of this.subExpressions) {
            subExpr.resolve(context);
        }

        // Last two args are dRow and dCol
        const dRowExpr = this._getResolvedExpression(context, this.subExpressions[this.subExpressions.length - 2]);
        const dColExpr = this._getResolvedExpression(context, this.subExpressions[this.subExpressions.length - 1]);

        // Get numeric values for dRow and dCol
        const dRowValues = dRowExpr.getVariableAtomicValues();
        const dColValues = dColExpr.getVariableAtomicValues();

        if (dRowValues.length === 0 || dColValues.length === 0) {
            this.dispatchError('pos(): dRow and dCol must be numeric values');
        }

        this.dRow = dRowValues[0];
        this.dCol = dColValues[0];

        // All preceding args are container variable references
        this.shapeVariableNames = [];
        for (let i = 0; i < this.subExpressions.length - 2; i++) {
            const subExpr = this.subExpressions[i];
            const resolved = this._getResolvedExpression(context, subExpr);

            // Get variable name for registry lookup
            const varName = subExpr.variableName || resolved.variableName;
            if (!varName) {
                this.dispatchError(`pos(): argument ${i + 1} must be a variable reference to a g2d, mathtext, or g3d`);
            }

            // Validate type (g2d, mathtext, g3d)
            const typeName = resolved.getName ? resolved.getName() : null;
            const validTypes = ['g2d', 'mathtext', 'g3d'];
            if (typeName && !validTypes.includes(typeName)) {
                this.dispatchError(`pos(): ${varName} must be a g2d, mathtext, or g3d (got: ${typeName})`);
            }

            this.shapeVariableNames.push(varName);
        }

        if (this.shapeVariableNames.length === 0) {
            this.dispatchError('pos() requires at least one container variable');
        }
    }

    getName() {
        return PosExpression.NAME;
    }

    getVariableAtomicValues() {
        return [this.dRow, this.dCol];
    }

    toCommand() {
        return new PosCommand(this.shapeVariableNames, this.dRow, this.dCol);
    }

    canPlay() {
        return true;
    }
}
