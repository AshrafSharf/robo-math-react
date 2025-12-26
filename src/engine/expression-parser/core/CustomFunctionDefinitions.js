/**
 * Custom Function Definitions
 *
 * Registers custom functions (math, utility, etc.) into the expression table.
 * Uses MathFunctionExpression to properly defer evaluation until resolve(),
 * enabling nested expressions like cos(rad(45)).
 */
import { MathFunctionExpression } from '../expressions/MathFunctionExpression.js';

/**
 * Register all custom functions
 * @param {Object} expTable - The expression table to register functions into
 */
export function registerCustomFunctions(expTable) {
    registerMathFunctions(expTable);
    // Future: registerGeometryFunctions(expTable);
    // Future: registerUtilityFunctions(expTable);
}

/**
 * Register math functions that wrap mathjs
 * @param {Object} expTable - The expression table
 */
function registerMathFunctions(expTable) {
    const mathFunctions = [
        // Trigonometric (mathjs uses radians)
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
        // Hyperbolic
        'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
        // Exponential/logarithmic
        'exp', 'sqrt', 'cbrt', 'log', 'log10', 'log2',
        // Rounding
        'abs', 'floor', 'ceil', 'round', 'sign',
        // Comparison
        'min', 'max',
        // Statistics
        'mean', 'median', 'std', 'variance',
        // Custom degree/radian conversion
        'rad',  // rad(45) → 45 degrees to radians
        'deg'   // deg(pi) → radians to degrees
    ];

    mathFunctions.forEach(name => {
        expTable[name] = (e) => new MathFunctionExpression(name, e.args);
    });
}
