/**
 * SequenceExpression - Executes multiple commands sequentially
 *
 * Syntax:
 *   seq(arg1, arg2, ...)   - execute commands in order
 *
 * Examples:
 *   seq(fadeout(A), fadein(B))   - run fade animations sequentially
 *   seq(l1, l2)                  - replay l1 then l2 animations
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { SequenceCommand } from '../../commands/SequenceCommand.js';

export class SequenceExpression extends AbstractNonArithmeticExpression {
    static NAME = 'seq';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.commandNames = [];      // Variable names for registry lookup
        this.commandCreators = [];   // Expressions that can create commands
    }

    resolve(context) {
        if (this.subExpressions.length === 0) {
            this.dispatchError('seq() requires at least one argument.\nUsage: seq(arg1, arg2, ...)');
        }

        this.commandNames = [];
        this.commandCreators = [];

        for (const subExpr of this.subExpressions) {
            subExpr.resolve(context);

            // Check if it's a variable reference
            if (subExpr.variableName) {
                this.commandNames.push(subExpr.variableName);
                this.commandCreators.push(null);  // Placeholder
            } else if (subExpr.getVariableName) {
                this.commandNames.push(subExpr.getVariableName());
                this.commandCreators.push(null);  // Placeholder
            } else if (typeof subExpr.toCommand === 'function') {
                // It's an expression that can create a command
                this.commandNames.push(null);  // Placeholder
                this.commandCreators.push(subExpr);
            }
        }
    }

    getName() {
        return SequenceExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        // Create commands from expressions, keep nulls for variable references
        const commands = this.commandCreators.map(expr =>
            expr ? expr.toCommand() : null
        );
        return new SequenceCommand(this.commandNames, commands);
    }

    canPlay() {
        return true;
    }
}
