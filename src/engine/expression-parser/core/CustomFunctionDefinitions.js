/**
 * Custom Function Definitions
 *
 * Registers custom functions (math, utility, etc.) into the expression table.
 * Add new function definitions here as the system grows.
 */
import { NumericExpression } from '../expressions/NumericExpression.js';

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
 * Register standard math functions that wrap JavaScript Math object
 * @param {Object} expTable - The expression table
 */
function registerMathFunctions(expTable) {
    const mathFunctions = [
        // Trigonometric
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        // Exponential/logarithmic
        'exp', 'sqrt', 'log',
        // Rounding
        'abs', 'floor', 'ceil', 'round',
        // Comparison
        'min', 'max'
    ];

    mathFunctions.forEach(name => defineMathFunction(expTable, name));
}

/**
 * Define a math function that wraps JavaScript Math object
 * @param {Object} expTable - The expression table
 * @param {string} functionName - Name of the Math function
 */
function defineMathFunction(expTable, functionName) {
    expTable[functionName] = (e) => {
        const args = e.args;

        // Get numeric values from expressions
        const numericArgs = args.map(arg => {
            const values = arg.getVariableAtomicValues();
            if (values.length === 0) {
                throw new Error(`Cannot apply ${functionName} to non-numeric value`);
            }
            return values[0];
        });

        // Apply the Math function
        const mathFunc = Math[functionName];
        if (!mathFunc) {
            throw new Error(`Math function ${functionName} not found`);
        }

        const result = mathFunc(...numericArgs);
        return new NumericExpression(result);
    };
}
