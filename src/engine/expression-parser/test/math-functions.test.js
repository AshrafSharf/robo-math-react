/**
 * Test math functions
 */

import {
    ExpressionInterpreter,
    ExpressionContext,
    IntrepreterFunctionTable
} from '../index.js';
import { describe, test, assert, printSummary } from './test-framework.js';

// Initialize
IntrepreterFunctionTable.populateFunctionTable();

describe('Math Functions', () => {
    test('sqrt function', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const sqrtAST = {
            name: 'sqrt',
            args: [{ name: 'numeric', value: 16 }]
        };
        const result = interpreter.evalExpression(sqrtAST);
        result.resolve(context);

        assert.equal(result.getVariableAtomicValues()[0], 4);
    });

    test('sin function', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const sinAST = {
            name: 'sin',
            args: [{ name: 'numeric', value: 0 }]
        };
        const result = interpreter.evalExpression(sinAST);
        result.resolve(context);

        assert.closeTo(result.getVariableAtomicValues()[0], 0, 0.0001);
    });

    test('cos function', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const cosAST = {
            name: 'cos',
            args: [{ name: 'numeric', value: 0 }]
        };
        const result = interpreter.evalExpression(cosAST);
        result.resolve(context);

        assert.closeTo(result.getVariableAtomicValues()[0], 1, 0.0001);
    });

    test('sin(pi/2) = 1', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const sinAST = {
            name: 'sin',
            args: [{ name: 'numeric', value: Math.PI / 2 }]
        };
        const result = interpreter.evalExpression(sinAST);
        result.resolve(context);

        assert.closeTo(result.getVariableAtomicValues()[0], 1, 0.0001);
    });

    test('exp and log', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const expAST = {
            name: 'exp',
            args: [{ name: 'numeric', value: 1 }]
        };
        const expResult = interpreter.evalExpression(expAST);
        expResult.resolve(context);

        assert.closeTo(expResult.getVariableAtomicValues()[0], Math.E, 0.0001);

        const logAST = {
            name: 'log',
            args: [{ name: 'numeric', value: Math.E }]
        };
        const logResult = interpreter.evalExpression(logAST);
        logResult.resolve(context);

        assert.closeTo(logResult.getVariableAtomicValues()[0], 1, 0.0001);
    });

    test('floor function', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const floorAST = {
            name: 'floor',
            args: [{ name: 'numeric', value: 3.7 }]
        };
        const result = interpreter.evalExpression(floorAST);
        result.resolve(context);

        assert.equal(result.getVariableAtomicValues()[0], 3);
    });

    test('ceil function', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const ceilAST = {
            name: 'ceil',
            args: [{ name: 'numeric', value: 3.2 }]
        };
        const result = interpreter.evalExpression(ceilAST);
        result.resolve(context);

        assert.equal(result.getVariableAtomicValues()[0], 4);
    });

    test('round function', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const roundAST = {
            name: 'round',
            args: [{ name: 'numeric', value: 3.5 }]
        };
        const result = interpreter.evalExpression(roundAST);
        result.resolve(context);

        assert.equal(result.getVariableAtomicValues()[0], 4);
    });

    test('abs function', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const absAST = {
            name: 'abs',
            args: [{ name: 'numeric', value: -42 }]
        };
        const result = interpreter.evalExpression(absAST);
        result.resolve(context);

        assert.equal(result.getVariableAtomicValues()[0], 42);
    });

    test('min function', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const minAST = {
            name: 'min',
            args: [
                { name: 'numeric', value: 5 },
                { name: 'numeric', value: 10 }
            ]
        };
        const result = interpreter.evalExpression(minAST);
        result.resolve(context);

        assert.equal(result.getVariableAtomicValues()[0], 5);
    });

    test('max function', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const maxAST = {
            name: 'max',
            args: [
                { name: 'numeric', value: 5 },
                { name: 'numeric', value: 10 }
            ]
        };
        const result = interpreter.evalExpression(maxAST);
        result.resolve(context);

        assert.equal(result.getVariableAtomicValues()[0], 10);
    });

    test('rad function - degrees to radians', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // rad(180) should equal π
        const radAST = {
            name: 'rad',
            args: [{ name: 'numeric', value: 180 }]
        };
        const result = interpreter.evalExpression(radAST);
        result.resolve(context);

        assert.closeTo(result.getVariableAtomicValues()[0], Math.PI, 0.0001);
    });

    test('deg function - radians to degrees', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // deg(π) should equal 180
        const degAST = {
            name: 'deg',
            args: [{ name: 'numeric', value: Math.PI }]
        };
        const result = interpreter.evalExpression(degAST);
        result.resolve(context);

        assert.closeTo(result.getVariableAtomicValues()[0], 180, 0.0001);
    });

    test('cos(rad(45)) - nested function call', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // cos(rad(45)) = cos(45°) ≈ 0.7071
        const cosRadAST = {
            name: 'cos',
            args: [{
                name: 'rad',
                args: [{ name: 'numeric', value: 45 }]
            }]
        };
        const result = interpreter.evalExpression(cosRadAST);
        result.resolve(context);

        assert.closeTo(result.getVariableAtomicValues()[0], Math.SQRT2 / 2, 0.0001);
    });

    test('sin(rad(30)) - nested function call', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // sin(rad(30)) = sin(30°) = 0.5
        const sinRadAST = {
            name: 'sin',
            args: [{
                name: 'rad',
                args: [{ name: 'numeric', value: 30 }]
            }]
        };
        const result = interpreter.evalExpression(sinRadAST);
        result.resolve(context);

        assert.closeTo(result.getVariableAtomicValues()[0], 0.5, 0.0001);
    });

    test('sqrt(abs(-16)) - deeply nested', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // sqrt(abs(-16)) = sqrt(16) = 4
        const nestedAST = {
            name: 'sqrt',
            args: [{
                name: 'abs',
                args: [{ name: 'numeric', value: -16 }]
            }]
        };
        const result = interpreter.evalExpression(nestedAST);
        result.resolve(context);

        assert.equal(result.getVariableAtomicValues()[0], 4);
    });
});

printSummary();
