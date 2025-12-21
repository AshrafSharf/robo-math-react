/**
 * FunctionCallExpression - Calls a function definition with arguments
 *
 * Syntax: fun(funcRef, arg1, arg2, ...)
 * Examples:
 *   f = def(x, "x^2 + a")
 *   fun(f, 3)              // Evaluates f(3) = 3^2 + a (with current 'a' value)
 *   point(2, fun(f, 2))    // Use function result in another expression
 *
 * Late Binding: Variables in the function body are captured at CALL time (when fun() resolves),
 * not when the function was defined.
 */

import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { FunctionDefinitionExpression } from './FunctionDefinitionExpression.js';
import { MathFunctionCompiler } from '../utils/MathFunctionCompiler.js';

export class FunctionCallExpression extends AbstractNonArithmeticExpression {
    static NAME = 'fun';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.value = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('fun() requires function and arguments: fun(f, 2)');
        }

        // First arg is function reference
        const funcRefExpr = this.subExpressions[0];
        funcRefExpr.resolve(context);

        // Get the function name and look it up in context
        const funcName = funcRefExpr.getVariableName();
        if (!funcName) {
            this.dispatchError('First argument to fun() must be a function name');
        }

        const funcDef = context.getReference(funcName);
        if (!funcDef) {
            this.dispatchError(`Function '${funcName}' is not defined`);
        }

        if (!(funcDef instanceof FunctionDefinitionExpression)) {
            this.dispatchError(`'${funcName}' is not a function definition (created with def())`);
        }

        // Register caller as dependent of user variables in function body (for fromTo)
        // Uses caller mode (no 4th arg) - parent expression gets registered, not fun itself
        MathFunctionCompiler.registerDependencies(
            funcDef.getBodyString(),
            funcDef.getParameters(),
            context
        );

        // Remaining args are function arguments
        const argValues = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const vals = this.subExpressions[i].getVariableAtomicValues();
            if (vals.length > 0) {
                argValues.push(vals[0]);
            } else {
                this.dispatchError(`Argument ${i} could not be evaluated to a value`);
            }
        }

        // Validate argument count
        const expectedCount = funcDef.getParameterCount();
        if (argValues.length !== expectedCount) {
            this.dispatchError(
                `Function '${funcName}' expects ${expectedCount} argument(s), but got ${argValues.length}`
            );
        }

        // LATE BINDING: Compile with CURRENT context scope, then evaluate
        const currentScope = context.getReferencesCopyAsPrimitiveValues();
        const compiledFn = funcDef.compileWithScope(currentScope);

        // Evaluate the function with the provided arguments
        this.value = compiledFn(...argValues);

        return this;
    }

    getName() {
        return FunctionCallExpression.NAME;
    }

    getVariableAtomicValues() {
        return [this.value];
    }

    /**
     * Get the numeric value result
     * @returns {number} The evaluated function result
     */
    getNumericValue() {
        return this.value;
    }

    // Function calls don't render anything - they just produce a value
    canPlay() {
        return false;
    }

    toCommand() {
        return null;
    }
}
