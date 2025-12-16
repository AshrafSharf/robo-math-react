/**
 * MathFunctionCompiler - Compiles math expression strings into callable functions
 * Uses mathjs for parsing and evaluation.
 *
 * This utility is standalone and diagram-agnostic, designed for reuse across 2D, 3D,
 * and any future contexts.
 *
 * ## mathjs Syntax Reference
 *
 * ### Built-in Constants (use directly in expressions):
 * - pi     → 3.141592653589793
 * - e      → 2.718281828459045 (Euler's number)
 * - i      → imaginary unit (i^2 = -1)
 *
 * ### Logarithm Functions:
 * - log(x)        → natural logarithm (ln), base e
 * - log(x, base)  → logarithm with custom base: log(1000, 10) = 3
 * - log10(x)      → base-10 logarithm: log10(1000) = 3
 * - log2(x)       → base-2 logarithm: log2(8) = 3
 *
 * ### Trigonometric (radians):
 * - sin(x), cos(x), tan(x)
 * - asin(x), acos(x), atan(x), atan2(y, x)
 *
 * ### Exponential & Power:
 * - exp(x)        → e^x
 * - sqrt(x)       → square root
 * - cbrt(x)       → cube root
 * - x^n           → power (use ^ not **)
 * - pow(x, n)     → same as x^n
 * - nthRoot(x, n) → nth root
 *
 * ### Other:
 * - abs(x)        → absolute value
 * - ceil(x), floor(x), round(x)
 * - sign(x)       → -1, 0, or 1
 * - mod(x, y)     → modulo
 *
 * ### Expression Examples:
 * - "x^2 + 2*x + 1"        → quadratic
 * - "sin(2*pi*x)"          → sine wave
 * - "e^(-x^2)"             → Gaussian-like
 * - "log(x)"               → natural log
 * - "log(x, 10)"           → log base 10
 * - "sqrt(x^2 + y^2)"      → distance formula
 * - "a*sin(b*x + c)"       → parameterized sine (a,b,c from scope)
 */

import { compile } from 'mathjs';

export class MathFunctionCompiler {
    /**
     * Compile a math expression string to a callable function
     * @param {string} expression - Math expression e.g., "x^2 + a*y"
     * @param {string[]} parameters - Parameter names e.g., ['x', 'y']
     * @param {Object} scope - Captured variables e.g., {a: 5, b: 10}
     * @returns {Function} Callable function that takes parameter values
     *
     * @example
     * // Single parameter function
     * const f = MathFunctionCompiler.compile("x^2 + a", ['x'], {a: 5});
     * f(3);  // Returns 14 (3^2 + 5)
     *
     * @example
     * // Multi-parameter function
     * const g = MathFunctionCompiler.compile("x^2 + y^2", ['x', 'y'], {});
     * g(3, 4);  // Returns 25 (3^2 + 4^2)
     */
    static compile(expression, parameters, scope = {}) {
        const compiled = compile(expression);

        if (parameters.length === 1) {
            // Single parameter: f(x)
            const paramName = parameters[0];
            return (value) => {
                const evalScope = { ...scope, [paramName]: value };
                return compiled.evaluate(evalScope);
            };
        } else {
            // Multiple parameters: f(x, y, ...)
            return (...values) => {
                const evalScope = { ...scope };
                parameters.forEach((param, i) => {
                    evalScope[param] = values[i];
                });
                return compiled.evaluate(evalScope);
            };
        }
    }
}
