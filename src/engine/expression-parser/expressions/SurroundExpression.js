/**
 * SurroundExpression - Draws a rectangle around a TextItem
 *
 * Syntax: surround(T)
 * Where T is a TextItem variable from subonly() or subwithout()
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { SurroundCommand } from '../../commands/SurroundCommand.js';

export class SurroundExpression extends AbstractNonArithmeticExpression {
    static NAME = 'surround';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.textItemVariableName = null;
    }

    resolve(context) {
        // Arg 0: TextItem variable reference (required)
        if (this.subExpressions.length < 1) {
            this.dispatchError('surround() requires 1 argument: surround(T)');
        }

        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('surround() argument must be a TextItem variable');
        }
        this.textItemVariableName = targetExpr.variableName;
    }

    getName() {
        return SurroundExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        return new SurroundCommand({
            textItemVariableName: this.textItemVariableName
        });
    }

    canPlay() {
        return true;
    }
}
