/**
 * Interpreter Function Table - populates the expression table with all available functions
 */
import { ExpressionInterpreter } from './ExpressionInterpreter.js';
import { NumericExpression } from '../expressions/NumericExpression.js';
import { PointExpression } from '../expressions/PointExpression.js';
import { LineExpression } from '../expressions/LineExpression.js';
import { VariableReferenceExpression } from '../expressions/VariableReferenceExpression.js';
import { AssignmentExpression } from '../expressions/AssignmentExpression.js';
import { AdditionExpression } from '../expressions/AdditionExpression.js';
import { SubtractionExpression } from '../expressions/SubtractionExpression.js';
import { MultiplicationExpression } from '../expressions/MultiplicationExpression.js';
import { DivisionExpression } from '../expressions/DivisionExpression.js';
import { PowerExpression } from '../expressions/PowerExpression.js';
import { AbstractArithmeticExpression } from '../expressions/AbstractArithmeticExpression.js';

export class IntrepreterFunctionTable {
    constructor() {}

    /**
     * Populate the function table with all available expressions
     */
    static populateFunctionTable() {
        // Set up circular dependency references
        AbstractArithmeticExpression.NumericExpression = NumericExpression;
        AbstractArithmeticExpression.PointExpression = PointExpression;
        NumericExpression.PointExpression = PointExpression;

        // Arithmetic operators
        ExpressionInterpreter.expTable['*'] = function(e) {
            const args = e.args;
            const lhs = args[0];
            const rhs = args[1];
            return new MultiplicationExpression(lhs, rhs);
        };

        ExpressionInterpreter.expTable['/'] = function(e) {
            const args = e.args;
            const lhs = args[0];
            const rhs = args[1];
            return new DivisionExpression(lhs, rhs);
        };

        ExpressionInterpreter.expTable['+'] = function(e) {
            const args = e.args;
            const lhs = args[0];
            const rhs = args[1];
            return new AdditionExpression(lhs, rhs);
        };

        ExpressionInterpreter.expTable['-'] = function(e) {
            const args = e.args;
            const lhs = args[0];
            const rhs = args[1];
            return new SubtractionExpression(lhs, rhs);
        };

        ExpressionInterpreter.expTable['^'] = function(e) {
            const args = e.args;
            const lhs = args[0];
            const rhs = args[1];
            return new PowerExpression(lhs, rhs);
        };

        // Assignment
        ExpressionInterpreter.expTable['assignment'] = function(e) {
            const args = e.args;
            const lhs = args[0];
            const rhs = args[1];
            return new AssignmentExpression(lhs, rhs);
        };

        // Variable reference
        ExpressionInterpreter.expTable['string'] = function(e) {
            const variableName = e.args[0];
            return new VariableReferenceExpression(variableName);
        };

        // Numeric value
        ExpressionInterpreter.expTable['numeric'] = function(e) {
            const args = e.args;
            const value = args[0];
            return new NumericExpression(value);
        };

        // Point expression
        ExpressionInterpreter.expTable['point'] = function(e) {
            const args = e.args;
            return new PointExpression(args);
        };

        // Line expression
        ExpressionInterpreter.expTable['line'] = function(e) {
            const args = e.args;
            return new LineExpression(args);
        };

        // Math functions
        const mathFunctions = [
            'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
            'exp', 'sqrt', 'log', 'abs', 'floor', 'ceil', 'round',
            'min', 'max'
        ];

        mathFunctions.forEach(funcName => {
            this.defineMathFunction(funcName);
        });
    }

    /**
     * Define a math function that wraps JavaScript Math object
     */
    static defineMathFunction(functionName) {
        ExpressionInterpreter.expTable[functionName] = function(e) {
            const args = e.args;

            // Get the numeric value(s) from expression(s)
            const numericArgs = args.map(arg => {
                const values = arg.getVariableAtomicValues();
                if (values.length === 0) {
                    throw new Error(`Cannot apply ${functionName} to non-numeric value`);
                }
                return values[0];
            });

            // Apply the Math function
            let result;
            const mathFunc = Math[functionName];

            if (!mathFunc) {
                throw new Error(`Math function ${functionName} not found`);
            }

            if (numericArgs.length === 1) {
                result = mathFunc(numericArgs[0]);
            } else if (numericArgs.length === 2) {
                result = mathFunc(numericArgs[0], numericArgs[1]);
            } else {
                result = mathFunc(...numericArgs);
            }

            return new NumericExpression(result);
        };
    }
}
