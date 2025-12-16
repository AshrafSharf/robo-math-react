/**
 * FunctionDefinitionExpression - Defines a reusable math function
 *
 * Syntax: f = def(param1, param2, ..., "body")
 * Examples:
 *   f = def(x, "x^2 + a")           // Single parameter function
 *   g = def(x, y, "x^2 + y^2")      // Multi-parameter function
 *
 * Late Binding: Variables in the body (like 'a') are NOT captured at definition time.
 * They are captured when the function is USED (in plot(), fun(), etc.).
 *
 * This allows:
 *   a = 5
 *   f = def(x, "x^2 + a")   // Just stores template
 *   a = 10
 *   plot(G, f)              // Captures a=10 HERE
 */

import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { MathFunctionCompiler } from '../utils/MathFunctionCompiler.js';

export class FunctionDefinitionExpression extends AbstractNonArithmeticExpression {
    static NAME = 'def';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.parameters = [];      // ['x'] or ['x', 'y']
        this.bodyString = '';      // "x^2 + a" - stored as template
    }

    resolve(context) {
        const args = this.subExpressions;

        if (args.length < 2) {
            this.dispatchError('def() requires at least parameter and body: def(x, "x^2")');
        }

        // Last arg is always the body string
        // All args before that are parameter names
        this.parameters = [];

        // Extract parameters (all but last)
        for (let i = 0; i < args.length - 1; i++) {
            args[i].resolve(context);
            const paramName = args[i].getVariableName();
            if (!paramName) {
                this.dispatchError(`Parameter ${i + 1} must be a variable name`);
            }
            this.parameters.push(paramName);
        }

        // Extract body string (last argument)
        const bodyArg = args[args.length - 1];
        bodyArg.resolve(context);

        // Get the string value from the body argument
        if (typeof bodyArg.getStringValue === 'function') {
            this.bodyString = bodyArg.getStringValue();
        } else if (typeof bodyArg.getValue === 'function') {
            this.bodyString = String(bodyArg.getValue());
        } else {
            const atomicValues = bodyArg.getVariableAtomicValues();
            if (atomicValues.length > 0) {
                this.bodyString = String(atomicValues[0]);
            } else {
                this.dispatchError('Body must be a string expression like "x^2"');
            }
        }

        // NOTE: Do NOT capture scope or compile here!
        // Variables are bound later when the function is USED (late binding)

        return this;
    }

    getName() {
        return FunctionDefinitionExpression.NAME;
    }

    /**
     * Get the parameter names
     * @returns {string[]} Array of parameter names
     */
    getParameters() {
        return this.parameters;
    }

    /**
     * Get the body expression string
     * @returns {string} The body string
     */
    getBodyString() {
        return this.bodyString;
    }

    /**
     * Get the number of parameters
     * @returns {number} Parameter count
     */
    getParameterCount() {
        return this.parameters.length;
    }

    /**
     * Compile the function with the given scope (called by consumers like plot, fun)
     * This implements late binding - scope is captured at USE time, not definition time.
     *
     * @param {Object} scope - Current context values at use time
     * @returns {Function} Compiled function ready to evaluate
     */
    compileWithScope(scope) {
        return MathFunctionCompiler.compile(this.bodyString, this.parameters, scope);
    }

    getVariableAtomicValues() {
        return [this.bodyString, ...this.parameters];
    }

    // No visual output - function definitions don't render anything
    canPlay() {
        return false;
    }

    toCommand() {
        return null;
    }
}
