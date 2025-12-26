/**
 * Math function expression - wraps mathjs functions (sin, cos, sqrt, mean, etc.)
 * Properly defers evaluation until resolve() is called, allowing variable references
 * and nested expressions like cos(deg(45)).
 */
import { AbstractArithmeticExpression } from './AbstractArithmeticExpression.js';
import * as mathjs from 'mathjs';

export class MathFunctionExpression extends AbstractArithmeticExpression {
    static NAME = 'mathfunction';

    constructor(functionName, args) {
        super();
        this.functionName = functionName;
        this.subExpressions = args;
        this.resultValue = null;
    }

    resolve(context) {
        // Resolve each argument first (like AdditionExpression does)
        const numericArgs = this.subExpressions.map(arg => {
            arg.resolve(context);
            const values = arg.getVariableAtomicValues();
            if (values.length === 0) {
                this.dispatchError(`Cannot apply ${this.functionName}() to non-numeric value`);
            }
            return values[0];
        });

        // Handle custom functions not in mathjs
        if (this.functionName === 'rad') {
            // Degrees to radians: rad(45) → 45° in radians
            this.resultValue = numericArgs[0] * (Math.PI / 180);
            return;
        }
        if (this.functionName === 'deg') {
            // Radians to degrees: deg(pi) → 180°
            this.resultValue = numericArgs[0] * (180 / Math.PI);
            return;
        }

        // Apply the mathjs function
        const mathFunc = mathjs[this.functionName];
        if (!mathFunc) {
            this.dispatchError(`Math function ${this.functionName}() not found`);
        }

        this.resultValue = mathFunc(...numericArgs);
    }

    getName() {
        return MathFunctionExpression.NAME;
    }

    getVariableAtomicValues() {
        if (this.resultValue === null) {
            this.dispatchError(`Math function ${this.functionName}() not resolved yet`);
        }
        return [this.resultValue];
    }
}
