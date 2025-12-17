/**
 * ParallelExpression - Plays multiple commands in parallel
 *
 * Syntax:
 *   para(arg1, arg2, ...)   - play commands simultaneously
 *
 * Examples:
 *   para(l1, l2)                      - replay existing l1 and l2 in parallel
 *   para(line(G,A,B), circle(G,C,3)) - create and play new shapes in parallel
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { ParallelCommand } from '../../commands/ParallelCommand.js';

export class ParallelExpression extends AbstractNonArithmeticExpression {
    static NAME = 'para';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.commandNames = [];      // Variable names for registry lookup
        this.commandCreators = [];   // Expressions that can create commands
    }

    resolve(context) {
        if (this.subExpressions.length === 0) {
            this.dispatchError('para() requires at least one argument.\nUsage: para(arg1, arg2, ...)');
        }

        this.commandNames = [];
        this.commandCreators = [];

        for (const subExpr of this.subExpressions) {
            subExpr.resolve(context);

            // Check if it's a variable reference
            if (subExpr.variableName) {
                this.commandNames.push(subExpr.variableName);
            } else if (subExpr.getVariableName) {
                this.commandNames.push(subExpr.getVariableName());
            } else if (typeof subExpr.toCommand === 'function') {
                // It's an expression that can create a command
                this.commandCreators.push(subExpr);
            }
        }
    }

    getName() {
        return ParallelExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        // Create commands from expressions
        const commands = this.commandCreators.map(expr => expr.toCommand());
        return new ParallelCommand(this.commandNames, commands);
    }

    canPlay() {
        return true;
    }
}
