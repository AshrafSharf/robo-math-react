/**
 * SequenceExpression - Executes multiple expressions sequentially
 *
 * Syntax:
 *   seq(expr1, expr2, ...)   - execute expressions in order
 *
 * Example:
 *   seq(fadeout(A), replace("x^2", B))
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { SequenceCommand } from '../../commands/SequenceCommand.js';

export class SequenceExpression extends AbstractNonArithmeticExpression {
    static NAME = 'seq';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.resolvedExpressions = [];
    }

    resolve(context) {
        if (this.subExpressions.length === 0) {
            this.dispatchError('seq() requires at least one expression.\nUsage: seq(expr1, expr2, ...)');
        }

        this.resolvedExpressions = [];

        for (const subExpr of this.subExpressions) {
            subExpr.resolve(context);
            this.resolvedExpressions.push(subExpr);
        }
    }

    getName() {
        return SequenceExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        const commands = this.resolvedExpressions.map(expr => expr.toCommand());
        return new SequenceCommand(commands);
    }

    canPlay() {
        return true;
    }
}
